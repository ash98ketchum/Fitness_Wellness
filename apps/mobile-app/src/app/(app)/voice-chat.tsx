import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Mic, MicOff, ArrowUp, ArrowLeft, Volume2, MessageSquare, Headphones } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

// ──────────────────────────────────────────────────
// Web Speech API helper (works in Chrome/Edge)
// ──────────────────────────────────────────────────
function getWebSpeechRecognition(): any | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  }
  return null;
}

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
    // Fallback if TTS not supported (e.g. mobile React Native without Expo Speech)
    if (onEnd) setTimeout(onEnd, 2000);
  }
}

export default function VoiceChat() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hey! I'm Athelya, your Master Coach. Ready to conquer the day? Or did you have an event to log?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  // New state for Voice Mode
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const recognitionRef = useRef<any>(null);
  
  // Refs for callbacks
  const isVoiceModeRef = useRef(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
    isProcessingRef.current = isProcessing;
  }, [isVoiceMode, isProcessing]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    const SpeechRecognitionClass = getWebSpeechRecognition();
    if (!SpeechRecognitionClass) {
      if (isVoiceModeRef.current) setIsVoiceMode(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (interimTranscript) setInputText(interimTranscript);
      if (finalTranscript) {
        setInputText('');
        setIsListening(false);
        sendMessage(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if in voice mode and we are not currently processing a request
      if (isVoiceModeRef.current && !isProcessingRef.current) {
        startListening();
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) {}
  }, []);

  // ── Send a chat message ─────────────────────────
  const sendMessage = useCallback(async (overrideText?: string) => {
    const msgText = (overrideText || inputText).trim();
    if (!msgText || !user || !token) return;

    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: msgText }]);
    setIsProcessing(true);
    
    // Explicitly update processing ref for onend callback
    isProcessingRef.current = true;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    try {
      const res = await fetch(`https://athelya-api.onrender.com/api/v1/chat/voice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: msgText })
      });

      const data = await res.json();
      setIsProcessing(false);
      isProcessingRef.current = false;

      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
        if (ttsEnabled) {
          speakText(data.text, () => {
            if (isVoiceModeRef.current) {
              startListening();
            }
          });
        } else {
          if (isVoiceModeRef.current) startListening();
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I lost connection to the brain." }]);
        if (isVoiceModeRef.current) startListening();
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      isProcessingRef.current = false;
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't reach the servers." }]);
      if (isVoiceModeRef.current) startListening();
    }
  }, [inputText, user, token, ttsEnabled, startListening]);

  // ── Cleanup on unmount ──────────────────────────
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const toggleVoiceMode = () => {
    const newMode = !isVoiceMode;
    setIsVoiceMode(newMode);
    
    if (newMode) {
      // Start voice mode
      setTtsEnabled(true);
      startListening();
    } else {
      // End voice mode
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View className="h-16 border-b border-zinc-900 flex-row items-center justify-between px-4 bg-black">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white font-medium text-lg">Athelya Voice</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="p-2"
            onPress={() => setTtsEnabled(p => !p)}
          >
            <Volume2 size={24} color={ttsEnabled ? "#3b82f6" : "#71717a"} />
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 ${isVoiceMode ? 'bg-blue-600' : 'bg-zinc-800'}`}
            onPress={toggleVoiceMode}
          >
            {isVoiceMode ? (
              <>
                <Headphones size={16} color="#fff" />
                <Text className="text-white text-xs font-medium">Voice</Text>
              </>
            ) : (
              <>
                <MessageSquare size={16} color="#a1a1aa" />
                <Text className="text-zinc-400 text-xs font-medium">Chat</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Area */}
      <ScrollView
        className="flex-1 px-4 py-6"
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <View className="space-y-6 pb-6">
          {messages.map((msg, idx) => (
            <View key={idx} className={`flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <View className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-zinc-800 rounded-br-none' : 'bg-blue-900/40 border border-blue-900/50 rounded-bl-none'}`}>
                {msg.role === 'ai' && (
                  <Text className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">Athelya</Text>
                )}
                <Text className="text-white text-base leading-relaxed">{msg.text}</Text>
              </View>
            </View>
          ))}
          {isProcessing && (
            <View className="flex-row justify-start">
              <View className="bg-blue-900/20 border border-blue-900/30 rounded-2xl p-4 rounded-bl-none w-20 items-center">
                <ActivityIndicator size="small" color="#3b82f6" />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Listening Indicator */}
      {isListening && (
        <View className="px-4 pb-2">
          <View className="flex-row items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 rounded-2xl py-3 px-4">
            <View className="w-3 h-3 rounded-full bg-red-500" />
            <Text className="text-red-400 text-sm font-medium">Listening… speak now</Text>
          </View>
        </View>
      )}

      {/* Input Area */}
      <View className="p-4 border-t border-zinc-900 bg-zinc-950">
        <View className="flex-row items-end gap-2 bg-zinc-900 rounded-3xl p-2 pl-4 border border-zinc-800">
          <TextInput
            className={`flex-1 min-h-[40px] max-h-32 pt-2 pb-2 text-base ${isVoiceMode ? 'text-zinc-600' : 'text-white'}`}
            placeholder={isVoiceMode ? "Voice mode active..." : (isListening ? "Listening…" : "Type or speak…")}
            placeholderTextColor="#71717a"
            multiline
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage()}
            editable={!isVoiceMode}
          />
          {inputText.trim() ? (
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center"
              onPress={() => sendMessage()}
              disabled={isProcessing}
            >
              <ArrowUp size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className={`w-10 h-10 rounded-full items-center justify-center ${isVoiceMode ? 'bg-blue-600' : (isListening ? 'bg-red-600' : 'bg-zinc-800')}`}
              onPress={() => {
                if (!isVoiceMode) {
                  // Fallback for manual click if not in voice mode
                  setIsListening(true);
                  startListening();
                } else {
                  toggleVoiceMode();
                }
              }}
              disabled={isProcessing}
            >
              {isVoiceMode ? <Headphones size={20} color="#fff" /> : (isListening ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#fff" />)}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
