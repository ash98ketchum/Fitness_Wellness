import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api/v1';
  }
  
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    // hostUri usually looks like "192.168.1.x:8081"
    const ipAddress = hostUri.split(':')[0];
    return `http://${ipAddress}:3000/api/v1`;
  }
  
  // Fallback for Android emulator if hostUri is unavailable
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api/v1';
  }

  // Fallback for iOS simulator
  return 'http://localhost:3000/api/v1';
};

export const API_URL = getApiUrl();
