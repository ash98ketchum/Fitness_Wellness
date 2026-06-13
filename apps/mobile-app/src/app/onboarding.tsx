import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../constants/api';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const updateData = (key: string, value: string) => setData({ ...data, [key]: value });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save profile');
      router.replace('/(app)/dashboard');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.question}>Personal Info</Text>
            <Input key="age" label="Age" placeholder="e.g. 25" keyboardType="numeric" value={data.age || ''} onChangeText={v => updateData('age', v)} />
            <Input key="gender" label="Gender" placeholder="Male / Female / Other" value={data.gender || ''} onChangeText={v => updateData('gender', v)} />
            <Input key="weight" label="Weight (kg)" placeholder="e.g. 70" keyboardType="numeric" value={data.weight || ''} onChangeText={v => updateData('weight', v)} />
            <Input key="height" label="Height (cm)" placeholder="e.g. 175" keyboardType="numeric" value={data.height || ''} onChangeText={v => updateData('height', v)} />
            <Button title="Next" onPress={handleNext} style={styles.btn} />
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.question}>Fitness Goals</Text>
            <Input key="goal" label="Primary Goal" placeholder="Lose weight, build muscle..." value={data.goal || ''} onChangeText={v => updateData('goal', v)} />
            <Input key="targetWeight" label="Target Weight (kg)" placeholder="e.g. 65" keyboardType="numeric" value={data.targetWeight || ''} onChangeText={v => updateData('targetWeight', v)} />
            <Input key="timeframe" label="Timeframe" placeholder="e.g. 3 months" value={data.timeframe || ''} onChangeText={v => updateData('timeframe', v)} />
            <View style={styles.row}>
              <Button title="Back" onPress={handleBack} variant="outline" style={[styles.btn, { flex: 1, marginRight: 8 }]} />
              <Button title="Next" onPress={handleNext} style={[styles.btn, { flex: 1 }]} />
            </View>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.question}>Diet Preferences</Text>
            <Input key="dietPreference" label="Diet Preference" placeholder="Vegan, Keto, None..." value={data.dietPreference || ''} onChangeText={v => updateData('dietPreference', v)} />
            <Input key="allergies" label="Allergies" placeholder="Peanuts, Dairy..." value={data.allergies || ''} onChangeText={v => updateData('allergies', v)} />
            <Input key="mealsPerDay" label="Meals Per Day" placeholder="e.g. 4" keyboardType="numeric" value={data.mealsPerDay || ''} onChangeText={v => updateData('mealsPerDay', v)} />
            <View style={styles.row}>
              <Button title="Back" onPress={handleBack} variant="outline" style={[styles.btn, { flex: 1, marginRight: 8 }]} />
              <Button title="Complete Setup" onPress={handleSubmit} isLoading={loading} style={[styles.btn, { flex: 1 }]} />
            </View>
          </View>
        );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.progress}>
        <View style={[styles.bar, step >= 1 && styles.activeBar]} />
        <View style={[styles.bar, step >= 2 && styles.activeBar]} />
        <View style={[styles.bar, step >= 3 && styles.activeBar]} />
      </View>
      <Text style={styles.title}>Step {step} of 3</Text>
      <View style={styles.card}>{renderStep()}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#000', padding: 24, paddingTop: 60 },
  progress: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  bar: { flex: 1, height: 4, backgroundColor: '#27272a', borderRadius: 2 },
  activeBar: { backgroundColor: '#10b981' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  card: { backgroundColor: '#18181b', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#27272a' },
  question: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 24 },
  btn: { marginTop: 16 },
  row: { flexDirection: 'row', marginTop: 16 }
});
