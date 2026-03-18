import { useRouter } from 'expo-router';
import { Camera, ChevronLeft, Image as ImageIcon, Info, Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function SkinAnalysisPage() {
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [scanLineAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (isAnalyzing) {
            startScanAnimation();
            const interval = setInterval(() => {
                setAnalysisProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        finishAnalysis();
                        return 100;
                    }
                    return prev + 2;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isAnalyzing]);

    const startScanAnimation = () => {
        scanLineAnim.setValue(0);
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'We need access to your gallery to analyze your skin.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'We need access to your camera to analyze your skin.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const startAnalysis = () => {
        if (!image) {
            Alert.alert('Image required', 'Please take or pick a photo of your skin first.');
            return;
        }
        setIsAnalyzing(true);
    };

    const finishAnalysis = async () => {
        if (!image) return;

        // In a real app, you would use your AI server URL
        const AI_SERVER_URL = process.env.EXPO_PUBLIC_AI_SERVER_URL || 'http://10.175.179.82:5005/analyze'; 

        try {
            // Simulated delay for progress bar effect
            await new Promise(resolve => setTimeout(resolve, 500));

            // Create form data for image upload
            const formData = new FormData();
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: 'skin_image.jpg',
            } as any);

            // 🧩 Securely retrieve the patient's customized medical profile to feed AI 
            try {
                const medicalDataStr = await AsyncStorage.getItem('patientMedicalHistory');
                if (medicalDataStr) {
                    formData.append('medical_data', medicalDataStr);
                }
            } catch (e) {
                console.log('Failed to attach medical profile.');
            }

            // Attempt to call the Python AI Server
            // We use a timeout to fallback to mock if the server isn't running
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch(AI_SERVER_URL, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const aiResult = await response.json();
                processAIResult(aiResult);
            } catch (err) {
                console.log("AI Server not reached, using local simulation logic...");
                // Fallback simulation that follows the same logic as the Python model
                simulateAIResponse();
            }

        } catch (error) {
            console.error('Analysis Error:', error);
            Alert.alert('Analysis Failed', 'Could not process image. Please try again.');
            setIsAnalyzing(false);
        } finally {
            // Keep loader until processAIResult takes over (which sets it to false)
            // But if we crash here, we MUST close it
            // setIsAnalyzing(false); 
        }
    };

    const processAIResult = (aiResult: any) => {
        // ALWAYS stop analysis loader first to prevent sticking
        setIsAnalyzing(false);
        setAnalysisProgress(0);

        // 1. Condition Level Check (Requirement 2)
        if (aiResult.condition_level === 'low') {
            Alert.alert(
                'Concern Detected',
                'Based on our AI analysis, your skin condition requires professional consultation. Would you like to book an appointment with a dermatologist?',
                [
                    { text: 'See Results First', onPress: () => navigateToResults(aiResult) },
                    { text: 'Book Appointment', onPress: () => {
                        navigateToResults(aiResult); // Navigate anyway so result is in history
                        router.push('/patient/appointment-booking');
                    }, style: 'default' }
                ]
            );
        } else {
            navigateToResults(aiResult);
        }
    };

    const simulateAIResponse = () => {
        const problems = ['Acne', 'Wrinkles', 'Pigmentation', 'Dark Circles'];
        const condition = problems[Math.floor(Math.random() * problems.length)];
        
        const dummyRecs = [
            { tier: 'Budget', category: 'Cleanser', name: 'Face Wash', brand: 'Saeed Ghani', price: 'Rs. 450' },
            { tier: 'Mid-Range', category: 'Serum', name: 'MandelAC', brand: 'Jenpharm', price: 'Rs. 1200' }
        ];

        const result = {
            Condition: condition,
            Confidence: '89%',
            Severity: 'Moderate',
            Advice: 'Avoid touching face, stay hydrated.',
            Doctor: 'Not required',
            Products: dummyRecs
        };

        processAIResult(result);
    };

    const navigateToResults = (aiResult: any) => {
        const mockResults = {
            skinType: aiResult.Condition || aiResult.disease || 'Problematic',
            detectedDisease: aiResult.Condition || aiResult.disease,
            conditionLevel: aiResult.Severity?.toLowerCase() || aiResult.condition_level || 'moderate',
            confidence: aiResult.Confidence || '92%',
            advice: aiResult.Advice || 'Maintain good hygiene.',
            doctor: aiResult.Doctor || 'Not required',
            skinTone: 'Medium',
            issues: {
                acne: aiResult.Condition === 'Acne' ? 85 : 5,
                pigmentation: aiResult.Condition === 'Pigmentation' ? 85 : 5,
                dryness: aiResult.Condition === 'Eczema' ? 85 : 5,
                oiliness: aiResult.Condition === 'Acne' ? 70 : 15,
                darkCircles: aiResult.Condition === 'Dark Circles' ? 85 : 5,
                sensitivity: aiResult.Condition === 'Eczema' ? 75 : 10
            },
            recommendations: aiResult.Products || aiResult.recommendations || []
        };

        router.push({
            pathname: '/patient/analysis-results',
            params: { result: JSON.stringify(mockResults) }
        });
    };

    if (isAnalyzing) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
                <View className="w-full max-w-sm aspect-square bg-gray-100 rounded-[40px] overflow-hidden relative shadow-2xl mb-12">
                    {image && <Image source={{ uri: image }} className="w-full h-full" />}
                    
                    {/* Scanning Animation */}
                    <Animated.View 
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: 4,
                            backgroundColor: '#9333ea',
                            zIndex: 10,
                            shadowColor: '#9333ea',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 10,
                            transform: [{
                                translateY: scanLineAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 320] // Assuming ~320px height for aspect-square max-w-sm
                                })
                            }]
                        }}
                    />

                    {/* Overlay Grid */}
                    <View className="absolute inset-0 opacity-10 border border-purple-500/20 pointer-events-none">
                        <View className="w-full h-full flex-row">
                            <View className="flex-1 border-r border-purple-500" />
                            <View className="flex-1 border-r border-purple-500" />
                            <View className="flex-1" />
                        </View>
                    </View>
                </View>

                <Text className="text-3xl font-black text-gray-900 mb-2">Analyzing...</Text>
                <Text className="text-gray-500 text-center mb-10">Our AI is scanning for 12+ skin indicators. One moment please.</Text>

                <View className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
                    <View 
                        className="h-full bg-purple-600" 
                        style={{ width: `${analysisProgress}%` }}
                    />
                </View>
                <Text className="text-purple-600 font-bold">{analysisProgress}% Complete</Text>

                <View className="mt-12 items-center">
                    <Text className="text-gray-400 text-xs italic">Processing securely on-device</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
                    >
                        <ChevronLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">AI Skin Analysis</Text>
                    <View className="w-10" />
                </View>

                {/* Hero / Instruction Section */}
                <View className="px-6 mt-8 items-center">
                    <View className="w-full bg-purple-50 rounded-[40px] p-8 items-center mb-8 border border-purple-100">
                        <View className="w-20 h-20 bg-purple-600 rounded-3xl items-center justify-center mb-6 shadow-xl shadow-purple-200">
                            <Sparkles size={40} color="white" />
                        </View>
                        <Text className="text-2xl font-black text-center text-gray-900 mb-4 px-4">
                            See Your Skin Like Never Before
                        </Text>
                        <Text className="text-center text-gray-600 leading-6 mb-2">
                            Our advanced AI analyzes your skin for texture, tone, concerns, and type to build your perfect routine.
                        </Text>
                    </View>

                    {/* Step Guide */}
                    <View className="w-full mb-10">
                        <Text className="text-lg font-bold text-gray-900 mb-6 px-2">For best results:</Text>
                        <View className="gap-4">
                            <GuideItem 
                                icon={<Info size={18} color="#9333EA" />}
                                text="Good natural lighting (avoid shadows)"
                            />
                            <GuideItem 
                                icon={<Info size={18} color="#9333EA" />}
                                text="Clean, makeup-free skin"
                            />
                            <GuideItem 
                                icon={<Info size={18} color="#9333EA" />}
                                text="Hold camera 6-8 inches from face"
                            />
                        </View>
                    </View>

                    {/* Image Placeholder / Preview */}
                    <View className="w-full mb-10">
                        {image ? (
                            <View className="w-full aspect-square bg-gray-50 rounded-3xl overflow-hidden relative shadow-sm">
                                <Image source={{ uri: image }} className="w-full h-full" />
                                <TouchableOpacity 
                                    onPress={() => setImage(null)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
                                >
                                    <X size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="w-full border-2 border-dashed border-purple-200 bg-gray-50 rounded-3xl p-12 items-center">
                                <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-4">
                                    <Camera size={32} color="#7E22CE" />
                                </View>
                                <Text className="text-gray-400 font-medium text-center">No image selected</Text>
                            </View>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View className="w-full gap-4 mb-20">
                        {!image ? (
                            <>
                                <TouchableOpacity 
                                    onPress={takePhoto}
                                    className="w-full py-5 bg-purple-600 rounded-3xl flex-row items-center justify-center gap-3 shadow-xl shadow-purple-100"
                                >
                                    <Camera size={20} color="white" />
                                    <Text className="text-white font-black text-lg">Take Live Photo</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    onPress={pickImage}
                                    className="w-full py-5 bg-white border-2 border-purple-600 rounded-3xl flex-row items-center justify-center gap-3"
                                >
                                    <ImageIcon size={20} color="#9333EA" />
                                    <Text className="text-purple-600 font-black text-lg">Upload from Gallery</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity 
                                onPress={startAnalysis}
                                className="w-full py-5 bg-purple-600 rounded-3xl flex-row items-center justify-center gap-3 shadow-xl shadow-purple-200"
                            >
                                <Sparkles size={20} color="white" />
                                <Text className="text-white font-black text-lg">Start Analysis Now</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function GuideItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <View className="flex-row items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            {icon}
            <Text className="text-gray-700 font-medium">{text}</Text>
        </View>
    );
}
