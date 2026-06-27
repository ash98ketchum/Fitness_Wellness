import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export default function Planner() {
  const router = useRouter();
  const { user, token } = useAuth();
  
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentHour = new Date().getHours();
  
  // Cutoffs for auto-striking meals
  const isPastTime = (type: string) => {
    if (type === 'Breakfast') return currentHour >= 10;
    if (type === 'Lunch') return currentHour >= 14;
    if (type === 'Snacks') return currentHour >= 17;
    if (type === 'Dinner') return currentHour >= 21;
    return false;
  };

  const [dailyPlan, setDailyPlan] = useState<any>({
    Breakfast: { id: 'bk', name: 'Unplanned Meal', calories: 0, completed: false },
    Lunch: { id: 'ln', name: 'Unplanned Meal', calories: 0, completed: false },
    Snacks: { id: 'sn', name: 'Unplanned Meal', calories: 0, completed: false },
    Dinner: { id: 'dn', name: 'Unplanned Meal', calories: 0, completed: false },
  });

  useEffect(() => {
    if (!user || !token) return;
    
    fetch(`http://localhost:3000/api/v1/plans/latest?userId=${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.plan) {
          const meals = data.plan.meals || [];
          setDailyPlan({
            Breakfast: { id: meals[0]?.id || 'bk', name: meals[0]?.name || 'Breakfast', calories: meals[0]?.calories || 0, completed: false },
            Lunch: { id: meals[1]?.id || 'ln', name: meals[1]?.name || 'Lunch', calories: meals[1]?.calories || 0, completed: false },
            Snacks: { id: meals[3]?.id || 'sn', name: meals[3]?.name || 'Snacks', calories: meals[3]?.calories || 0, completed: false },
            Dinner: { id: meals[2]?.id || 'dn', name: meals[2]?.name || 'Dinner', calories: meals[2]?.calories || 0, completed: false },
          });
        }
      })
      .catch(() => {});
  }, [user, token]);

  const [loadingMeals, setLoadingMeals] = useState<Record<string, boolean>>({});

  const toggleCompletion = (type: string) => {
    setDailyPlan((prev: any) => ({
      ...prev,
      [type]: { ...prev[type], completed: !prev[type].completed }
    }));
  };

  const handleRegenerate = async (type: string) => {
    const meal = dailyPlan[type];
    
    setLoadingMeals(prev => ({ ...prev, [type]: true }));
    try {
      const isPlaceholder = !meal.id || meal.id === 'bk' || meal.id === 'ln' || meal.id === 'sn' || meal.id === 'dn';
      const endpoint = isPlaceholder 
        ? `http://localhost:3000/api/v1/plans/latest/meals/add`
        : `http://localhost:3000/api/v1/meals/${meal.id}/regenerate`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data?.meal) {
          setDailyPlan((prev: any) => ({
            ...prev,
            [type]: {
              ...prev[type],
              id: data.meal.id,
              name: data.meal.name,
              calories: data.meal.calories,
            }
          }));
        }
      }
    } catch (err) {
      console.error('Failed to regenerate meal', err);
    } finally {
      setLoadingMeals(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="h-16 border-b border-zinc-900 flex-row items-center justify-between px-4 bg-black">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.push('/(app)/dashboard')}>
            <Activity size={24} color="#a1a1aa" />
          </TouchableOpacity>
          <Text className="text-white font-medium text-lg">Daily Planner</Text>
        </View>
        <Text className="text-xs text-zinc-500">{currentDay}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6 pb-20">
        <View className="space-y-6">
          {MEAL_TYPES.map(type => {
            const meal = dailyPlan[type];
            const isPast = isPastTime(type);
            const isStruck = meal.completed || isPast;

            return (
              <View key={type} className="gap-2 mb-4">
                <Text className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{type}</Text>
                
                <View className={`rounded-xl border overflow-hidden ${
                  isStruck 
                    ? 'bg-zinc-900/30 border-zinc-900/50 opacity-60' 
                    : 'bg-zinc-950 border-zinc-800'
                }`}>
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => {
                      if (meal.id && meal.id !== 'bk' && meal.id !== 'ln' && meal.id !== 'sn' && meal.id !== 'dn') {
                        router.push({ pathname: '/(app)/meal/[id]', params: { id: meal.id } });
                      }
                    }}
                    className="p-4 flex-row justify-between items-start gap-4"
                  >
                    <View className="flex-1">
                      <Text className={`text-base font-medium mb-1 ${isStruck ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {meal.name}
                      </Text>
                      <Text className="text-sm text-orange-400">{meal.calories} kcal</Text>
                    </View>

                    {meal.id && meal.id !== 'bk' && meal.id !== 'ln' && meal.id !== 'sn' && meal.id !== 'dn' && (
                       <View className="pt-1">
                          <ChevronRight size={20} color="#52525b" />
                       </View>
                    )}
                  </TouchableOpacity>
                  
                  <View className="px-4 pb-4 pt-2 border-t border-zinc-900/50 flex-row justify-between items-center bg-zinc-950/30">
                    <TouchableOpacity 
                      className="flex-row items-center gap-1.5"
                      onPress={() => handleRegenerate(type)}
                      disabled={loadingMeals[type]}
                    >
                      {loadingMeals[type] ? (
                        <ActivityIndicator size="small" color="#71717a" />
                      ) : (
                        <RefreshCw size={14} color="#71717a" />
                      )}
                      <Text className="text-xs text-zinc-400">
                        {loadingMeals[type] ? 'Regenerating...' : 'Regenerate'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      className="flex-row items-center gap-1.5"
                      onPress={() => toggleCompletion(type)}
                    >
                      <CheckCircle2 size={16} color={meal.completed ? "#10b981" : (isPast ? "#52525b" : "#71717a")} />
                      <Text className={`text-xs ${meal.completed ? "text-emerald-500" : "text-zinc-400"}`}>
                        {meal.completed ? 'Done' : (isPast ? 'Missed' : 'Mark Done')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
