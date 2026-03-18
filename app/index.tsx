import { useRouter } from 'expo-router';
import { Calendar, Camera, ChevronRight, LogIn, Menu, Shield, Sparkles, Star, UserPlus, X } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

// Landing Page Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View className="p-6 bg-white rounded-3xl border border-purple-100 shadow-sm mb-4 w-full">
      <View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center mb-4">
        {icon}
      </View>
      <Text className="text-xl font-bold text-gray-900 mb-2">{title}</Text>
      <Text className="text-gray-600 leading-6">{description}</Text>
    </View>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <View className="flex-row items-center gap-4 mb-6">
      <View className="w-12 h-12 bg-purple-600 rounded-2xl items-center justify-center">
        <Text className="text-white text-xl font-bold">{number}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900 mb-1">{title}</Text>
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header/Navbar */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-50 bg-white/80 z-50">
        <View className="flex-row items-center gap-2">
          <View className="w-10 h-10 bg-purple-600 rounded-xl items-center justify-center">
            <Sparkles size={24} color="white" />
          </View>
          <Text className="text-2xl font-black text-purple-900 tracking-tighter">SKINZY</Text>
        </View>

        <View className="flex-row items-center gap-2">
          {isDesktop ? (
            <View className="flex-row items-center gap-4">
              <NavLink title="Booking" icon={<Calendar size={18} color="#4B5563" />} onPress={() => router.push('/patient/appointment-booking' as any)} />
              <NavLink title="Signup" icon={<UserPlus size={18} color="#4B5563" />} onPress={() => router.push('/shared/user-type-selection')} />
              <NavLink title="Login" icon={<LogIn size={18} color="white" />} onPress={() => router.push('/shared/login')} primary />
            </View>
          ) : (
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => router.push('/shared/login')}
                className="px-4 py-2 bg-purple-600 rounded-full"
              >
                <Text className="font-bold text-white text-xs">Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full"
              >
                {mobileMenuOpen ? <X size={24} color="#1F2937" /> : <Menu size={24} color="#1F2937" />}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <View className="absolute top-20 left-0 right-0 bottom-0 bg-white z-50 p-6">
          <View className="gap-6">
            <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/shared/user-type-selection'); }} className="flex-row justify-between items-center border-b border-gray-50 pb-4">
              <Text className="text-2xl font-bold">Register</Text>
              <ChevronRight color="#9333EA" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/shared/login'); }} className="flex-row justify-between items-center border-b border-gray-50 pb-4">
              <Text className="text-2xl font-bold">Sign In</Text>
              <ChevronRight color="#9333EA" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/patient/skin-analysis' as any); }} className="flex-row justify-between items-center border-b border-gray-50 pb-4">
              <Text className="text-2xl font-bold">AI Skin Test</Text>
              <ChevronRight color="#9333EA" />
            </TouchableOpacity>
          </View>
          <View className="mt-auto items-center mb-10">
            <Text className="text-gray-400">© 2025 Skinzy Pakistan</Text>
          </View>
        </View>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View
          className="px-6 items-center justify-center pt-10 pb-20"
          style={{ minHeight: height - 100 }}
        >
          <View className="bg-purple-50 px-4 py-2 rounded-full mb-6 flex-row items-center gap-2 border border-purple-100">
            <Shield size={16} color="#9333EA" />
            <Text className="text-purple-700 font-bold text-xs uppercase tracking-widest">Pakistan's #1 AI Skincare</Text>
          </View>

          <Text className="text-4xl font-black text-center text-gray-900 leading-[48px] mb-6">
            Smart Skincare for the <Text className="text-purple-600">Modern Pakistani</Text>
          </Text>

          <Text className="text-center text-gray-600 text-lg leading-7 mb-10 max-w-2xl">
            Advanced AI skin analysis designed for our climate, pollution, and skin types.
            Get Halal product recommendations and expert care.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/patient/skin-analysis' as any)}
            className="px-8 bg-purple-600 hover:bg-purple-900 py-4 rounded-full flex-row items-center justify-center gap-3 shadow-xl shadow-purple-200"
          >
            <Camera size={20} color="white" />
            <Text className="text-white font-black text-lg">Scan Your Skin</Text>
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
        <View className="m-6 bg-purple-900 rounded-[40px] p-8 overflow-hidden relative">
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600 rounded-full opacity-20" />
          <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600 rounded-full opacity-20" />

          <Text className="text-white text-3xl font-black mb-4 text-center">Transformation Starts Here</Text>
          <Text className="text-purple-100 text-center mb-8 leading-6">
            Don't guess with your skin. Use the same technology used by professionals.
          </Text>

          <TouchableOpacity
            onPress={handleGetStarted}
            className="bg-white py-4 rounded-2xl items-center"
          >
            <Text className="text-purple-900 font-black">GET STARTED NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="px-6 py-12 items-center bg-gray-50 mt-10">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-6 h-6 bg-purple-600 rounded-md items-center justify-center">
              <Sparkles size={14} color="white" />
            </View>
            <Text className="font-black text-gray-900 uppercase">Skinzy Pakistan</Text>
          </View>
          <Text className="text-gray-500 text-sm text-center mb-6">Designed for the unique skincare needs of the South Asian community.</Text>
          <View className="flex-row gap-6">
            <Text className="text-gray-400 text-xs">Privacy Policy</Text>
            <Text className="text-gray-400 text-xs">Terms of Use</Text>
            <Text className="text-gray-400 text-xs">Contact Us</Text>
          </View>
        </View>

        {/* Dev Menu Verifier */}
        <View className="p-4 bg-gray-200">
          <Text className="text-xs font-bold text-gray-500 mb-2 underline">DEV VERIFICATION LINKS:</Text>
          <View className="flex-row flex-wrap">
            {['/shared/login', '/shared/user-type-selection', '/doctor/registration', '/patient/dashboard'].map(route => (
              <TouchableOpacity key={route} onPress={() => router.push(route as any)} className="bg-gray-300 px-2 py-1 rounded mr-2 mb-2">
                <Text className="text-[10px] text-gray-700">{route}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
