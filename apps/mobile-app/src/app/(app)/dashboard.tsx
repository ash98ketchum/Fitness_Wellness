import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Flame, Bell, ChevronRight, Menu, LogOut, Activity, Settings, Utensils, Award, X, Mic } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const fallbackState = {
  transformation: {
    recoveryScore: 100,
    confidenceScore: 85,
    estimatedCompletion: null,
    weeklyAdherence: 100,
    currentPhase: 'MAINTENANCE',
    targetCalories: 2500
  },
  streaks: {
    workoutStreak: 0,
    nutritionStreak: 0,
    overallConsistency: 0
  },
  dailySummary: "Ready to conquer the day?"
};

export default function Dashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [state, setState] = useState<any>(fallbackState);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [skipMenuOpen, setSkipMenuOpen] = useState(false);

  useEffect(() => {
    if (!user || !token) return;
    
    fetch(`http://localhost:3000/api/v1/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.success) {
          setState({
            transformation: data.transformation || fallbackState.transformation,
            streaks: data.streaks || fallbackState.streaks,
            dailySummary: data.dailySummary || fallbackState.dailySummary
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, token]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const handleSkip = async (reason: string) => {
    try {
      await fetch(`http://localhost:3000/api/v1/events/log`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType: 'WORKOUT_SKIPPED',
          eventData: { reason }
        })
      });
      alert(`Master Coach notified. Your transformation plan is adapting to accommodate: ${reason}`);
      setSkipMenuOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to log event");
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Header */}
      <View className="h-16 border-b border-zinc-900 flex-row items-center justify-between px-4 bg-black">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => setMenuOpen(true)}>
            <Menu size={24} color="#a1a1aa" />
          </TouchableOpacity>
          <Text className="text-white font-medium text-lg">Overview</Text>
        </View>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity>
            <Bell size={20} color="#a1a1aa" />
          </TouchableOpacity>
          <View className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center">
            <Text className="text-white text-xs font-medium">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
        </View>
      </View>

      {/* Sidebar Overlay */}
      {menuOpen && (
        <View className="absolute inset-0 z-50 flex-row">
          <TouchableOpacity 
            className="absolute inset-0 bg-black/80" 
            activeOpacity={1} 
            onPress={() => setMenuOpen(false)} 
          />
          <View className="w-64 h-full bg-black border-r border-zinc-900 pt-16 px-6">
            <TouchableOpacity 
              className="absolute top-16 right-6"
              onPress={() => setMenuOpen(false)}
            >
              <X size={20} color="#a1a1aa" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-2 mb-12 mt-4">
              <View className="w-6 h-6 rounded bg-white items-center justify-center">
                <Activity size={16} color="#000" />
              </View>
              <Text className="text-white font-semibold text-lg">Athelya</Text>
            </View>
            <View className="flex-1 space-y-4">
              <SidebarItem icon={<Activity size={18} color="#fff" />} label="Dashboard" active />
              <SidebarItem icon={<Utensils size={18} color="#a1a1aa" />} label="Meals" onPress={() => { setMenuOpen(false); router.push('/(app)/planner'); }} />
              <SidebarItem icon={<Award size={18} color="#a1a1aa" />} label="Expert Report" AI onPress={() => { setMenuOpen(false); router.push('/(app)/expert-report'); }} />
              <SidebarItem icon={<Settings size={18} color="#a1a1aa" />} label="Settings" />
            </View>
            <TouchableOpacity 
              className="flex-row items-center gap-3 py-4 mt-auto mb-8"
              onPress={handleLogout}
            >
              <LogOut size={18} color="#ef4444" />
              <Text className="text-red-400 font-medium">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-semibold tracking-tight text-white">Today's Focus</Text>
              <Text className="text-zinc-500 text-sm mt-1">Athelya AI Master Coach</Text>
            </View>
          </View>

          {/* AI Daily Summary */}
          <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl mb-8">
            <Text className="text-sm text-zinc-300 leading-relaxed italic">
              "{state.dailySummary}"
            </Text>
          </View>

          {/* Transformation State Metrics */}
          <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
            <MetricCard label="Readiness Score" value={`${state.transformation.recoveryScore}%`} icon={<Activity size={16} color="#3b82f6" />} />
            <MetricCard label="Plan Confidence" value={`${state.transformation.confidenceScore}%`} icon={<Award size={16} color="#f59e0b" />} />
            <MetricCard label="Weekly Adherence" value={`${state.transformation.weeklyAdherence}%`} icon={<Flame size={16} color="#10b981" />} />
            <MetricCard label="Workout Streak" value={`${state.streaks.workoutStreak} days`} icon={<Flame size={16} color="#ef4444" />} />
          </View>

          {/* Action Area */}
          <Text className="font-medium text-lg text-white mb-4">Actions</Text>
          <View className="space-y-3 mb-8">
            <TouchableOpacity 
              className="bg-emerald-500 p-4 rounded-xl items-center justify-center"
              onPress={() => router.push('/(app)/workout-lobby')}
            >
              <Text className="text-black font-bold text-lg">Start Today's Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl items-center justify-center"
              onPress={() => router.push('/(app)/planner')}
            >
              <Text className="text-white font-medium">View Nutrition Protocol</Text>
            </TouchableOpacity>
          </View>

          {/* Granular Skip Logic */}
          <Text className="font-medium text-lg text-white mb-4">Skip Protocol</Text>
          {skipMenuOpen ? (
            <View className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
              <Text className="text-zinc-400 text-sm mb-2">Why are you skipping? The AI will adapt your week.</Text>
              <TouchableOpacity onPress={() => handleSkip('BUSY')} className="bg-zinc-800 p-3 rounded-lg"><Text className="text-white text-center">Too Busy</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleSkip('SICK')} className="bg-red-900/40 p-3 rounded-lg"><Text className="text-red-400 text-center">Feeling Sick</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleSkip('TRAVELING')} className="bg-zinc-800 p-3 rounded-lg"><Text className="text-white text-center">Traveling</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setSkipMenuOpen(false)} className="mt-2"><Text className="text-zinc-500 text-center text-xs">Cancel</Text></TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              className="border border-red-900/50 bg-red-950/20 p-4 rounded-xl items-center justify-center mb-8"
              onPress={() => setSkipMenuOpen(true)}
            >
              <Text className="text-red-400 font-medium">I need to skip today</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      )}

      {/* Voice Assistant Floating Action Button */}
      {!loading && (
        <TouchableOpacity 
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/50 border border-blue-500"
          onPress={() => router.push('/(app)/voice-chat')}
        >
          <Mic size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function SidebarItem({ icon, label, active, AI, onPress }: any) {
  return (
    <TouchableOpacity 
      className={`flex-row items-center justify-between px-3 py-3 rounded-lg ${active ? 'bg-zinc-900' : ''}`}
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className={`${active ? 'text-white' : 'text-zinc-400'} font-medium`}>{label}</Text>
      </View>
      {AI && (
        <View className="bg-white px-1.5 py-0.5 rounded">
          <Text className="text-[10px] font-bold text-black uppercase">AI</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function MetricCard({ label, value, icon }: any) {
  return (
    <View className="w-[48%] p-4 rounded-xl border border-zinc-800 bg-zinc-950">
      <View className="flex-row items-center gap-1.5 mb-2">
        {icon}
        <Text className="text-zinc-500 text-xs font-medium">{label}</Text>
      </View>
      <Text className="text-xl font-bold text-white mt-1">{value}</Text>
    </View>
  );
}


