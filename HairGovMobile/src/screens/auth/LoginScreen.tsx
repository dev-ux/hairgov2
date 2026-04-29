import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, StatusBar, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'client' | 'coiffeur'>('client');
  const [localError, setLocalError] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, isLoading, error: authError, clearError } = useAuth();

  useEffect(() => {
    if (authError) { setLocalError(authError); clearError(); }
  }, [authError, clearError]);

  const handleLogin = async () => {
    if (!phone || !password) {
      setLocalError(!phone ? 'Le numéro de téléphone est requis' : 'Le mot de passe est requis');
      return;
    }
    setLocalError('');
    try {
      const success = await login(phone, password);
      if (success) {
        const userData = await AsyncStorage.getItem('userData');
        const parsed = userData ? JSON.parse(userData) : null;
        setTimeout(() => {
          navigation.replace(parsed?.user_type === 'hairdresser' ? 'BarberHome' : 'Home');
        }, 100);
      } else {
        setLocalError('Identifiants incorrects');
      }
    } catch {
      setLocalError('Échec de la connexion');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>Scizz</Text>
          <Text style={styles.tagline}>Votre style, notre expertise</Text>
        </LinearGradient>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

          {/* User type toggle */}
          <View style={styles.toggle}>
            {(['client', 'coiffeur'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.toggleBtn, userType === t && styles.toggleBtnActive]}
                onPress={() => setUserType(t)}
              >
                <Ionicons name={t === 'client' ? 'person-outline' : 'cut-outline'} size={16} color={userType === t ? '#fff' : '#888'} />
                <Text style={[styles.toggleText, userType === t && styles.toggleTextActive]}>
                  {t === 'client' ? 'Client' : 'Coiffeur'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <View style={styles.fieldIcon}><Ionicons name="call-outline" size={18} color="#6C63FF" /></View>
            <TextInput
              style={styles.input}
              placeholder="Numéro de téléphone"
              placeholderTextColor="#bbb"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <View style={styles.fieldIcon}><Ionicons name="lock-closed-outline" size={18} color="#6C63FF" /></View>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#aaa" />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {localError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#F44336" />
              <Text style={styles.errorText}>{localError}</Text>
            </View>
          ) : null}

          {/* Login button */}
          <TouchableOpacity style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]} onPress={handleLogin} disabled={isLoading}>
            <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.loginBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Se connecter</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register' as any)}>
              <Text style={styles.signupLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>© 2024 Scizz — Tous droits réservés</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f6fa' },
  scroll: { flexGrow: 1 },

  hero: {
    height: height * 0.32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  logo: { width: 80, height: 80, marginBottom: 4 },
  appName: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' },

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    padding: 28,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 24 },

  toggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  toggleBtnActive: { backgroundColor: '#6C63FF' },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#888' },
  toggleTextActive: { color: '#fff' },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1.5,
    borderColor: '#eee',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
  },
  fieldIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  eyeBtn: { padding: 4 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { color: '#F44336', fontSize: 13, flex: 1 },

  loginBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnGrad: { height: 52, justifyContent: 'center', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  forgotBtn: { alignSelf: 'center', marginBottom: 24 },
  forgotText: { color: '#6C63FF', fontSize: 14, fontWeight: '600' },

  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { fontSize: 14, color: '#999' },
  signupLink: { fontSize: 14, color: '#6C63FF', fontWeight: '700' },

  footer: { textAlign: 'center', fontSize: 11, color: '#ccc', padding: 20 },
});

export default LoginScreen;
