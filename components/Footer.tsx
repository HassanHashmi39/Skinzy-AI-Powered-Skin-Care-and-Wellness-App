import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';

export default function Footer() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View className="bg-gray-50 border-t border-gray-100 px-6 py-12 w-full mt-10">
      <View className={`max-w-7xl mx-auto w-full ${isMobile ? 'flex-col gap-10' : 'flex-row justify-between gap-8'}`}>
        
        {/* Brand & Description */}
        <View className={`${isMobile ? 'w-full' : 'w-1/3'}`}>
          <TouchableOpacity 
            className="flex-row items-center gap-2 mb-4 transition-transform duration-300 hover:scale-105 self-start"
            onPress={() => router.push('/')}
          >
            <View className="w-8 h-8 bg-purple-600 rounded-xl items-center justify-center shadow-sm shadow-purple-200">
              <Sparkles size={16} color="white" />
            </View>
            <Text className="text-2xl font-black text-gray-900 tracking-tighter">SKINZY</Text>
          </TouchableOpacity>
          <Text className="text-gray-500 leading-6 mb-6">
            Skinzy is an AI-powered skincare assistant that helps users analyze skin concerns, track routines, connect with doctors, and get personalized recommendations.
          </Text>
        </View>

        {/* Quick Links */}
        <View className={`${isMobile ? 'w-full' : 'w-1/4'}`}>
          <Text className="text-lg font-bold text-gray-900 mb-4">Quick Links</Text>
          <View className="gap-3">
            <TouchableOpacity onPress={() => router.push('/')}><Text className="text-gray-600 transition-colors duration-300 hover:text-purple-600 hover:underline">Home</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/patient/skin-analysis')}><Text className="text-gray-600 transition-colors duration-300 hover:text-purple-600 hover:underline">AI Skin Analysis</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/patient/dashboard')}><Text className="text-gray-500 text-sm transition-colors duration-300 hover:text-purple-600 hover:underline">Patient Dashboard</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/doctor/dashboard')}><Text className="text-gray-500 text-sm transition-colors duration-300 hover:text-purple-600 hover:underline">Doctor Dashboard</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/shared/contact')}><Text className="text-gray-500 text-sm transition-colors duration-300 hover:text-purple-600 hover:underline">Contact Us</Text></TouchableOpacity>
          </View>
        </View>

        {/* Services */}
        <View className={`${isMobile ? 'w-full' : 'w-1/4'}`}>
          <Text className="text-lg font-bold text-gray-900 mb-4">Services</Text>
          <View className="gap-3">
            <TouchableOpacity onPress={() => router.push('/patient/appointment-booking')}><Text className="text-gray-600 transition-colors duration-300 hover:text-purple-600 hover:underline">Appointments</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/patient/product-recommendations')}><Text className="text-gray-600 transition-colors duration-300 hover:text-purple-600 hover:underline">Product Recommendations</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/patient/routine-tracker')}><Text className="text-gray-600 transition-colors duration-300 hover:text-purple-600 hover:underline">Routine Tracker</Text></TouchableOpacity>
          </View>
        </View>

      </View>

      {/* Copyright & Bottom Links */}
      <View className="max-w-7xl mx-auto w-full mt-12 pt-6 border-t border-gray-200 flex-row flex-wrap justify-between items-center gap-4">
        <Text className="text-gray-400 text-sm">© {new Date().getFullYear()} Skinzy. All rights reserved.</Text>
        <View className="flex-row flex-wrap gap-6">
          <TouchableOpacity onPress={() => router.push('/shared/privacy-policy')}><Text className="text-gray-400 text-sm transition-colors duration-300 hover:text-purple-600 hover:underline">Privacy Policy</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/shared/terms')}><Text className="text-gray-400 text-sm transition-colors duration-300 hover:text-purple-600 hover:underline">Terms & Conditions</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/shared/contact')}><Text className="text-gray-400 text-sm transition-colors duration-300 hover:text-purple-600 hover:underline">Contact Support</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
