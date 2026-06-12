import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Activity, Menu, X, Bell, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

export default function Planner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(generateMockPlan());
  
  // Drag state
  const [draggedItem, setDraggedItem] = useState<{day: string, type: string} | null>(null);

  const handleDragStart = (day: string, type: string) => {
    setDraggedItem({ day, type });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (targetDay: string, targetType: string) => {
    if (!draggedItem) return;
    if (draggedItem.day === targetDay && draggedItem.type === targetType) return;

    // Swap logic
    setWeekPlan(prev => {
      const newPlan = { ...prev };
      const sourceMeal = { ...newPlan[draggedItem.day][draggedItem.type] };
      const targetMeal = { ...newPlan[targetDay][targetType] };

      newPlan[draggedItem.day][draggedItem.type] = targetMeal;
      newPlan[targetDay][targetType] = sourceMeal;
      return newPlan;
    });
    setDraggedItem(null);
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
    // In a real app, this would call the AI backend
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-4 lg:px-8 bg-black">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-zinc-400 hover:text-white transition-colors">
            <Activity size={20} />
          </button>
          <h1 className="font-medium">Weekly Planner</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">Drag & drop to swap meals</span>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="min-w-[1000px] flex gap-4 h-full">
          {DAYS.map(day => (
            <div key={day} className="flex-1 flex flex-col gap-4">
              <h2 className="text-lg font-semibold tracking-tight text-center pb-2 border-b border-zinc-900">{day}</h2>
              <div className="flex-1 flex flex-col gap-4">
                {MEAL_TYPES.map(type => {
                  const meal = weekPlan[day][type];
                  return (
                    <div 
                      key={`${day}-${type}`}
                      className="flex flex-col gap-2"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(day, type)}
                    >
                      <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{type}</span>
                      <motion.div
                        draggable
                        onDragStart={() => handleDragStart(day, type)}
                        layoutId={meal.id}
                        className={`p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-colors ${
                          meal.completed 
                            ? 'bg-zinc-900/30 border-zinc-900/50 opacity-60' 
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`text-sm font-medium ${meal.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                            {meal.name}
                          </h4>
                          <button onClick={() => toggleCompletion(day, type)} className="text-zinc-500 hover:text-emerald-500">
                            <CheckCircle2 size={16} className={meal.completed ? 'text-emerald-500' : ''} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs text-orange-400">{meal.calories} kcal</span>
                          <button onClick={() => handleRegenerate(day, type)} className="text-xs text-zinc-500 hover:text-blue-400 flex items-center gap-1">
                            <RefreshCw size={12} /> Regenerate
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
