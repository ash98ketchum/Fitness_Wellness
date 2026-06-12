import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants/api';
import { Button } from '../../components/ui/Button';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChefHat, Flame, LogOut, CheckCircle2 } from 'lucide-react-native';

export default function DashboardScreen() {
  const { token, user, logout } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [mealLogs, setMealLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      const [planRes, progressRes] = await Promise.all([
        fetch(`${API_URL}/plans/latest`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/progress/today`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (!planRes.ok && planRes.status === 404) {
        router.replace('/(app)/onboarding');
        return;
      }
      
      if (planRes.ok) {
        const planData = await planRes.json();
        setPlan(planData.plan);
      }
      
      if (progressRes.ok) {
        const progData = await progressRes.json();
        setProgress(progData.progress);
        setMealLogs(progData.mealLogs);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const handleLogMeal = async (mealId: string) => {
    try {
      await fetch(`${API_URL}/progress/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mealId })
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to log meal', error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/plans/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlan();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><Text style={styles.text}>Loading Dashboard...</Text></View>;
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} tintColor="#10b981" />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <LogOut color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>

      {!plan ? (
        <View style={styles.emptyState}>
          <ChefHat color="#10b981" size={48} />
          <Text style={styles.emptyTitle}>Ready for your plan?</Text>
          <Button title="Generate Diet Plan" onPress={handleGenerate} />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.macrosCard}>
            <View style={styles.macroRow}>
              <Flame color="#fb923c" size={24} />
              <View>
                <Text style={styles.caloriesText}>{progress?.caloriesConsumed || 0} / {plan.totalCalories}</Text>
                <Text style={styles.macroLabel}>Calories Consumed Today</Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, ((progress?.caloriesConsumed || 0) / plan.totalCalories) * 100)}%` }]} />
            </View>

            <View style={[styles.macroGrid, { marginTop: 24 }]}>
              <View style={styles.macroItem}><Text style={styles.macroLabel}>Target Pro</Text><Text style={[styles.macroValue, {color: '#60a5fa'}]}>{plan.proteinG}g</Text></View>
              <View style={styles.macroItem}><Text style={styles.macroLabel}>Target Carbs</Text><Text style={[styles.macroValue, {color: '#34d399'}]}>{plan.carbsG}g</Text></View>
              <View style={styles.macroItem}><Text style={styles.macroLabel}>Target Fats</Text><Text style={[styles.macroValue, {color: '#fbbf24'}]}>{plan.fatsG}g</Text></View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <View style={styles.mealList}>
            {plan.meals?.map((meal: any, i: number) => {
              const isLogged = mealLogs.some(log => log.mealId === meal.id);
              return (
                <View key={i} style={styles.mealCard}>
                  <TouchableOpacity 
                    style={styles.mealInfoTouchable}
                    onPress={() => router.push(`/(app)/meal/${meal.id}`)}
                  >
                    <View style={styles.mealTimeBox}>
                      <Text style={styles.mealTimeText}>{meal.time.split(' ')[0]}</Text>
                    </View>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealDetails}>{meal.calories} kcal • P:{meal.macros?.protein}g C:{meal.macros?.carbs}g F:{meal.macros?.fats}g</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.logButton, isLogged && styles.logButtonActive]}
                    onPress={() => !isLogged && handleLogMeal(meal.id)}
                    disabled={isLogged}
                  >
                    <CheckCircle2 color={isLogged ? '#10b981' : '#a1a1aa'} size={24} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#a1a1aa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  date: { fontSize: 14, color: '#a1a1aa', marginTop: 4 },
  logoutBtn: { padding: 12, backgroundColor: '#18181b', borderRadius: 12 },
  emptyState: { alignItems: 'center', padding: 48, marginTop: 48 },
  emptyTitle: { fontSize: 20, color: '#fff', fontWeight: 'bold', marginTop: 24, marginBottom: 24 },
  content: { padding: 24 },
  macrosCard: { backgroundColor: '#18181b', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#27272a', marginBottom: 32 },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  caloriesText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  progressBarBg: { height: 8, backgroundColor: '#27272a', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 4 },
  macroGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  macroItem: { flex: 1, alignItems: 'center' },
  macroLabel: { fontSize: 13, color: '#a1a1aa', marginBottom: 4 },
  macroValue: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  mealList: { gap: 16 },
  mealCard: { flexDirection: 'row', backgroundColor: '#18181b', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#27272a', alignItems: 'center' },
  mealInfoTouchable: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 },
  mealTimeBox: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#27272a', alignItems: 'center', justifyContent: 'center' },
  mealTimeText: { color: '#a1a1aa', fontWeight: 'bold', fontSize: 14 },
  mealInfo: { flex: 1 },
  mealName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  mealDetails: { color: '#10b981', fontSize: 13, fontWeight: '500' },
  logButton: { padding: 12, borderRadius: 16, backgroundColor: '#27272a' },
  logButtonActive: { backgroundColor: '#064e3b' }
});
