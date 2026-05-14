import { useRouter } from 'expo-router';
import { ArrowLeft, Stethoscope, UserCircle } from 'lucide-react-native';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

type UserTypeSelectionProps = {
  onNavigate: (page: string) => void;
  onSelectUserType: (type: 'patient' | 'doctor') => void;
};

function UserTypeSelection({ onNavigate, onSelectUserType }: UserTypeSelectionProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        className="bg-purple-50"
        showsVerticalScrollIndicator={false}
    >
      <SafeAreaView className="flex-1">
        {/* Main Container - Removed justify-center to prevent layout issues on web/overflow */}
        <View className="flex-1 px-4 py-12 items-center">
          <View className="w-full max-w-5xl">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => onNavigate('landing')}
              className="flex-row items-center gap-2 mb-8 self-start"
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#4b5563" />
              <Text className="text-gray-600 font-medium">Back to Home</Text>
            </TouchableOpacity>

            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-16 h-16 bg-purple-500 rounded-full items-center justify-center mb-4 shadow-lg shadow-purple-200">
                <Text className="text-white text-2xl font-bold">S</Text>
              </View>
              <Text className="text-3xl font-black mb-3 text-gray-900 text-center">Join Skinzy</Text>
              <Text className="text-gray-600 text-center text-lg max-w-md">
                Choose your account type to get started with personalized skin care
              </Text>
            </View>

            {/* User Type Cards */}
            <View className={`gap-6 w-full ${isDesktop ? 'flex-row items-stretch' : 'flex-col'}`}>
              {/* Patient Card */}
              <TouchableOpacity
                onPress={() => onSelectUserType('patient')}
                activeOpacity={0.9}
                className={`bg-white rounded-[32px] p-8 shadow-sm border-2 border-transparent active:border-purple-300 ${isDesktop ? 'flex-1' : 'w-full'}`}
              >
                <View className="w-16 h-16 bg-purple-100 rounded-2xl items-center justify-center mb-6">
                  <UserCircle size={32} color="#9333ea" />
                </View>
                <Text className="text-2xl font-bold mb-3 text-gray-900">I'm a Patient</Text>
                <Text className="text-gray-600 mb-8 leading-6 text-base">
                  Get AI-powered skin analysis, personalized routines, and connect with dermatologists
                </Text>
                <View className="gap-4 mb-10">
                  {[
                    "Free AI skin analysis",
                    "Personalized skincare routines",
                    "Halal & affordable product recommendations",
                    "Book appointments with doctors",
                    "Track your skincare progress"
                  ].map((item, idx) => (
                    <View key={idx} className="flex-row items-start gap-3">
                      <View className="w-5 h-5 bg-purple-100 rounded-full items-center justify-center mt-0.5">
                        <Text className="text-purple-600 font-bold text-xs">✓</Text>
                      </View>
                      <Text className="text-gray-700 flex-1 leading-5">{item}</Text>
                    </View>
                  ))}
                </View>
                <View className="mt-auto px-6 py-4 bg-purple-600 rounded-2xl items-center shadow-lg shadow-purple-200">
                  <Text className="text-white font-black text-lg">Continue as Patient</Text>
                </View>
              </TouchableOpacity>

              {/* Doctor Card */}
              <TouchableOpacity
                onPress={() => onSelectUserType('doctor')}
                activeOpacity={0.9}
                className={`bg-white rounded-[32px] p-8 shadow-sm border-2 border-transparent active:border-purple-300 ${isDesktop ? 'flex-1' : 'w-full'}`}
              >
                <View className="w-16 h-16 bg-purple-100 rounded-2xl items-center justify-center mb-6">
                  <Stethoscope size={32} color="#9333ea" />
                </View>
                <Text className="text-2xl font-bold mb-3 text-gray-900">I'm a Doctor</Text>
                <Text className="text-gray-600 mb-8 leading-6 text-base">
                  Register as a dermatologist to manage appointments and connect with patients
                </Text>
                <View className="gap-4 mb-10">
                  {[
                    "Professional dashboard",
                    "Manage patient appointments",
                    "Access patient medical history",
                    "Chat with patients securely",
                    "Document verification system"
                  ].map((item, idx) => (
                    <View key={idx} className="flex-row items-start gap-3">
                      <View className="w-5 h-5 bg-purple-100 rounded-full items-center justify-center mt-0.5">
                        <Text className="text-purple-600 font-bold text-xs">✓</Text>
                      </View>
                      <Text className="text-gray-700 flex-1 leading-5">{item}</Text>
                    </View>
                  ))}
                </View>
                <View className="mt-auto px-6 py-4 bg-purple-600 rounded-2xl items-center shadow-lg shadow-purple-200">
                  <Text className="text-white font-black text-lg">Continue as Doctor</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Already have account */}
            <View className="items-center mt-12 mb-8 flex-row justify-center">
              <Text className="text-gray-600 text-lg">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => onNavigate('login')} activeOpacity={0.7}>
                <Text className="text-purple-600 font-black text-lg">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

export default function UserTypeSelectionPage() {
    const router = useRouter();

    const handleNavigate = (page: string) => {
        if (page === 'landing') {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }
        else if (page === 'login') router.push('/shared/login' as any);
    };

    const handleSelectUserType = (type: 'patient' | 'doctor') => {
        if (type === 'doctor') {
            router.push('/doctor/registration' as any);
        } else {
            router.push('/patient/signup' as any);
        }
    };

    return (
        <UserTypeSelection
            onNavigate={handleNavigate}
            onSelectUserType={handleSelectUserType}
        />
    );
}
