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
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-8 h-8 bg-green-500 rounded-xl items-center justify-center shadow-sm shadow-green-200">
              <Sparkles size={16} color="white" />
            </View>
            <Text className="text-2xl font-black text-gray-900 tracking-tighter">SKINZY</Text>
          </View>
          <Text className="text-gray-500 leading-6 mb-6">
            Skinzy is an AI-powered skincare assistant that helps users analyze skin concerns, track routines, connect with doctors, and get personalized recommendations.
          </Text>
        </View>

        {/* Quick Links */}
        <View className={`${isMobile ? 'w-full' : 'w-1/4'}`}>
          <Text className="text-lg font-bold text-gray-900 mb-4">Quick Links</Text>
          <View className="gap-3">
            <TouchableOpacity onPress={() => router.push('/')}><Text className="text-gray-600 hover:text-green-600">Home</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/patient/skin-analysis')}><Text className="text-gray-600 hover:text-green-600">AI Skin Analysis</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/patient/dashboard')}><Text className="text-gray-600 hover:text-green-600">Patient Dashboard</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/doctor/dashboard')}><Text className="text-gray-600 hover:text-green-600">Doctor Dashboard</Text></TouchableOpacity>
          </View>
        </View>

        {/* Services */}
        <View className={`${isMobile ? 'w-full' : 'w-1/4'}`}>
          <Text className="text-lg font-bold text-gray-900 mb-4">Services</Text>
          <View className="gap-3">
            <TouchableOpacity onPress={() => router.push('/patient/appointment-booking')}><Text className="text-gray-600 hover:text-green-600">Appointments</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/patient/product-recommendations')}><Text className="text-gray-600 hover:text-green-600">Product Recommendations</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/patient/routine-tracker')}><Text className="text-gray-600 hover:text-green-600">Routine Tracker</Text></TouchableOpacity>
          </View>
        </View>

      </View>

      {/* Copyright & Bottom Links */}
      <View className="max-w-7xl mx-auto w-full mt-12 pt-6 border-t border-gray-200 flex-row flex-wrap justify-between items-center gap-4">
        <Text className="text-gray-400 text-sm">© {new Date().getFullYear()} Skinzy. All rights reserved.</Text>
        <View className="flex-row flex-wrap gap-6">
          <TouchableOpacity><Text className="text-gray-400 text-sm hover:text-green-600">Privacy Policy</Text></TouchableOpacity>
          <TouchableOpacity><Text className="text-gray-400 text-sm hover:text-green-600">Terms & Conditions</Text></TouchableOpacity>
          <TouchableOpacity><Text className="text-gray-400 text-sm hover:text-green-600">Contact Support</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
