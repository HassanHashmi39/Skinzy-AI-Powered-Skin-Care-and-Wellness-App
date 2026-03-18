import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Sparkles, ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { 
    ActivityIndicator, 
    Alert, 
    KeyboardAvoidingView, 
    Platform, 
    SafeAreaView, 
    ScrollView, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';
import * as api from '../../utils/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.signIn(email, password);
            
            if (response && response.token) {
                // Determine redirect based on user type from response
                const type = response.user?.userType || userType;
                if (type === 'doctor') {
                    router.replace('/doctor/dashboard' as any);
                } else {
                    router.replace('/patient/dashboard' as any);
                }
            } else {
                Alert.alert('Login Failed', response?.message || 'Invalid credentials');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert('Login Error', error.message || 'Failed to connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    <View className="px-6 py-8">
                        {/* Back Button */}
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mb-8"
                        >
                            <ArrowLeft size={20} color="#4B5563" />
                        </TouchableOpacity>

                        {/* Logo & Header */}
                        <View className="items-center mb-10">
                            <View className="w-16 h-16 bg-purple-600 rounded-3xl items-center justify-center mb-4 shadow-xl shadow-purple-200">
                                <Sparkles size={32} color="white" />
                            </View>
                            <Text className="text-3xl font-black text-gray-900 mb-2 text-center">Welcome Back</Text>
                            <Text className="text-gray-500 text-center">Sign in to continue your skincare journey</Text>
                        </View>

                        {/* User Type Selector */}
                        <View className="flex-row bg-gray-100 p-1 rounded-2xl mb-8">
                            <TouchableOpacity 
                                onPress={() => setUserType('patient')}
                                className={`flex-1 py-3 rounded-xl items-center ${userType === 'patient' ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Text className={`font-bold ${userType === 'patient' ? 'text-purple-600' : 'text-gray-500'}`}>Patient</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setUserType('doctor')}
                                className={`flex-1 py-3 rounded-xl items-center ${userType === 'doctor' ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Text className={`font-bold ${userType === 'doctor' ? 'text-blue-600' : 'text-gray-500'}`}>Doctor</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View className="gap-5">
                            <View>
                                <Text className="text-gray-700 font-bold mb-2 ml-1">Email Address</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                                    <Mail size={20} color="#9CA3AF" />
                                    <TextInput 
                                        className="flex-1 ml-3 text-gray-900 font-medium"
                                        placeholder="ayesha@example.com"
                                        placeholderTextColor="#9CA3AF"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-gray-700 font-bold mb-2 ml-1">Password</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                                    <Lock size={20} color="#9CA3AF" />
                                    <TextInput 
                                        className="flex-1 ml-3 text-gray-900 font-medium"
                                        placeholder="••••••••"
                                        placeholderTextColor="#9CA3AF"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity className="self-end mt-2">
                                    <Text className="text-purple-600 font-bold text-sm">Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity 
                                onPress={handleLogin}
                                disabled={isLoading}
                                className={`py-4 rounded-2xl items-center justify-center shadow-lg shadow-purple-200 mt-4 ${userType === 'patient' ? 'bg-purple-600' : 'bg-blue-600'}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black text-lg">Sign In</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View className="flex-row justify-center mt-10 mb-6">
                            <Text className="text-gray-500 font-medium">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/shared/user-type-selection')}>
                                <Text className="text-purple-600 font-bold">Register Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
