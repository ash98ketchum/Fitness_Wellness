import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Activity } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://athelya-api.onrender.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      
      await login(data.user, data.token);
      if (data.user.hasCompletedOnboarding) {
        router.replace('/(app)/dashboard');
      } else {
        router.replace('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center">
      <StatusBar style="light" />
      
      <View className="w-full max-w-sm px-6">
        <View className="items-center mb-6">
          <TouchableOpacity 
            className="w-10 h-10 rounded-lg bg-white items-center justify-center mb-6"
            onPress={() => router.replace('/')}
          >
            <Activity size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-3xl font-semibold tracking-tight text-white mb-2">Sign in to your account</Text>
          <Text className="text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link href="/(auth)/signup" className="font-medium text-white">Sign up</Link>
          </Text>
        </View>

        <View className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <View className="space-y-5">
            <View className="mb-4">
              <Text className="text-sm font-medium text-zinc-300 mb-1.5">Email address</Text>
              <TextInput 
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-zinc-500"
                placeholder="name@example.com"
                placeholderTextColor="#71717a"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View className="mb-6">
              <Text className="text-sm font-medium text-zinc-300 mb-1.5">Password</Text>
              <TextInput 
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-zinc-500"
                placeholder="••••••••"
                placeholderTextColor="#71717a"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {error ? (
              <View className="bg-red-900/20 border border-red-900/50 rounded-lg px-4 py-2 mb-4">
                <Text className="text-sm text-red-400">{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              className="w-full bg-white flex-row items-center justify-center py-3 rounded-lg"
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-black font-medium text-sm">Sign in</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
