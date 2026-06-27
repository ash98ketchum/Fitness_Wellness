import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Play, Activity, Clock, Flame, ChevronLeft } from 'lucide-react-native';

export default function WorkoutLobby() {
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user || !token) return;
    fetchWorkout();
  }, [user, token]);

  const fetchWorkout = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/workouts/today?userId=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.session) {
        setSession(data.session);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateWorkout = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/workouts/generate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user?.id })
      });
      
      if (res.ok) {
        await fetchWorkout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-4 flex-row items-center justify-between border-b border-zinc-900">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-white font-semibold text-lg">Workout Lobby</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {!session ? (
          <View className="flex-1 justify-center items-center mt-20">
            <Activity size={48} color="#52525b" />
            <Text className="text-white text-xl font-bold mt-6 mb-2">No Workout Found</Text>
            <Text className="text-zinc-400 text-center mb-8 px-4">
              Your AI trainer needs to generate today's optimal protocol based on your recovery and goals.
            </Text>
            <TouchableOpacity 
              onPress={generateWorkout}
              disabled={generating}
              className={`bg-white px-8 py-4 rounded-full flex-row items-center ${generating ? 'opacity-50' : ''}`}
            >
              {generating ? (
                <ActivityIndicator color="#000" className="mr-3" />
              ) : (
                <Play size={20} color="#000" className="mr-3" />
              )}
              <Text className="text-black font-bold text-lg">
                {generating ? "Generating..." : "Generate Protocol"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="mb-8">
              <Text className="text-3xl font-bold text-white mb-2">{session.title}</Text>
              
              <View className="flex-row items-center gap-6 mt-4">
                <View className="flex-row items-center gap-2">
                  <Clock size={16} color="#a1a1aa" />
                  <Text className="text-zinc-400 font-medium">{session.durationMinutes} min</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Flame size={16} color="#a1a1aa" />
                  <Text className="text-zinc-400 font-medium">{session.caloriesBurned} kcal</Text>
                </View>
              </View>
            </View>

            <Text className="text-white text-lg font-semibold mb-4">Exercises</Text>
            <View className="space-y-4 mb-8">
              {session.exercises?.map((we: any, i: number) => (
                <View key={we.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex-row items-center">
                  <Image 
                    source={{ uri: we.exercise.gifUrl }} 
                    className="w-16 h-16 rounded-lg bg-zinc-800 mr-4"
                  />
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-base mb-1">{we.exercise.name}</Text>
                    <Text className="text-zinc-400 text-sm">
                      {we.setsTarget} sets × {we.repsTarget} reps
                    </Text>
                    <Text className="text-zinc-500 text-xs mt-1">
                      Rest: {we.restSeconds}s • Tempo: {we.tempo}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {session && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/80">
          <TouchableOpacity 
            onPress={() => router.push(`/(app)/active-workout/${session.id}`)}
            className="bg-emerald-500 p-4 rounded-2xl items-center flex-row justify-center"
          >
            <Play size={20} color="#000" className="mr-2" />
            <Text className="text-black font-bold text-lg">Begin Workout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
