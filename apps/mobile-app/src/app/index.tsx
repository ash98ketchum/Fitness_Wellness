import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, Easing, withRepeat, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Activity, Cpu, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const AnimatedBlurCircle = () => {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.blurCircle, animatedStyle]} />
  );
};

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AnimatedBlurCircle />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Navbar */}
        <View style={styles.nav}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Activity color="#000" size={16} />
            </View>
            <Text style={styles.logoText}>LuminaFit</Text>
          </View>
          <View style={styles.navRight}>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.navLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.hero}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>LuminaFit AI Engine 2.0 is live</Text>
            </View>
            
            <Text style={styles.h1}>
              Hyper-personalized nutrition.{"\n"}
              <Text style={styles.h1Sub}>Powered by multi-agent AI.</Text>
            </Text>
            
            <Text style={styles.heroSub}>
              Stop guessing your macros. Our AI engine analyzes your biology, goals, and lifestyle to generate a perfectly optimized diet plan in seconds.
            </Text>
            
            <Button 
              title="Start your assessment" 
              onPress={() => router.push('/(auth)/signup')} 
              style={styles.mainCta}
            />
            <Button 
              title="For Gyms & Trainers" 
              variant="outline"
              onPress={() => {}} 
              style={styles.secondaryCta}
            />
          </Animated.View>

          {/* Features */}
          <View style={styles.section}>
            <FeatureCard 
              icon={<Cpu color="#fff" />}
              title="Multi-Agent Pipeline"
              description="A Generator, Reviewer, and Optimizer work together to ensure your plan is biologically perfect."
            />
            <FeatureCard 
              icon={<Activity color="#fff" />}
              title="Dynamic Macro Balancing"
              description="As your body changes, your plan adapts instantly. No more static PDFs."
            />
            <FeatureCard 
              icon={<ShieldCheck color="#fff" />}
              title="Expert Verified"
              description="Every plan passes through an AI verification layer checking for allergies and contradictions."
            />
          </View>

          {/* Pricing */}
          <Animated.View entering={FadeIn.delay(400).duration(800)} style={styles.section}>
            <Text style={styles.h2}>Simple, transparent pricing.</Text>
            <Text style={styles.h2Sub}>Start for free, upgrade when you need more power.</Text>
            
            <View style={styles.pricingCardPro}>
              <View style={styles.gradientTopBar} />
              <View style={styles.popularBadge}><Text style={styles.popularBadgeText}>Most Popular</Text></View>
              <Text style={styles.pricingTitle}>Pro</Text>
              <Text style={styles.pricingDesc}>For those who want full control and adaptive AI coaching.</Text>
              <Text style={styles.pricingPrice}>$19<Text style={styles.pricingPriceSub}>/mo</Text></Text>
              
              <View style={styles.pricingFeatures}>
                {['Adaptive Meal Engine', 'Voice Cooking Assistant', 'Unlimited meal recalculations', 'Priority 24/7 AI Coach'].map(f => (
                  <View key={f} style={styles.featureRow}>
                    <CheckCircle2 color="#10b981" size={18} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              
              <Button title="Upgrade to Pro" onPress={() => router.push('/(auth)/signup')} style={styles.proCta} textStyle={{ color: '#000' }} />
            </View>
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.featureCard}>
      <View style={styles.iconBox}>{icon}</View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  blurCircle: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(39, 39, 42, 0.4)',
    transform: [{ scale: 1 }],
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { width: 24, height: 24, backgroundColor: '#fff', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '600', fontSize: 18 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  navLink: { color: '#fff', fontSize: 14 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 60 },
  hero: { alignItems: 'center', marginBottom: 60 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#27272a', backgroundColor: 'rgba(39, 39, 42, 0.5)', marginBottom: 32 },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  badgeText: { color: '#d4d4d8', fontSize: 12 },
  h1: { fontSize: 40, fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: 48, marginBottom: 24 },
  h1Sub: { color: '#71717a' },
  heroSub: { fontSize: 16, color: '#a1a1aa', textAlign: 'center', lineHeight: 24, marginBottom: 40, paddingHorizontal: 16 },
  mainCta: { width: '100%', marginBottom: 12 },
  secondaryCta: { width: '100%' },
  section: { marginTop: 40, gap: 16 },
  featureCard: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(39, 39, 42, 0.5)', backgroundColor: 'rgba(24, 24, 27, 0.5)', marginBottom: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  featureTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 8 },
  featureDesc: { fontSize: 14, color: '#a1a1aa', lineHeight: 22 },
  h2: { fontSize: 28, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  h2Sub: { fontSize: 16, color: '#a1a1aa', textAlign: 'center', marginBottom: 32 },
  pricingCardPro: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#3f3f46', backgroundColor: 'rgba(24, 24, 27, 0.8)', overflow: 'hidden' },
  gradientTopBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#10b981' },
  popularBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  popularBadgeText: { color: '#000', fontSize: 10, fontWeight: '600' },
  pricingTitle: { fontSize: 24, fontWeight: '600', color: '#fff', marginBottom: 8 },
  pricingDesc: { fontSize: 14, color: '#a1a1aa', marginBottom: 24 },
  pricingPrice: { fontSize: 36, fontWeight: '700', color: '#fff', marginBottom: 24 },
  pricingPriceSub: { fontSize: 16, fontWeight: '400', color: '#71717a' },
  pricingFeatures: { gap: 12, marginBottom: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { color: '#fff', fontSize: 14 },
  proCta: { backgroundColor: '#fff' }
});
