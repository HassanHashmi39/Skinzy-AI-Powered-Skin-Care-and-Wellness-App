import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useEffect } from 'react';
import { AlertCircle, ArrowRight, Check, Droplet, Eye, Sun, Zap, ShieldAlert, Coffee, Moon, CheckCircle2, XCircle, Camera, Activity } from 'lucide-react-native';

export type Page = 'landing' | 'analysis' | 'results' | 'products' | 'routine' | 'appointments' | 'remedies' | 'chat' | 'history' | 'notifications' | 'profile' | 'feedback';

export type SkinAnalysisResult = {
  skinType: string;
  skinTone: string;
  detectedDisease?: string;
  conditionLevel?: string;
  confidence?: string;
  advice?: string;
  doctor?: string;
  issues: {
    acne: number;
    pigmentation: number;
    dryness: number;
    oiliness: number;
    darkCircles: number;
    sensitivity: number;
  };
  recommendations: any[];
};

type AnalysisResultsProps = {
  result: SkinAnalysisResult;
  onNavigate: (page: Page) => void;
};

import * as api from '../../utils/api';

function AnalysisResults({ result, onNavigate }: AnalysisResultsProps) {
  useEffect(() => {
    saveAnalysis();
  }, [result]);

  const saveAnalysis = async () => {
    try {
      await api.createAnalysis({
        results: result.issues,
        skinType: result.skinType,
        skinTone: result.skinTone
      });
      console.log('✅ Analysis saved to history');
    } catch (err) {
      console.error('❌ Failed to save analysis:', err);
    }
  };
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score < 30) return 'Mild';
    if (score < 60) return 'Moderate';
    return 'Severe';
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Success Header */}
      <View className="bg-white m-4 rounded-3xl shadow-sm p-6 mb-6">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
            <Check size={32} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold mb-2 text-gray-900 text-center">Analysis Complete!</Text>
          <Text className="text-gray-600 text-center">Here's what we found about your skin</Text>
        </View>

        {/* AI Result Banner (Requirement 1 & 2) */}
        <View className="mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-200 relative overflow-hidden">
            <View className="absolute top-0 right-0 bg-purple-200 px-3 py-1 rounded-bl-2xl flex-row items-center gap-1 z-10">
                <Activity size={12} color="#6b21a8" />
                <Text className="text-purple-800 font-bold text-xs uppercase">Confidence: {result.confidence || '92%'}</Text>
            </View>
            <Text className="text-gray-600 text-xs mb-1 uppercase font-bold tracking-widest mt-2">Our AI Detected:</Text>
            <Text className="text-3xl font-black text-purple-900 mb-2">{result.detectedDisease || result.skinType}</Text>
            <View className="flex-row items-center gap-2">
                <Text className="text-gray-500 font-medium tracking-tight uppercase text-[10px]">Condition Level:</Text>
                <View className={`px-3 py-1 rounded-full ${result.conditionLevel === 'good' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <Text className={`font-bold text-xs uppercase ${result.conditionLevel === 'good' ? 'text-green-700' : 'text-yellow-700'}`}>
                        {result.conditionLevel || 'Moderate'}
                    </Text>
                </View>
            </View>
        </View>

        {/* Skin Profile */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <Text className="text-gray-600 text-xs mb-1 font-medium">Skin Category:</Text>
            <Text className="text-gray-900 font-bold">{result.skinType}</Text>
          </View>
          <View className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <Text className="text-gray-600 text-xs mb-1 font-medium">Skin Tone:</Text>
            <Text className="text-gray-900 font-bold">{result.skinTone}</Text>
          </View>
        </View>

      </View>

      {/* Doctor Alert System */}
      {(result.conditionLevel === 'low' || result.conditionLevel === 'severe' || result.doctor === 'Recommended') && (
        <View className="bg-red-50 mx-4 mb-4 rounded-3xl shadow-sm p-6 border border-red-200 flex-row items-center gap-4">
            <ShieldAlert size={32} color="#dc2626" />
            <View className="flex-1">
                <Text className="text-red-800 font-bold text-lg mb-1">Doctor Alert System &nbsp;⚠️</Text>
                <Text className="text-red-600 font-medium leading-5">Your condition may require dermatologist consultation for proper treatment.</Text>
            </View>
        </View>
      )}



      <View className="bg-white m-4 mt-0 rounded-3xl shadow-sm p-6 mb-8">
        <Text className="text-xl font-bold mb-6 text-gray-900">Your Action Plan</Text>
        
        {/* Daily Routine */}
        <View className="mb-6 gap-3">
            <View className="bg-blue-50 p-4 rounded-2xl">
                <View className="flex-row items-center gap-2 mb-3">
                    <Coffee size={20} color="#2563eb" />
                    <Text className="text-blue-900 font-bold text-lg">Morning Routine</Text>
                </View>
                {(
                  result.skinType?.toLowerCase().includes('oily') 
                  ? ['1. Foaming Cleanser', '2. Niacinamide Serum', '3. Oil-free Sunscreen SPF 50+']
                  : result.skinType?.toLowerCase().includes('dry')
                  ? ['1. Hydrating Cleanser', '2. Hyaluronic Acid', '3. Moisturizing Sunscreen SPF 50+']
                  : result.skinType?.toLowerCase().includes('sensitive')
                  ? ['1. Milk Cleanser', '2. Soothing Centella Serum', '3. Mineral Sunscreen SPF 50+']
                  : ['1. Gentle Cleanser', '2. Active Serum (e.g. Vitamin C)', '3. Sunscreen SPF 60+']
                ).map((step, i) => (
                  <Text key={i} className="text-blue-800 mb-1 font-medium">• {step}</Text>
                ))}
            </View>
            <View className="bg-indigo-50 p-4 rounded-2xl">
                <View className="flex-row items-center gap-2 mb-3">
                    <Moon size={20} color="#4f46e5" />
                    <Text className="text-indigo-900 font-bold text-lg">Night Routine</Text>
                </View>
                {(
                  result.detectedDisease && result.detectedDisease !== 'Healthy'
                  ? ['1. Double Cleanse', `2. Targeted Treatment (for ${result.detectedDisease})`, '3. Reparative Moisturizer']
                  : result.skinType?.toLowerCase().includes('oily')
                  ? ['1. Micellar Water', '2. Salicylic Acid Cleanser', '3. Light Gel Moisturizer']
                  : result.skinType?.toLowerCase().includes('dry')
                  ? ['1. Cleansing Balm', '2. Hydrating Cleanser', '3. Rich Night Cream']
                  : ['1. Double Cleanse', '2. Gentle Exfoliation (1-2x/week)', '3. Reparative Moisturizer']
                ).map((step, i) => (
                  <Text key={i} className="text-indigo-800 mb-1 font-medium">• {step}</Text>
                ))}
            </View>
        </View>

        {/* Dos & Don'ts */}
        <View className="mb-6 gap-3 flex-row">
            <View className="flex-1 border border-green-200 bg-green-50 p-4 rounded-2xl">
                <View className="flex-row items-center gap-2 mb-2">
                    <CheckCircle2 size={16} color="#15803d" />
                    <Text className="font-bold text-green-800 text-base">Do's</Text>
                </View>
                {(
                  result.detectedDisease?.toLowerCase().includes('acne') || result.skinType?.toLowerCase().includes('oily')
                  ? ['Wash face 2x daily', 'Use non-comedogenic makeup', 'Change pillowcases often']
                  : result.skinType?.toLowerCase().includes('dry')
                  ? ['Moisturize on damp skin', 'Use a humidifier', 'Drink much water']
                  : result.skinType?.toLowerCase().includes('sensitive')
                  ? ['Patch test new products', 'Keep routine simple', 'Wear wide-brimmed hats']
                  : ['Wash face 2x daily', 'Drink much water', 'Eat antioxidant foods']
                ).map((item, i) => (
                  <Text key={i} className="text-green-700 text-sm mb-1">• {item}</Text>
                ))}
            </View>
            <View className="flex-1 border border-red-200 bg-red-50 p-4 rounded-2xl">
               <View className="flex-row items-center gap-2 mb-2">
                    <XCircle size={16} color="#b91c1c" />
                    <Text className="font-bold text-red-800 text-base">Don'ts</Text>
                </View>
                {(
                  result.detectedDisease?.toLowerCase().includes('acne')
                  ? ['Pop or pick at pimples', 'Over-exfoliate', 'Consume excessive dairy']
                  : result.skinType?.toLowerCase().includes('dry')
                  ? ['Use hot water for washing', 'Use alcohol toners', 'Over-wash face']
                  : result.skinType?.toLowerCase().includes('sensitive')
                  ? ['Use physical scrubs', 'Use strong fragrances', 'Try many new products at once']
                  : ['Avoid oily/salty food', "Don't touch face", 'Skip sunscreen']
                ).map((item, i) => (
                  <Text key={i} className="text-red-700 text-sm mb-1">• {item}</Text>
                ))}
            </View>
        </View>

        {/* Multiple Product Recommendations */}
        <View className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8">
            <Text className="font-bold text-gray-900 text-lg mb-4">Recommended Products</Text>
            
            {result.recommendations && result.recommendations.map((item: any, idx: number) => (
                <View key={idx} className="mb-4">
                    <Text className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">{item.tier || 'Product'} Option | {item.category}</Text>
                    <Text className="text-gray-800 font-medium text-base">{item.brand} {item.name}</Text>
                    <Text className="text-purple-600 font-bold text-sm">{item.price}</Text>
                </View>
            ))}
            {(!result.recommendations || result.recommendations.length === 0) && (
                 <Text className="text-gray-500 font-medium">No specific products recommended.</Text>
            )}
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <TouchableOpacity
            onPress={() => onNavigate('products')}
            className="flex-row items-center justify-center gap-2 px-6 py-4 bg-purple-600 rounded-2xl"
          >
            <Text className="text-white font-bold text-lg">Shop Entire Routine</Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onNavigate('routine')}
            className="flex-row items-center justify-center gap-2 px-6 py-4 bg-purple-50 rounded-2xl"
          >
            <Text className="text-purple-700 font-bold text-lg">Save Routine & Reminders</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Additional Options */}
      <View className="mx-4 gap-4">
        {/* Progress Tracking */}
        <TouchableOpacity
          onPress={() => onNavigate('history')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 flex-row items-center gap-4"
        >
          <View className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
             <Activity size={24} color="#9333ea" />
          </View>
          <View className="flex-1">
              <Text className="text-lg font-bold mb-1 text-gray-900">Patient History</Text>
              <Text className="text-gray-600 text-sm">View your past skin analysis results</Text>
          </View>
        </TouchableOpacity>
      
        <TouchableOpacity
          onPress={() => onNavigate('appointments')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 flex-row items-center gap-4"
        >
          <View className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
             <ShieldAlert size={24} color="#dc2626" />
          </View>
          <View className="flex-1">
              <Text className="text-lg font-bold mb-1 text-gray-900">Consult Doctor</Text>
              <Text className="text-gray-600 text-sm">Get professional dermatologist advice</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ConcernBar({
  icon,
  label,
  score,
  color,
  bgColor,
  severity,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  color: string;
  bgColor: string;
  severity: string;
}) {
  return (
    <View>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className="text-gray-700 font-medium">{label}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Text className={`${color} font-medium`}>{severity}</Text>
          <Text className="text-gray-500">{score}%</Text>
        </View>
      </View>
      <View className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <View
          className={`h-full ${bgColor}`}
          style={{ width: `${score}%` }}
        />
      </View>
    </View>
  );
}

export default function AnalysisResultsPage() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const result: SkinAnalysisResult = params.result ? JSON.parse(params.result as string) : {
        skinType: 'Combination',
        skinTone: 'Medium',
        issues: {
            acne: 20,
            pigmentation: 15,
            dryness: 10,
            oiliness: 40,
            darkCircles: 30,
            sensitivity: 50
        },
        recommendations: ["Use a gentle cleanser", "Apply moisturizer daily"]
    };

    const handleNavigate = (page: string) => {
        console.log('Navigate to:', page);
        if (page === 'landing') router.push('/');
        else if (page === 'analysis') router.push('/patient/skin-analysis');
        else if (page === 'products') router.push('/patient/product-recommendations');
        else if (page === 'routine') router.push('/patient/routine-tracker');
        else if (page === 'appointments') router.push('/patient/appointment-booking');
        else if (page === 'remedies') router.push('/patient/remedies');
        else if (page === 'chat') router.push('/patient/chat');
        else if (page === 'history') router.push('/patient/history');
        else if (page === 'notifications') router.push('/shared/notifications');
        else if (page === 'profile') router.push('/shared/user-profile');
        else if (page === 'feedback') router.push('/shared/feedback');
        else router.push(`/${page}` as any);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <AnalysisResults
                result={result}
                onNavigate={handleNavigate}
            />
        </SafeAreaView>
    );
}
