import { useRouter } from "expo-router";
import { ArrowLeft, Check, Sparkles, Activity, ShieldAlert, Heart, MessageSquare } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    useWindowDimensions
} from "react-native";
import * as api from "../../utils/api";

export default function HealthInfoScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isLargeScreen = width > 768;

    const [isLoading, setIsLoading] = useState(false);
    const [skinType, setSkinType] = useState("");
    const [issues, setIssues] = useState<string[]>([]);
    const [familyHistory, setFamilyHistory] = useState<boolean | null>(null);
    const [familyHistoryText, setFamilyHistoryText] = useState("");
    const [allergies, setAllergies] = useState<boolean | null>(null);
    const [allergiesText, setAllergiesText] = useState("");

    const toggleIssue = (issue: string) => {
        if (issues.includes(issue)) {
            setIssues(issues.filter((i) => i !== issue));
        } else {
            setIssues([...issues, issue]);
        }
    };

    const handleSubmit = async () => {
        if (!skinType) {
            Alert.alert("Missing Info", "Please select your skin type to help us personalize your routine.");
            return;
        }

        try {
            setIsLoading(true);

            // 1. Update skin type and concerns (using profile-update)
            await api.updateProfile("me", {
                skinType,
                mainConcerns: issues
            });

            // 2. Save medical info
            await api.saveMedicalHistory({
                hasFamilyHistory: familyHistory,
                familyHistoryDetails: familyHistoryText,
                hasAllergies: allergies,
                allergyDetails: allergiesText
            });

            Alert.alert("All Set! 🚀", "Your profile is now complete. Welcome to Skinzy!");
            router.replace("/patient/dashboard" as any);
        } catch (error: any) {
            console.error("Error saving health info:", error);
            // Even if it fails, we might want to navigate, but let's show an error for now
            Alert.alert("Error", error.message || "Failed to save your information. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

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
                                    <Activity size={18} color="white" />
                                </View>
                                <Text className="text-purple-600 font-bold tracking-widest uppercase text-xs">Step 2 of 2</Text>
                            </View>
                            <Text className="text-3xl font-black text-gray-900 mb-2">Skin Health</Text>
                            <Text className="text-gray-500 text-base">Your information is encrypted and visible only to you and your doctor.</Text>
                        </View>

                        <View className={isLargeScreen ? "flex-row gap-8" : "gap-0"}>
                            <View className={isLargeScreen ? "flex-1" : "w-full"}>
                                {/* Skin Type Section */}
                                <View className="mb-8">
                                    <Text className="text-gray-900 font-black text-lg mb-4">What is your skin type?</Text>
                                    <View className="flex-row flex-wrap gap-3">
                                        {["Normal", "Oily", "Dry", "Combination", "Sensitive"].map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                onPress={() => setSkinType(type)}
                                                className={`px-5 py-3 rounded-2xl border ${
                                                    skinType === type 
                                                    ? 'bg-purple-600 border-purple-600 shadow-md shadow-purple-200' 
                                                    : 'bg-white border-purple-50 shadow-sm'
                                                }`}
                                            >
                                                <Text className={`font-bold ${skinType === type ? 'text-white' : 'text-purple-900'}`}>
                                                    {type}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Skin Issues Section */}
                                <View className="mb-8">
                                    <Text className="text-gray-900 font-black text-lg mb-4">Concerns you want to address?</Text>
                                    <View className={isLargeScreen ? "flex-row flex-wrap gap-3" : "gap-3"}>
                                        {["Acne & Breakouts", "Dark Circles", "Pigmentation", "Wrinkles & Aging", "Dryness"].map((issue) => {
                                            const isSelected = issues.includes(issue);
                                            return (
                                                <TouchableOpacity
                                                    key={issue}
                                                    onPress={() => toggleIssue(issue)}
                                                    className={`flex-row items-center justify-between p-4 rounded-3xl border ${isLargeScreen ? 'flex-1 min-w-[200px]' : 'w-full'} ${
                                                        isSelected ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white border-purple-50 shadow-sm'
                                                    }`}
                                                >
                                                    <Text className={`font-bold text-base ${isSelected ? 'text-purple-900' : 'text-gray-600'}`}>
                                                        {issue}
                                                    </Text>
                                                    <View className={`w-6 h-6 rounded-full items-center justify-center border ${
                                                        isSelected ? 'bg-purple-600 border-purple-600' : 'border-purple-200'
                                                    }`}>
                                                        {isSelected && <Check size={14} color="white" />}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>

                            <View className={isLargeScreen ? "flex-1" : "w-full"}>
                                {/* Quick Toggle Sections */}
                                <View className="bg-white rounded-[32px] p-6 shadow-md border border-purple-50 mb-10">
                                    <Text className="text-gray-900 font-black text-lg mb-6 text-center">Medical Context</Text>
                                    
                                    {/* Family History */}
                                    <View className="mb-8">
                                        <View className="flex-row items-center justify-between mb-3">
                                            <View className="flex-row items-center gap-3 flex-1 pr-4">
                                                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center">
                                                    <ShieldAlert size={20} color="#3B82F6" />
                                                </View>
                                                <Text className="text-gray-700 font-bold text-sm">Family history of skin issues?</Text>
                                            </View>
                                            <View className="flex-row bg-gray-100 p-1 rounded-full">
                                                <TouchableOpacity 
                                                    onPress={() => setFamilyHistory(true)}
                                                    className={`px-4 py-1.5 rounded-full ${familyHistory === true ? 'bg-white shadow-sm' : ''}`}
                                                >
                                                    <Text className={`text-xs font-bold ${familyHistory === true ? 'text-purple-600' : 'text-gray-500'}`}>Yes</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    onPress={() => setFamilyHistory(false)}
                                                    className={`px-4 py-1.5 rounded-full ${familyHistory === false ? 'bg-white shadow-sm' : ''}`}
                                                >
                                                    <Text className={`text-xs font-bold ${familyHistory === false ? 'text-purple-600' : 'text-gray-500'}`}>No</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {familyHistory === true && (
                                            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 mt-2">
                                                <MessageSquare size={16} color="#9333EA" />
                                                <TextInput
                                                    className="flex-1 ml-3 text-gray-900 font-medium text-sm"
                                                    placeholder="Specify issues (e.g. Eczema, Psoriasis)"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={familyHistoryText}
                                                    onChangeText={setFamilyHistoryText}
                                                />
                                            </View>
                                        )}
                                    </View>

                                    {/* Allergies */}
                                    <View>
                                        <View className="flex-row items-center justify-between mb-3">
                                            <View className="flex-row items-center gap-3 flex-1 pr-4">
                                                <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center">
                                                    <Heart size={20} color="#EF4444" />
                                                </View>
                                                <Text className="text-gray-700 font-bold text-sm">Any known allergies?</Text>
                                            </View>
                                            <View className="flex-row bg-gray-100 p-1 rounded-full">
                                                <TouchableOpacity 
                                                    onPress={() => setAllergies(true)}
                                                    className={`px-4 py-1.5 rounded-full ${allergies === true ? 'bg-white shadow-sm' : ''}`}
                                                >
                                                    <Text className={`text-xs font-bold ${allergies === true ? 'text-purple-600' : 'text-gray-500'}`}>Yes</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    onPress={() => setAllergies(false)}
                                                    className={`px-4 py-1.5 rounded-full ${allergies === false ? 'bg-white shadow-sm' : ''}`}
                                                >
                                                    <Text className={`text-xs font-bold ${allergies === false ? 'text-purple-600' : 'text-gray-500'}`}>No</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {allergies === true && (
                                            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 mt-2">
                                                <MessageSquare size={16} color="#9333EA" />
                                                <TextInput
                                                    className="flex-1 ml-3 text-gray-900 font-medium text-sm"
                                                    placeholder="e.g. Nuts, Fragrance, SPF"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={allergiesText}
                                                    onChangeText={setAllergiesText}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Footer Button */}
                        <View className="items-center mt-4 mb-8">
                            <TouchableOpacity 
                                onPress={handleSubmit}
                                disabled={isLoading}
                                className={`bg-purple-600 px-12 py-4 rounded-full flex-row items-center justify-center gap-2 shadow-lg shadow-purple-200 ${isLargeScreen ? 'w-1/3' : 'w-full'}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white font-black text-lg">Finish & See Results</Text>
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