import * as api from '../../utils/api';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Calendar, CheckCircle, FileText, Upload, User } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { filterNameInput, filterPhoneInput, filterNumberInput, isValidEmail, validatePassword } from '../../utils/validation';
import Toast from '../../components/Toast';

type DoctorRegistrationProps = {
  onNavigate: (page: string) => void;
  onRegistrationComplete: () => void;
};

function DoctorRegistration({ onNavigate, onRegistrationComplete }: DoctorRegistrationProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

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
    cnicFront: null as DocumentPicker.DocumentPickerAsset | null,
    cnicBack: null as DocumentPicker.DocumentPickerAsset | null,
    certificate: null as DocumentPicker.DocumentPickerAsset | null,
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    let finalValue = value;
    if (typeof value === 'string') {
      if (field === 'fullName') finalValue = filterNameInput(value);
      else if (field === 'phone') finalValue = filterPhoneInput(value);
      else if (field === 'experience') {
          finalValue = filterNumberInput(value);
          if (finalValue && parseInt(finalValue, 10) > 50) finalValue = '50';
      }
      else if (field === 'consultationFee') {
          finalValue = filterNumberInput(value);
          if (finalValue && parseInt(finalValue, 10) > 20000) finalValue = '20000';
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: finalValue,
    }));
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
  };

  const handleFileUpload = async (type: 'license' | 'cnicFront' | 'cnicBack' | 'certificate') => {
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
        if (fieldErrors[type]) {
          setFieldErrors(prev => ({ ...prev, [type]: '' }));
        }
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
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!isValidEmail(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
      
      if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required';
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
      
      if (!formData.consultationFee.trim()) {
        newErrors.consultationFee = 'Consultation Fee is required';
      } else if (parseInt(formData.consultationFee, 10) < 100) {
        newErrors.consultationFee = 'Minimum fee is 100 PKR';
      }
      
      if (!formData.experience.trim()) {
        newErrors.experience = 'Experience is required';
      } else if (parseInt(formData.experience, 10) < 1) {
        newErrors.experience = 'Minimum experience is 1 year';
      }
      
      const pwdVal = validatePassword(password);
      if (!pwdVal.isValid) {
        newErrors.password = pwdVal.message;
      }
      
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirm Password is required.';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }

      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        return;
      }
    }

    if (step === 2) {
      if (!documents.license) newErrors.license = 'Medical License is required';
      if (!documents.cnicFront) newErrors.cnicFront = 'CNIC Front Side is required';
      if (!documents.cnicBack) newErrors.cnicBack = 'CNIC Back Side is required';
      
      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
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
        email: formData.email.trim(),
        password,
        name: formData.fullName.trim(),
        userType: 'doctor',
        phone: formData.phone.trim(),
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber.trim(),
        experience: formData.experience.trim(),
        hospital: formData.hospital.trim(),
        consultationFee: formData.consultationFee.trim(),
        availability: formData.availability,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      });

      showToast("Doctor account created successfully", "success");
      
      setTimeout(() => {
        setIsLoading(false);
        onRegistrationComplete();
      }, 1500);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      let errMsg = err.message || 'Registration failed. Please try again.';
      if (errMsg.toLowerCase().includes('duplicate') || errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('email')) {
        errMsg = "This email is already registered. Please use another email or login.";
      }
      setError(errMsg);
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
    <>
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
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
                    className="bg-purple-600 h-2 rounded-full"
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
                      <Text className="text-gray-700 mb-2 font-medium">Full Name <Text className="text-red-500">*</Text></Text>
                      <TextInput
                        value={formData.fullName}
                        onChangeText={(val) => handleInputChange('fullName', val)}
                        placeholder="Dr. Ayesha Khan"
                        className={`w-full px-4 py-3 border rounded-xl bg-white ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      {fieldErrors.fullName && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.fullName}</Text>}
                    </View>

                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <Text className="text-gray-700 mb-2 font-medium">Email Address <Text className="text-red-500">*</Text></Text>
                        <TextInput
                          value={formData.email}
                          onChangeText={(val) => handleInputChange('email', val)}
                          placeholder="doctor@example.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          className={`w-full px-4 py-3 border rounded-xl bg-white ${fieldErrors.email ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {fieldErrors.email && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.email}</Text>}
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-700 mb-2 font-medium">Phone Number <Text className="text-red-500">*</Text></Text>
                      <TextInput
                        value={formData.phone}
                        onChangeText={(val) => handleInputChange('phone', val)}
                        placeholder="+92 300 1234567"
                        keyboardType="phone-pad"
                        className={`w-full px-4 py-3 border rounded-xl bg-white ${fieldErrors.phone ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      {fieldErrors.phone && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.phone}</Text>}
                    </View>

                    <View>
                      <Text className="text-gray-700 mb-2 font-medium">Specialization <Text className="text-red-500">*</Text></Text>
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
                        <Text className="text-gray-700 mb-2 font-medium">Years of Experience <Text className="text-red-500">*</Text></Text>
                        <TextInput
                          value={formData.experience}
                          onChangeText={(val) => handleInputChange('experience', val)}
                          placeholder="10"
                          keyboardType="numeric"
                          className={`w-full px-4 py-3 border rounded-xl bg-white ${fieldErrors.experience ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {fieldErrors.experience && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.experience}</Text>}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-700 mb-2 font-medium">License Number <Text className="text-red-500">*</Text></Text>
                        <TextInput
                          value={formData.licenseNumber}
                          onChangeText={(val) => handleInputChange('licenseNumber', val)}
                          placeholder="PMC-12345"
                          className={`w-full px-4 py-3 border rounded-xl bg-white ${fieldErrors.licenseNumber ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {fieldErrors.licenseNumber && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.licenseNumber}</Text>}
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
                      <Text className="text-gray-700 mb-2 font-medium">Consultation Fee (PKR) <Text className="text-red-500">*</Text></Text>
                      <TextInput
                        value={formData.consultationFee}
                        onChangeText={(val) => handleInputChange('consultationFee', val)}
                        placeholder="2500"
                        keyboardType="numeric"
                        className={`w-full px-4 py-3 border rounded-xl bg-white ${fieldErrors.consultationFee ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      {fieldErrors.consultationFee && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.consultationFee}</Text>}
                    </View>

                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <Text className="text-gray-700 mb-2 font-medium">Password <Text className="text-red-500">*</Text></Text>
                        <TextInput
                          secureTextEntry
                          value={password}
                          onChangeText={handlePasswordChange}
                          placeholder="Min. 6 chars"
                          className={`w-full px-4 py-3 border rounded-xl bg-white ${fieldErrors.password ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {fieldErrors.password && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password}</Text>}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-700 mb-2 font-medium">Confirm Password <Text className="text-red-500">*</Text></Text>
                        <TextInput
                          secureTextEntry
                          value={confirmPassword}
                          onChangeText={handleConfirmPasswordChange}
                          placeholder="Re-enter password"
                          className={`w-full px-4 py-3 border rounded-xl bg-white ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {fieldErrors.confirmPassword && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.confirmPassword}</Text>}
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
                      className={`p-6 border border-dashed rounded-xl bg-white items-center flex-row gap-4 ${fieldErrors.license ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                        {documents.license ? (
                          <CheckCircle size={24} color="#16a34a" />
                        ) : (
                          <Upload size={24} color="#9333ea" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 mb-1 font-medium">Medical License <Text className="text-red-500">*</Text></Text>
                        <Text className="text-gray-600">
                          {documents.license ? documents.license.name : 'Upload your PMC license (PDF, JPG, PNG)'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {fieldErrors.license && <Text className="text-red-500 text-xs ml-1">{fieldErrors.license}</Text>}

                    {/* CNIC Front */}
                    <TouchableOpacity
                      onPress={() => handleFileUpload('cnicFront')}
                      className={`p-6 border border-dashed rounded-xl bg-white items-center flex-row gap-4 ${fieldErrors.cnicFront ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                        {documents.cnicFront ? (
                          <CheckCircle size={24} color="#16a34a" />
                        ) : (
                          <Upload size={24} color="#9333ea" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 mb-1 font-medium">CNIC Front Side <Text className="text-red-500">*</Text></Text>
                        <Text className="text-gray-600">
                          {documents.cnicFront ? documents.cnicFront.name : 'Upload front side of your CNIC (PDF, JPG, PNG)'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {fieldErrors.cnicFront && <Text className="text-red-500 text-xs ml-1">{fieldErrors.cnicFront}</Text>}

                    {/* CNIC Back */}
                    <TouchableOpacity
                      onPress={() => handleFileUpload('cnicBack')}
                      className={`p-6 border border-dashed rounded-xl bg-white items-center flex-row gap-4 ${fieldErrors.cnicBack ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                        {documents.cnicBack ? (
                          <CheckCircle size={24} color="#16a34a" />
                        ) : (
                          <Upload size={24} color="#9333ea" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 mb-1 font-medium">CNIC Back Side <Text className="text-red-500">*</Text></Text>
                        <Text className="text-gray-600">
                          {documents.cnicBack ? documents.cnicBack.name : 'Upload back side of your CNIC (PDF, JPG, PNG)'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {fieldErrors.cnicBack && <Text className="text-red-500 text-xs ml-1">{fieldErrors.cnicBack}</Text>}

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
                  className={`flex-1 px-6 py-4 rounded-full items-center justify-center shadow-lg flex-row gap-2 ${isLoading ? 'bg-purple-300' : 'bg-purple-600 shadow-purple-100'}`}
                >
                  {isLoading ? (
                    <>
                      <ActivityIndicator color="white" size="small" />
                      <Text className="text-white font-bold ml-2">Creating account...</Text>
                    </>
                  ) : (
                    <Text className="text-white font-bold">{step === 3 ? 'Complete Registration' : 'Next Step'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </>
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
