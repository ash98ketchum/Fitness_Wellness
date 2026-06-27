import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, Clock, ChefHat, Flame, Send, Bot, Mic } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function MealDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [meal, setMeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

// TTS – read AI response out loud
function speakText(text: string, onEnd?: () => void) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    utter.pitch = 1;
    if (onEnd) utter.onend = onEnd;
    window.speechSynthesis.speak(utter);
  } else {
    if (onEnd) setTimeout(onEnd, 2000);
  }
}

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Voice state
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isVoiceModeRef = useRef(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
    isProcessingRef.current = chatLoading;
  }, [isVoiceMode, chatLoading]);

  const startListening = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecClass) {
      setIsVoiceMode(false);
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    const recognition = new SpeechRecClass();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput('');
      setIsListening(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    
    recognition.onend = () => {
      setIsListening(false);
      if (isVoiceModeRef.current && !isProcessingRef.current) {
        setTimeout(() => {
          if (isVoiceModeRef.current && !isProcessingRef.current) {
            startListening();
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) {}
  }, []);

  const toggleVoiceMode = () => {
    const newMode = !isVoiceMode;
    setIsVoiceMode(newMode);
    if (newMode) {
      startListening();
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  useEffect(() => {
    if (!id || !user || !token) return;
    
    fetch(`http://localhost:3000/api/v1/meals/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.meal) setMeal(data.meal);
      })
      .finally(() => setLoading(false));
  }, [id, user, token]);

  const handleSendMessage = async (overrideText?: string) => {
    const userMessage = (overrideText || input).trim();
    if (!userMessage || chatLoading || !meal || !token) return;

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setChatLoading(true);
    
    isProcessingRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/agents/cooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mealId: meal.id,
          messages: newMessages
        })
      });

      const data = await response.json();
      const reply = data.reply || "I couldn't process that.";
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      
      if (isVoiceModeRef.current) {
        speakText(reply, () => {
          if (isVoiceModeRef.current) startListening();
        });
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: "An error occurred. Please try again." }]);
      if (isVoiceModeRef.current) startListening();
    } finally {
      setChatLoading(false);
      isProcessingRef.current = false;
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View className="flex-1 bg-black justify-center items-center p-6">
        <Text className="text-white text-xl font-semibold mb-4">Meal not found</Text>
        <TouchableOpacity className="bg-white px-4 py-2 rounded-lg" onPress={() => router.back()}>
          <Text className="text-black font-medium">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      <View className="flex-row items-center p-4 border-b border-zinc-900 bg-black">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mr-4">
          <ArrowLeft size={20} color="#a1a1aa" />
        </TouchableOpacity>
        <Text className="text-white font-medium text-lg flex-1 truncate">{meal.name}</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          
          <Text className="text-3xl font-semibold tracking-tight text-white mb-2">{meal.name}</Text>
          
          <View className="flex-row items-center gap-4 text-zinc-400 mb-6 flex-wrap">
            <View className="flex-row items-center gap-1">
              <Clock size={14} color="#a1a1aa" />
              <Text className="text-zinc-400 text-sm">{meal.prepTime || 15} min prep</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <ChefHat size={14} color="#a1a1aa" />
              <Text className="text-zinc-400 text-sm">{meal.difficulty || 'Easy'}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Flame size={14} color="#fb923c" />
              <Text className="text-orange-400 text-sm">{meal.calories} kcal</Text>
            </View>
          </View>

          <View className="flex-row gap-2 mb-6 flex-wrap">
            <View className="px-4 py-2 bg-blue-900/20 rounded-lg border border-blue-900/50 items-center justify-center">
              <Text className="text-blue-400 font-semibold">{meal.macros?.protein || 0}g</Text>
              <Text className="text-blue-400 text-xs">Protein</Text>
            </View>
            <View className="px-4 py-2 bg-emerald-900/20 rounded-lg border border-emerald-900/50 items-center justify-center">
              <Text className="text-emerald-400 font-semibold">{meal.macros?.carbs || 0}g</Text>
              <Text className="text-emerald-400 text-xs">Carbs</Text>
            </View>
            <View className="px-4 py-2 bg-yellow-900/20 rounded-lg border border-yellow-900/50 items-center justify-center">
              <Text className="text-yellow-400 font-semibold">{meal.macros?.fats || 0}g</Text>
              <Text className="text-yellow-400 text-xs">Fats</Text>
            </View>
          </View>

          {/* Ingredients */}
          <View className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 mb-6">
            <Text className="text-lg font-medium text-white mb-4">Ingredients</Text>
            <View className="space-y-2">
              {meal.ingredients?.map((ing: string, i: number) => {
                const portion = meal.portionSizes?.[ing] || '';
                return (
                  <View key={i} className="flex-row items-center gap-3">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Text className="text-zinc-300">
                      {ing} {portion ? `- ${portion}` : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Instructions */}
          <View className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 mb-6">
            <Text className="text-lg font-medium text-white mb-4">Instructions</Text>
            {meal.recipeSteps && meal.recipeSteps.length > 0 ? (
              <View className="space-y-4">
                {meal.recipeSteps.map((step: string, i: number) => (
                  <View key={i} className="flex-row items-start gap-3">
                    <Text className="text-zinc-500 font-medium">{i + 1}.</Text>
                    <Text className="text-zinc-300 leading-relaxed flex-1">{step}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-zinc-300 leading-relaxed">
                {meal.description || "Simple assembly. Combine ingredients and serve immediately."}
              </Text>
            )}
          </View>

          {/* Chat Interface */}
          <View className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden min-h-[400px] flex-col">
            <View className="p-4 border-b border-zinc-800 flex-row items-center gap-3 bg-zinc-900/50">
              <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center">
                <ChefHat size={16} color="#10b981" />
              </View>
              <View>
                <Text className="font-medium text-white">Cooking Assistant</Text>
                <Text className="text-xs text-zinc-500">Ask about substitutions or allergies</Text>
              </View>
            </View>

            <ScrollView ref={scrollViewRef} className="flex-1 p-4 h-64">
              {messages.length === 0 && (
                <View className="items-center mt-8 opacity-50">
                  <Bot size={32} color="#a1a1aa" />
                  <Text className="text-center text-zinc-500 text-sm mt-2">
                    Hi! I'm your dedicated cooking assistant for {meal.name}.{"\n"}
                    Need any substitutions?
                  </Text>
                </View>
              )}
              {messages.map((m, i) => (
                <View key={i} className={`flex-row mb-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <View className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center mr-2">
                      <Bot size={14} color="#34d399" />
                    </View>
                  )}
                  <View className={`p-3 rounded-2xl max-w-[80%] ${
                    m.role === 'user' ? 'bg-emerald-600 rounded-tr-none' : 'bg-zinc-900 border border-zinc-800 rounded-tl-none'
                  }`}>
                    <Text className={m.role === 'user' ? 'text-white' : 'text-zinc-200'}>{m.content}</Text>
                  </View>
                </View>
              ))}
              {chatLoading && (
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center mr-2">
                    <Bot size={14} color="#34d399" />
                  </View>
                  <View className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 rounded-tl-none">
                    <Text className="text-zinc-400">Thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View className="p-3 border-t border-zinc-800 bg-zinc-900/30 flex-row items-center gap-2">
              <TouchableOpacity 
                onPress={toggleVoiceMode}
                className={`w-10 h-10 rounded-full items-center justify-center ${isVoiceMode ? 'bg-red-600' : 'bg-zinc-800'}`}
              >
                <Mic size={18} color={isVoiceMode ? "#fff" : "#a1a1aa"} />
              </TouchableOpacity>
              <View className="flex-1 relative justify-center">
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder={isVoiceMode ? (isListening ? "Listening..." : "Voice mode active") : "Ask a question..."}
                  placeholderTextColor="#71717a"
                  className={`w-full bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2.5 pr-10 ${isVoiceMode ? 'text-zinc-500' : 'text-white'}`}
                  editable={!isVoiceMode}
                  onSubmitEditing={() => handleSendMessage()}
                />
                <TouchableOpacity 
                  className="absolute right-1 w-8 h-8 rounded-full bg-emerald-500 items-center justify-center disabled:opacity-50"
                  disabled={!input.trim() || chatLoading}
                  onPress={() => handleSendMessage()}
                >
                  <Send size={14} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
