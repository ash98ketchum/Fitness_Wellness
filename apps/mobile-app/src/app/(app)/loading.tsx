import React, { useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const agentSteps = [
  "Saving your profile",
  "Agent 1: Generating initial meal plan",
  "Agent 2: Reviewing nutritional accuracy",
  "Agent 3: Optimizing macros & timing",
  "Preparing your dashboard",
];

export default function Loading() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current || !token) return;
    hasStarted.current = true;

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < 3) {
        currentStep += 1;
        setActiveStep(currentStep);
      }
    }, 2000);

    const runPipeline = async () => {
      try {
        const genRes = await fetch('https://athelya-api.onrender.com/api/v1/plans/generate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({})
        });

        if (genRes.ok) {
          // Now poll for completion
          const checkPlan = setInterval(async () => {
            try {
              const res = await fetch(`https://athelya-api.onrender.com/api/v1/plans/latest?userId=${user?.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                const data = await res.json();
                if (data.plan && data.plan.status === 'READY') {
                  clearInterval(interval);
                  clearInterval(checkPlan);
                  setActiveStep(4);
                  setTimeout(() => router.replace('/(app)/dashboard'), 500);
                }
              }
            } catch (e) {
              // Keep polling
            }
          }, 3000);
        } else {
          console.error('Generation failed', await genRes.text());
        }
      } catch (err) {
        console.error('Pipeline error:', err);
      }
    };

    runPipeline();

    return () => clearInterval(interval);
  }, [user, token, router]);

  return (
    <View className="flex-1 bg-black justify-center items-center px-6">
      <StatusBar style="light" />
      
      <View className="w-full max-w-sm">
        <Text className="text-2xl font-semibold text-white mb-2 tracking-tight text-center">
          Building your AI Model
        </Text>
        <Text className="text-sm text-zinc-500 text-center mb-10">This usually takes 10-15 seconds</Text>

        <View className="space-y-6">
          {agentSteps.map((step, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            
            return (
              <View key={step} className="flex-row items-center gap-4 mb-6">
                <View className="w-6 h-6 items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 size={24} color="#10b981" />
                  ) : isActive ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View className="w-2 h-2 rounded-full bg-zinc-800" />
                  )}
                </View>
                
                <Text className={`text-base font-medium ${
                  isActive ? 'text-white' : isCompleted ? 'text-zinc-500' : 'text-zinc-800'
                }`}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
