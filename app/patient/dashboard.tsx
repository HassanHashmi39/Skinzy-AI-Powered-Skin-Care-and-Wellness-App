import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Bell, Calendar, Camera, ChevronRight, MessageCircle, ShoppingBag, Sparkles, Sun, TrendingUp, Umbrella, User } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as api from '../../utils/api';

const { width } = Dimensions.get('window');

// Mock data for initial UI
const MOCK_USER = {
    name: 'Ayesha',
    skinType: 'Combination',
    lastAnalysisDate: 'Dec 30, 2024',
    skinScore: 78,
};

const MOCK_WEATHER = {
    city: 'Loading...',
    temp: '--',
    condition: 'Loading...',
    uvIndex: '--',
};

export default function PatientDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [routineData, setRoutineData] = useState<any>(null);
    const [weather, setWeather] = useState(MOCK_WEATHER);
    const [allDoctors, setAllDoctors] = useState<any[]>([]);

    const [appointments, setAppointments] = useState<any[]>([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [])
    );

    const fetchDashboardData = async () => {
        setIsLoading(true);
        
        // Load critical user data first
        try {
            const userResponse = await api.getCurrentUser();
            if (userResponse && userResponse.user) {
                setUserData(userResponse.user);
                
                // Load weather in background after user data is available
                api.getWeatherRecommendations(userResponse.user.city || 'Karachi')
                    .then(setWeather)
                    .catch(e => console.error('Weather error:', e));
            }
        } catch (err) {
            console.error('User data fetch error:', err);
        }

        // Load other parts in parallel but independently
        const loadIndependentData = async () => {
            try {
                const routine = await api.getRoutine();
                if (routine) setRoutineData(routine);
            } catch (e) { console.error('Routine error:', e); }

            try {
                const apts = await api.getAppointments();
                if (apts?.appointments) setAppointments(apts.appointments);
            } catch (e) { console.error('Apts error:', e); }

            try {
                const docs = await api.getDoctors();
                if (docs?.doctors) setAllDoctors(docs.doctors);
            } catch (e) { console.error('Doctors error:', e); }

            try {
                const notifs = await api.getNotifications();
                if (notifs?.notifications) {
                    const unread = notifs.notifications.filter((n: any) => !n.isRead).length;
                    setUnreadNotifications(unread);
                }
            } catch (e) { console.error('Notifs error:', e); }
        };

        await loadIndependentData();
        setIsLoading(false);
    };

    if (isLoading && !userData) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#A855F7" />
            </SafeAreaView>
        );
    }

    const displayName = userData?.name?.split(' ')[0] || MOCK_USER.name;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
                    <View>
                        <Text className="text-gray-500 text-sm font-medium">Welcome back,</Text>
                        <Text className="text-2xl font-bold text-gray-900">{displayName} ✨</Text>
                    </View>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => router.push('/shared/notifications')}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm relative"
                        >
                            <Bell size={20} color="#4B5563" />
                            {unreadNotifications > 0 && (
                                <View className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center border border-white">
                                    <Text className="text-white text-[10px] font-bold">
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/shared/user-profile')}
                            className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center shadow-sm overflow-hidden"
                        >
                            {userData?.profileImage ? (
                                <Image source={{ uri: userData.profileImage }} className="w-full h-full" />
                            ) : (
                                <User size={20} color="#7E22CE" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Weather Alert / Tip */}
                <View className="px-6 mt-4">
                    <View className="bg-blue-600 rounded-3xl p-5 shadow-lg flex-row items-center">
                        <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                                <Sun size={18} color="white" />
                                <Text className="text-blue-100 font-bold text-xs uppercase tracking-widest">
                                    {(weather as any).uvIndex || '--'} UV INDEX • {weather.city || userData?.city || 'Local'}
                                </Text>
                            </View>
                            <Text className="text-white font-black text-xl mb-1 leading-tight">
                                {(weather as any).tip || "Loading Weather Tip..."}
                            </Text>
                            <Text className="text-blue-100 text-sm font-medium leading-5">
                                {(weather as any).recommendation || "Fetching personalized skin protection advice..."}
                            </Text>
                        </View>
                        <View className="w-16 h-16 bg-blue-500/50 rounded-2xl items-center justify-center ml-4 border border-blue-400">
                            <Text className="text-white font-black text-xl">{weather.temp}</Text>
                        </View>
                    </View>
                </View>

                {/* Skin Analysis Summary */}
                <View className="px-6 mt-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900">Your Skin Analysis</Text>
                        <TouchableOpacity onPress={() => router.push('/patient/skin-analysis')}>
                            <Text className="text-purple-600 font-medium">New Scan</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/patient/history?filter=analysis')}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-3">
                                <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center">
                                    <Sparkles size={24} color="#7E22CE" />
                                </View>
                                <View>
                                    <Text className="text-gray-900 font-bold text-lg">Health Score: {MOCK_USER.skinScore}%</Text>
                                    <Text className="text-gray-500 text-sm">Last scan: {MOCK_USER.lastAnalysisDate}</Text>
                                </View>
                            </View>
                            <View className="bg-green-100 px-3 py-1 rounded-full">
                                <Text className="text-green-700 font-bold text-xs">IMPROVING</Text>
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-gray-50 p-3 rounded-2xl">
                                <Text className="text-gray-500 text-xs mb-1">Top Concern</Text>
                                <Text className="text-gray-900 font-bold">Oiliness</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 p-3 rounded-2xl">
                                <Text className="text-gray-500 text-xs mb-1">Skin Type</Text>
                                <Text className="text-gray-900 font-bold">{userData?.skinType || MOCK_USER.skinType}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions Grid */}
                <View className="px-6 mt-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
                    <View className="flex-row flex-wrap justify-between gap-y-4">

                        <ActionCard
                            title="My Routine"
                            icon={<TrendingUp size={24} color="#3B82F6" />}
                            bgColor="bg-blue-50"
                            onPress={() => router.push('/patient/routine-tracker')}
                        />
                        <ActionCard
                            title="AI Analysis"
                            icon={<Camera size={24} color="#A855F7" />}
                            bgColor="bg-purple-50"
                            onPress={() => router.push('/patient/skin-analysis')}

                        />
                        <ActionCard
                            title="Products"
                            icon={<ShoppingBag size={24} color="#EC4899" />}
                            bgColor="bg-pink-50"
                            onPress={() => router.push('/patient/product-recommendations')}
                        />
                        <ActionCard
                            title="AI Chat"
                            icon={<MessageCircle size={24} color="#F59E0B" />}
                            bgColor="bg-amber-50"
                            onPress={() => router.push('/patient/chat')}
                        />
                        <ActionCard
                            title="Remedies"
                            icon={<Umbrella size={24} color="#6366F1" />}
                            bgColor="bg-indigo-50"
                            onPress={() => router.push('/patient/remedies')}
                        />
                    </View>
                </View>

                {/* Recommended Doctors */}
                <View className="px-6 mt-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900">Top Dermatologists</Text>
                        <TouchableOpacity onPress={() => router.push('/patient/appointment-booking')}>
                            <Text className="text-purple-600 font-medium">View All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
                        {allDoctors.length > 0 ? (
                            allDoctors.map((doc: any) => (
                                <TouchableOpacity
                                    key={doc._id}
                                    onPress={() => router.push('/patient/appointment-booking')}
                                    className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mr-4 items-center w-40"
                                >
                                    <View className="w-20 h-20 bg-purple-100 rounded-full mb-3 items-center justify-center overflow-hidden">
                                        {doc.profileImage ? (
                                            <Image source={{ uri: doc.profileImage }} className="w-full h-full" />
                                        ) : (
                                            <Text className="text-2xl text-purple-700 font-bold">{doc.name.charAt(0)}</Text>
                                        )}
                                    </View>
                                    <Text className="text-gray-900 font-bold text-center" numberOfLines={1}>{doc.name}</Text>
                                    <Text className="text-gray-500 text-xs text-center mb-2">{doc.specialization || 'Skin Expert'}</Text>
                                    <View className="bg-purple-600 px-3 py-1.5 rounded-full w-full">
                                        <Text className="text-white font-bold text-[10px] text-center">BOOK</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="bg-white rounded-2xl p-4 w-60 border border-dashed border-gray-300 items-center justify-center">
                                <Text className="text-gray-400 text-xs">No doctors available</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Daily Routine Progress */}
                <View className="px-6 mt-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Daily Routine</Text>
                    <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-row items-center">
                        {routineData ? (
                            <>
                                <View className="w-16 h-16 rounded-full border-4 border-purple-500 items-center justify-center mr-4">
                                    <Text className="text-purple-700 font-bold text-lg">
                                        {(() => {
                                            const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
                                            const todayTasks = routineData.morningRoutine?.filter((t: any) => !t.days || t.days.includes(currentDay)) || [];
                                            return `${todayTasks.filter((t: any) => t.isCompleted).length}/${todayTasks.length}`;
                                        })()}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">Morning Routine</Text>
                                    <Text className="text-gray-500 text-sm">
                                        {(() => {
                                            const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
                                            const todayTasks = routineData.morningRoutine?.filter((t: any) => !t.days || t.days.includes(currentDay)) || [];
                                            const remaining = todayTasks.length - todayTasks.filter((t: any) => t.isCompleted).length;
                                            return `${remaining} steps remaining for today`;
                                        })()}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/patient/routine-tracker')}
                                        className="mt-2 flex-row items-center"
                                    >
                                        <Text className="text-purple-600 font-medium mr-1">View Routine</Text>
                                        <ChevronRight size={16} color="#9333EA" />
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <View className="flex-1 items-center justify-center py-4">
                                <Text className="text-gray-500">No routine set up yet</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/patient/routine-tracker')}
                                    className="mt-2"
                                >
                                    <Text className="text-purple-600 font-bold">Set Up Now</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                <View className="px-6 mt-8 mb-12">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900">Upcoming Consultations</Text>
                        <TouchableOpacity onPress={() => router.push('/patient/history')}>
                            <Text className="text-gray-500 font-medium">History</Text>
                        </TouchableOpacity>
                    </View>

                    {appointments && appointments.length > 0 ? (
                        appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').slice(0, 2).map((apt: any) => (
                            <View key={apt._id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-4 flex-row items-center">
                                <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                                    <Calendar size={24} color="#3B82F6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold">{apt.doctor.name}</Text>
                                    <Text className="text-gray-500 text-sm">{apt.appointmentDate} • {apt.appointmentTime}</Text>
                                    <View className={`px-2 py-0.5 rounded-full self-start mt-1 ${apt.status === 'confirmed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                        <Text className={`text-[10px] font-bold ${apt.status === 'confirmed' ? 'text-green-700' : 'text-yellow-700'}`}>{apt.status.toUpperCase()}</Text>
                                    </View>
                                </View>
                                {apt.status === 'confirmed' && (
                                    <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-xl">
                                        <Text className="text-white font-bold text-xs">JOIN</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    ) : (
                        <View className="bg-white rounded-3xl p-8 items-center border border-dashed border-gray-300">
                            <Text className="text-gray-500">No upcoming appointments</Text>
                            <TouchableOpacity onPress={() => router.push('/patient/appointment-booking')} className="mt-2">
                                <Text className="text-purple-600 font-bold">Book One Now</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}

function ActionCard({ title, icon, bgColor, onPress }: { title: string; icon: any; bgColor: string; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`${bgColor} rounded-3xl p-4 items-center justify-center shadow-sm`}
            style={{ width: (width - 48 - 16) / 3 }}
        >
            <View className="mb-2">{icon}</View>
            <Text className="text-gray-900 font-bold text-xs text-center">{title}</Text>
        </TouchableOpacity>
    );
}
