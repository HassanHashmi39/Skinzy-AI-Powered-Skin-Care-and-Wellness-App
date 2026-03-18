import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, LogOut, Mail, Settings, Shield, User, MapPin, Calendar, Smartphone, Save, Activity, Trash2, Heart, ShieldAlert, Thermometer, UserSquare2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { 
    ActivityIndicator, 
    Alert, 
    Image, 
    SafeAreaView, 
    ScrollView, 
    Text, 
    TouchableOpacity, 
    View 
} from 'react-native';
import * as api from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native';

export default function UserProfile() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        age: '',
        gender: '',
        skinType: '',
        mainConcerns: '',
        allergies: '',
        chronicConditions: '',
        currentMedications: '',
    });
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await api.getCurrentUser();
            if (response && response.user) {
                setUserData(response.user);
                setFormData({
                    name: response.user.name || '',
                    email: response.user.email || '',
                    phone: response.user.phone || '',
                    city: response.user.city || '',
                    age: response.user.age?.toString() || '',
                    gender: response.user.gender || '',
                    skinType: response.user.skinType || '',
                    mainConcerns: Array.isArray(response.user.mainConcerns) ? response.user.mainConcerns.join(', ') : (response.user.mainConcerns || ''),
                    allergies: response.user.allergies || '',
                    chronicConditions: response.user.chronicConditions || '',
                    currentMedications: response.user.currentMedications || '',
                });
                setProfileImage(response.user.profileImage || null);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Profile fetch error:', error);
            setIsLoading(false);
        }
    };

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

    const handleUpdateProfile = async () => {
        try {
            setIsUpdating(true);
            const updates = {
                ...formData,
                age: formData.age ? parseInt(formData.age) : undefined,
                mainConcerns: formData.mainConcerns.split(',').map(s => s.trim()).filter(s => s.length > 0),
                profileImage,
            };
            const response = await api.updateProfile('me', updates);
            if (response && response.user) {
                setUserData(response.user);
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully!');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        console.log('🔘 handleLogout triggered');
        
        const performLogout = async () => {
            console.log('🔄 performLogout: Starting...');
            try {
                await api.logout();
                console.log('✅ performLogout: api.logout success');
                console.log('🚀 performLogout: Navigating to /');
                router.replace('/');
            } catch (err) {
                console.error('❌ performLogout: Error encountered:', err);
                console.log('🔄 performLogout: Attempting fallback token removal');
                await AsyncStorage.removeItem('sessionToken');
                router.replace('/');
            }
        };

        // Simplified for debugging - direct logout
        // The user can add confirmation back once we confirm navigation works
        await performLogout();
    };

    if (isLoading && !userData) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#9333EA" />
            </SafeAreaView>
        );
    }

    const isPatient = userData?.userType === 'patient';

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Header Block */}
                <View className="bg-purple-600 pt-8 pb-20 px-6 rounded-b-[50px]">
                    <View className="flex-row justify-between items-center mb-8">
                        <TouchableOpacity 
                            onPress={() => isEditing ? setIsEditing(false) : router.replace(isPatient ? '/patient/dashboard' : '/doctor/dashboard' as any)}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        >
                            <ArrowLeft size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">{isEditing ? 'Edit Profile' : 'My Profile'}</Text>
                        <TouchableOpacity 
                            onPress={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                isEditing ? <Save size={20} color="white" /> : <Settings size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="items-center">
                        <View className="relative">
                            <View className="w-32 h-32 bg-white rounded-full p-1 shadow-2xl">
                                <View className="w-full h-full bg-purple-100 rounded-full items-center justify-center overflow-hidden">
                                    {profileImage ? (
                                        <Image source={{ uri: profileImage }} className="w-full h-full" />
                                    ) : (
                                        <User size={60} color="#9333EA" />
                                    )}
                                </View>
                            </View>
                            {isEditing && (
                                <TouchableOpacity 
                                    onPress={pickImage}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg"
                                >
                                    <Camera size={20} color="#9333EA" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text className="text-white text-2xl font-black mt-4">{userData?.name || 'User'}</Text>
                        <View className="bg-white/20 px-4 py-1 rounded-full mt-2 border border-white/30">
                            <Text className="text-white font-bold text-xs uppercase tracking-widest">{userData?.userType || 'Patient'}</Text>
                        </View>
                    </View>
                </View>

                {/* Info Cards */}
                <View className="px-6 -mt-10">
                    <View className="bg-white rounded-[32px] p-6 shadow-sm border border-purple-50">
                        <Text className="text-gray-900 font-black text-lg mb-6">Personal Details</Text>
                        
                        {isEditing ? (
                            <View className="gap-4">
                                <EditField label="Name" icon={<User size={16} color="#9333EA" />} value={formData.name} onChange={(val) => setFormData({...formData, name: val})} />
                                <EditField label="Email" icon={<Mail size={16} color="#9333EA" />} value={formData.email} onChange={(val) => setFormData({...formData, email: val})} keyboardType="email-address" />
                                <EditField label="Phone" icon={<Smartphone size={16} color="#9333EA" />} value={formData.phone} onChange={(val) => setFormData({...formData, phone: val})} keyboardType="phone-pad" />
                                <EditField label="Location" icon={<MapPin size={16} color="#9333EA" />} value={formData.city} onChange={(val) => setFormData({...formData, city: val})} />
                                
                                {isPatient && (
                                    <>
                                        <View className="flex-row gap-4">
                                            <View className="flex-1">
                                                <EditField label="Age" icon={<Calendar size={16} color="#9333EA" />} value={formData.age} onChange={(val) => setFormData({...formData, age: val})} keyboardType="numeric" />
                                            </View>
                                            <View className="flex-1">
                                                <EditField label="Gender" icon={<UserSquare2 size={16} color="#9333EA" />} value={formData.gender} onChange={(val) => setFormData({...formData, gender: val})} />
                                            </View>
                                        </View>
                                        
                                        <Text className="text-gray-900 font-black text-lg mt-4 mb-2">Medical History</Text>
                                        <EditField label="Skin Type" icon={<Activity size={16} color="#9333EA" />} value={formData.skinType} onChange={(val) => setFormData({...formData, skinType: val})} placeholder="e.g. Oily, Dry, Combination" />
                                        <EditField label="Main Concerns" icon={<Thermometer size={16} color="#9333EA" />} value={formData.mainConcerns} onChange={(val) => setFormData({...formData, mainConcerns: val})} placeholder="e.g. Acne, Pigmentation (comma separated)" />
                                        <EditField label="Allergies" icon={<Heart size={16} color="#9333EA" />} value={formData.allergies} onChange={(val) => setFormData({...formData, allergies: val})} placeholder="e.g. Penicillin, Pollen" />
                                        <EditField label="Chronic Conditions" icon={<ShieldAlert size={16} color="#9333EA" />} value={formData.chronicConditions} onChange={(val) => setFormData({...formData, chronicConditions: val})} placeholder="e.g. Diabetes, Hypertension" />
                                        <EditField label="Current Medications" icon={<Shield size={16} color="#9333EA" />} value={formData.currentMedications} onChange={(val) => setFormData({...formData, currentMedications: val})} placeholder="e.g. Aspirin, Vitamin C" />
                                    </>
                                )}

                                <TouchableOpacity 
                                    onPress={handleUpdateProfile}
                                    disabled={isUpdating}
                                    className="bg-purple-600 p-3 rounded-2xl flex-row items-center justify-center gap-2 mt-4 shadow-lg shadow-purple-200"
                                >
                                    {isUpdating ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Save size={20} color="white" />
                                            <Text className="text-white font-black text-lg">Save All Changes</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    onPress={() => setIsEditing(false)}
                                    className="bg-gray-100 p-4 rounded-2xl flex-row items-center justify-center mt-2"
                                >
                                    <Text className="text-gray-500 font-bold">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <InfoRow icon={<Mail size={20} color="#9333EA" />} label="Email" value={userData?.email || 'N/A'} />
                                <InfoRow icon={<Smartphone size={20} color="#9333EA" />} label="Phone" value={userData?.phone || 'Not provided'} />
                                <InfoRow icon={<MapPin size={20} color="#9333EA" />} label="Location" value={userData?.city || 'Pakistan'} />
                                <InfoRow icon={<Calendar size={20} color="#9333EA" />} label="Joined" value="March 2025" />
                            </>
                        )}
                    </View>

                    {/* Skin Profile (only for patients) */}
                    {isPatient && (
                        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-purple-50 mt-6">
                            <Text className="text-gray-900 font-black text-lg mb-6">Skin Profile</Text>
                            <View className="flex-row gap-4">
                                <View className="flex-1 bg-purple-50 p-4 rounded-2xl items-center border border-purple-100">
                                    <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Type</Text>
                                    <Text className="text-purple-900 font-black text-lg">{userData?.skinType || 'Unknown'}</Text>
                                </View>
                                <View className="flex-1 bg-blue-50 p-4 rounded-2xl items-center border border-blue-100">
                                    <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Score</Text>
                                    <Text className="text-blue-900 font-black text-lg">78%</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Account Settings */}
                    <View className="bg-white rounded-[32px] p-6 shadow-sm border border-purple-50 mt-6 mb-10">
                        <Text className="text-gray-900 font-black text-lg mb-6">Account</Text>
                        
                        <MenuOption icon={<Shield size={20} color="#4B5563" />} title="Privacy & Security" />
                        <TouchableOpacity 
                            onPress={handleLogout}
                            className="flex-row items-center justify-between py-4 border-b border-gray-50"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center">
                                    <LogOut size={20} color="#EF4444" />
                                </View>
                                <Text className="text-red-500 font-bold text-lg">Sign Out</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function EditField({ label, value, onChange, icon, placeholder, keyboardType = 'default' }: { label: string, value: string, onChange: (val: string) => void, icon?: any, placeholder?: string, keyboardType?: any }) {
    return (
        <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-1 ml-1">
                {icon}
                <Text className="text-gray-400 text-xs font-bold uppercase">{label}</Text>
            </View>
            <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 border border-purple-50 p-3 rounded-2xl text-gray-900 font-bold"
            />
        </View>
    );
}

function InfoRow({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <View className="flex-row items-center gap-4 mb-5 last:mb-0">
            <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center">
                {icon}
            </View>
            <View>
                <Text className="text-gray-400 text-sm">{label}</Text>
                <Text className="text-gray-900 font-bold">{value}</Text>
            </View>
        </View>
    );
}

function MenuOption({ icon, title }: { icon: any, title: string }) {
    return (
        <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-50">
            <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
                    {icon}
                </View>
                <Text className="text-gray-900 font-bold text-lg">{title}</Text>
            </View>
            <ArrowLeft size={20} color="#9CA3AF" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
    );
}
