import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ArrowRight, Activity, Cpu, ShieldCheck, Star, CheckCircle2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const testimonials = [
  { name: "James Hartley", role: "Owner, Iron Republic Gym", text: "LuminaFit replaced our entire nutrition coaching workflow. Members love the AI plans." },
  { name: "Sarah Chen", role: "PT, FitLab London", text: "The multi-agent system catches things I'd miss. It's like having a second pair of expert eyes." },
  { name: "Marcus Williams", role: "Head Coach, Apex Athletics", text: "We've seen 40% better member retention since integrating LuminaFit into our onboarding." },
  { name: "Dr. Emily Foster", role: "Sports Nutritionist", text: "The macro optimization is genuinely impressive. It accounts for nutrient timing perfectly." },
  { name: "Ryan O'Brien", role: "CrossFit Box Owner", text: "Setup took 10 minutes. Our athletes had personalized plans the same day." },
  { name: "Priya Sharma", role: "Wellness Director, GoldFit", text: "The verification reports give us confidence. Every plan is backed by data." },
];

const stats = [
  { value: "500+", label: "Gyms & Studios" },
  { value: "12,000+", label: "Plans Generated" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "<30s", label: "Generation Time" },
];

const faqs = [
  { question: "How does the AI optimize my macros?", answer: "Our multi-agent pipeline factors in your exact body weight, body fat percentage, activity level, and goals to create a mathematically perfect macro split. It constantly re-evaluates as you progress." },
  { question: "Can I swap meals if I don't like something?", answer: "Yes. Our Adaptive Meal Engine allows you to drag-and-drop meals, or simply tell the AI Coach 'I don't like eggs', and it will instantly recalculate a new meal that fits your daily macros perfectly." },
  { question: "What if I go off plan?", answer: "No problem. Just tell the AI what you ate (e.g., 'I had 3 slices of pizza'). The Adaptive Engine will automatically rebalance your remaining meals for the day or week to keep you on track." },
  { question: "Is my data private and secure?", answer: "Absolutely. We employ enterprise-grade encryption for all user data. Your health information is strictly confidential and never shared with third parties." },
];

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-800 selection:text-white flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-900 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center">
              <Activity size={16} />
            </div>
            LuminaFit
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log in</Button>
            <Button size="sm" onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center px-6 pt-32 pb-24 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-900 rounded-full blur-[120px] opacity-50 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LuminaFit AI Engine 2.0 is live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.1] mb-8">
            Hyper-personalized nutrition.<br />
            <span className="text-zinc-500">Powered by multi-agent AI.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop guessing your macros. Our AI engine analyzes your biology, goals, and lifestyle to generate a perfectly optimized diet plan in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/signup')}>
              Start your assessment <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-zinc-400 border-zinc-800">
              For Gyms & Trainers
            </Button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-32 z-10 w-full"
        >
          <FeatureCard 
            icon={<Cpu />}
            title="Multi-Agent Pipeline"
            description="A Generator, Reviewer, and Optimizer work together to ensure your plan is biologically perfect."
          />
          <FeatureCard 
            icon={<Activity />}
            title="Dynamic Macro Balancing"
            description="As your body changes, your plan adapts instantly. No more static PDFs."
          />
          <FeatureCard 
            icon={<ShieldCheck />}
            title="Expert Verified"
            description="Every plan passes through an AI verification layer checking for allergies and contradictions."
          />
        </motion.div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-32 w-full max-w-4xl mx-auto z-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-b border-zinc-900">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-semibold tracking-tight">{stat.value}</div>
                <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Marquee */}
        <div className="mt-24 w-full overflow-hidden z-10">
          <h3 className="text-center text-sm font-medium text-zinc-500 uppercase tracking-widest mb-8">
            Trusted by fitness professionals
          </h3>
          <div className="relative">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
            
            <div className="flex animate-marquee hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
              {[...testimonials, ...testimonials].map((t, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[380px] mx-3 p-6 rounded-2xl border border-zinc-800/50 bg-zinc-950/50"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className="fill-zinc-500 text-zinc-500" />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">"{t.text}"</p>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-32 w-full max-w-5xl mx-auto z-10"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter mb-4">Simple, transparent pricing.</h2>
            <p className="text-zinc-400 text-lg">Start for free, upgrade when you need more power.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm flex flex-col">
              <h3 className="text-2xl font-semibold mb-2">Basic</h3>
              <p className="text-zinc-400 mb-6">Perfect for individuals starting their fitness journey.</p>
              <div className="text-4xl font-bold tracking-tight mb-8">Free</div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Basic AI meal generation', 'Standard macro tracking', 'Weekly progress review', 'Community support'].map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/signup')}>Get Started Free</Button>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-3xl border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm flex flex-col relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
              <div className="absolute top-4 right-4 px-3 py-1 text-xs font-medium bg-white text-black rounded-full">Most Popular</div>
              <h3 className="text-2xl font-semibold mb-2 text-white">Pro</h3>
              <p className="text-zinc-400 mb-6">For those who want full control and adaptive AI coaching.</p>
              <div className="text-4xl font-bold tracking-tight mb-2 text-white">$19<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
              <p className="text-sm text-zinc-500 mb-8">Billed annually at $228</p>
              <ul className="space-y-4 mb-8 flex-1">
                {['Adaptive Meal Engine', 'Voice Cooking Assistant', 'Unlimited meal recalculations', 'Downloadable Expert Reports', 'Priority 24/7 AI Coach'].map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-white">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-white text-black hover:bg-zinc-200" onClick={() => navigate('/signup')}>Upgrade to Pro</Button>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-32 mb-24 w-full max-w-3xl mx-auto z-10"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/30">
                <button
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:bg-zinc-900/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-lg">{faq.question}</span>
                  {openFaq === i ? <Minus size={20} className="text-zinc-400" /> : <Plus size={20} className="text-zinc-400" />}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <p className="p-6 pt-0 text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-semibold text-lg tracking-tight mb-4">
                <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center">
                  <Activity size={16} />
                </div>
                LuminaFit
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                AI-powered nutrition for the modern fitness industry.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">Features</li>
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">API Docs</li>
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">Changelog</li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">About</li>
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-zinc-300 cursor-pointer transition-colors">GDPR</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} LuminaFit. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-zinc-600 hover:text-zinc-300 transition-colors text-sm">Twitter</a>
              <a href="#" className="text-zinc-600 hover:text-zinc-300 transition-colors text-sm">LinkedIn</a>
              <a href="#" className="text-zinc-600 hover:text-zinc-300 transition-colors text-sm">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm text-left flex flex-col items-start hover:border-zinc-700 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}
