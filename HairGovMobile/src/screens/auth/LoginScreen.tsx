import React, { useState } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

export const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'client' | 'coiffeur'>('client');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Tentative de connexion avec:', { phone });
      
      const response = await fetch('http://127.0.0.1:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim(),
          password: password,
        }),
      });

      console.log('Réponse du serveur - Status:', response.status);
      
      let data;
      try {
        const responseText = await response.text();
        console.log('Réponse brute du serveur:', responseText);
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
        throw new Error('Réponse invalide du serveur');
      }

      console.log('Réponse du serveur - Données parsées:', data);
      console.log('Structure des données utilisateur:', {
        hasUser: !!data.user,
        userKeys: data.user ? Object.keys(data.user) : 'Aucun utilisateur dans la réponse',
        dataKeys: Object.keys(data)
      });

      if (!response.ok) {
        const errorMessage = data.message || `Erreur ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('Connexion réussie, données reçues:', data);
      
      // Les données utilisateur sont dans data.data.user
      if (data.data && data.data.user) {
        const userData = {
          full_name: data.data.user.full_name,
          email: data.data.user.email,
          phone: data.data.user.phone,
          id: data.data.user.id,
          user_type: data.data.user.user_type
        };
        
        console.log('Données utilisateur à enregistrer:', userData);
        
        // Sauvegarder les données utilisateur
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        // Sauvegarder le token
        if (data.data.token) {
          await AsyncStorage.setItem('userToken', data.data.token);
        }
        
        // Sauvegarder le refresh token
        if (data.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        }
      } else {
        console.error('Aucune donnée utilisateur trouvée dans la réponse');
      }
      
      // Rediriger vers l'écran d'accueil
      navigation.navigate('Home');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion';
      console.error('Erreur détaillée:', {
        message: errorMessage,
        error: err,
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Bienvenue sur HairGov</Text>
          <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, userType === 'client' && styles.activeToggle]}
            onPress={() => setUserType('client')}
          >
            <Text style={[styles.toggleText, userType === 'client' && styles.activeToggleText]}>
              Je suis un client
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, userType === 'coiffeur' && styles.activeToggle]}
            onPress={() => setUserType('coiffeur')}
          >
            <Text style={[styles.toggleText, userType === 'coiffeur' && styles.activeToggleText]}>
              Je suis un coiffeur
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+225XXXXXXXXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.loginButton, (isLoading || !phone || !password) && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading || !phone || !password}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Vous n'avez pas de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
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
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 5,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleText: {
    color: '#666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#6a1b9a',
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    paddingLeft: 45,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 40,
    zIndex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6a1b9a',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6a1b9a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#6a1b9a',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9c27b0',
    opacity: 0.7,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#6a1b9a',
    fontWeight: '600',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
});
