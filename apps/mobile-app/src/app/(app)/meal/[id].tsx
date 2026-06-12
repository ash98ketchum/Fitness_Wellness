import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../constants/api';
import { Clock, ChefHat, Flame, ArrowLeft, Send, Bot, Mic } from 'lucide-react-native';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();

  const [meal, setMeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!token || !id) return;
    
    fetch(`${API_URL}/meals/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.meal) setMeal(data.meal);
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleSendMessage = async () => {
    if (!input.trim() || chatLoading || !meal) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/agents/cooking`, {
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
      setMessages([...newMessages, { role: 'assistant', content: data.reply || "I couldn't process that." }]);
      // If voice was returned, normally we would play audio here
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "An error occurred. Please try again." }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setInput("I'm speaking right now... (Simulated Voice Input)");
    } else {
      setIsRecording(true);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#10b981" /></View>;
  }

  if (!meal) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Meal not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 16}}><Text style={{color: '#10b981'}}>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{meal.name}</Text>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.scroll} contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        {/* Meal Info */}
        <View style={styles.statsRow}>
          <View style={styles.stat}><Clock color="#a1a1aa" size={16} /><Text style={styles.statText}>{meal.prepTime || 15} min</Text></View>
          <View style={styles.stat}><ChefHat color="#a1a1aa" size={16} /><Text style={styles.statText}>{meal.difficulty || 'Easy'}</Text></View>
          <View style={styles.stat}><Flame color="#fb923c" size={16} /><Text style={styles.statText}>{meal.calories} kcal</Text></View>
        </View>

        <View style={styles.macrosRow}>
          <View style={[styles.macroBadge, {borderColor: '#1e3a8a', backgroundColor: '#172554'}]}><Text style={[styles.macroBadgeText, {color: '#60a5fa'}]}>{meal.macros?.protein}g Pro</Text></View>
          <View style={[styles.macroBadge, {borderColor: '#064e3b', backgroundColor: '#022c22'}]}><Text style={[styles.macroBadgeText, {color: '#34d399'}]}>{meal.macros?.carbs}g Carbs</Text></View>
          <View style={[styles.macroBadge, {borderColor: '#78350f', backgroundColor: '#451a03'}]}><Text style={[styles.macroBadgeText, {color: '#fbbf24'}]}>{meal.macros?.fats}g Fats</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ingredients</Text>
          {meal.ingredients?.map((ing: string, i: number) => {
            const portion = meal.portionSizes?.[ing] || '';
            return (
              <View key={i} style={styles.ingRow}>
                <View style={styles.dot} />
                <Text style={styles.ingText}>{ing} {portion ? `- ${portion}` : ''}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Instructions</Text>
          {meal.recipeSteps && meal.recipeSteps.length > 0 ? (
            meal.recipeSteps.map((step: string, i: number) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={styles.instText}>{step}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.instText}>{meal.description}</Text>
          )}
        </View>

        {/* Chat Section */}
        <View style={styles.chatHeader}>
          <ChefHat color="#10b981" size={20} />
          <Text style={styles.chatTitle}>Cooking Assistant</Text>
        </View>
        
        {messages.length === 0 && (
          <Text style={styles.chatEmpty}>Hi! Ask me about substitutions, allergies, or prep steps for this meal.</Text>
        )}

        {messages.map((m, i) => (
          <View key={i} style={[styles.msgRow, m.role === 'user' ? styles.msgRight : styles.msgLeft]}>
            {m.role === 'assistant' && <View style={styles.botAvatar}><Bot color="#10b981" size={14} /></View>}
            <View style={[styles.msgBubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
              <Text style={styles.msgText}>{m.content}</Text>
            </View>
          </View>
        ))}
        {chatLoading && (
          <View style={[styles.msgRow, styles.msgLeft]}>
            <View style={styles.botAvatar}><Bot color="#10b981" size={14} /></View>
            <View style={styles.bubbleBot}><Text style={styles.msgText}>Thinking...</Text></View>
          </View>
        )}
      </ScrollView>

      {/* Input Field */}
      <View style={styles.inputArea}>
        <TouchableOpacity 
          style={[styles.micBtn, isRecording && styles.micBtnActive]} 
          onPress={handleVoiceToggle}
        >
          <Mic color={isRecording ? "#fff" : "#a1a1aa"} size={20} />
        </TouchableOpacity>
        <TextInput 
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask or tap mic to speak..."
          placeholderTextColor="#71717a"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage} disabled={!input.trim() || chatLoading}>
          <Send color="#000" size={18} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#a1a1aa' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  backBtn: { marginRight: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },
  scroll: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: '#a1a1aa', fontSize: 14 },
  macrosRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  macroBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  macroBadgeText: { fontSize: 12, fontWeight: 'bold' },
  card: { backgroundColor: '#18181b', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#27272a', marginBottom: 16 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  ingText: { color: '#d4d4d8', fontSize: 15 },
  instText: { color: '#d4d4d8', fontSize: 15, lineHeight: 24 },
  
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 16 },
  chatTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  chatEmpty: { color: '#71717a', fontSize: 14, textAlign: 'center', marginVertical: 16 },
  msgRow: { flexDirection: 'row', marginBottom: 12, width: '100%' },
  msgLeft: { justifyContent: 'flex-start' },
  msgRight: { justifyContent: 'flex-end' },
  botAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#18181b', alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: '#27272a' },
  msgBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  bubbleUser: { backgroundColor: '#10b981', borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderBottomLeftRadius: 4 },
  msgText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  
  inputArea: { flexDirection: 'row', padding: 16, backgroundColor: '#18181b', borderTopWidth: 1, borderTopColor: '#27272a', alignItems: 'center', gap: 12 },
  micBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#27272a', alignItems: 'center', justifyContent: 'center' },
  micBtnActive: { backgroundColor: '#ef4444' },
  input: { flex: 1, backgroundColor: '#000', borderWidth: 1, borderColor: '#27272a', borderRadius: 24, color: '#fff', paddingHorizontal: 16, height: 48, fontSize: 15 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' }
});
