import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'client' | 'coiffeur'>('client');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, isLoading, error: authError, clearError } = useAuth();
  const [localError, setLocalError] = useState('');

  // Gérer les erreurs du contexte d'authentification
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      clearError();
    }
  }, [authError, clearError]);

  const handleLogin = async () => {
    console.log('handleLogin appelé');
    if (!phone || !password) {
      const errorMsg = !phone ? 'Le numéro de téléphone est requis' : 'Le mot de passe est requis';
      console.log('Champs manquants:', { phone: !!phone, password: '•••••' });
      setLocalError(errorMsg);
      return;
    }

    console.log('Tentative de connexion...');
    setLocalError('');

    try {
      const success = await login(phone, password);
      if (success) {
        console.log('Connexion réussie, redirection...');
        // Récupérer les données utilisateur pour la redirection
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('Type utilisateur:', parsedUser.user_type);
          
          // Redirection selon le type d'utilisateur
          setTimeout(() => {
            if (parsedUser.user_type === 'hairdresser') {
              console.log('Navigation vers BarberHome');
              navigation.replace('BarberHome');
            } else {
              console.log('Navigation vers Home');
              navigation.replace('Home');
            }
          }, 100);
        } else {
          console.log('Pas de userData, navigation vers Home par défaut');
          setTimeout(() => {
            navigation.replace('Home');
          }, 100);
        }
      } else {
        setLocalError('Échec de la connexion');
      }
    } catch (error) {
      console.error('Erreur dans handleLogin:', error);
      setLocalError('Échec de la connexion');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec logo Scizz */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Votre style, notre expertise</Text>
          </View>
        </View>

        {/* Formulaire de connexion */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte Scizz</Text>

          {/* Sélection du type d'utilisateur */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'client' && styles.userTypeButtonActive
              ]}
              onPress={() => setUserType('client')}
            >
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={userType === 'client' ? '#ffffff' : '#666'} 
              />
              <Text style={[
                styles.userTypeText,
                userType === 'client' && styles.userTypeTextActive
              ]}>
                Client
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'coiffeur' && styles.userTypeButtonActive
              ]}
              onPress={() => setUserType('coiffeur')}
            >
              <Ionicons 
                name="cut-outline" 
                size={20} 
                color={userType === 'coiffeur' ? '#ffffff' : '#666'} 
              />
              <Text style={[
                styles.userTypeText,
                userType === 'coiffeur' && styles.userTypeTextActive
              ]}>
                Coiffeur
              </Text>
            </TouchableOpacity>
          </View>

          {/* Champ téléphone */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Numéro de téléphone"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoComplete="tel"
            />
          </View>

          {/* Champ mot de passe */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* Message d'erreur */}
          {localError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#ff4444" />
              <Text style={styles.errorText}>{localError}</Text>
            </View>
          ) : null}

          {/* Bouton de connexion */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Lien mot de passe oublié */}
          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {/* Lien vers inscription */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Pas encore de compte ? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register' as any)}
            >
              <Text style={styles.signupLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Scizz - Tous droits réservés</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: height * 0.05,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  userTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 22,
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#6C63FF',
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  userTypeTextActive: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 15,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#a5a1ff',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6C63FF',
    textDecorationLine: 'underline',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default LoginScreen;
