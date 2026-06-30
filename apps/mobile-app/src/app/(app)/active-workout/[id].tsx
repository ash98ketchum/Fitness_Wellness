import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { ChevronLeft, Check, Timer, Activity, MessageSquare, Send, Maximize, X, Mic } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { BlurView } from 'expo-blur';

// TTS – read AI response out loud
function speakText(text: string, onEnd?: () => void, cancelPrevious: boolean = true) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (cancelPrevious) window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    utter.pitch = 1;
    if (onEnd) utter.onend = onEnd;
    window.speechSynthesis.speak(utter);
  } else {
    if (onEnd) setTimeout(onEnd, 2000);
  }
}

export default function ActiveWorkout() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [chatMode, setChatMode] = useState<'trainer' | 'coach'>('trainer');
  
  // Animation Sequence State
  const [animationPhase, setAnimationPhase] = useState<'setup' | 'grip' | 'posture' | 'movement' | 'loop'>('setup');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHandsFreeMode, setIsHandsFreeMode] = useState(false);
  const [handsFreeStatus, setHandsFreeStatus] = useState("Tap mic to start");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isHandsFreeModeRef = useRef(false);
  const isProcessingRef = useRef(false);
  const processCommandRef = useRef<any>(null);

  useEffect(() => {
    isHandsFreeModeRef.current = isHandsFreeMode;
  }, [isHandsFreeMode]);

  const startListening = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecClass) {
      setHandsFreeStatus("Voice not supported.");
      return;
    }
    
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    const recognition = new SpeechRecClass();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setHandsFreeStatus("🎤 Listening... speak now!");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setHandsFreeStatus(`Heard: "${transcript}"`);
      if (processCommandRef.current) {
        processCommandRef.current(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setHandsFreeStatus(event.error === 'not-allowed' ? "Mic denied." : "Couldn't hear you.");
    };

    recognition.onend = () => {
      setIsListening(false);
      if (isHandsFreeModeRef.current && !isProcessingRef.current) {
        setTimeout(() => {
          if (isHandsFreeModeRef.current && !isProcessingRef.current) {
            startListening();
          }
        }, 500);
      } else if (!isHandsFreeModeRef.current) {
        setHandsFreeStatus("Tap mic to speak");
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) {}
  }, []);

  useEffect(() => {
    if (isHandsFreeMode) {
      startListening();
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
    }
  }, [isHandsFreeMode, startListening]);

  // Track inputs for the current exercise
  const [setsData, setSetsData] = useState<{ reps: string, weight: string, completed: boolean }[]>([]);

  // Chat State
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, content: chatInput.trim() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const endpoint = chatMode === 'coach' 
        ? 'https://athelya-api.onrender.com/api/v1/workouts/coach-chat'
        : 'https://athelya-api.onrender.com/api/v1/workouts/trainer-chat'; // assuming you have this or will have this
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [...chatHistory, userMsg],
          exerciseId: session?.exercises[activeExerciseIndex]?.exerciseId || session?.exercises[activeExerciseIndex]?.exercise?.id
        })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Connection error.' }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error reaching the AI.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => (prev ? prev - 1 : 0));
      }, 1000);
    } else if (restTimer === 0) {
      setRestTimer(null); // Timer finished
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const initializeSetsData = (sessionData: any, exerciseIndex: number) => {
    const currentEx = sessionData.exercises[exerciseIndex];
    const targetSets = currentEx.setsTarget;
    const dbSets = currentEx.sets || [];
    
    const newSetsData = Array.from({ length: targetSets }, (_, i) => {
       const existing = dbSets.find((s: any) => s.setNumber === i + 1);
       if (existing) {
         return {
           reps: existing.repsCompleted?.toString() || '',
           weight: existing.weightUsed?.toString() || '',
           completed: existing.isCompleted
         };
       }
       return { reps: '', weight: '', completed: false };
    });
    setSetsData(newSetsData);
  };

  const logSetToDB = async (setNumber: number, reps: string, weight: string) => {
    try {
      if (!session) return;
      const currentEx = session.exercises[activeExerciseIndex];
      await fetch('https://athelya-api.onrender.com/api/v1/workouts/log-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          workoutExerciseId: currentEx.id,
          setNumber,
          repsCompleted: reps,
          weightUsed: weight
        })
      });
    } catch (err) {
      console.error('Failed to log set:', err);
    }
  };

  const fetchWorkout = async () => {
    try {
      // In a real app, we'd have a specific endpoint for get session by id
      // Since we just built /api/v1/workouts/today, we can use that to grab the active one
      const res = await fetch(`https://athelya-api.onrender.com/api/v1/workouts/today?userId=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.session) {
        setSession(data.session);
        initializeSetsData(data.session, 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextExercise = () => {
    if (session && activeExerciseIndex < session.exercises.length - 1) {
      const nextIndex = activeExerciseIndex + 1;
      setActiveExerciseIndex(nextIndex);
      initializeSetsData(session, nextIndex);
      setRestTimer(null);
    } else {
      // Finish workout
      router.push('/(app)/dashboard');
    }
  };

  const handleSetComplete = (index: number) => {
    const currentSet = setsData[index];
    setSetsData(prev => prev.map((s, i) =>
      i === index ? { ...s, completed: true } : s
    ));
    
    logSetToDB(index + 1, currentSet.reps, currentSet.weight);
    
    const currentEx = session.exercises[activeExerciseIndex];
    setRestTimer(currentEx.restSeconds);
  };

  const processHandsFreeCommand = async (command: string) => {
    isProcessingRef.current = true;
    setHandsFreeStatus("Processing command...");
    
    const lowerCommand = command.toLowerCase();
    
    // 1. Next Exercise
    if (lowerCommand.includes('next') && (lowerCommand.includes('exercise') || lowerCommand.includes('workout') || lowerCommand.includes('move'))) {
      handleNextExercise();
      setHandsFreeStatus("Moving to next exercise...");
      speakText("Moving to next exercise.", () => {
         isProcessingRef.current = false;
         if (isHandsFreeModeRef.current) startListening();
      }, true);
      return;
    }
    
    // 2. Skip Rest
    if (lowerCommand.includes('skip') && lowerCommand.includes('rest')) {
      setRestTimer(null);
      setHandsFreeStatus("Rest skipped.");
      speakText("Rest skipped. Let's go.", () => {
         isProcessingRef.current = false;
         if (isHandsFreeModeRef.current) startListening();
      }, true);
      return;
    }
    
    // 3. Log a set
    const repsMatch = lowerCommand.match(/(\d+)\s*rep/);
    const weightMatch = lowerCommand.match(/(\d+)\s*(kg|lb|kilo)/);
    let loggedSomething = false;
    
    if (repsMatch || weightMatch || lowerCommand.includes('log') || lowerCommand.includes('done')) {
       const nextIncompleteIndex = setsData.findIndex(s => !s.completed);
       if (nextIncompleteIndex !== -1) {
          const currentEx = session.exercises[activeExerciseIndex];
          const reps = repsMatch ? repsMatch[1] : setsData[nextIncompleteIndex].reps || "10";
          const weight = weightMatch ? weightMatch[1] : setsData[nextIncompleteIndex].weight || "0";
          
          setSetsData(prev => {
             const newData = [...prev];
             newData[nextIncompleteIndex] = { weight, reps, completed: true };
             return newData;
          });
          
          logSetToDB(nextIncompleteIndex + 1, reps, weight);
          
          setRestTimer(currentEx.restSeconds);
          const affirmation = `Logged ${reps} reps at ${weight} kilograms. Rest started for ${currentEx.restSeconds} seconds.`;
          setHandsFreeStatus(affirmation);
          loggedSomething = true;
          
          speakText(affirmation, undefined, true);
          
          // Background AI Coaching Call
          fetch(`https://athelya-api.onrender.com/api/v1/chat/voice`, {
             method: 'POST',
             headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
             body: JSON.stringify({ text: `[WORKOUT EVENT] I just finished ${reps} reps at ${weight}kg of ${currentEx.exercise.name}. Give me a short 1-sentence motivation, form tip, or reminder to drink water.` })
          }).then(res => res.json()).then(data => {
             if (data.text && isHandsFreeModeRef.current) {
                 speakText(data.text, () => {
                     isProcessingRef.current = false;
                     if (isHandsFreeModeRef.current) startListening();
                 }, false);
             } else {
                 isProcessingRef.current = false;
                 if (isHandsFreeModeRef.current) startListening();
             }
          }).catch(() => {
             isProcessingRef.current = false;
             if (isHandsFreeModeRef.current) startListening();
          });
          return;
       } else {
          setHandsFreeStatus("All sets completed for this exercise!");
          loggedSomething = true;
          speakText("All sets completed. Say next exercise when ready.", () => {
             isProcessingRef.current = false;
             if (isHandsFreeModeRef.current) startListening();
          }, true);
          return;
       }
    }
    
    // 4. Fallback to AI conversational query
    if (!loggedSomething) {
      try {
        const res = await fetch(`https://athelya-api.onrender.com/api/v1/chat/voice`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: command })
        });
        const data = await res.json();
        setHandsFreeStatus(data.text || "Command executed.");
        speakText(data.text || "I'm not sure.", () => {
            isProcessingRef.current = false;
            if (isHandsFreeModeRef.current) startListening();
        }, true);
      } catch (e) {
        setHandsFreeStatus("Error processing command.");
        isProcessingRef.current = false;
        if (isHandsFreeModeRef.current) startListening();
      }
    }
  };

  useEffect(() => {
    processCommandRef.current = processHandsFreeCommand;
  }, [processHandsFreeCommand]);

  if (loading || !session) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#emerald-500" />
      </View>
    );
  }

  const currentExercise = session.exercises[activeExerciseIndex];

  const renderVideoPlayer = (isFullScreenView: boolean) => {
    return currentExercise.exercise.setupAnimationUrl ? (
      currentExercise.exercise.setupAnimationUrl.endsWith('.mp4') ? (
        <AvatarVideoPlayer 
          currentExercise={currentExercise}
          animationPhase={animationPhase}
          setAnimationPhase={setAnimationPhase}
          isFullScreenView={isFullScreenView}
        />
      ) : (
        <Image
          source={{ uri: currentExercise.exercise.setupAnimationUrl.replace('.json', '.png') }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode={isFullScreenView ? "contain" : "cover"}
        />
      )
    ) : (
      <Text className="text-zinc-500">3D Avatar Placeholder</Text>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-4 flex-row items-center border-b border-zinc-900">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-4">
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View>
          <Text className="text-zinc-500 text-xs uppercase tracking-wider">Exercise {activeExerciseIndex + 1} of {session.exercises.length}</Text>
          <Text className="text-white font-semibold text-lg">{session.title}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {restTimer !== null ? (
          <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 items-center justify-center my-8">
            <Timer size={48} color="#10b981" className="mb-4" />
            <Text className="text-zinc-400 text-lg mb-2">Rest Time Remaining</Text>
            <Text className="text-white text-6xl font-bold tracking-tighter">
              {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
            </Text>
            <TouchableOpacity 
              onPress={() => setRestTimer(null)}
              className="mt-8 bg-zinc-800 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-medium">Skip Rest</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Exercise Details & AI Avatar Player Card */}
            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden mb-8">
              
              {/* Avatar Player */}
              <View className="w-full h-64 bg-zinc-800 relative justify-center items-center">
                {!isFullscreen && renderVideoPlayer(false)}

                {/* Phase Indicator */}
                <View className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full border border-zinc-700">
                  <Text className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    {animationPhase} PHASE
                  </Text>
                </View>

                {/* Fullscreen Button */}
                <TouchableOpacity 
                  onPress={() => setIsFullscreen(true)}
                  className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full border border-zinc-700"
                >
                  <Maximize size={20} color="#10b981" />
                </TouchableOpacity>
              </View>
              <View className="p-5">
                <Text className="text-white text-2xl font-bold mb-2">{currentExercise.exercise.name}</Text>
                
                <View className="flex-row items-center gap-4 mb-4 flex-wrap">
                  <View className="bg-zinc-800 px-3 py-1.5 rounded-full">
                    <Text className="text-zinc-300 text-xs">{currentExercise.exercise.targetMuscles}</Text>
                  </View>
                  <View className="bg-zinc-800 px-3 py-1.5 rounded-full">
                    <Text className="text-zinc-300 text-xs">Tempo: {currentExercise.tempo}</Text>
                  </View>
                </View>

                <Text className="text-zinc-400 text-sm leading-relaxed">
                  Target: {currentExercise.setsTarget} sets × {currentExercise.repsTarget} reps at {currentExercise.intensity}.
                  Suggested Weight: {currentExercise.suggestedWeight}kg.
                </Text>
              </View>
            </View>

            {/* Sets Logging */}
            <Text className="text-white text-lg font-semibold mb-4">Track Sets</Text>
            <View className="space-y-3 mb-8">
              {setsData.map((setData, index) => (
                <View key={index} className={`flex-row items-center p-3 rounded-xl border ${setData.completed ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-zinc-900 border-zinc-800'}`}>
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${setData.completed ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                    {setData.completed ? (
                      <Check size={18} color="#fff" />
                    ) : (
                      <Text className="text-zinc-400 font-bold">{index + 1}</Text>
                    )}
                  </View>
                  <View className="flex-1 flex-row gap-2">
                    <TextInput 
                      className={`rounded-lg px-4 py-3 flex-1 ${setData.completed ? 'bg-emerald-900/30 text-emerald-300' : 'bg-zinc-800 text-white'}`}
                      placeholder="kg"
                      placeholderTextColor="#71717a"
                      keyboardType="numeric"
                      editable={!setData.completed}
                      value={setData.weight}
                      onChangeText={(t) => {
                        setSetsData(prev => prev.map((s, i) =>
                          i === index ? { ...s, weight: t } : s
                        ));
                      }}
                    />
                    <TextInput 
                      className={`rounded-lg px-4 py-3 flex-1 ${setData.completed ? 'bg-emerald-900/30 text-emerald-300' : 'bg-zinc-800 text-white'}`}
                      placeholder="reps"
                      placeholderTextColor="#71717a"
                      keyboardType="numeric"
                      editable={!setData.completed}
                      value={setData.reps}
                      onChangeText={(t) => {
                        setSetsData(prev => prev.map((s, i) =>
                          i === index ? { ...s, reps: t } : s
                        ));
                      }}
                    />
                  </View>
                  {!setData.completed ? (
                    <TouchableOpacity 
                      onPress={() => handleSetComplete(index)}
                      className="w-12 h-12 ml-2 rounded-xl bg-emerald-500/20 items-center justify-center"
                    >
                      <Check size={20} color="#10b981" />
                    </TouchableOpacity>
                  ) : (
                    <View className="w-12 h-12 ml-2 rounded-xl bg-emerald-500/30 items-center justify-center">
                      <Check size={20} color="#10b981" />
                    </View>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity 
              onPress={handleNextExercise}
              className="bg-white p-4 rounded-full items-center justify-center mb-8"
            >
              <Text className="text-black font-bold text-lg">
                {activeExerciseIndex < session.exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'}
              </Text>
            </TouchableOpacity>

            {/* AI Chat Modules (Trainer vs Coach) */}
            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden p-5 mb-8">
              <View className="flex-row items-center justify-between mb-4 border-b border-zinc-800 pb-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
                    {chatMode === 'trainer' ? <Activity size={20} color="#10b981" /> : <MessageSquare size={20} color="#10b981" />}
                  </View>
                  <View>
                    <Text className="text-white font-semibold">
                      {chatMode === 'trainer' ? 'Hype Trainer' : 'Biomechanics Coach'}
                    </Text>
                    <Text className="text-zinc-400 text-xs">
                      {chatMode === 'trainer' ? 'Motivation & Pacing' : 'Form & Technique'}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  className="px-3 py-1.5 bg-zinc-800 rounded-full"
                  onPress={() => setChatMode(m => m === 'trainer' ? 'coach' : 'trainer')}
                >
                  <Text className="text-xs text-zinc-300">Switch Mode</Text>
                </TouchableOpacity>
              </View>

              <View className="h-48 mb-4">
                <ScrollView contentContainerStyle={{ gap: 12 }}>
                  {chatHistory.map((msg, i) => (
                    <View key={i} className={`flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <View className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user' ? 'bg-emerald-500' : 'bg-zinc-800'
                      }`}>
                        <Text className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-zinc-200'} leading-relaxed`}>
                          {msg.content}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {chatLoading && (
                    <View className="flex-row justify-start">
                      <View className="bg-zinc-800 rounded-2xl px-4 py-3">
                        <ActivityIndicator size="small" color="#10b981" />
                      </View>
                    </View>
                  )}
                </ScrollView>
              </View>

              <View className="flex-row gap-3">
                <TextInput
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder={chatMode === 'trainer' ? "Need a push?" : "Ask about form..."}
                  placeholderTextColor="#71717a"
                  className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-white"
                  onSubmitEditing={handleChatSubmit}
                />
                <TouchableOpacity 
                  onPress={handleChatSubmit}
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-12 h-12 bg-emerald-500 rounded-xl items-center justify-center"
                >
                  <Send size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fullscreen Modal */}
      <Modal visible={isFullscreen} transparent={true} animationType="fade">
        <BlurView intensity={90} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View className="w-[90%] max-w-xl aspect-square relative bg-black rounded-3xl overflow-hidden border border-zinc-700 shadow-2xl">
            {isFullscreen && renderVideoPlayer(true)}
            
            {/* Phase Indicator */}
            <View className="absolute top-6 left-6 bg-black/50 px-4 py-2 rounded-full border border-zinc-700 z-10">
              <Text className="text-emerald-400 text-sm font-bold uppercase tracking-wider">
                {animationPhase} PHASE
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity 
              onPress={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 bg-black/50 p-3 rounded-full border border-zinc-700 z-10"
            >
              <X size={24} color="#10b981" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>

      {/* Hands Free Mode Modal */}
      <Modal visible={isHandsFreeMode} transparent={true} animationType="slide">
        <View className="flex-1 justify-end">
          <View className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 h-[45%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Hands-Free Mode</Text>
              <TouchableOpacity onPress={() => setIsHandsFreeMode(false)} className="bg-zinc-800 p-2 rounded-full">
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-1 items-center justify-center">
              <TouchableOpacity
                onPress={() => {
                  if (isListening || isProcessingRef.current) {
                    if (recognitionRef.current) {
                      try { recognitionRef.current.stop(); } catch (_) {}
                    }
                    setIsListening(false);
                    setHandsFreeStatus("Stopped.");
                  } else {
                    startListening();
                  }
                }}
                className={`w-28 h-28 rounded-full items-center justify-center mb-4 border-2 ${isListening ? 'bg-red-600/30 border-red-500' : 'bg-blue-600/20 border-blue-500/50'}`}
              >
                <Mic size={48} color={isListening ? "#ef4444" : "#3b82f6"} />
              </TouchableOpacity>
              <Text className="text-zinc-200 text-lg mb-2 text-center font-medium">{handsFreeStatus}</Text>
              <Text className="text-zinc-500 text-sm text-center">Say: "Log 10 reps at 50kg" or "Next exercise"</Text>
            </View>
            
            <View className="flex-row justify-center mt-auto gap-3">
               <TouchableOpacity onPress={() => processHandsFreeCommand("Log my set")} className="bg-zinc-800 px-5 py-3 rounded-full border border-zinc-700">
                 <Text className="text-zinc-300 font-medium">⚡ Log Set</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => processHandsFreeCommand("Next exercise")} className="bg-zinc-800 px-5 py-3 rounded-full border border-zinc-700">
                 <Text className="text-zinc-300 font-medium">⏭ Next</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => { setRestTimer(null); }} className="bg-zinc-800 px-5 py-3 rounded-full border border-zinc-700">
                 <Text className="text-zinc-300 font-medium">⏩ Skip Rest</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Hands-Free Button */}
      {!isHandsFreeMode && (
        <TouchableOpacity 
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/50 border border-blue-500"
          onPress={() => setIsHandsFreeMode(true)}
        >
          <Mic size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function AvatarVideoPlayer({ currentExercise, animationPhase, setAnimationPhase, isFullScreenView }: any) {
  const videoSource = animationPhase === 'setup' ? currentExercise.exercise.setupAnimationUrl :
                 animationPhase === 'grip' ? currentExercise.exercise.gripAnimationUrl :
                 animationPhase === 'posture' ? currentExercise.exercise.postureAnimationUrl :
                 animationPhase === 'movement' ? currentExercise.exercise.movementAnimationUrl :
                 currentExercise.exercise.loopAnimationUrl;

  const player = useVideoPlayer(videoSource, player => {
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    player.loop = animationPhase === 'loop';
    player.play();
  }, [player, animationPhase, videoSource]);

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      if (!player.loop) {
        if (animationPhase === 'setup') setAnimationPhase('grip');
        else if (animationPhase === 'grip') setAnimationPhase('posture');
        else if (animationPhase === 'posture') setAnimationPhase('movement');
        else if (animationPhase === 'movement') setAnimationPhase('loop');
      }
    });
    return () => {
      subscription.remove();
    };
  }, [player, animationPhase, setAnimationPhase]);

  return (
    <VideoView 
      player={player} 
      style={{ width: '100%', height: '100%', position: 'absolute' }} 
      contentFit={isFullScreenView ? "contain" : "cover"} 
      nativeControls={false}
    />
  );
}
