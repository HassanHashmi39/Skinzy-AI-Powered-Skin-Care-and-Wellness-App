import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Mail, Phone, MapPin, Send } from 'lucide-react-native';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Success', 'Your message has been sent. We will get back to you soon!');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black text-gray-900 mb-2">Contact Us</Text>
        <Text className="text-gray-500 mb-10 text-lg">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</Text>

        <View className="flex-row flex-wrap gap-4 mb-10">
            <ContactInfo icon={<Mail size={20} color="#9333EA" />} label="Email" value="support@skinzy.com" />
            <ContactInfo icon={<Phone size={20} color="#9333EA" />} label="Phone" value="+92 300 1234567" />
            <ContactInfo icon={<MapPin size={20} color="#9333EA" />} label="Location" value="Karachi, Pakistan" />
        </View>

        <View className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-6">Send Message</Text>
          
          <View className="gap-4">
            <View>
              <Text className="text-gray-600 font-bold mb-2 ml-2">Full Name *</Text>
              <TextInput 
                className="bg-white px-6 py-4 rounded-2xl border border-gray-100 text-gray-900 font-medium"
                placeholder="John Doe"
                value={form.name}
                onChangeText={(t) => setForm({...form, name: t})}
              />
            </View>

            <View>
              <Text className="text-gray-600 font-bold mb-2 ml-2">Email Address *</Text>
              <TextInput 
                className="bg-white px-6 py-4 rounded-2xl border border-gray-100 text-gray-900 font-medium"
                placeholder="john@example.com"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(t) => setForm({...form, email: t})}
              />
            </View>

            <View>
              <Text className="text-gray-600 font-bold mb-2 ml-2">Subject</Text>
              <TextInput 
                className="bg-white px-6 py-4 rounded-2xl border border-gray-100 text-gray-900 font-medium"
                placeholder="How can we help?"
                value={form.subject}
                onChangeText={(t) => setForm({...form, subject: t})}
              />
            </View>

            <View>
              <Text className="text-gray-600 font-bold mb-2 ml-2">Message *</Text>
              <TextInput 
                className="bg-white px-6 py-8 rounded-2xl border border-gray-100 text-gray-900 font-medium"
                placeholder="Write your message here..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={form.message}
                onChangeText={(t) => setForm({...form, message: t})}
              />
            </View>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="bg-purple-600 py-5 rounded-2xl flex-row items-center justify-center gap-3 mt-4 shadow-xl shadow-purple-100"
            >
              <Send size={20} color="white" />
              <Text className="text-white font-black text-lg">{isSubmitting ? 'Sending...' : 'Send Message'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

function ContactInfo({ icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <View className="bg-purple-50 px-5 py-4 rounded-2xl border border-purple-100 flex-1 min-w-[150px]">
            <View className="flex-row items-center gap-2 mb-1">
                {icon}
                <Text className="text-purple-800 font-bold text-xs uppercase">{label}</Text>
            </View>
            <Text className="text-gray-900 font-bold">{value}</Text>
        </View>
    );
}
