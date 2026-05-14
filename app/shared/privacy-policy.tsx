import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function PrivacyPolicy() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black text-gray-900 mb-6">Privacy Policy</Text>
        <Text className="text-gray-500 mb-4">Last Updated: May 2025</Text>
        
        <Text className="text-lg font-bold text-gray-900 mb-2">1. Introduction</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          Welcome to Skinzy. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered skincare application.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">2. Information We Collect</Text>
        <Text className="text-gray-600 mb-4 leading-6">
          We collect information that you provide directly to us, including:
        </Text>
        <View className="mb-6 pl-4">
          <Text className="text-gray-600 mb-2">• Account Information: Name, email address, and password.</Text>
          <Text className="text-gray-600 mb-2">• Health Data: Skin analysis photos, medical history, and routine preferences.</Text>
          <Text className="text-gray-600">• Device Information: IP address, device type, and operating system.</Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-2">3. How We Use Your Information</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          Your data is used to provide AI skin analysis, personalize product recommendations, and facilitate communication with healthcare professionals. We do not sell your personal data to third parties.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">4. Data Sharing and Disclosure</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          We do not sell, trade, or rent your personal identification information to others. We may share your health data with healthcare professionals you explicitly choose to consult with through the platform. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners and advertisers.
        </Text>
        
        <Text className="text-lg font-bold text-gray-900 mb-2">5. Data Retention</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">6. Your Rights</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          You have the right to access, update, or delete the information we have on you. Whenever made possible, you can access, update or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">7. Data Security</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security. Your health data is encrypted both at rest and in transit.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-2">8. Contact Us</Text>
        <Text className="text-gray-600 mb-10 leading-6">
          If you have any questions about this Privacy Policy, please contact us at support@skinzy.com.
        </Text>
        
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
