import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Clock, ChefHat, Flame, Send, Bot, Mic, User as UserIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function MealDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [meal, setMeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token || !id) return;
    
    fetch(`http://localhost:3000/api/v1/meals/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.meal) setMeal(data.meal);
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || chatLoading || !meal) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setChatLoading(true);

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
      setMessages([...newMessages, { role: 'assistant', content: data.reply || "I couldn't process that." }]);
      
      // If voice was returned, normally we would play audio
      if (data.audioUrl) {
        console.log("Playing AI voice response:", data.audioUrl);
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: "An error occurred. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      // Process voice
      setInput("I'm speaking right now... (Simulated Voice Input)");
    } else {
      setIsRecording(true);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Meal Data...</div>;
  }

  if (!meal) {
    return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h2>Meal not found</h2>
      <Button onClick={() => navigate('/dashboard')} className="mt-4">Back to Dashboard</Button>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 w-fit"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
          
          {/* Left Side: Recipe Info */}
          <div className="flex flex-col overflow-y-auto pr-2 space-y-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{meal.name}</h1>
              <div className="flex items-center gap-4 text-zinc-400 mt-2 text-sm">
                <span className="flex items-center gap-1"><Clock size={14} /> {meal.prepTime || 15} min prep</span>
                <span className="flex items-center gap-1"><ChefHat size={14} /> {meal.difficulty || 'Easy'}</span>
                <span className="flex items-center gap-1 text-orange-400"><Flame size={14} /> {meal.calories} kcal</span>
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="px-4 py-2 bg-blue-900/20 text-blue-400 rounded-lg border border-blue-900/50">
                <span className="font-semibold block">{meal.macros?.protein}g</span> Protein
              </div>
              <div className="px-4 py-2 bg-emerald-900/20 text-emerald-400 rounded-lg border border-emerald-900/50">
                <span className="font-semibold block">{meal.macros?.carbs}g</span> Carbs
              </div>
              <div className="px-4 py-2 bg-yellow-900/20 text-yellow-400 rounded-lg border border-yellow-900/50">
                <span className="font-semibold block">{meal.macros?.fats}g</span> Fats
              </div>
            </div>

            <Card className="bg-zinc-950 border-zinc-800 p-6">
              <h3 className="text-lg font-medium mb-4">Ingredients</h3>
              <ul className="space-y-2">
                {meal.ingredients?.map((ing: string, i: number) => {
                  const portion = meal.portionSizes?.[ing] || '';
                  return (
                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {ing} {portion ? `- ${portion}` : ''}
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800 p-6">
              <h3 className="text-lg font-medium mb-4">Instructions</h3>
              {meal.recipeSteps && meal.recipeSteps.length > 0 ? (
                <ol className="space-y-4 list-decimal list-inside text-zinc-300 leading-relaxed">
                  {meal.recipeSteps.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-zinc-300 leading-relaxed">
                  {meal.description || "Simple assembly. Combine ingredients and serve immediately."}
                </p>
              )}
            </Card>
          </div>

          {/* Right Side: Cooking Assistant Chat */}
          <Card className="bg-zinc-950 border-zinc-800 flex flex-col h-[600px] lg:h-full">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/50 rounded-t-xl">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <ChefHat size={16} />
              </div>
              <div>
                <h3 className="font-medium">Cooking Assistant</h3>
                <p className="text-xs text-zinc-500">Ask about substitutions, instructions, or allergies</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-zinc-500 text-sm mt-8">
                  <Bot size={32} className="mx-auto mb-2 opacity-50" />
                  Hi! I'm your dedicated cooking assistant for {meal.name}.<br/>
                  I'm aware of your allergies and macros. Need any substitutions?
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-emerald-400" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-emerald-400" />
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-tl-none">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-900/30 rounded-b-xl">
              <div className="flex gap-2 relative items-center">
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
                >
                  <Mic size={18} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask or tap mic to speak..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors pr-12"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || chatLoading}
                    className="absolute right-1 top-1 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black disabled:opacity-50 hover:bg-emerald-400 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
}
