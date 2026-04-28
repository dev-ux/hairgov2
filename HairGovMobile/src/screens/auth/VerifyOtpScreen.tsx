import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type VerifyOtpRouteProp = RouteProp<RootStackParamList, 'VerifyOtp'>;

// Fonction utilitaire pour formater le numéro de téléphone
const formatPhoneNumber = (phone: string) => {
  // Formatage basique du numéro de téléphone
  // Exemple: +225 07 74 79 94 26
  if (!phone) return '';
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Formater selon la longueur du numéro
  if (cleaned.length > 0) {
    // Si c'est un numéro international (commence par +)
    if (phone.startsWith('+')) {
      const countryCode = cleaned.substring(0, 3);
      const rest = cleaned.substring(3);
      return `+${countryCode} ${rest.substring(0, 2)} ${rest.substring(2, 4)} ${rest.substring(4, 6)} ${rest.substring(6, 8)} ${rest.substring(8)}`;
    }
    // Formatage pour les numéros locaux
    return cleaned.replace(/(\d{2})(?=(\d{2})+(?!\d))/g, '$1 ');
  }
  
  return phone;
};

export const VerifyOtpScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<VerifyOtpRouteProp>();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const { email, phone, userId } = route.params;

  // Gérer le compte à rebours pour le renvoi du code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Veuillez entrer un code OTP valide à 6 chiffres');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Ici, vous devrez implémenter l'appel à votre API pour vérifier l'OTP
      // Par exemple :
      // const response = await AuthService.verifyOtp(userId, phone, otpCode);
      
      // Simulation de la vérification réussie
      console.log('Vérification du code OTP:', otpCode);
      
      // Attendre 1 seconde pour simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Marquer l'utilisateur comme vérifié
      // En production, vous devrez appeler votre API pour vérifier le code OTP
      // et mettre à jour le statut de vérification de l'utilisateur
      
      // Rediriger vers l'écran d'accueil ou de connexion
      Alert.alert(
        'Vérification réussie', 
        'Votre compte a été vérifié avec succès !',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      
    } catch (error) {
      console.error('Erreur lors de la vérification du code OTP:', error);
      setError('Code OTP invalide. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }

    setIsLoading(true);
    setError('');

    try {
      // Ici, vous devrez appeler votre API pour vérifier l'OTP
      // const response = await AuthService.verifyOtp(email || phone, otpCode);
      
      // Simulation de la vérification réussie
      setTimeout(() => {
        setIsLoading(false);
        // Rediriger vers l'écran de connexion ou directement connecter l'utilisateur
        Alert.alert('Succès', 'Votre compte a été vérifié avec succès !');
        navigation.navigate('Login');
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      setError('Code OTP invalide. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendDisabled(true); +
      setCountdown(30);
      setError('');
      
      
      console.log('Demande de renvoi du code OTP à:', phone);
      
      // Simulation du renvoi du code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Code renvoyé', 
        'Un nouveau code de vérification a été envoyé à votre numéro de téléphone.'
      );
    } catch (error) {
      console.error('Erreur lors du renvoi du code:', error);
      setError('Une erreur est survenue lors du renvoi du code. Veuillez réessayer.');
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Passer au champ suivant si un chiffre est entré
    if (value && index < 3) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // Soumettre automatiquement si le dernier chiffre est entré
    if (index === 3 && value) {
      handleVerifyOtp();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Revenir au champ précédent lors de la suppression
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const inputRefs = React.useRef<Array<TextInput | null>>([]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Vérification</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Entrez le code à 6 chiffres envoyé au {phone ? formatPhoneNumber(phone) : email}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.otpContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref && !inputRefs.current.includes(ref)) {
                  inputRefs.current[index] = ref;
                }
              }}
              style={[styles.otpInput, otp[index] ? styles.otpInputFilled : null]}
              value={otp[index]}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading ? styles.buttonDisabled : null]}
          onPress={handleVerifyOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Vérifier</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Vous n'avez pas reçu de code ? </Text>
          <TouchableOpacity 
            onPress={handleResendOtp} 
            disabled={resendDisabled}
          >
            <Text style={[styles.resendLink, resendDisabled && styles.resendLinkDisabled]}>
              {resendDisabled ? `Renvoyer (${countdown}s)` : 'Renvoyer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  otpInputFilled: {
    borderColor: '#6c63ff',
    backgroundColor: '#f0eeff',
  },
  button: {
    backgroundColor: '#6c63ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#666',
  },
  resendLink: {
    color: '#6c63ff',
    fontWeight: 'bold',
  },
  resendLinkDisabled: {
    color: '#999',
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default VerifyOtpScreen;
