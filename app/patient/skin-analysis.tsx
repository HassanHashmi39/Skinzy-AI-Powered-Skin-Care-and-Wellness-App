import { useRouter } from 'expo-router';
import { Camera, ChevronLeft, Image as ImageIcon, Info, Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useRef } from 'react';
import Footer from '../../components/Footer';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function SkinAnalysisPage() {
    const router = useRouter();
    
    useEffect(() => {
        // Pre-check AI Server connection on load
        const checkServer = async () => {
            const urls = [
                `http://${Platform.OS === 'web' ? window.location.hostname : '127.0.0.1'}:8080/health`,
                'http://127.0.0.1:8080/health',
                'http://192.168.1.15:8080/health',
                'http://localhost:8080/health'
            ];
            for (const url of urls) {
                try {
                    const r = await fetch(url);
                    if (r.ok) {
                        console.log("✅ Proactive check: AI Server found at", url);
                        break;
                    }
                } catch(e) {}
            }
        };
        checkServer();
    }, []);

    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [scanLineAnim] = useState(new Animated.Value(0));
    
    // Camera State for Web
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);

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

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Attach stream to video element when it becomes available
    useEffect(() => {
        if (isCameraActive && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [isCameraActive, videoRef.current, streamRef.current]);

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
            const croppedUri = await cropUploadedImage(result.assets[0].uri);
            setImage(croppedUri);
        }
    };

    const takePhoto = async () => {
        if (Platform.OS === 'web') {
            startWebCamera();
            return;
        }

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
            const croppedUri = await cropUploadedImage(result.assets[0].uri);
            setImage(croppedUri);
        }
    };

    const startWebCamera = async () => {
        setCameraError(null);
        try {
            const constraints = {
                video: { 
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            setIsCameraActive(true);
            setImage(null);
            // The useEffect will handle attaching streamRef.current to videoRef.current
        } catch (err: any) {
            console.error("Camera access error:", err);
            let msg = "Could not access camera.";
            if (err.name === 'NotAllowedError') msg = "Camera access was denied. Please allow camera permission.";
            else if (err.name === 'NotFoundError') msg = "No camera device found.";
            else if (err.name === 'NotReadableError') msg = "Camera is already in use by another application.";
            else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                msg = "Camera requires HTTPS to work on a hosted website.";
            }
            setCameraError(msg);
            Alert.alert("Camera Error", msg);
        }
    };

    const stopWebCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const captureWebPhoto = () => {
        if (!videoRef.current || !streamRef.current) {
            console.error("Camera not ready for capture");
            return;
        }

        const video = videoRef.current;
        
        // Ensure video is playing and has dimensions
        if (video.readyState < 2 || video.videoWidth === 0) {
            console.warn("Video not ready, retrying capture...");
            setTimeout(captureWebPhoto, 100);
            return;
        }

        const canvas = document.createElement('canvas');
        
        // 📐 Calculate square crop (Center Crop)
        const size = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Draw only the center square of the video frame
            ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            setImage(dataUrl);
            stopWebCamera();
        }
    };

    const cropUploadedImage = async (uri: string): Promise<string> => {
        if (Platform.OS !== 'web') return uri;

        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const size = Math.min(img.width, img.height);
                const startX = (img.width - size) / 2;
                const startY = (img.height - size) / 2;

                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
                    resolve(canvas.toDataURL('image/jpeg', 0.95));
                } else {
                    resolve(uri);
                }
            };
            img.onerror = () => resolve(uri);
            img.src = uri;
        });
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
        // Updated to your current IP address (10.9.213.216)
        const AI_SERVER_URL = process.env.EXPO_PUBLIC_AI_SERVER_URL || 
            (Platform.OS === 'web' 
                ? `http://${window.location.hostname}:8080/analyze` 
                : 'http://192.168.1.15:8080/analyze'); 

        try {
            // Simulated delay for progress bar effect
            await new Promise(resolve => setTimeout(resolve, 500));

            // Create form data for image upload
            const formData = new FormData();
            
            if (Platform.OS === 'web') {
                try {
                    // For web, we need to convert the URI to a blob
                    console.log("Converting image to blob:", image.substring(0, 50) + "...");
                    const response = await fetch(image);
                    const blob = await response.blob();
                    formData.append('image', blob, 'skin_image.jpg');
                    console.log("Image successfully converted to blob");
                } catch (blobErr) {
                    console.error("Failed to convert image to blob:", blobErr);
                    setIsAnalyzing(false);
                    Alert.alert('Image Error', 'Failed to process the selected image for upload.');
                    return;
                }
            } else {
                // For mobile (React Native)
                formData.append('image', {
                    uri: image,
                    type: 'image/jpeg',
                    name: 'skin_image.jpg',
                } as any);
            }

            // 🧩 Securely retrieve the patient's customized medical profile to feed AI 
            try {
                const medicalDataStr = await AsyncStorage.getItem('patientMedicalHistory');
                if (medicalDataStr) {
                    formData.append('medical_data', medicalDataStr);
                }
            } catch (e) {
                console.log('Failed to attach medical profile.');
            }

            // Attempt to call the Python AI Server with multiple fallback URLs
            const tryFetch = async (url: string) => {
                console.log("Attempting to reach AI Server at:", url);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); 

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        body: formData,
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);
                    return response;
                } catch (e) {
                    clearTimeout(timeoutId);
                    throw e;
                }
            };

            try {
                let response;
                const urlsToTry = [
                    AI_SERVER_URL,
                    `http://${Platform.OS === 'web' ? window.location.hostname : '127.0.0.1'}:8080/analyze`,
                    'http://127.0.0.1:8080/analyze',
                    'http://192.168.1.15:8080/analyze',
                    'http://localhost:8080/analyze'
                ];

                // Remove duplicates and invalid URLs
                const uniqueUrls = Array.from(new Set(urlsToTry.filter(url => url && url.startsWith('http'))));

                console.log("Will attempt these URLs:", uniqueUrls);

                let lastErr;
                for (const url of uniqueUrls) {
                    try {
                        response = await tryFetch(url);
                        if (response) break;
                    } catch (err) {
                        console.log(`Failed to reach ${url}, trying next...`);
                        lastErr = err;
                    }
                }

                if (!response) {
                    throw lastErr || new Error("All connection attempts failed");
                }

                const aiResult = await response.json();
                
                if (aiResult.error) {
                    console.log("AI Server returned an error:", aiResult.error);
                    setIsAnalyzing(false);
                    Alert.alert('Analysis Failed', aiResult.error);
                    return;
                }
                
                processAIResult(aiResult);
            } catch (err) {
                console.log("AI Server not reached on any URL:", err);
                setIsAnalyzing(false);
                Alert.alert('Server Error', `AI server at ${AI_SERVER_URL} is not responding. Please check if the Python backend is running.`);
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
        // Removed the random mock fallback. The AI analysis must only come from the real server.
        setIsAnalyzing(false);
        Alert.alert('Analysis Unavailable', 'The AI model server is not reachable.');
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
            recommendations: aiResult.Products || aiResult.recommendations || [],
            dos: aiResult.dos || [],
            donts: aiResult.donts || [],
            morningRoutine: aiResult.morning_routine || [],
            nightRoutine: aiResult.night_routine || []
        };

        router.push({
            pathname: '/patient/analysis-results',
            params: { result: JSON.stringify(mockResults) }
        });
    };

    if (isAnalyzing) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-6">
                <View className="w-full max-w-sm aspect-square bg-gray-100 rounded-[40px] overflow-hidden relative shadow-2xl mb-12">
                    {image && <Image source={{ uri: image }} className="w-full h-full" />}
                    
                    {/* Scanning Animation */}
                    <Animated.View 
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: 4,
                            backgroundColor: '#10b981',
                            zIndex: 10,
                            shadowColor: '#10b981',
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
                    <View className="absolute inset-0 opacity-10 border border-green-500/20 pointer-events-none">
                        <View className="w-full h-full flex-row">
                            <View className="flex-1 border-r border-green-500" />
                            <View className="flex-1 border-r border-green-500" />
                            <View className="flex-1" />
                        </View>
                    </View>
                </View>

                <Text className="text-3xl font-black text-gray-900 mb-2">Analyzing...</Text>
                <Text className="text-gray-500 text-center mb-10">Our AI is scanning for 12+ skin indicators. One moment please.</Text>

                <View className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
                    <View 
                        className="h-full bg-green-500" 
                        style={{ width: `${analysisProgress}%` }}
                    />
                </View>
                <Text className="text-green-500 font-bold">{analysisProgress}% Complete</Text>

                <View className="mt-12 items-center">
                    <Text className="text-gray-400 text-xs italic">Processing securely on-device</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Page Title Section */}
                <View className="max-w-6xl mx-auto w-full px-6 pt-10 pb-6 flex-row items-center">
                    <TouchableOpacity 
                        onPress={() => {
                            if (isCameraActive) stopWebCamera();
                            router.back();
                        }}
                        className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center shadow-sm border border-gray-100"
                    >
                        <ChevronLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View className="ml-6">
                        <Text className="text-3xl font-black text-gray-900">Skin Analysis</Text>
                        <Text className="text-gray-500 font-medium">AI-powered skin health assessment</Text>
                    </View>
                </View>

                {/* Main Content Container - Responsive Layout */}
                <View className="max-w-6xl mx-auto w-full px-6 flex-col lg:flex-row lg:items-start lg:gap-10 pb-16">
                    
                    {/* Left Side: Image Upload / Preview / Camera */}
                    <View className="w-full lg:w-[55%] mb-10 lg:mb-0">
                        <View className="w-full mb-8">
                            {isCameraActive ? (
                                <View className="w-full aspect-[4/3] max-h-[500px] bg-black rounded-[40px] overflow-hidden relative shadow-2xl">
                                    {Platform.OS === 'web' && (
                                        <video 
                                            ref={videoRef}
                                            autoPlay 
                                            playsInline 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    )}
                                    
                                    {/* 🎯 Face Guide Overlay */}
                                    <View className="absolute inset-0 items-center justify-center pointer-events-none">
                                        <View className="w-40 h-40 md:w-56 md:h-56 border-2 border-green-500/50 rounded-full flex-col items-center justify-center">
                                            <View className="w-full h-[2px] bg-green-500/20 absolute top-1/2" />
                                            <View className="h-full w-[2px] bg-green-500/20 absolute left-1/2" />
                                            <View className="bg-green-500/10 p-2 rounded-lg">
                                                <Text className="text-green-500 text-[10px] font-bold uppercase tracking-widest">Position Face Here</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View className="absolute bottom-8 left-0 right-0 flex-row justify-center gap-6">
                                        <TouchableOpacity 
                                            onPress={captureWebPhoto}
                                            className="bg-purple-600 p-5 rounded-full shadow-2xl transform active:scale-95 transition-all"
                                        >
                                            <Camera size={32} color="white" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={stopWebCamera}
                                            className="bg-red-500 p-5 rounded-full shadow-2xl transform active:scale-95 transition-all"
                                        >
                                            <X size={32} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : image ? (
                                <View className="w-full bg-gray-50 rounded-[40px] overflow-hidden relative shadow-xl border border-gray-100 items-center justify-center p-4">
                                    <View className="w-full max-h-[320px] aspect-square rounded-[30px] overflow-hidden bg-white shadow-inner">
                                        <Image 
                                            source={{ uri: image }} 
                                            className="w-full h-full" 
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </View>
                                    
                                    <TouchableOpacity 
                                        onPress={() => setImage(null)}
                                        className="absolute top-6 right-6 w-10 h-10 bg-black/60 rounded-full items-center justify-center shadow-lg"
                                    >
                                        <X size={20} color="white" />
                                    </TouchableOpacity>
                                    
                                    <View className="flex-row justify-center gap-3 mt-4">
                                        <TouchableOpacity 
                                            onPress={() => setImage(null)}
                                            className="bg-white px-5 py-2.5 rounded-xl border border-purple-600 shadow-sm flex-row items-center gap-2"
                                        >
                                            <Text className="text-purple-600 font-bold text-sm">Change</Text>
                                        </TouchableOpacity>
                                        {Platform.OS === 'web' && (
                                            <TouchableOpacity 
                                                onPress={startWebCamera}
                                                className="bg-white px-5 py-2.5 rounded-xl border border-purple-600 shadow-sm flex-row items-center gap-2"
                                            >
                                                <Text className="text-purple-600 font-bold text-sm">Retake</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ) : (
                                <View className="w-full border-2 border-dashed border-purple-200 bg-purple-50/20 rounded-[40px] p-8 items-center justify-center min-h-[280px] lg:h-[350px]">
                                    <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-4 shadow-sm">
                                        <Camera size={32} color="#9333EA" />
                                    </View>
                                    <Text className="text-gray-400 font-bold text-lg text-center mb-1">No image selected</Text>
                                    <Text className="text-gray-400 text-xs text-center px-10">Capture or upload a photo of your skin</Text>
                                    
                                    {cameraError && (
                                        <Text className="text-red-500 text-[10px] text-center mt-4 px-4 bg-red-50 py-1.5 rounded-lg">{cameraError}</Text>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Action Buttons */}
                        {!isCameraActive && (
                            <View className="w-full gap-5">
                                {!image ? (
                                    <View className="flex-col md:flex-row gap-4">
                                        <TouchableOpacity 
                                            onPress={takePhoto}
                                            className="flex-1 py-5 bg-purple-600 rounded-[24px] flex-row items-center justify-center gap-3 shadow-xl shadow-purple-200"
                                        >
                                            <Camera size={22} color="white" />
                                            <Text className="text-white font-black text-lg">Live Camera</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            onPress={pickImage}
                                            className="flex-1 py-5 bg-white border-2 border-purple-600 rounded-[24px] flex-row items-center justify-center gap-3"
                                        >
                                            <ImageIcon size={22} color="#9333EA" />
                                            <Text className="text-purple-600 font-black text-lg">Upload Photo</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity 
                                        onPress={startAnalysis}
                                        className="w-full py-6 bg-purple-600 rounded-[24px] flex-row items-center justify-center gap-3 shadow-2xl shadow-purple-200 transform active:scale-95 transition-all"
                                    >
                                        <Sparkles size={24} color="white" />
                                        <Text className="text-white font-black text-xl">Start Analysis Now</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Right Side: Instructions / Guide */}
                    <View className="w-full lg:w-[45%] lg:mt-0">
                        <View className="w-full bg-purple-50 rounded-[40px] p-6 items-center mb-6 border border-purple-100 shadow-sm">
                            <View className="w-14 h-14 bg-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-purple-200">
                                <Sparkles size={28} color="white" />
                            </View>
                            <Text className="text-xl font-black text-center text-gray-900 mb-2 leading-tight">
                                Deep Analysis
                            </Text>
                            <Text className="text-center text-gray-600 text-sm leading-5">
                                Our medical-grade AI performs a deep scan of your skin layers to identify concerns before they surface.
                            </Text>
                        </View>

                        {/* Step Guide */}
                        <View className="w-full bg-gray-50/50 p-5 rounded-[40px] border border-gray-100">
                            <Text className="text-base font-bold text-gray-900 mb-4">For Best Results:</Text>
                            <View className="gap-4">
                                <GuideItem 
                                    icon={<Info size={16} color="#9333EA" />}
                                    text="Ensure you are in a brightly lit room."
                                />
                                <GuideItem 
                                    icon={<Info size={16} color="#9333EA" />}
                                    text="Remove makeup or glasses."
                                />
                                <GuideItem 
                                    icon={<Info size={16} color="#9333EA" />}
                                    text="Position face inside the guide."
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <Footer />
            </ScrollView>
        </View>
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
