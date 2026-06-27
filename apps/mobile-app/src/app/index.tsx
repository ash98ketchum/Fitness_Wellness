import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Activity, ArrowRight, BrainCircuit, Activity as ActivityIcon, MessageSquare } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Navbar */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-zinc-900 bg-black">
        <View className="flex-row items-center gap-2">
          <View className="w-6 h-6 rounded bg-white items-center justify-center">
            <Activity size={16} color="#000" />
          </View>
          <Text className="text-white font-semibold text-lg tracking-tight">Athelya</Text>
        </View>
        <View className="flex-row gap-4 items-center">
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-white">Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-white px-3 py-1.5 rounded-md"
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text className="text-black font-semibold text-sm">Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Hero */}
        <View className="items-center px-6 pt-16 pb-12">
          <View className="flex-row items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <Text className="text-xs text-zinc-300">Athelya AI Engine 2.0 is live</Text>
          </View>
          
          <Text className="text-4xl md:text-5xl font-semibold tracking-tighter text-white text-center leading-[1.1] mb-6">
            Hyper-personalized nutrition.{'\n'}
            <Text className="text-zinc-500">Powered by multi-agent AI.</Text>
          </Text>
          
          <Text className="text-lg text-zinc-400 mb-10 text-center max-w-sm leading-relaxed">
            Stop guessing your macros. Our AI engine analyzes your biology, goals, and lifestyle to generate a perfectly optimized diet plan in seconds.
          </Text>
          
          <View className="w-full gap-4">
            <TouchableOpacity 
              className="w-full bg-white flex-row items-center justify-center py-4 rounded-lg"
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text className="text-black font-medium text-lg mr-2">Start your assessment</Text>
              <ArrowRight size={18} color="#000" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-full border border-zinc-800 py-4 rounded-lg"
            >
              <Text className="text-zinc-400 font-medium text-lg text-center">For Gyms & Trainers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View className="px-6 space-y-4">
          <FeatureCard 
            icon={<BrainCircuit size={20} color="#34d399" />}
            title="Zero Hallucinations"
            description="Our 3-agent verification pipeline ensures every macro is mathematically perfect."
          />
          <FeatureCard 
            icon={<ActivityIcon size={20} color="#60a5fa" />}
            title="Clinical Precision"
            description="Adapts to 20+ variables including allergies, thyroid conditions, and metabolic rate."
          />
          <FeatureCard 
            icon={<MessageSquare size={20} color="#a78bfa" />}
            title="Voice AI Coach"
            description="Talk to your AI dietician in real-time while cooking for instant substitutions."
          />
        </View>

      </ScrollView>
    </View>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <View className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
      <View className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center mb-4">
        {icon}
      </View>
      <Text className="text-lg font-medium text-white mb-2">{title}</Text>
      <Text className="text-zinc-400 leading-relaxed">{description}</Text>
    </View>
  );
}
