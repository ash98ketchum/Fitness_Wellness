import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Award, CheckCircle2, ShieldAlert, Download, AlertTriangle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const STANDARD_RULES = [
  "Macro target alignment",
  "Caloric sum verification",
  "Allergen cross-checking",
  "Disliked foods filtering"
];

export default function ExpertReport() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;

    fetch(`https://athelya-api.onrender.com/api/v1/plans/latest?userId=${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.plan?.verificationReport) {
          setReport(data.plan.verificationReport);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, token]);

  const handleDownload = async () => {
    if (!report) return;
    try {
      const reportContent = `--- Athelya AI Verification Report ---\n\nConfidence Score: ${report.confidenceScore}/100\n\nAGENT 1 (Generator):\n${report.agent1Raw}\n\nAGENT 2 (Reviewer):\n${report.agent2Raw}\n\nAGENT 3 (Optimizer):\n${report.agent3Raw}`;
      await Share.share({
        message: reportContent,
        title: 'Athelya Expert AI Report'
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!report) {
    return (
      <View className="flex-1 bg-black justify-center items-center p-6">
        <Text className="text-white text-xl font-semibold mb-4">Report Not Found</Text>
        <TouchableOpacity className="bg-white px-4 py-2 rounded-lg" onPress={() => router.back()}>
          <Text className="text-black font-medium">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const validCorrections = report.correctionsApplied?.filter((c: string) => c && c.trim() !== '') || [];
  const issuesFound = report.issuesFound || [];

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Header */}
      <View className="h-16 border-b border-zinc-900 flex-row items-center justify-between px-4 bg-black">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#a1a1aa" />
          </TouchableOpacity>
          <Text className="text-white font-medium text-lg">Expert AI Report</Text>
        </View>
        <TouchableOpacity onPress={handleDownload}>
          <Download size={20} color="#34d399" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full bg-indigo-900/30 items-center justify-center mb-4 border border-indigo-500/50">
            <Award size={32} color="#818cf8" />
          </View>
          <Text className="text-2xl font-semibold text-white tracking-tight text-center">
            Agent Optimization Complete
          </Text>
          <Text className="text-zinc-400 mt-2 text-center">
            Your plan has been reviewed by our multi-agent system.
          </Text>
        </View>

        {/* Confidence Score */}
        <View className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 mb-6">
          <Text className="text-zinc-400 text-sm mb-1 uppercase tracking-wider font-medium">Confidence Score</Text>
          <View className="flex-row items-end gap-2">
            <Text className="text-4xl font-bold text-white">{report.confidenceScore}</Text>
            <Text className="text-xl font-bold text-emerald-500 mb-1">/ 100</Text>
          </View>
        </View>

        {/* Rules Checked */}
        <View className="mb-8">
          <Text className="text-lg font-medium text-white mb-4">Rules Verified</Text>
          <View className="space-y-3">
            {STANDARD_RULES.map((rule: string, i: number) => (
              <View key={i} className="flex-row items-center gap-3 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <CheckCircle2 size={18} color="#10b981" />
                <Text className="text-zinc-200 flex-1">{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Issues Found */}
        {issuesFound.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-medium text-white mb-4">Initial Issues Found</Text>
            <View className="space-y-3">
              {issuesFound.map((issue: string, i: number) => (
                <View key={i} className="flex-row items-start gap-3 bg-amber-900/20 p-4 rounded-lg border border-amber-900/50">
                  <AlertTriangle size={18} color="#fbbf24" className="mt-0.5" />
                  <Text className="text-amber-200 flex-1 leading-relaxed">{issue}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Corrections */}
        {validCorrections.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-medium text-white mb-4">Agent Corrections</Text>
            <View className="space-y-3">
              {validCorrections.map((correction: string, i: number) => (
                <View key={i} className="flex-row items-start gap-3 bg-indigo-900/20 p-4 rounded-lg border border-indigo-900/50">
                  <ShieldAlert size={18} color="#818cf8" className="mt-0.5" />
                  <Text className="text-indigo-200 flex-1 leading-relaxed">{correction}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
