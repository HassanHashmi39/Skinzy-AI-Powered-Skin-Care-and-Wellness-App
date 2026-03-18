import { useRouter } from 'expo-router';
import { Alert, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Send, Star } from 'lucide-react-native';
import { useState } from 'react';
export type Page = 'landing' | 'analysis' | 'results' | 'products' | 'routine' | 'appointments' | 'remedies' | 'chat' | 'history' | 'notifications' | 'profile' | 'feedback';

type FeedbackProps = {
    onNavigate: (page: Page) => void;
};

function Feedback({ onNavigate }: FeedbackProps) {
    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState<'General' | 'Bug' | 'Feature Request' | 'Other'>('General');
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (rating === 0) {
            if (Platform.OS === 'web') {
                window.alert('Please provide a rating');
            } else {
                Alert.alert('Rating Required', 'Please select a rating before submitting.');
            }
            return;
        }

        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    };

    if (submitted) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 p-6">
                <View className="bg-white rounded-3xl p-8 w-full max-w-md items-center shadow-sm">
                    <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                        <Send size={40} color="#16a34a" />
                    </View>
                    <Text className="text-2xl font-bold mb-2 text-center">Thank You!</Text>
                    <Text className="text-gray-600 text-center mb-8">
                        We appreciate your feedback. It helps us improve Skinzy for everyone.
                    </Text>
                    <TouchableOpacity
                        onPress={() => onNavigate('landing')}
                        className="w-full py-4 bg-purple-600 rounded-xl items-center"
                    >
                        <Text className="text-white font-bold">Return to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 md:p-8 max-w-2xl mx-auto w-full">
                <TouchableOpacity
                    onPress={() => onNavigate('landing')}
                    className="flex-row items-center gap-2 mb-8"
                >
                    <ArrowLeft size={20} color="#4b5563" />
                    <Text className="text-gray-600 font-medium ml-2">Back to Home</Text>
                </TouchableOpacity>

                <View className="mb-8">
                    <Text className="text-3xl font-bold mb-3 text-gray-900">Send Feedback</Text>
                    <Text className="text-gray-600">
                        Tell us about your experience with Skinzy
                    </Text>
                </View>

                <View className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-bold mb-4">How would you rate your experience?</Text>
                    <View className="flex-row gap-4 mb-8 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                            >
                                <Star
                                    size={40}
                                    fill={star <= rating ? "#eab308" : "transparent"}
                                    color={star <= rating ? "#eab308" : "#d1d5db"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-gray-700 font-medium mb-3">Category</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {['General', 'Bug', 'Feature Request', 'Other'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setCategory(cat as any)}
                                className={`px-4 py-2 rounded-full border ${category === cat
                                        ? 'bg-purple-50 border-purple-500'
                                        : 'bg-white border-gray-200'
                                    }`}
                            >
                                <Text className={category === cat ? 'text-purple-700 font-medium' : 'text-gray-600'}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-gray-700 font-medium mb-3">Your Comments</Text>
                    <TextInput
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        placeholder="Share your thoughts, suggestions, or report issues..."
                        value={comment}
                        onChangeText={setComment}
                        className="w-full border border-gray-200 rounded-xl p-4 mb-6 min-h-[150px] bg-gray-50"
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="w-full py-4 bg-purple-600 rounded-xl flex-row items-center justify-center gap-2"
                    >
                        <Send size={20} color="white" />
                        <Text className="text-white font-bold">Submit Feedback</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

export default function FeedbackPage() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Feedback
                onNavigate={(page) => {
                    if (page === 'landing') router.push('/');
                    else router.back();
                }}
            />
        </SafeAreaView>
    );
}
