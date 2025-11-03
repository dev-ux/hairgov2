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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';

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
      console.log('Appel de login avec:', { phone });
      const success = await login(phone, password);
      if (success) {
        console.log('Login réussi, navigation vers l\'accueil...');
        // La navigation est gérée par le contexte d'authentification
        navigation.replace('Home');
      } else {
        setLocalError('Échec de la connexion. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur dans handleLogin:', error);
      setLocalError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la connexion');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>HairGov</Text>
          </View>
          <Text style={styles.title}>HairGov</Text>
          <Text style={styles.subtitle}>Trouvez le coiffeur parfait près de chez vous</Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton, 
              userType === 'client' && styles.activeToggle
            ]}
            onPress={() => setUserType('client')}
          >
            <Text style={[
              styles.toggleText, 
              userType === 'client' && styles.activeToggleText
            ]}>
              Je suis un client
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton, 
              userType === 'coiffeur' && styles.activeToggle
            ]}
            onPress={() => setUserType('coiffeur')}
          >
            <Text style={[
              styles.toggleText, 
              userType === 'coiffeur' && styles.activeToggleText
            ]}>
              Je suis un coiffeur
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
          
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
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Votre mot de passe"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.loginButton,
              (isLoading || !phone || !password) && styles.disabledButton
            ]}
            onPress={handleLogin}
            disabled={isLoading || !phone || !password}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Vous n'avez pas de compte ? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register', { userType })}
            >
              <Text style={styles.signupLink}>
                {userType === 'client' ? 'Créer un compte' : 'Devenir coiffeur'}
              </Text>
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
  scrollView: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    marginBottom: 20,
    backgroundColor: '#6C63FF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
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
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#a5a1ff',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default LoginScreen;
