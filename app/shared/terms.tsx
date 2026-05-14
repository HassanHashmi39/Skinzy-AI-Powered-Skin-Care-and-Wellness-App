import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function TermsAndConditions() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black text-gray-900 mb-6">Terms & Conditions</Text>
        <Text className="text-gray-500 mb-4">Last Updated: May 2025</Text>
        
        <Text className="text-lg font-bold text-gray-900 mb-2">1. Acceptance of Terms</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          By accessing or using the Skinzy app, you agree to be bound by these Terms and Conditions and our Privacy Policy.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">2. Medical Disclaimer</Text>
        <Text className="text-gray-600 mb-6 leading-6 font-bold">
          IMPORTANT: Skinzy is an AI-powered assistant intended for educational and informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">3. User Responsibilities</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to provide accurate and complete information when using the app.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">4. Prohibited Uses</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          You may not use the app for any illegal or unauthorized purpose, or to upload any content that is harmful, offensive, or violates the rights of others.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">5. Appointment and Consultations</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          Skinzy facilitates connections between patients and dermatologists. We do not guarantee the availability of any specific doctor at any given time. Users are responsible for all fees associated with consultations and agree to provide accurate medical history.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">6. Intellectual Property</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          The app and its original content, features, and functionality are and will remain the exclusive property of Skinzy and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Skinzy.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">7. Termination</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          We may terminate or suspend your account and bar access to the app immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">8. Governing Law</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          These Terms shall be governed and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">9. Limitation of Liability</Text>
        <Text className="text-gray-600 mb-10 leading-6">
          To the maximum extent permitted by law, Skinzy and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the application.
        </Text>
        
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
