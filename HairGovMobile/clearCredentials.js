// Run this in your React Native app to clear stored credentials
import AsyncStorage from '@react-native-async-storage/async-storage';

const clearCredentials = async () => {
  try {
    await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userData']);
    console.log('✅ Credentials cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing credentials:', error);
  }
};

export default clearCredentials;
