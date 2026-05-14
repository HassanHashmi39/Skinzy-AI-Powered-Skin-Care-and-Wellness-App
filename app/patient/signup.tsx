import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Lock, MapPin, Phone, Sparkles, User, Mail } from "lucide-react-native";
import React, { useState } from "react";
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
    View,
    useWindowDimensions
} from "react-native";
import * as api from '../../utils/api';

export default function UserInfoScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isLargeScreen = width > 768;

    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({
        fullName: "",
        email: "",
        gender: "",
        age: "",
        phone: "",
        city: "",
        Password: "",
        ConfirmPassword: "",
    });

    const handleChange = (field: string, value: string) => {
        setUser({ ...user, [field]: value });
    };

    const handleSubmit = async () => {
        const { fullName, email, gender, age, phone, city, Password, ConfirmPassword } = user;

        if (!fullName || !email || !gender || !phone || !city || !Password || !ConfirmPassword) {
            Alert.alert("Missing Info", "Please fill all required fields to personalize your experience.");
            return;
        }

        if (Password !== ConfirmPassword) {
            Alert.alert("Password Mismatch", "Passwords do not match. Please try again.");
            return;
        }

        if (Password.length < 6) {
            Alert.alert("Security", "Password must be at least 6 characters long.");
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.signUp({
                email,
                password: Password,
                name: fullName,
                userType: 'patient',
                gender,
                age,
                phone,
                city
            });

            if (response && response.token) {
                router.push("/patient/healthinfo" as any);
            } else {
                Alert.alert("Signup Failed", response?.message || "Something went wrong. Please try again.");
            }
        } catch (error: any) {
            console.error("Signup error:", error);
            Alert.alert("Error", error.message || "Failed to connect to server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const commonCities = ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi"];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    className="bg-gray-50/30"
                >
                    <View className={`px-6 py-8 self-center w-full ${isLargeScreen ? 'max-w-4xl' : ''}`}>
                        {/* Header Section */}
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mb-6"
                        >
                            <ArrowLeft size={20} color="#9333EA" />
                        </TouchableOpacity>

                        <View className="mb-8">
                            <View className="flex-row items-center gap-2 mb-2">
                                <View className="w-8 h-8 bg-purple-600 rounded-lg items-center justify-center">
                                    <Sparkles size={18} color="white" />
                                </View>
                                <Text className="text-purple-600 font-bold tracking-widest uppercase text-xs">Step 1 of 2</Text>
                            </View>
                            <Text className="text-3xl font-black text-gray-900 mb-2">Complete Profile</Text>
                            <Text className="text-gray-500 text-base">Let's personalize your Skinzy experience for better results.</Text>
                        </View>

                        <View className={isLargeScreen ? "flex-row gap-8" : "gap-0"}>
                            {/* Personal Info Side */}
                            <View className={isLargeScreen ? "flex-1" : "w-full"}>
                                <View className="bg-white rounded-[32px] p-6 shadow-md border border-purple-50 mb-6">
                                    <View className="gap-6">
                                        {/* Full Name */}
                                        <View>
                                            <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Full Name</Text>
                                            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5">
                                                <User size={18} color="#9333EA" />
                                                <TextInput
                                                    className="flex-1 ml-3 text-gray-900 font-medium"
                                                    placeholder="Ayesha Ahmed"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={user.fullName}
                                                    onChangeText={(text) => handleChange("fullName", text)}
                                                />
                                            </View>
                                        </View>

                                        {/* Email */}
                                        <View>
                                            <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Email Address</Text>
                                            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5">
                                                <Mail size={18} color="#9333EA" />
                                                <TextInput
                                                    className="flex-1 ml-3 text-gray-900 font-medium"
                                                    placeholder="ayesha@example.com"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={user.email}
                                                    onChangeText={(text) => handleChange("email", text)}
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                />
                                            </View>
                                        </View>

                                        {/* Gender */}
                                        <View>
                                            <Text className="text-gray-700 font-bold mb-3 ml-1 text-sm">Gender</Text>
                                            <View className="flex-row gap-2">
                                                {["Male", "Female", "Other"].map((g) => (
                                                    <TouchableOpacity
                                                        key={g}
                                                        onPress={() => handleChange("gender", g)}
                                                        className={`flex-1 py-3.5 rounded-2xl border items-center ${user.gender === g
                                                            ? 'bg-purple-600 border-purple-600 shadow-md shadow-purple-100'
                                                            : 'bg-gray-50 border-gray-100'
                                                            }`}
                                                    >
                                                        <Text className={`font-bold ${user.gender === g ? 'text-white' : 'text-gray-500'}`}>
                                                            {g}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        <View className="flex-row gap-4">
                                            {/* Age */}
                                            <View className="w-24">
                                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Age</Text>
                                                <View className="flex-row items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl px-2 py-2">
                                                    <Calendar size={18} color="#9333EA" />
                                                    <TextInput
                                                        className="flex-1 ml-2 text-gray-900 font-medium text-center"
                                                        placeholder="22"
                                                        placeholderTextColor="#9CA3AF"
                                                        keyboardType="number-pad"
                                                        maxLength={3}
                                                        value={user.age}
                                                        onChangeText={(text) => handleChange("age", text)}
                                                    />
                                                </View>
                                            </View>

                                            {/* Phone Number */}
                                            <View className="flex-1">
                                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Phone Number</Text>
                                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5">
                                                    <Phone size={18} color="#9333EA" />
                                                    <TextInput
                                                        className="flex-1 ml-3 text-gray-900 font-medium"
                                                        placeholder="+92 300 1234567"
                                                        placeholderTextColor="#9CA3AF"
                                                        keyboardType="phone-pad"
                                                        value={user.phone}
                                                        onChangeText={(text) => handleChange("phone", text)}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Location & Security Side */}
                            <View className={isLargeScreen ? "flex-1" : "w-full"}>
                                <View className="bg-white rounded-[32px] p-6 shadow-md border border-purple-50 mb-6">
                                    <View className="gap-6">
                                        {/* City / Location */}
                                        <View>
                                            <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">City / Location</Text>
                                            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 mb-3">
                                                <MapPin size={18} color="#9333EA" />
                                                <TextInput
                                                    className="flex-1 ml-3 text-gray-900 font-medium"
                                                    placeholder="Karachi, Pakistan"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={user.city}
                                                    onChangeText={(text) => handleChange("city", text)}
                                                />
                                            </View>
                                            <View className="flex-row flex-wrap gap-2">
                                                {commonCities.map((c) => (
                                                    <TouchableOpacity
                                                        key={c}
                                                        onPress={() => handleChange("city", c)}
                                                        className={`px-3 py-1.5 rounded-full border ${user.city === c ? 'bg-purple-100 border-purple-200 shadow-sm' : 'bg-transparent border-gray-200'}`}
                                                    >
                                                        <Text className={`text-[11px] font-bold ${user.city === c ? 'text-purple-600' : 'text-gray-400'}`}>{c}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Passwords */}
                                        <View className="gap-4">
                                            <View>
                                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Password</Text>
                                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5">
                                                    <Lock size={18} color="#9333EA" />
                                                    <TextInput
                                                        className="flex-1 ml-3 text-gray-900 font-medium"
                                                        placeholder="********"
                                                        placeholderTextColor="#9CA3AF"
                                                        value={user.Password}
                                                        onChangeText={(text) => handleChange("Password", text)}
                                                        secureTextEntry
                                                    />
                                                </View>
                                            </View>

                                            <View>
                                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Confirm Password</Text>
                                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5">
                                                    <Lock size={18} color="#9333EA" />
                                                    <TextInput
                                                        className="flex-1 ml-3 text-gray-900 font-medium"
                                                        placeholder="********"
                                                        placeholderTextColor="#9CA3AF"
                                                        value={user.ConfirmPassword}
                                                        onChangeText={(text) => handleChange("ConfirmPassword", text)}
                                                        secureTextEntry
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View className="items-center mt-6 mb-8">
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isLoading}
                                className={`bg-purple-600 px-12 py-4 rounded-full flex-row items-center justify-center gap-2 shadow-xl shadow-purple-200 ${isLargeScreen ? 'w-1/3' : 'w-full'}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white font-black text-lg">Save & Continue</Text>
                                        <Sparkles size={18} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}