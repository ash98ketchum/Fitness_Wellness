import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Check, Upload, FileText } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';

const steps = [
  { id: 'personal', title: 'Personal Information', subtitle: 'Basic details to calibrate your metabolism calculations.' },
  { id: 'goals', title: 'Fitness Goals', subtitle: 'Tell us what you\'re working towards.' },
  { id: 'diet', title: 'Diet & Allergies', subtitle: 'So we never include something you can\'t eat.' },
  { id: 'lifestyle', title: 'Lifestyle & Schedule', subtitle: 'Your routine shapes your nutrition timing.' },
  { id: 'health', title: 'Health & Preferences', subtitle: 'Final details for a fully optimized plan.' },
  { id: 'medical', title: 'Medical Records', subtitle: 'Optional: Upload medical or blood reports for deep intelligence.' },
];

const goalOptions = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Athletic Performance', 'Body Recomposition'];
const activityLevels = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];
const dietPreferences = ['No Restrictions', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Mediterranean', 'Halal', 'Kosher'];
const mealCounts = ['2 meals', '3 meals', '4 meals', '5 meals', '6+ meals'];
const cookingSkills = ['Beginner', 'Intermediate', 'Advanced', 'I don\'t cook'];
const budgetLevels = ['Budget-friendly', 'Moderate', 'No budget limit'];

export default function Onboarding() {
  const router = useRouter();
  const { user, token, logout, updateUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    age: '', gender: '', weight: '', height: '', bodyFatPct: '',
    activityLevel: '', goal: '', targetWeight: '', targetBodyFat: '', timeframe: '',
    dietPreference: '', allergies: '', dislikedFoods: '',
    mealsPerDay: '', cookingSkill: '', budget: '',
    waterIntake: '', sleepHours: '', stressLevel: '', supplements: '', medicalConditions: '',
    bloodGroup: '', timeZone: '', occupation: '', diseases: '', allergiesList: '', medications: '', medicalReports: []
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (result.canceled) return;
      
      setIsUploading(true);
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('report', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf'
      } as any);

      const res = await fetch(`https://athelya-api.onrender.com/api/v1/onboarding/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev: any) => ({
          ...prev,
          medicalReports: [...prev.medicalReports, data.fileUrl]
        }));
        alert("Report uploaded and analyzed successfully!");
      } else {
        alert("Upload failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
    }
  };

  const update = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // Step 5 -> Submit metrics and route to loading
      try {
        const res = await fetch(`https://athelya-api.onrender.com/api/v1/onboarding`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...formData, userId: user?.id, email: user?.email, name: user?.name })
        });
        if (res.ok) {
          await updateUser({ hasCompletedOnboarding: true });
          router.replace('/(app)/loading');
        } else {
          console.error("Failed to save onboarding:", await res.text());
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else {
      router.replace('/');
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="p-6 flex-row items-center justify-between z-10">
        <TouchableOpacity onPress={() => router.replace('/')}>
          <View className="w-6 h-6 rounded bg-white items-center justify-center">
            <Activity size={16} color="#000" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={async () => {
            await logout();
            router.replace('/');
          }}
        >
          <Text className="text-sm font-medium text-zinc-500">Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-1 bg-zinc-900">
        <View 
          className="h-full bg-white"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </View>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-3xl font-semibold tracking-tight text-white mb-2">{steps[currentStep].title}</Text>
        <Text className="text-zinc-400 mb-8">{steps[currentStep].subtitle}</Text>
        
        <View className="space-y-6">
          {currentStep === 0 && (
            <>
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Input label="Age" placeholder="28" value={formData.age} onChangeText={(v: string) => update('age', v)} />
                </View>
              </View>
              <SelectCards label="Gender" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={(v: string) => update('gender', v)} />
              <View className="flex-row gap-4 my-4">
                <View className="flex-1">
                  <Input label="Weight (kg)" placeholder="75" value={formData.weight} onChangeText={(v: string) => update('weight', v)} />
                </View>
                <View className="flex-1">
                  <Input label="Height (cm)" placeholder="180" value={formData.height} onChangeText={(v: string) => update('height', v)} />
                </View>
              </View>
              <Input label="Body Fat % (optional)" placeholder="15" value={formData.bodyFatPct} onChangeText={(v: string) => update('bodyFatPct', v)} />
              <SelectCards label="Activity Level" options={activityLevels} value={formData.activityLevel} onChange={(v: string) => update('activityLevel', v)} />
              <View className="flex-row gap-4 my-4">
                <View className="flex-1">
                  <Input label="Blood Group" placeholder="e.g., O+" value={formData.bloodGroup} onChangeText={(v: string) => update('bloodGroup', v)} />
                </View>
                <View className="flex-1">
                  <Input label="Occupation" placeholder="e.g., Software Engineer" value={formData.occupation} onChangeText={(v: string) => update('occupation', v)} />
                </View>
              </View>
            </>
          )}

          {currentStep === 1 && (
            <>
              <SelectCards label="Primary Goal" options={goalOptions} value={formData.goal} onChange={(v: string) => update('goal', v)} />
              <View className="flex-row gap-4 my-4">
                <View className="flex-1">
                  <Input label="Target Weight (kg)" placeholder="70" value={formData.targetWeight} onChangeText={(v: string) => update('targetWeight', v)} />
                </View>
                <View className="flex-1">
                  <Input label="Target Body Fat %" placeholder="12" value={formData.targetBodyFat} onChangeText={(v: string) => update('targetBodyFat', v)} />
                </View>
              </View>
              <Input label="Timeframe" placeholder="3 months" value={formData.timeframe} onChangeText={(v: string) => update('timeframe', v)} />
            </>
          )}

          {currentStep === 2 && (
            <>
              <SelectCards label="Dietary Preference" options={dietPreferences} value={formData.dietPreference} onChange={(v: string) => update('dietPreference', v)} />
              <View className="mt-4">
                <Input label="Allergies & Restrictions" placeholder="e.g., Peanuts, Dairy" value={formData.allergies} onChangeText={(v: string) => update('allergies', v)} />
              </View>
              <View className="mt-4">
                <Input label="Foods You Dislike" placeholder="e.g., Mushrooms, Olives" value={formData.dislikedFoods} onChangeText={(v: string) => update('dislikedFoods', v)} />
              </View>
            </>
          )}

          {currentStep === 3 && (
            <>
              <SelectCards label="Meals Per Day" options={mealCounts} value={formData.mealsPerDay} onChange={(v: string) => update('mealsPerDay', v)} />
              <SelectCards label="Cooking Skill" options={cookingSkills} value={formData.cookingSkill} onChange={(v: string) => update('cookingSkill', v)} />
              <SelectCards label="Budget" options={budgetLevels} value={formData.budget} onChange={(v: string) => update('budget', v)} />
            </>
          )}

          {currentStep === 4 && (
            <>
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Input label="Daily Water Intake" placeholder="2.5" value={formData.waterIntake} onChangeText={(v: string) => update('waterIntake', v)} />
                </View>
                <View className="flex-1">
                  <Input label="Average Sleep" placeholder="7" value={formData.sleepHours} onChangeText={(v: string) => update('sleepHours', v)} />
                </View>
              </View>
              <SelectCards label="Stress Level" options={['Low', 'Moderate', 'High', 'Very High']} value={formData.stressLevel} onChange={(v: string) => update('stressLevel', v)} />
              <View className="mt-4">
                <Input label="Supplements (if any)" placeholder="e.g., Creatine" value={formData.supplements} onChangeText={(v: string) => update('supplements', v)} />
              </View>
              <View className="mt-4">
                <Input label="General Medical Conditions" placeholder="e.g., Diabetes" value={formData.medicalConditions} onChangeText={(v: string) => update('medicalConditions', v)} />
              </View>
              <View className="mt-4">
                <Input label="Diagnosed Diseases" placeholder="e.g., Hypertension" value={formData.diseases} onChangeText={(v: string) => update('diseases', v)} />
              </View>
              <View className="mt-4">
                <Input label="Current Medications" placeholder="e.g., Metformin 500mg" value={formData.medications} onChangeText={(v: string) => update('medications', v)} />
              </View>
            </>
          )}

          {currentStep === 5 && (
            <>
              <Text className="text-zinc-400 mb-6">
                Upload your latest blood test or medical reports. Athelya's Document Intelligence will extract key markers and use them to personalize your transformation journey.
              </Text>
              
              <TouchableOpacity 
                onPress={handleFileUpload}
                disabled={isUploading}
                className="w-full border-2 border-dashed border-zinc-700 rounded-2xl p-8 items-center justify-center bg-zinc-900/30"
              >
                <View className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center mb-4">
                  <Upload size={24} color={isUploading ? "#a1a1aa" : "#fff"} />
                </View>
                <Text className="text-white font-medium mb-1">{isUploading ? "Uploading & Analyzing..." : "Tap to upload PDF"}</Text>
                <Text className="text-zinc-500 text-sm">Blood tests, doctor reports, etc.</Text>
              </TouchableOpacity>

              {formData.medicalReports.length > 0 && (
                <View className="mt-6 space-y-3">
                  <Text className="text-sm font-medium text-zinc-400">Uploaded Reports</Text>
                  {formData.medicalReports.map((url: string, idx: number) => (
                    <View key={idx} className="flex-row items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                      <FileText size={20} color="#fff" />
                      <Text className="text-zinc-300 ml-3 flex-1 font-medium" numberOfLines={1}>{url.split('-').pop()}</Text>
                      <Check size={16} color="#10b981" />
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

      </ScrollView>

      {/* Footer Nav */}
      <View className="p-6 border-t border-zinc-900 bg-black flex-row items-center justify-between">
        <TouchableOpacity onPress={handleBack} className="py-3 px-4">
          <Text className="text-zinc-400 font-medium">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleNext} 
          className="bg-white py-3 px-6 rounded-lg"
        >
          <Text className="text-black font-semibold">
            {currentStep === steps.length - 1 ? 'Generate Plan' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Input({ label, placeholder, value, onChangeText }: any) {
  return (
    <View className="mb-2">
      <Text className="text-sm font-medium text-zinc-300 mb-1.5">{label}</Text>
      <TextInput 
        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
        placeholder={placeholder}
        placeholderTextColor="#71717a"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function SelectCards({ label, options, value, onChange }: any) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-zinc-300 mb-2">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option: string) => {
          const selected = value === option;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onChange(option)}
              className={`p-3 rounded-xl border flex-row items-center justify-between ${
                selected ? 'border-white bg-white/5' : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              <Text className={`text-sm font-medium mr-2 ${selected ? 'text-white' : 'text-zinc-400'}`}>
                {option}
              </Text>
              {selected && <Check size={14} color="#fff" />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
