import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Activity, CheckCircle2, RefreshCw } from 'lucide-react-native';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

interface PlannerMeal {
  id: string;
  name: string;
  calories: number;
  completed: boolean;
}

type WeekPlan = Record<string, Record<string, PlannerMeal>>;

const generateMockPlan = (): WeekPlan => {
  const plan: WeekPlan = {};
  DAYS.forEach(day => {
    plan[day] = {};
    MEAL_TYPES.forEach(type => {
      plan[day][type] = {
        id: `${day}-${type}`,
        name: type === 'Breakfast' ? 'Oatmeal & Eggs' : type === 'Lunch' ? 'Chicken Salad' : type === 'Dinner' ? 'Salmon & Quinoa' : 'Protein Shake',
        calories: type === 'Snacks' ? 250 : 500,
        completed: false,
      };
    });
  });
  return plan;
};

export default function PlannerScreen() {
  const router = useRouter();
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(generateMockPlan());
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);

  // For mobile, drag-and-drop is tricky without a complex library like react-native-dnd.
  // Instead, we allow "Swap" via a selection state.
  const [swapSource, setSwapSource] = useState<{day: string, type: string} | null>(null);

  const handleMealTap = (day: string, type: string) => {
    if (!swapSource) {
      setSwapSource({ day, type });
    } else {
      if (swapSource.day === day && swapSource.type === type) {
        setSwapSource(null); // deselect
      } else {
        // execute swap
        setWeekPlan(prev => {
          const newPlan = { ...prev };
          const sourceMeal = { ...newPlan[swapSource.day][swapSource.type] };
          const targetMeal = { ...newPlan[day][type] };
          newPlan[swapSource.day][swapSource.type] = targetMeal;
          newPlan[day][type] = sourceMeal;
          return newPlan;
        });
        setSwapSource(null);
      }
    }
  };

  const toggleCompletion = (day: string, type: string) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: {
          ...prev[day][type],
          completed: !prev[day][type].completed
        }
      }
    }));
  };

  const handleRegenerate = (day: string, type: string) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: {
          ...prev[day][type],
          name: 'AI Generated Meal ⚡',
          calories: Math.floor(Math.random() * 300) + 300,
        }
      }
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Planner</Text>
        {swapSource ? (
          <Text style={styles.subtitle}>Tap another meal to swap</Text>
        ) : (
          <Text style={styles.subtitle}>Tap a meal to swap</Text>
        )}
      </View>

      <View style={styles.daySelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>
          {DAYS.map(day => (
            <TouchableOpacity 
              key={day} 
              style={[styles.dayTab, selectedDay === day && styles.dayTabActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPad}>
        {MEAL_TYPES.map(type => {
          const meal = weekPlan[selectedDay][type];
          const isSelected = swapSource?.day === selectedDay && swapSource?.type === type;
          return (
            <View key={type} style={styles.mealSlot}>
              <Text style={styles.slotTitle}>{type}</Text>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => handleMealTap(selectedDay, type)}
                style={[
                  styles.card,
                  meal.completed && styles.cardCompleted,
                  isSelected && styles.cardSelected
                ]}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.mealName, meal.completed && styles.textCompleted]}>{meal.name}</Text>
                  <TouchableOpacity onPress={() => toggleCompletion(selectedDay, type)}>
                    <CheckCircle2 color={meal.completed ? "#10b981" : "#71717a"} size={20} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.cardBottom}>
                  <Text style={styles.calsText}>{meal.calories} kcal</Text>
                  <TouchableOpacity style={styles.regenBtn} onPress={() => handleRegenerate(selectedDay, type)}>
                    <RefreshCw color="#a1a1aa" size={12} />
                    <Text style={styles.regenText}>Regenerate</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{height: 100}}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#a1a1aa', marginTop: 4 },
  daySelectorContainer: { borderBottomWidth: 1, borderBottomColor: '#27272a' },
  daySelector: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: 'row' },
  dayTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#18181b' },
  dayTabActive: { backgroundColor: '#10b981' },
  dayText: { color: '#a1a1aa', fontSize: 14, fontWeight: '500' },
  dayTextActive: { color: '#000', fontWeight: 'bold' },
  content: { flex: 1 },
  contentPad: { padding: 24, gap: 24 },
  mealSlot: { gap: 8 },
  slotTitle: { color: '#71717a', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  card: { padding: 16, borderRadius: 16, backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a' },
  cardCompleted: { backgroundColor: 'rgba(24, 24, 27, 0.4)', borderColor: 'rgba(39, 39, 42, 0.5)' },
  cardSelected: { borderColor: '#10b981' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mealName: { fontSize: 16, fontWeight: '600', color: '#e4e4e7' },
  textCompleted: { textDecorationLine: 'line-through', color: '#71717a' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calsText: { fontSize: 14, color: '#fb923c' },
  regenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regenText: { fontSize: 12, color: '#a1a1aa' }
});
