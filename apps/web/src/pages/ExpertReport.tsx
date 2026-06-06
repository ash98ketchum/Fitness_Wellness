import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Activity, FileJson, ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, ChefHat, Clock, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OnboardingProfile {
  personalInfo: string;
  fitnessGoals: string;
  lifestyle: string;
  healthData: string;
  foodPreferences: string;
}

interface VerificationReport {
  agent1Raw: string;
  agent2Raw: string;
  agent3Raw: string;
  confidenceScore: number;
}

export default function ExpertReport() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [report, setReport] = useState<VerificationReport | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchReport = async () => {
      try {
        const planRes = await fetch('http://localhost:3000/api/v1/plans/latest', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const planData = await planRes.json();
        if (planData.plan?.verificationReport) {
          setReport(planData.plan.verificationReport);
        }

        const profileRes = await fetch('http://localhost:3000/api/v1/onboarding/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile) {
             const p = JSON.parse(profileData.profile.personalInfo);
             const f = JSON.parse(profileData.profile.fitnessGoals);
             const l = JSON.parse(profileData.profile.lifestyle);
             const h = JSON.parse(profileData.profile.healthData);
             const food = JSON.parse(profileData.profile.foodPreferences);
             setProfile({ ...p, ...f, ...l, ...h, ...food });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Report...</div>;
  }

  // Parse Agent Data safely
  const parseJsonStr = (str: string | undefined) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const agent1 = parseJsonStr(report?.agent1Raw);
  const agent2 = parseJsonStr(report?.agent2Raw);
  const agent3 = parseJsonStr(report?.agent3Raw);

  const MealCard = ({ meal }: { meal: any }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-white flex items-center gap-2">
          <ChefHat size={16} className="text-zinc-400"/> {meal.name}
        </h4>
        <div className="flex items-center text-xs text-zinc-400 gap-1">
          <Clock size={12} /> {meal.time}
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-3">{meal.description}</p>
      
      <div className="flex gap-4 mb-3 text-xs">
        <span className="flex items-center gap-1 text-orange-400"><Flame size={14}/> {meal.calories} kcal</span>
        <span className="text-blue-400">P: {meal.macros?.protein}g</span>
        <span className="text-emerald-400">C: {meal.macros?.carbs}g</span>
        <span className="text-yellow-400">F: {meal.macros?.fats}g</span>
      </div>
      
      <div className="text-xs text-zinc-500">
        <strong className="text-zinc-300">Ingredients:</strong> {meal.ingredients?.join(', ')}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8 pb-32">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <header className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
            <Activity className="text-emerald-500" /> Clinical Dietician Report
          </h1>
          <p className="text-zinc-500 mt-2">Transparent evaluation logs from the multi-agent AI pipeline.</p>
        </header>

        <div className="space-y-8">
          {/* Section 1: Form Data */}
          <section>
            <h2 className="text-xl font-medium mb-4">Client Onboarding Data</h2>
            <Card className="p-6 bg-zinc-950 border-zinc-800">
              {Object.keys(profile).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(profile).map(([key, value]) => (
                    <div key={key} className="border-b border-zinc-900 pb-2">
                      <div className="text-xs text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-sm font-medium mt-1">{String(value || 'N/A')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">No profile data found.</p>
              )}
            </Card>
          </section>

          {/* Section 2: Agent 1 */}
          <section>
            <h2 className="text-xl font-medium mb-4 text-blue-400 flex items-center gap-2">
              <FileJson size={18} /> Model 1: Generation Phase
            </h2>
            <Card className="p-6 border-zinc-800 bg-zinc-950">
              {agent1 ? (
                <div>
                  <div className="flex gap-6 mb-6 pb-6 border-b border-zinc-800">
                    <div>
                      <div className="text-xs text-zinc-500">Proposed Calories</div>
                      <div className="text-xl font-medium text-white">{agent1.totalCalories}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Proposed Protein</div>
                      <div className="text-xl font-medium text-blue-400">{agent1.proteinG}g</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Proposed Carbs</div>
                      <div className="text-xl font-medium text-emerald-400">{agent1.carbsG}g</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Proposed Fats</div>
                      <div className="text-xl font-medium text-yellow-400">{agent1.fatsG}g</div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-4">Proposed Draft Meals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agent1.meals?.map((meal: any, idx: number) => <MealCard key={idx} meal={meal} />)}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">Agent 1 data is unavailable or unparseable.</p>
              )}
            </Card>
          </section>

          {/* Section 3: Agent 2 */}
          <section>
            <h2 className="text-xl font-medium mb-4 text-red-400 flex items-center gap-2">
              <CheckCircle2 size={18} /> Model 2: Quality Assurance Review
            </h2>
            <Card className="p-6 border-zinc-800 bg-zinc-950">
              {agent2 ? (
                <div>
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                    <div className={`text-3xl font-bold ${agent2.confidenceScore >= 90 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                      {agent2.confidenceScore}%
                    </div>
                    <div className="text-sm text-zinc-400">
                      QA Confidence Score <br/>
                      <span className="text-xs">Based on macro math & allergy checks</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-400"/> Issues Identified
                      </h3>
                      {agent2.issuesFound?.length > 0 ? (
                        <ul className="space-y-2">
                          {agent2.issuesFound.map((issue: string, idx: number) => (
                            <li key={idx} className="text-sm text-red-300 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-emerald-400 bg-emerald-950/30 p-3 rounded-lg border border-emerald-900/50">
                          ✓ No clinical or mathematical issues found in Agent 1's draft.
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                        <Lightbulb size={16} className="text-yellow-400"/> Fix Suggestions
                      </h3>
                      {agent2.suggestions?.length > 0 ? (
                        <ul className="space-y-2">
                          {agent2.suggestions.map((sug: string, idx: number) => (
                            <li key={idx} className="text-sm text-yellow-300 bg-yellow-950/30 p-3 rounded-lg border border-yellow-900/50">
                              {sug}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-zinc-500 italic">No suggestions provided.</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">Agent 2 data is unavailable or unparseable.</p>
              )}
            </Card>
          </section>

          {/* Section 4: Agent 3 */}
          <section>
            <h2 className="text-xl font-medium mb-4 text-emerald-400 flex items-center gap-2">
              <Activity size={18} /> Model 3: Optimization & Synthesis
            </h2>
            <Card className="p-6 border-zinc-800 bg-zinc-950">
              {agent3 ? (
                <div>
                   <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-transparent border border-emerald-900/30">
                    <h3 className="text-sm font-medium text-emerald-400 mb-2">Final AI Insight</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      "{agent3.aiInsight}"
                    </p>
                  </div>

                  {agent3.correctionsApplied?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-zinc-300 mb-3">Corrections Applied by Optimizer</h3>
                      <ul className="space-y-2">
                        {agent3.correctionsApplied.map((corr: string, idx: number) => (
                          <li key={idx} className="text-sm text-emerald-300 flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" /> {corr}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <h3 className="text-sm font-medium text-zinc-300 mb-4 pt-4 border-t border-zinc-800">Final Locked Meals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agent3.meals?.map((meal: any, idx: number) => <MealCard key={idx} meal={meal} />)}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">Agent 3 data is unavailable or unparseable.</p>
              )}
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
