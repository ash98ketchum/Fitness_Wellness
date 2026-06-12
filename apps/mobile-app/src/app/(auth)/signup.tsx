import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants/api';
import { useRouter } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      await login(data.token, data.user);
      router.replace('/(app)/dashboard');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Dumbbell color="#10b981" size={32} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your transformation journey</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button 
            title="Create Account" 
            onPress={handleSignup} 
            isLoading={loading}
            style={styles.submitBtn}
          />
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.link} onPress={() => router.push('/(auth)/login')}>
              Sign in
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logoBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#18181b', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#27272a' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a1a1aa', textAlign: 'center' },
  form: { width: '100%' },
  submitBtn: { marginTop: 16, marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#a1a1aa', fontSize: 14 },
  link: { color: '#10b981', fontSize: 14, fontWeight: '600' }
});
