import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { Activity, Check } from 'lucide-react';

const steps = [
  { id: 'personal', title: 'Personal Information', subtitle: 'Basic details to calibrate your metabolism calculations.' },
  { id: 'goals', title: 'Fitness Goals', subtitle: 'Tell us what you\'re working towards.' },
  { id: 'diet', title: 'Diet & Allergies', subtitle: 'So we never include something you can\'t eat.' },
  { id: 'lifestyle', title: 'Lifestyle & Schedule', subtitle: 'Your routine shapes your nutrition timing.' },
  { id: 'health', title: 'Health & Preferences', subtitle: 'Final details for a fully optimized plan.' },
];

const goalOptions = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Athletic Performance', 'Body Recomposition'];
const activityLevels = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];
const dietPreferences = ['No Restrictions', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Mediterranean', 'Halal', 'Kosher'];
const mealCounts = ['2 meals', '3 meals', '4 meals', '5 meals', '6+ meals'];
const cookingSkills = ['Beginner', 'Intermediate', 'Advanced', 'I don\'t cook'];
const budgetLevels = ['Budget-friendly', 'Moderate', 'No budget limit'];

interface FormData {
  age: string;
  gender: string;
  weight: string;
  height: string;
  bodyFatPct: string;
  activityLevel: string;
  goal: string;
  targetWeight: string;
  targetBodyFat: string;
  timeframe: string;
  dietPreference: string;
  allergies: string;
  dislikedFoods: string;
  mealsPerDay: string;
  cookingSkill: string;
  budget: string;
  waterIntake: string;
  sleepHours: string;
  stressLevel: string;
  supplements: string;
  medicalConditions: string;
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    age: '', gender: '', weight: '', height: '', bodyFatPct: '',
    activityLevel: '', goal: '', targetWeight: '', targetBodyFat: '', timeframe: '',
    dietPreference: '', allergies: '', dislikedFoods: '',
    mealsPerDay: '', cookingSkill: '', budget: '',
    waterIntake: '', sleepHours: '', stressLevel: '', supplements: '', medicalConditions: '',
  });

  const update = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // Navigate to generating, passing form data
      navigate('/generating', { state: { formData } });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 font-semibold cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center">
            <Activity size={16} />
          </div>
        </div>
        <div className="text-sm font-medium text-zinc-500">
          Step {currentStep + 1} of {steps.length}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-zinc-900">
        <motion.div 
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "anticipate" }}
            className="w-full"
          >
            <h2 className="text-3xl font-semibold tracking-tight mb-2">{steps[currentStep].title}</h2>
            <p className="text-zinc-400 mb-8">{steps[currentStep].subtitle}</p>
            
            <div className="space-y-6">
              {/* Step 1: Personal Info */}
              {currentStep === 0 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Age" type="number" placeholder="28" value={formData.age} onChange={e => update('age', e.target.value)} />
                    <SelectCards
                      label="Gender"
                      options={['Male', 'Female', 'Other']}
                      value={formData.gender}
                      onChange={v => update('gender', v)}
                      columns={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Weight (kg)" type="number" placeholder="75" value={formData.weight} onChange={e => update('weight', e.target.value)} />
                    <Input label="Height (cm)" type="number" placeholder="180" value={formData.height} onChange={e => update('height', e.target.value)} />
                  </div>
                  <Input label="Body Fat % (optional)" type="number" placeholder="15" value={formData.bodyFatPct} onChange={e => update('bodyFatPct', e.target.value)} />
                  <SelectCards
                    label="Activity Level"
                    options={activityLevels}
                    value={formData.activityLevel}
                    onChange={v => update('activityLevel', v)}
                  />
                </>
              )}

              {/* Step 2: Fitness Goals */}
              {currentStep === 1 && (
                <>
                  <SelectCards
                    label="Primary Goal"
                    options={goalOptions}
                    value={formData.goal}
                    onChange={v => update('goal', v)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Target Weight (kg, optional)" type="number" placeholder="70" value={formData.targetWeight} onChange={e => update('targetWeight', e.target.value)} />
                    <Input label="Target Body Fat % (optional)" type="number" placeholder="12" value={formData.targetBodyFat} onChange={e => update('targetBodyFat', e.target.value)} />
                  </div>
                  <Input label="Timeframe (e.g., 3 months)" type="text" placeholder="3 months" value={formData.timeframe} onChange={e => update('timeframe', e.target.value)} />
                </>
              )}

              {/* Step 3: Diet & Allergies */}
              {currentStep === 2 && (
                <>
                  <SelectCards
                    label="Dietary Preference"
                    options={dietPreferences}
                    value={formData.dietPreference}
                    onChange={v => update('dietPreference', v)}
                    columns={3}
                  />
                  <Input label="Allergies & Restrictions" type="text" placeholder="e.g., Peanuts, Dairy, Gluten" value={formData.allergies} onChange={e => update('allergies', e.target.value)} />
                  <Input label="Foods You Dislike" type="text" placeholder="e.g., Mushrooms, Olives, Liver" value={formData.dislikedFoods} onChange={e => update('dislikedFoods', e.target.value)} />
                </>
              )}

              {/* Step 4: Lifestyle & Schedule */}
              {currentStep === 3 && (
                <>
                  <SelectCards
                    label="Meals Per Day"
                    options={mealCounts}
                    value={formData.mealsPerDay}
                    onChange={v => update('mealsPerDay', v)}
                    columns={5}
                  />
                  <SelectCards
                    label="Cooking Skill"
                    options={cookingSkills}
                    value={formData.cookingSkill}
                    onChange={v => update('cookingSkill', v)}
                    columns={4}
                  />
                  <SelectCards
                    label="Budget"
                    options={budgetLevels}
                    value={formData.budget}
                    onChange={v => update('budget', v)}
                    columns={3}
                  />
                </>
              )}

              {/* Step 5: Health & Preferences */}
              {currentStep === 4 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Daily Water Intake (litres)" type="number" placeholder="2.5" value={formData.waterIntake} onChange={e => update('waterIntake', e.target.value)} />
                    <Input label="Average Sleep (hours)" type="number" placeholder="7" value={formData.sleepHours} onChange={e => update('sleepHours', e.target.value)} />
                  </div>
                  <SelectCards
                    label="Stress Level"
                    options={['Low', 'Moderate', 'High', 'Very High']}
                    value={formData.stressLevel}
                    onChange={v => update('stressLevel', v)}
                    columns={4}
                  />
                  <Input label="Supplements (if any)" type="text" placeholder="e.g., Creatine, Whey Protein, Multivitamin" value={formData.supplements} onChange={e => update('supplements', e.target.value)} />
                  <Input label="Medical Conditions (if any)" type="text" placeholder="e.g., Diabetes Type 2, Thyroid" value={formData.medicalConditions} onChange={e => update('medicalConditions', e.target.value)} />
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex w-full justify-between items-center border-t border-zinc-900 pt-6">
          <Button variant="ghost" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Generate Plan' : 'Continue'}
          </Button>
        </div>
      </main>
    </div>
  );
}

/* Reusable clickable option card grid */
function SelectCards({
  label,
  options,
  value,
  onChange,
  columns = 1,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  const colClass =
    columns === 1 ? 'grid-cols-1' :
    columns === 2 ? 'grid-cols-2' :
    columns === 3 ? 'grid-cols-3' :
    columns === 4 ? 'grid-cols-2 sm:grid-cols-4' :
    columns === 5 ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-1';

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      <div className={`grid ${colClass} gap-2`}>
        {options.map(option => {
          const selected = value === option;
          return (
            <button
              type="button"
              key={option}
              onClick={() => onChange(option)}
              className={`relative p-3 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${
                selected
                  ? 'border-white bg-white/5 text-white'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50'
              }`}
            >
              <span>{option}</span>
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <Check size={14} className="text-white" />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
