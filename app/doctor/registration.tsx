import * as api from '../../utils/api';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Calendar, CheckCircle, FileText, Upload, User } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

type DoctorRegistrationProps = {
  onNavigate: (page: string) => void;
  onRegistrationComplete: () => void;
};

function DoctorRegistration({ onNavigate, onRegistrationComplete }: DoctorRegistrationProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: 'Dermatologist',
    licenseNumber: '',
    experience: '',
    hospital: '',
    consultationFee: '',
    availability: [] as string[],
  });

  const [documents, setDocuments] = useState({
    license: null as DocumentPicker.DocumentPickerAsset | null,
    cnic: null as DocumentPicker.DocumentPickerAsset | null,
    certificate: null as DocumentPicker.DocumentPickerAsset | null,
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = async (type: 'license' | 'cnic' | 'certificate') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocuments(prev => ({
          ...prev,
          [type]: result.assets![0]
        }));
      }
    } catch (err) {
      console.error('File selection error', err);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleAvailabilityToggle = (day: string) => {
    if (formData.availability.includes(day)) {
      setFormData(prev => ({
        ...prev,
        availability: prev.availability.filter(d => d !== day),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        availability: [...prev.availability, day],
      }));
    }
  };

  const handleNext = () => {
    setError('');

    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.licenseNumber || !formData.consultationFee) {
        setError('Please fill in all required fields');
        return;
      }
      if (!password || !confirmPassword) {
        setError('Please enter and confirm your password');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    if (step === 2) {
      if (!documents.license || !documents.cnic) {
        setError('Please upload required documents');
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      if (formData.availability.length === 0) {
        setError('Please select at least one day of availability');
        return;
      }
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      await api.signUp({
        email: formData.email,
        password,
        name: formData.fullName,
        userType: 'doctor',
        phone: formData.phone,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        experience: formData.experience,
        hospital: formData.hospital,
        consultationFee: formData.consultationFee,
        availability: formData.availability,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      });

      setIsLoading(false);
      onRegistrationComplete();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onNavigate('landing');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" className="bg-white">
      <SafeAreaView className="flex-1">
        <View className="px-4 py-8">
          <View className="max-w-3xl mx-auto w-full">
            {/* Header */}
            <View className="mb-8">
              <TouchableOpacity
                onPress={handleBack}
                className="flex-row items-center gap-2 mb-4"
              >
                <ArrowLeft size={20} color="#4b5563" />
                <Text className="text-gray-600 font-medium">Back</Text>
              </TouchableOpacity>
              <Text className="text-2xl font-bold mb-2">Doctor Registration</Text>
              <Text className="text-gray-600">
                Join Skinzy as a verified dermatologist and help patients across Pakistan
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="mb-8">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Step {step} of 3</Text>
                <Text className="text-gray-600">{Math.round((step / 3) * 100)}% Complete</Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <View
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </View>
            </View>

            <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              {/* Step Header */}
              <View className="flex-row items-center gap-3 mb-6">
                <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                  {step === 1 ? <User size={24} color="#9333ea" /> :
                    step === 2 ? <FileText size={24} color="#9333ea" /> :
                      <Calendar size={24} color="#9333ea" />}
                </View>
                <View>
                  <Text className="text-xl font-bold">
                    {step === 1 ? 'Personal Information' :
                      step === 2 ? 'Upload Documents' : 'Set Your Availability'}
                  </Text>
                  <Text className="text-gray-600">
                    {step === 1 ? "Tell us about yourself" :
                      step === 2 ? "We need to verify your credentials" :
                        "Choose days when you're available for consultations"}
                  </Text>
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Text className="text-red-700">{error}</Text>
                </View>
              ) : null}

              {/* Step 1: Personal Information */}
              {step === 1 && (
                <View className="gap-4">
                  <View>
                    <Text className="text-gray-700 mb-2 font-medium">Full Name *</Text>
                    <TextInput
                      value={formData.fullName}
                      onChangeText={(val) => handleInputChange('fullName', val)}
                      placeholder="Dr. Ayesha Khan"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                    />
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-700 mb-2 font-medium">Email Address *</Text>
                      <TextInput
                        value={formData.email}
                        onChangeText={(val) => handleInputChange('email', val)}
                        placeholder="doctor@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-2 font-medium">Phone Number *</Text>
                    <TextInput
                      value={formData.phone}
                      onChangeText={(val) => handleInputChange('phone', val)}
                      placeholder="+92 300 1234567"
                      keyboardType="phone-pad"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-2 font-medium">Specialization *</Text>
                    <View className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                      <Picker
                        selectedValue={formData.specialization}
                        onValueChange={(val) => handleInputChange('specialization', val)}
                      >
                        <Picker.Item label="Dermatologist" value="Dermatologist" />
                        <Picker.Item label="Cosmetic Dermatologist" value="Cosmetic Dermatologist" />
                        <Picker.Item label="Pediatric Dermatologist" value="Pediatric Dermatologist" />
                      </Picker>
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-700 mb-2 font-medium">Years of Experience *</Text>
                      <TextInput
                        value={formData.experience}
                        onChangeText={(val) => handleInputChange('experience', val)}
                        placeholder="10"
                        keyboardType="numeric"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-700 mb-2 font-medium">License Number *</Text>
                      <TextInput
                        value={formData.licenseNumber}
                        onChangeText={(val) => handleInputChange('licenseNumber', val)}
                        placeholder="PMC-12345"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-2 font-medium">Hospital/Clinic Name</Text>
                    <TextInput
                      value={formData.hospital}
                      onChangeText={(val) => handleInputChange('hospital', val)}
                      placeholder="Aga Khan University Hospital"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-2 font-medium">Consultation Fee (PKR) *</Text>
                    <TextInput
                      value={formData.consultationFee}
                      onChangeText={(val) => handleInputChange('consultationFee', val)}
                      placeholder="2500"
                      keyboardType="numeric"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                    />
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-700 mb-2 font-medium">Password *</Text>
                      <TextInput
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Min. 6 chars"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-700 mb-2 font-medium">Confirm Password *</Text>
                      <TextInput
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Step 2: Document Upload */}
              {step === 2 && (
                <View className="gap-4">
                  {/* Medical License */}
                  <TouchableOpacity
                    onPress={() => handleFileUpload('license')}
                    className="p-6 border border-dashed border-gray-300 rounded-xl bg-white items-center flex-row gap-4"
                  >
                    <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                      {documents.license ? (
                        <CheckCircle size={24} color="#16a34a" />
                      ) : (
                        <Upload size={24} color="#9333ea" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 mb-1 font-medium">Medical License *</Text>
                      <Text className="text-gray-600">
                        {documents.license ? documents.license.name : 'Upload your PMC license (PDF, JPG, PNG)'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* CNIC */}
                  <TouchableOpacity
                    onPress={() => handleFileUpload('cnic')}
                    className="p-6 border border-dashed border-gray-300 rounded-xl bg-white items-center flex-row gap-4"
                  >
                    <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                      {documents.cnic ? (
                        <CheckCircle size={24} color="#16a34a" />
                      ) : (
                        <Upload size={24} color="#9333ea" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 mb-1 font-medium">CNIC (National ID) *</Text>
                      <Text className="text-gray-600">
                        {documents.cnic ? documents.cnic.name : 'Upload both sides of your CNIC (PDF, JPG, PNG)'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Educational Certificate */}
                  <TouchableOpacity
                    onPress={() => handleFileUpload('certificate')}
                    className="p-6 border border-dashed border-gray-300 rounded-xl bg-white items-center flex-row gap-4"
                  >
                    <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                      {documents.certificate ? (
                        <CheckCircle size={24} color="#16a34a" />
                      ) : (
                        <Upload size={24} color="#9333ea" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 mb-1 font-medium">Educational Certificate</Text>
                      <Text className="text-gray-600">
                        {documents.certificate ? documents.certificate.name : 'Upload your MBBS/medical degree (optional)'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View className="p-4 bg-blue-50 rounded-xl border border-blue-200 mt-2">
                    <Text className="text-blue-900 leading-5">
                      <Text className="font-bold">Note: </Text>
                      All documents will be verified by our team within 24-48 hours.
                      You'll receive an email once your account is approved.
                    </Text>
                  </View>
                </View>
              )}

              {/* Step 3: Availability */}
              {step === 3 && (
                <View className="gap-3 mb-6">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => handleAvailabilityToggle(day)}
                      className={`w-full p-4 rounded-xl border flex-row justify-between items-center ${formData.availability.includes(day)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white'
                        }`}
                    >
                      <Text className="text-gray-900 font-medium">{day}</Text>
                      {formData.availability.includes(day) && (
                        <CheckCircle size={20} color="#9333ea" />
                      )}
                    </TouchableOpacity>
                  ))}

                  <View className="p-4 bg-green-50 rounded-xl border border-green-200 mt-4">
                    <Text className="text-green-900 leading-5">
                      <Text className="font-bold">Ready to go! </Text>
                      You can update your detailed time slots later from your dashboard.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Navigation Buttons */}
            <View className="flex-row gap-4 mt-6">
              <TouchableOpacity
                onPress={handleBack}
                className="flex-1 px-6 py-4 border border-gray-300 rounded-full items-center"
              >
                <Text className="text-gray-700 font-medium">{step === 1 ? 'Cancel' : 'Previous'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNext}
                disabled={isLoading}
                className={`flex-1 px-6 py-4 rounded-full items-center ${isLoading ? 'bg-purple-300' : 'bg-purple-500'}`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">{step === 3 ? 'Complete Registration' : 'Next Step'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

export default function DoctorRegistrationPage() {
    const router = useRouter();

    const handleNavigate = (page: string) => {
        if (page === 'landing') router.dismiss ? router.dismiss() : router.back();
        else if (page === 'login') router.push('/shared/login');
    };

    const handleRegistrationComplete = () => {
        router.replace('/doctor/dashboard');
    };

    return (
        <DoctorRegistration
            onNavigate={handleNavigate}
            onRegistrationComplete={handleRegistrationComplete}
        />
    );
}
