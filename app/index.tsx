import { useRouter } from 'expo-router';
import { Calendar, Camera, ChevronRight, LogIn, Menu, Shield, Sparkles, Star, UserPlus, X } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Footer from '../components/Footer';

// Landing Page Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View className="p-6 bg-white rounded-3xl border border-purple-100 shadow-sm mb-4 w-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-purple-200 group">
      <View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-purple-100">
        <View className="transition-transform duration-300 group-hover:scale-110">
          {icon}
        </View>
      </View>
      <Text className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{title}</Text>
      <Text className="text-gray-600 leading-6">{description}</Text>
    </View>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <View className="flex-row items-center gap-4 mb-6 p-4 rounded-3xl transition-all duration-300 hover:bg-purple-50 group">
      <View className="w-12 h-12 bg-purple-600 rounded-2xl items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        <Text className="text-white text-xl font-bold">{number}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{title}</Text>
        <Text className="text-gray-600">{description}</Text>
      </View>
    </View>
  );
}

function NavLink({ title, icon, onPress, primary = false }: { title: string; icon?: React.ReactNode; onPress: () => void; primary?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${primary ? 'bg-purple-600' : 'bg-white'}`}
    >
      {icon}
      <Text className={`font-bold ${primary ? 'text-white' : 'text-gray-700'}`}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function Index() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = width >= 768;

  const handleGetStarted = () => {
    router.push('/shared/user-type-selection' as any);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Global Header handles navigation now */}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View
          className="px-6 items-center justify-center pt-10 pb-20"
          style={{ minHeight: height - 100 }}
        >
          <View className="bg-purple-50 px-4 py-2 rounded-full mb-6 flex-row items-center gap-2 border border-purple-100 animate-fade-in-top">
            <Shield size={16} color="#9333EA" />
            <Text className="text-purple-700 font-bold text-xs uppercase tracking-widest">Pakistan's #1 AI Skincare</Text>
          </View>
          
          <Text className="text-4xl font-black text-center text-gray-900 leading-[48px] mb-6 animate-fade-in">
            Smart Skincare for the <Text className="text-purple-600">Modern Pakistani</Text>
          </Text>
          
          <Text className="text-center text-gray-600 text-lg leading-7 mb-10 max-w-2xl animate-fade-in">
            Advanced AI skin analysis designed for our climate, pollution, and skin types.
            Get Halal product recommendations and expert care.
          </Text>
          
          <TouchableOpacity
            onPress={() => router.push('/patient/skin-analysis' as any)}
            className="px-8 bg-purple-600 py-4 rounded-full flex-row items-center justify-center gap-3 shadow-xl shadow-purple-200 transition-all duration-300 hover:bg-purple-900 hover:scale-105 active:scale-95 animate-fade-in-bottom group"
          >
            <Camera size={20} color="white" className="group-hover:rotate-12 transition-transform duration-300" />
            <Text className="text-white font-black text-lg">Scan Your Skin Now</Text>
          </TouchableOpacity>

          <View className="mt-8 flex-row items-center gap-2">
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} color="#FBBF24" fill="#FBBF24" />)}
            </View>
            <Text className="text-gray-500 font-medium">Join 50k+ Happy Users</Text>
          </View>
        </View>

        {/* Feature Highlights */}
        <View className="px-6 py-20 bg-gray-50/50 rounded-t-[50px]">
          <Text className="text-3xl font-black text-gray-900 mb-16 text-center">Why Skinzy?</Text>

          <View className={`w-full max-w-6xl mx-auto gap-6 ${isDesktop ? 'flex-row items-start' : 'flex-col'}`}>
            {/* Left Card - Staggered Down */}
            <View className={isDesktop ? 'flex-1  mt-12' : 'w-full'}>
              <FeatureCard
                icon={<Camera size={24} color="#9333EA" />}
                title="Instant AI Analysis"
                description="Our AI detects 12+ skin conditions including acne, pigmentation, and dark circles with 98% accuracy."
              />
            </View>

            {/* Center Card - Higher */}
            <View className={isDesktop ? 'flex-1' : 'w-full'}>
              <FeatureCard
                icon={<Shield size={24} color="#9333EA" />}
                title="Halal & Affordable"
                description="Personalized recommendations for local Halal-certified and budget-friendly Pakistani brands."
              />
            </View>

            {/* Right Card - Staggered Down */}
            <View className={isDesktop ? 'flex-1 mt-12' : 'w-full'}>
              <FeatureCard
                icon={<Calendar size={24} color="#9333EA" />}
                title="Dermatologist Access"
                description="Book online consultations with Pakistan's leading dermatologists within minutes."
              />
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View className="px-6 py-16 bg-white">
          <Text className="text-3xl font-black text-gray-900 mb-10 text-center">3 Simple Steps</Text>

          <StepCard
            number="1"
            title="Snap a Selfie"
            description="Take a clear photo in natural light using our built-in guided camera."
          />
          <StepCard
            number="2"
            title="Get Analysis"
            description="Receive your skin score and deep insights into your skin health instantly."
          />
          <StepCard
            number="3"
            title="Start Routine"
            description="Follow your custom routine and track improvements over time."
          />
        </View>

        {/* CTA Banner */}
        <View className="m-6 bg-purple-900 rounded-[40px] p-10 overflow-hidden relative border border-purple-700 shadow-2xl shadow-purple-400">
          <View className="absolute -top-10 -right-10 w-60 h-60 bg-purple-600 rounded-full opacity-30 animate-pulse" />
          <View className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500 rounded-full opacity-20" />

          <Text className="text-white text-3xl font-black mb-4 text-center">Transformation Starts Here</Text>
          <Text className="text-purple-100 text-center mb-10 leading-7 text-lg">
            Don't guess with your skin. Use the same technology used by professionals.
          </Text>

          <TouchableOpacity
            onPress={handleGetStarted}
            className="bg-white py-4 px-10 rounded-2xl items-center self-center transition-all duration-300 hover:bg-purple-50 hover:scale-105 active:scale-95 shadow-lg"
          >
            <Text className="text-purple-900 font-black text-lg">GET STARTED NOW</Text>
          </TouchableOpacity>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}
