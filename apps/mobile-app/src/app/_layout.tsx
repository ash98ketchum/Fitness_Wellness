import '../../global.css'; // NativeWind global css
import { Slot } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { View, ActivityIndicator, LogBox } from 'react-native';

// Suppress the useless "props.pointerEvents is deprecated" warning in React Native Web
LogBox.ignoreLogs(['props.pointerEvents is deprecated', 'Warning: props.pointerEvents is deprecated']);
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('pointerEvents is deprecated')) {
      return;
    }
    originalWarn(...args);
  };
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
