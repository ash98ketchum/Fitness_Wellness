import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Activity, Flame, Utensils, Award, Settings, Bell, ChevronRight, LogOut, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface MealData {
  id?: string;
  name: string;
  time: string;
  calories: number;
  macros: { protein: number; carbs: number; fats: number };
  ingredients: string[];
}

interface PlanData {
  totalCalories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  meals: MealData[];
  aiInsight: string;
  confidenceScore: number;
}

// Fallback static data if API call fails
const fallbackPlan: PlanData = {
  totalCalories: 2450,
  proteinG: 160,
  carbsG: 210,
  fatsG: 65,
  meals: [
    { name: 'High-Protein Oatmeal', time: '08:00 AM', calories: 450, macros: { protein: 30, carbs: 50, fats: 12 }, ingredients: [] },
    { name: 'Grilled Chicken Salad', time: '01:00 PM', calories: 600, macros: { protein: 50, carbs: 20, fats: 25 }, ingredients: [] },
    { name: 'Greek Yogurt & Berries', time: '04:00 PM', calories: 300, macros: { protein: 25, carbs: 30, fats: 5 }, ingredients: [] },
    { name: 'Salmon & Quinoa', time: '07:30 PM', calories: 800, macros: { protein: 45, carbs: 65, fats: 28 }, ingredients: [] },
  ],
  aiInsight: "I've optimized your fat intake today based on your reported energy dip yesterday afternoon. The salmon dinner provides high Omega-3s to support recovery.",
  confidenceScore: 98,
};

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanData>(fallbackPlan);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    fetch('http://localhost:3000/api/v1/plans/latest', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.plan) {
          setPlan({
            totalCalories: data.plan.totalCalories || fallbackPlan.totalCalories,
            proteinG: data.plan.proteinG || fallbackPlan.proteinG,
            carbsG: data.plan.carbsG || fallbackPlan.carbsG,
            fatsG: data.plan.fatsG || fallbackPlan.fatsG,
            meals: data.plan.meals?.length > 0 ? data.plan.meals.map((m: any) => ({
              id: m.id,
              name: m.name,
              time: m.time || '—',
              calories: m.calories,
              macros: typeof m.macros === 'object' ? m.macros : { protein: 0, carbs: 0, fats: 0 },
              ingredients: m.ingredients || [],
            })) : fallbackPlan.meals,
            aiInsight: data.plan.verificationReport?.correctionsApplied?.[0] || fallbackPlan.aiInsight,
            confidenceScore: data.plan.verificationReport?.confidenceScore || fallbackPlan.confidenceScore,
          });
        }
      })
      .catch(() => {/* use fallback */});
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 border-r border-zinc-900 bg-black flex flex-col p-6 fixed inset-y-0 left-0 z-40 transition-transform lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button 
          className="lg:hidden absolute top-6 right-6 text-zinc-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight mb-12">
          <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center">
            <Activity size={16} />
          </div>
          Athelya
        </div>
        
        <nav className="flex-1 space-y-2 text-sm font-medium">
          <div onClick={() => navigate('/dashboard')}><NavItem icon={<Activity />} label="Dashboard" active /></div>
          <div onClick={() => navigate('/planner')}><NavItem icon={<Utensils />} label="Meals" /></div>
          <div onClick={() => navigate('/expert-report')}><NavItem icon={<Award />} label="Expert Report" AI /></div>
          <NavItem icon={<Settings />} label="Settings" />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-zinc-900/50 transition-colors mt-4">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="font-medium">Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-zinc-400 hover:text-white transition-colors hidden sm:block">
              <Bell size={18} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-medium hover:border-zinc-500 transition-colors"
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </button>
              
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-zinc-800 mb-2">
                    <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-zinc-400 truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 max-w-5xl mx-auto w-full flex-1">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Today's Protocol</h2>
            <p className="text-zinc-500 text-sm mt-1">Generated by Agent Optimiser v2.4</p>
          </motion.div>

          {/* Macros Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MacroCard label="Calories" value={plan.totalCalories.toLocaleString()} target={`${Math.round(plan.totalCalories * 1.05).toLocaleString()} kcal`} icon={<Flame size={16} />} color="text-orange-500" />
            <MacroCard label="Protein" value={`${plan.proteinG}g`} target={`${Math.round(plan.proteinG * 1.1)}g`} color="text-blue-500" />
            <MacroCard label="Carbs" value={`${plan.carbsG}g`} target={`${Math.round(plan.carbsG * 1.15)}g`} color="text-green-500" />
            <MacroCard label="Fats" value={`${plan.fatsG}g`} target={`${Math.round(plan.fatsG * 1.08)}g`} color="text-yellow-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Meal Timeline */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-medium text-lg mb-4">Meal Timeline</h3>
              {plan.meals.map((meal, i) => (
                <MealCard
                  key={i}
                  id={meal.id}
                  time={meal.time}
                  name={meal.name}
                  calories={meal.calories}
                  macros={`P: ${meal.macros.protein}g • C: ${meal.macros.carbs}g • F: ${meal.macros.fats}g`}
                  status={i === 0 ? 'completed' : 'upcoming'}
                  onClick={() => meal.id && navigate(`/meal/${meal.id}`)}
                />
              ))}
            </div>

            {/* AI Expert Insight */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg mb-4">AI Insight</h3>
              <Card className="bg-zinc-900 border-zinc-800 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center flex-shrink-0">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Nutrition Expert</h4>
                    <p className="text-xs text-zinc-500">Confidence Score: {plan.confidenceScore}%</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  "{plan.aiInsight}"
                </p>
                <button onClick={() => navigate('/expert-report')} className="text-xs font-medium text-white flex items-center hover:text-zinc-300 transition-colors">
                  View Full Report <ChevronRight size={14} className="ml-1" />
                </button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, AI }: { icon: React.ReactNode; label: string; active?: boolean; AI?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}>
      <div className="flex items-center gap-3">
        {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 18 })}
        {label}
      </div>
      {AI && <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-black px-1.5 py-0.5 rounded">AI</span>}
    </div>
  );
}

function MacroCard({ label, value, target, icon, color }: { label: string; value: string; target: string; icon?: React.ReactNode; color?: string }) {
  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50">
      <div className="text-zinc-500 text-sm mb-2 flex items-center gap-1.5">
        {icon && <span className={color}>{icon}</span>}
        {label}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-zinc-600 mt-1">Target: {target}</div>
    </div>
  );
}

function MealCard({ id, time, name, calories, macros, status, onClick }: { id?: string; time: string; name: string; calories: number; macros: string; status: 'completed' | 'upcoming', onClick?: () => void }) {
  return (
    <Card onClick={onClick} className={`p-4 flex items-center justify-between transition-colors hover:border-zinc-700 cursor-pointer ${status === 'completed' ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-zinc-900 flex items-center justify-center flex-shrink-0 text-zinc-500 text-xs font-medium">
          {time.split(' ')[0]}
        </div>
        <div>
          <h4 className={`font-medium ${status === 'completed' ? 'line-through text-zinc-400' : 'text-white'}`}>{name}</h4>
          <p className="text-xs text-zinc-500 mt-1">{macros}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">{calories}</div>
        <div className="text-xs text-zinc-500">kcal</div>
      </div>
    </Card>
  );
}
