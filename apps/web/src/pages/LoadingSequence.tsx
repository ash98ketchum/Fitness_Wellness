import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, CircleDashed } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const agentSteps = [
  "Saving your profile",
  "Agent 1: Generating initial meal plan",
  "Agent 2: Reviewing nutritional accuracy",
  "Agent 3: Optimizing macros & timing",
  "Preparing your dashboard",
];

export default function LoadingSequence() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const formData = location.state?.formData;

    const runPipeline = async () => {
      try {
        // Step 0: Save onboarding profile
        if (formData && token) {
          await fetch('http://localhost:3000/api/v1/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData),
          });
        }
        setActiveStep(1);

        // Step 1-3: Generate plan (this calls the multi-agent pipeline)
        if (token) {
          const res = await fetch('http://localhost:3000/api/v1/plans/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            // Simulate seeing each agent step
            for (let i = 2; i <= 3; i++) {
              await new Promise(r => setTimeout(r, 1200));
              setActiveStep(i);
            }
          }
        } else {
          // No token — simulate for demo
          for (let i = 1; i <= 3; i++) {
            await new Promise(r => setTimeout(r, 1500));
            setActiveStep(i);
          }
        }

        // Step 4: Preparing dashboard
        await new Promise(r => setTimeout(r, 800));
        setActiveStep(4);

        // Navigate to dashboard
        await new Promise(r => setTimeout(r, 1000));
        navigate('/dashboard');
      } catch (err) {
        console.error('Pipeline error:', err);
        // Still navigate to dashboard with fallback data
        await new Promise(r => setTimeout(r, 1000));
        navigate('/dashboard');
      }
    };

    runPipeline();
  }, [navigate, location.state, token]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md relative">
        <motion.div 
          className="absolute -top-32 -left-32 w-64 h-64 bg-zinc-800 rounded-full blur-[100px] opacity-30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight text-center">
          Building your AI Model
        </h2>
        <p className="text-sm text-zinc-500 text-center mb-8">This usually takes 10-15 seconds</p>

        <div className="space-y-6 relative z-10">
          {agentSteps.map((step, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            
            return (
              <div key={step} className="flex items-center gap-4">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <CircleDashed size={24} className="text-white" />
                    </motion.div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-zinc-800" />
                  )}
                </div>
                
                <span className={`text-base font-medium transition-colors duration-500 ${
                  isActive ? 'text-white' : isCompleted ? 'text-zinc-500' : 'text-zinc-800'
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
