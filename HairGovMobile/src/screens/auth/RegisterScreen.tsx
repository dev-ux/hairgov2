import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';

interface FieldProps {
  icon: string; label: string; placeholder: string;
  value: string; onChangeText: (t: string) => void;
  keyboardType?: any; autoCapitalize?: any;
  secure?: boolean; showSecure?: boolean; onToggleSecure?: () => void;
}

const Field = ({ icon, label, placeholder, value, onChangeText, keyboardType, autoCapitalize, secure, showSecure, onToggleSecure }: FieldProps) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.field}>
      <View style={styles.fieldIcon}><Ionicons name={icon as any} size={17} color="#6C63FF" /></View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secure && !showSecure}
      />
      {secure && (
        <TouchableOpacity onPress={onToggleSecure} style={styles.eyeBtn}>
          <Ionicons name={showSecure ? 'eye-off-outline' : 'eye-outline'} size={17} color="#aaa" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export const RegisterScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { registerClient, isLoading, error: authError, clearError } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (authError) { setLocalError(authError); clearError(); }
  }, [authError, clearError]);

  const handleRegister = async () => {
    if (!fullName || !phone || !password || !confirmPassword) {
      setLocalError('Veuillez remplir tous les champs obligatoires'); return;
    }
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas'); return;
    }
    if (!acceptCGU) {
      setLocalError('Veuillez accepter les conditions générales'); return;
    }
    setLocalError('');
    try {
      await registerClient({ full_name: fullName, email: email || undefined, phone, password }, navigation);
    } catch {
      setLocalError('Une erreur est survenue lors de l\'inscription');
    }
  };

  const canSubmit = !isLoading && !!fullName && !!phone && !!password && !!confirmPassword && acceptCGU;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un compte</Text>
          <View style={{ width: 38 }} />
        </LinearGradient>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vos informations</Text>
          <Text style={styles.cardSub}>Tous les champs * sont obligatoires</Text>

          <Field icon="person-outline" label="Nom complet *" placeholder="Votre nom complet"
            value={fullName} onChangeText={setFullName} autoCapitalize="words" />
          <Field icon="mail-outline" label="Email (optionnel)" placeholder="votre@email.com"
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field icon="call-outline" label="Téléphone *" placeholder="+225XXXXXXXXX"
            value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field icon="lock-closed-outline" label="Mot de passe *" placeholder="Min. 8 caractères"
            value={password} onChangeText={setPassword} autoCapitalize="none"
            secure showSecure={showPassword} onToggleSecure={() => setShowPassword(!showPassword)} />
          <Field icon="lock-closed-outline" label="Confirmer le mot de passe *" placeholder="Répétez le mot de passe"
            value={confirmPassword} onChangeText={setConfirmPassword} autoCapitalize="none"
            secure showSecure={showConfirm} onToggleSecure={() => setShowConfirm(!showConfirm)} />

          {localError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#F44336" />
              <Text style={styles.errorText}>{localError}</Text>
            </View>
          ) : null}

          {/* CGU */}
          <TouchableOpacity style={styles.cguRow} onPress={() => setAcceptCGU(!acceptCGU)}>
            <View style={[styles.checkbox, acceptCGU && styles.checkboxActive]}>
              {acceptCGU && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.cguText}>
              J'accepte les <Text style={styles.cguLink}>conditions générales d'utilisation</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleRegister}
            disabled={!canSubmit}
          >
            <LinearGradient
              colors={canSubmit ? ['#6C63FF', '#8B84FF'] : ['#ccc', '#bbb']}
              style={styles.submitGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Créer mon compte</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Vous avez déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f6fa' },
  safe: { backgroundColor: '#6C63FF' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },

  scroll: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#aaa', marginBottom: 20 },

  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fafafa', borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 14, height: 50 },
  fieldIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  eyeBtn: { padding: 4 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFEBEE', borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { color: '#F44336', fontSize: 13, flex: 1 },

  cguRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  cguText: { flex: 1, fontSize: 13, color: '#555' },
  cguLink: { color: '#6C63FF', fontWeight: '600' },

  submitBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  submitBtnDisabled: { opacity: 0.7 },
  submitGrad: { height: 52, justifyContent: 'center', alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, color: '#999' },
  loginLink: { fontSize: 14, color: '#6C63FF', fontWeight: '700' },
});

export default RegisterScreen;
