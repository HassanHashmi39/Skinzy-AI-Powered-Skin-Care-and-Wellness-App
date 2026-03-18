import { Alert, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

function PatientMedicalForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Female',
    bloodType: '',
    weight: '',
    height: '',
    isPregnantOrNursing: 'No',

    // Medical History
    familyHistory: '',
    chronicDiseases: '',
    allergies: '',
    currentMedications: '',

    // Skin Condition
    skinType: 'Combination',
    mainConcerns: [] as string[],
    previousTreatments: '',
    skinSensitivity: 'Moderate',

    // Lifestyle
    dailySunExposure: 'Moderate',
    waterIntake: '6-8 glasses',
    sleepHours: '7-8 hours',
    stressLevel: 'Moderate',
    exercise: 'Sometimes',

    // Skincare Routine
    currentProducts: '',
    productAllergies: '',
    preferredBrands: '',
    budget: 'Moderate (PKR 2000-5000)',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleConcernToggle = (concern: string) => {
    const concerns = formData.mainConcerns.includes(concern)
      ? formData.mainConcerns.filter(c => c !== concern)
      : [...formData.mainConcerns, concern];
    handleInputChange('mainConcerns', concerns);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.age || !formData.gender) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Save form data into device memory securely
    AsyncStorage.setItem('patientMedicalHistory', JSON.stringify(formData)).then(() => {
        Alert.alert('Success', 'Medical history securely saved! The AI will now use this profile.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
    }).catch(err => {
        Alert.alert('Error', 'Failed to save medical history on-device.');
    });
  };

  const concerns = [
    'Acne', 'Pigmentation', 'Dark Spots', 'Dryness',
    'Oiliness', 'Dark Circles', 'Wrinkles', 'Sensitivity',
    'Pores', 'Redness', 'Dullness', 'Milia', 'Dermatitis'
  ];

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-xl font-bold mb-4 text-gray-900 mt-2">{title}</Text>
  );

  const Label = ({ text }: { text: string }) => (
    <Text className="text-gray-700 mb-2 font-medium">{text}</Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white border-b border-gray-100 p-4 flex-row items-center gap-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft color="#4B5563" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">Medical History Form</Text>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <Text className="text-gray-600 mb-6">
            Please provide accurate information to help dermatologists give you the best treatment.
          </Text>

          {/* Info Alert */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200 flex-row gap-3">
            <AlertCircle color="#2563EB" size={20} className="mt-0.5" />
            <View className="flex-1">
              <Text className="text-blue-900 font-bold mb-1">Your Privacy Matters</Text>
              <Text className="text-blue-800">
                This information is confidential and will only be shared with your appointed dermatologist.
              </Text>
            </View>
          </View>

          {/* Basic Information */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
            <SectionHeader title="Basic Information" />
            <View className="space-y-4">
              <View>
                <Label text="Age *" />
                <TextInput
                  value={formData.age}
                  onChangeText={(text) => handleInputChange('age', text)}
                  placeholder="25"
                  keyboardType="numeric"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                />
              </View>
              <View>
                <Label text="Gender *" />
                <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker
                    selectedValue={formData.gender}
                    onValueChange={(itemValue) => handleInputChange('gender', itemValue)}
                  >
                    <Picker.Item label="Female" value="Female" />
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Other" value="Other" />
                  </Picker>
                </View>
              </View>
              <View>
                <Label text="Blood Type" />
                <TextInput
                  value={formData.bloodType}
                  onChangeText={(text) => handleInputChange('bloodType', text)}
                  placeholder="A+"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                />
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Label text="Weight (kg)" />
                  <TextInput
                    value={formData.weight}
                    onChangeText={(text) => handleInputChange('weight', text)}
                    placeholder="60"
                    keyboardType="numeric"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                  />
                </View>
                <View className="flex-1">
                  <Label text="Height (cm)" />
                  <TextInput
                    value={formData.height}
                    onChangeText={(text) => handleInputChange('height', text)}
                    placeholder="170"
                    keyboardType="numeric"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Medical History */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
            <SectionHeader title="Medical History" />
            <View className="space-y-4">
              <View>
                <Label text="Family Medical History" />
                <TextInput
                  value={formData.familyHistory}
                  onChangeText={(text) => handleInputChange('familyHistory', text)}
                  placeholder="Any skin conditions...?"
                  multiline
                  numberOfLines={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 h-24 text-top"
                />
              </View>
              <View>
                <Label text="Chronic Diseases" />
                <TextInput
                  value={formData.chronicDiseases}
                  onChangeText={(text) => handleInputChange('chronicDiseases', text)}
                  placeholder="Diabetes, thyroid, etc..."
                  multiline
                  numberOfLines={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 h-24 text-top"
                />
              </View>
              <View>
                <Label text="Allergies" />
                <TextInput
                  value={formData.allergies}
                  onChangeText={(text) => handleInputChange('allergies', text)}
                  placeholder="Food, drug allergies..."
                  multiline
                  numberOfLines={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 h-24 text-top"
                />
              </View>
              <View>
                <Label text="Current Medications" />
                <TextInput
                  value={formData.currentMedications}
                  onChangeText={(text) => handleInputChange('currentMedications', text)}
                  placeholder="List current medications..."
                  multiline
                  numberOfLines={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 h-24 text-top"
                />
              </View>
            </View>
          </View>

          {/* Skin Condition */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
            <SectionHeader title="Skin Condition" />
            <View className="space-y-4">
              <View>
                <Label text="Skin Type" />
                <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker
                    selectedValue={formData.skinType}
                    onValueChange={(itemValue) => handleInputChange('skinType', itemValue)}
                  >
                    <Picker.Item label="Oily" value="Oily" />
                    <Picker.Item label="Dry" value="Dry" />
                    <Picker.Item label="Combination" value="Combination" />
                    <Picker.Item label="Normal" value="Normal" />
                    <Picker.Item label="Sensitive" value="Sensitive" />
                  </Picker>
                </View>
              </View>

              <View>
                <Label text="Main Skin Concerns" />
                <View className="flex-row flex-wrap gap-2">
                  {concerns.map((concern) => (
                    <TouchableOpacity
                      key={concern}
                      onPress={() => handleConcernToggle(concern)}
                      className={`px-4 py-2 rounded-xl border ${formData.mainConcerns.includes(concern)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white'
                        }`}
                    >
                      <Text className={
                        formData.mainConcerns.includes(concern)
                          ? 'text-purple-700 font-medium'
                          : 'text-gray-700'
                      }>
                        {concern}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Label text="Previous Treatments" />
                <TextInput
                  value={formData.previousTreatments}
                  onChangeText={(text) => handleInputChange('previousTreatments', text)}
                  placeholder="Treatments tried..."
                  multiline
                  numberOfLines={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 h-24 text-top"
                />
              </View>

              <View>
                <Label text="Skin Sensitivity Level" />
                <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker
                    selectedValue={formData.skinSensitivity}
                    onValueChange={(itemValue) => handleInputChange('skinSensitivity', itemValue)}
                  >
                    <Picker.Item label="Low" value="Low" />
                    <Picker.Item label="Moderate" value="Moderate" />
                    <Picker.Item label="High" value="High" />
                    <Picker.Item label="Very High" value="Very High" />
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          {/* Lifestyle */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
            <SectionHeader title="Lifestyle Factors" />
            <View className="space-y-4">
              <View>
                <Label text="Daily Sun Exposure" />
                <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker
                    selectedValue={formData.dailySunExposure}
                    onValueChange={(itemValue) => handleInputChange('dailySunExposure', itemValue)}
                  >
                    <Picker.Item label="Minimal (Mostly indoors)" value="Minimal" />
                    <Picker.Item label="Moderate (1-2 hours)" value="Moderate" />
                    <Picker.Item label="High (3+ hours)" value="High" />
                  </Picker>
                </View>
              </View>
              <View>
                <Label text="Daily Water Intake" />
                <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker
                    selectedValue={formData.waterIntake}
                    onValueChange={(itemValue) => handleInputChange('waterIntake', itemValue)}
                  >
                    <Picker.Item label="Less than 4 glasses" value="Less than 4 glasses" />
                    <Picker.Item label="4-6 glasses" value="4-6 glasses" />
                    <Picker.Item label="6-8 glasses" value="6-8 glasses" />
                    <Picker.Item label="More than 8 glasses" value="More than 8 glasses" />
                  </Picker>
                </View>
              </View>
              <View>
                <Label text="Average Sleep (Hours)" />
                <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker
                    selectedValue={formData.sleepHours}
                    onValueChange={(itemValue) => handleInputChange('sleepHours', itemValue)}
                  >
                    <Picker.Item label="Less than 6 hours" value="Less than 6 hours" />
                    <Picker.Item label="6-8 hours" value="6-8 hours" />
                    <Picker.Item label="More than 8 hours" value="More than 8 hours" />
                  </Picker>
                </View>
              </View>
              <View>
                <Label text="Stress Level" />
                <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker
                    selectedValue={formData.stressLevel}
                    onValueChange={(itemValue) => handleInputChange('stressLevel', itemValue)}
                  >
                    <Picker.Item label="Low" value="Low" />
                    <Picker.Item label="Moderate" value="Moderate" />
                    <Picker.Item label="High" value="High" />
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          {/* Current Skincare Routine */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
            <SectionHeader title="Your Beauty Routine" />
            <View className="space-y-4">
              <View>
                <Label text="Current Products Used" />
                <TextInput
                  value={formData.currentProducts}
                  onChangeText={(text) => handleInputChange('currentProducts', text)}
                  placeholder="Face wash, serum..."
                  multiline
                  numberOfLines={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 h-20 text-top"
                />
              </View>
              <View>
                <Label text="Known Product Allergies" />
                <TextInput
                  value={formData.productAllergies}
                  onChangeText={(text) => handleInputChange('productAllergies', text)}
                  placeholder="e.g. Salicylic acid irritation"
                  multiline
                  numberOfLines={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 h-20 text-top"
                />
              </View>
              <View>
                <Label text="Budget for Recommendations" />
                <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker
                    selectedValue={formData.budget}
                    onValueChange={(itemValue) => handleInputChange('budget', itemValue)}
                  >
                    <Picker.Item label="Budget (Under PKR 2000)" value="Budget" />
                    <Picker.Item label="Mid-Range (PKR 2000-5000)" value="Mid-Range" />
                    <Picker.Item label="Premium (PKR 5000+)" value="Premium" />
                  </Picker>
                </View>
              </View>

              {/* Crucial Medical Check for Females */}
              {formData.gender === 'Female' && (
                <View className="mt-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <Label text="Are you pregnant or nursing?" />
                  <Text className="text-gray-500 text-xs mb-2">Crucial for safe product recommendations (eg. no Retinols)</Text>
                  <View className="border border-purple-200 rounded-xl bg-white overflow-hidden">
                   <Picker
                     selectedValue={formData.isPregnantOrNursing}
                     onValueChange={(val) => handleInputChange('isPregnantOrNursing', val)}
                   >
                     <Picker.Item label="No" value="No" />
                     <Picker.Item label="Yes" value="Yes" />
                   </Picker>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-4 mb-10">
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 flex-row items-center justify-center gap-2 px-6 py-4 bg-purple-600 rounded-xl"
            >
              <Save color="white" size={20} />
              <Text className="text-white font-bold text-lg">Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              className="px-6 py-4 border border-gray-300 rounded-xl bg-white"
            >
              <Text className="text-gray-700 font-medium text-lg">Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default function MedicalFormPage() {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <PatientMedicalForm />
        </View>
    );
}
