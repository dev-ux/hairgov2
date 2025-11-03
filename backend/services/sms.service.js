// services/sms.service.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Stockage temporaire des OTP (à remplacer par une base de données en production)
const otpStore = new Map();

const smsService = {
  sendSMS: async (to, message) => {
    try {
      if (!accountSid || !authToken || !twilioPhoneNumber) {
        console.warn('Twilio credentials not configured. SMS not sent:', { to, message });
        return { success: false, message: 'SMS service not configured' };
      }

      const response = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: to
      });

      console.log('SMS sent:', response.sid);
      return { success: true, sid: response.sid };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Générer et envoyer un OTP
  sendOTP: async (phone) => {
    try {
      // Générer un code OTP à 6 chiffres
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const message = `Votre code de vérification HairGo est: ${otp}. Valable 10 minutes.`;
      
      // Envoyer le SMS
      const result = await smsService.sendSMS(phone, message);
      
      if (result.success) {
        // Stocker l'OTP avec une date d'expiration (10 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        
        otpStore.set(phone, {
          otp,
          expiresAt,
          verified: false
        });
        
        // Pour le développement, afficher l'OTP dans la console
        console.log(`OTP pour ${phone}: ${otp}`);
        
        return { success: true, otp: otp }; // En développement, on retourne l'OTP pour les tests
      }
      
      return { success: false, error: 'Failed to send OTP' };
    } catch (error) {
      console.error('Error in sendOTP:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Vérifier un OTP
  verifyOTP: (phone, code) => {
    try {
      const otpData = otpStore.get(phone);
      const now = new Date();
      
      if (!otpData) {
        return { success: false, error: 'Aucun OTP trouvé pour ce numéro' };
      }
      
      if (now > otpData.expiresAt) {
        return { success: false, error: 'OTP expiré' };
      }
      
      if (otpData.otp !== code) {
        return { success: false, error: 'Code OTP invalide' };
      }
      
      // Marquer l'OTP comme vérifié
      otpData.verified = true;
      otpStore.set(phone, otpData);
      
      return { success: true };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Vérifier si un OTP a été vérifié
  isOTPVerified: (phone) => {
    const otpData = otpStore.get(phone);
    return otpData && otpData.verified === true;
  }
};

module.exports = smsService;