import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as api from '../../utils/api';

type DoctorInfo = {
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  reviews: number;
  patients: number;
  consultationFee: string;
};

type DoctorSettingsProps = {
  doctorInfo: DoctorInfo;
  onBack: () => void;
  onLogout: () => void;
};

export function DoctorSettings({ doctorInfo, onBack, onLogout }: DoctorSettingsProps) {
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: doctorInfo.name,
    email: 'ayesha.khan@example.com',
    phone: '+92 300 1234567',
    specialization: doctorInfo.specialization,
    licenseNumber: 'PMC-67890',
    experience: doctorInfo.experience.toString(),
    hospital: 'Aga Khan University Hospital',
    consultationFee: doctorInfo.consultationFee.replace('PKR ', ''),
    bio: 'Experienced dermatologist specializing in acne treatment, pigmentation, and anti-aging solutions. Dedicated to helping patients achieve healthy, glowing skin.',
  });

  useEffect(() => {
    // If the doctorInfo has a profile image, use it
    // Note: doctorInfo doesn't have it currently in the prop type, let's fix that or fetch?
    // Actually, dashboard should pass it. Let's assume it's there or fetch it.
    const fetchFullData = async () => {
      try {
        const response = await api.getCurrentUser();
        if (response?.user?.profileImage) {
          setProfileImage(response.user.profileImage);
        }
        if (response?.user) {
          setFormData(prev => ({
            ...prev,
            fullName: response.user.name || prev.fullName,
            email: response.user.email || prev.email,
            phone: response.user.phone || prev.phone,
            hospital: response.user.hospital || prev.hospital,
            consultationFee: response.user.consultationFee || prev.consultationFee,
            bio: response.user.bio || prev.bio,
          }));
        }
      } catch (e) {
        console.error("Error fetching full doctor data:", e);
      }
    };
    fetchFullData();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const [availability, setAvailability] = useState([
    { day: 'Monday', from: '09:00', to: '17:00', enabled: true },
    { day: 'Tuesday', from: '09:00', to: '17:00', enabled: true },
    { day: 'Wednesday', from: '09:00', to: '17:00', enabled: true },
    { day: 'Thursday', from: '09:00', to: '17:00', enabled: true },
    { day: 'Friday', from: '09:00', to: '17:00', enabled: true },
    { day: 'Saturday', from: '10:00', to: '14:00', enabled: true },
    { day: 'Sunday', from: '10:00', to: '14:00', enabled: false },
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleAvailabilityToggle = (index: number) => {
    const updated = [...availability];
    updated[index].enabled = !updated[index].enabled;
    setAvailability(updated);
  };

  const handleTimeChange = (index: number, field: 'from' | 'to', value: string) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      const updates = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        hospital: formData.hospital,
        consultationFee: formData.consultationFee,
        bio: formData.bio,
        profileImage: profileImage,
      };

      await api.updateProfile("me", updates);

      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={onBack}
            className="flex-row items-center gap-2 mb-4"
          >
            <ArrowLeft size={20} color="#4b5563" />
            <Text className="text-gray-600 font-medium">Back to Dashboard</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold mb-2">Profile Settings</Text>
          <Text className="text-gray-600">Manage your profile information and availability</Text>
        </View>

        {/* Profile Photo */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold mb-4">Profile Photo</Text>
          <View className="flex-row items-center gap-6">
            <View className="w-24 h-24 bg-purple-200 rounded-full items-center justify-center relative overflow-hidden">
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="w-full h-full" />
              ) : (
                <Text className="text-4xl text-purple-700">{formData.fullName.charAt(0)}</Text>
              )}
              <TouchableOpacity
                onPress={pickImage}
                className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full items-center justify-center border-2 border-white"
              >
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 mb-1 font-medium">Update your profile photo</Text>
              <Text className="text-gray-500 text-xs">Recommended: Square image, at least 400x400px</Text>
            </View>
          </View>
        </View>

        {/* Ratings & Reviews */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold mb-4">Patient Ratings & Reviews</Text>

          {/* Overall Rating */}
          <View className="bg-purple-50 rounded-2xl p-6 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-4xl font-bold text-purple-900 mb-1">{doctorInfo.rating.toFixed(1)}</Text>
                <View className="flex-row items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} className="text-yellow-400 text-lg">
                      {star <= Math.round(doctorInfo.rating) ? '★' : '☆'}
                    </Text>
                  ))}
                </View>
                <Text className="text-purple-700 mt-1">{doctorInfo.reviews} total reviews</Text>
              </View>
              <View className="items-center">
                <View className="w-16 h-16 bg-purple-200 rounded-full items-center justify-center">
                  <Text className="text-2xl">⭐</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Reviews */}
          <Text className="text-gray-900 font-bold mb-3">Recent Patient Feedback</Text>
          <View className="gap-3">
            {[
              {
                id: '1',
                patientName: 'Sarah A.',
                rating: 5,
                date: '2 days ago',
                comment: 'Dr. Khan is excellent! Very professional and took time to explain my treatment plan thoroughly.',
              },
              {
                id: '2',
                patientName: 'Ahmed H.',
                rating: 4,
                date: '1 week ago',
                comment: 'Great experience. The doctor was very knowledgeable and the consultation was helpful.',
              },
              {
                id: '3',
                patientName: 'Fatima M.',
                rating: 5,
                date: '2 weeks ago',
                comment: 'Highly recommend! My skin has improved significantly after following the prescribed routine.',
              },
            ].map((review) => (
              <View key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-900 font-bold">{review.patientName}</Text>
                  <View className="flex-row items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text key={star} className="text-yellow-400">
                        {star <= review.rating ? '★' : '☆'}
                      </Text>
                    ))}
                  </View>
                </View>
                <Text className="text-gray-600 mb-2">{review.comment}</Text>
                <Text className="text-gray-500 text-xs">{review.date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Personal Information */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold mb-6">Personal Information</Text>
          <View className="gap-4">
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
              <TextInput
                value={formData.fullName}
                onChangeText={(text) => handleInputChange('fullName', text)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 font-medium">Email Address</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                  keyboardType="email-address"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 font-medium">Phone Number</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Bio</Text>
              <TextInput
                value={formData.bio}
                onChangeText={(text) => handleInputChange('bio', text)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white min-h-[100px]"
                multiline
                textAlignVertical="top"
                placeholder="Tell patients about yourself..."
              />
            </View>
          </View>
        </View>

        {/* Professional Information */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold mb-6">Professional Information</Text>
          <View className="bg-blue-50 p-3 rounded-lg mb-4">
            <Text className="text-blue-800 text-sm">
              ℹ️ Professional information cannot be edited as it was verified during registration. Contact support if you need to update these details.
            </Text>
          </View>

          <View className="gap-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 font-medium">Specialization</Text>
                <TextInput
                  value={formData.specialization}
                  editable={false}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 font-medium">License Number</Text>
                <TextInput
                  value={formData.licenseNumber}
                  editable={false}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 font-medium">Years of Experience</Text>
                <TextInput
                  value={formData.experience}
                  editable={false}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 mb-2 font-medium">Hospital/Clinic</Text>
                <TextInput
                  value={formData.hospital}
                  onChangeText={(text) => handleInputChange('hospital', text)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Consultation Fee (PKR)</Text>
              <TextInput
                value={formData.consultationFee}
                onChangeText={(text) => handleInputChange('consultationFee', text)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Availability Schedule */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold mb-6">Weekly Availability</Text>
          <View className="gap-3">
            {availability.map((schedule, index) => (
              <View
                key={schedule.day}
                className={`p-4 rounded-xl border-2 ${schedule.enabled
                  ? 'border-purple-200 bg-purple-50'
                  : 'border-gray-200 bg-gray-50'
                  }`}
              >
                <View className="flex-row items-center justify-between flex-wrap gap-4">
                  <View className="flex-row items-center gap-3 w-32">
                    <TouchableOpacity
                      onPress={() => handleAvailabilityToggle(index)}
                      className={`w-5 h-5 rounded border ${schedule.enabled ? 'bg-purple-600 border-purple-600' : 'border-gray-400 bg-white'
                        } items-center justify-center`}
                    >
                      {schedule.enabled && <Text className="text-white text-xs">✓</Text>}
                    </TouchableOpacity>
                    <Text className="text-gray-900 font-medium">{schedule.day}</Text>
                  </View>

                  {schedule.enabled ? (
                    <View className="flex-row items-center gap-3 flex-1 flex-wrap justify-end">
                      <TextInput
                        value={schedule.from}
                        onChangeText={(text) => handleTimeChange(index, 'from', text)}
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white min-w-[70px] text-center"
                        placeholder="09:00"
                      />
                      <Text className="text-gray-600">to</Text>
                      <TextInput
                        value={schedule.to}
                        onChangeText={(text) => handleTimeChange(index, 'to', text)}
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white min-w-[70px] text-center"
                        placeholder="17:00"
                      />
                    </View>
                  ) : (
                    <Text className="text-gray-500 font-medium flex-1">Not available</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            onPress={handleSaveChanges}
            disabled={isSaving}
            className={`flex-1 flex-row items-center justify-center gap-2 px-6 py-3 rounded-2xl ${isSaving ? 'bg-purple-400' : 'bg-purple-600'}`}
          >
            {isSaving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Save size={20} color="white" />
                <Text className="text-white font-bold">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onBack}
            className="px-6 py-3 border border-gray-300 rounded-2xl"
          >
            <Text className="text-gray-700 font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="bg-red-50 rounded-2xl p-6 border border-red-100 mb-6">
          <Text className="text-red-800 font-bold mb-3">Sign Out</Text>
          <TouchableOpacity
            onPress={() => {
                console.log('🔘 Doctor Settings Logout Clicked');
                onLogout();
            }}
            activeOpacity={0.8}
            className="w-full py-4 bg-red-600 rounded-2xl items-center shadow-lg shadow-red-100"
          >
            <Text className="text-white font-black text-lg">Logout from Account</Text>
          </TouchableOpacity>
        </View>

        {/* Save Success Message */}
        {showSaveSuccess && (
          <View className="bg-green-50 rounded-3xl p-6 border border-green-200 mb-6">
            <Text className="text-lg font-bold mb-2 text-green-900">Success</Text>
            <Text className="text-green-700">
              Profile settings saved successfully!
            </Text>
          </View>
        )}

        <View className="h-10" />
      </View>
    </ScrollView>
  );
}

export default function DoctorSettingsPage() {
  const router = useRouter();

  const doctorInfo = {
    name: 'Dr. Ayesha Khan',
    specialization: 'Dermatologist',
    experience: 8,
    rating: 4.8,
    reviews: 124,
    patients: 1500,
    consultationFee: 'PKR 3,000'
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <DoctorSettings
        doctorInfo={doctorInfo}
        onBack={() => router.back()}
        onLogout={async () => {
          await api.logout();
          router.replace('/shared/login');
        }}
      />
    </SafeAreaView>
  );
}
