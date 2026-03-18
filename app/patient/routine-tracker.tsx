import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Bell, CheckCircle2, Circle, Edit2, Moon, Plus, RefreshCw, Sun, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, SafeAreaView, ScrollView, Switch, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Keyboard } from 'react-native';
import * as api from '../../utils/api';

// Safely import Notifications
let Notifications: any = null;
if (Platform.OS !== 'web') {
    try {
        Notifications = require('expo-notifications');
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
    } catch (e) {
        console.warn('Notifications not supported in this environment (likely Expo Go SDK 53+). Dev build required for full functionality.');
    }
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RoutineTracker() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [routine, setRoutine] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [taskName, setTaskName] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [selectedDays, setSelectedDays] = useState<string[]>(DAYS_OF_WEEK);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        fetchRoutine();
        if (Platform.OS !== 'web') {
            requestNotificationPermissions();
        }
    }, []);

    const requestNotificationPermissions = async () => {
        try {
            if (!Notifications) return;
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Notifications permission denied');
            }
        } catch (error) {
            console.error('Error requesting permissions:', error);
        }
    };

    const fetchRoutine = async () => {
        try {
            setLoading(true);
            const data = await api.getRoutine();
            setRoutine(data);
        } catch (error) {
            console.error('Error fetching routine:', error);
            // Alert only on failure to fetch
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTask = async (taskId: string) => {
        try {
            const updatedRoutine = await api.toggleTaskCompletion(activeTab, taskId);
            setRoutine(updatedRoutine);
        } catch (error) {
            console.error('Toggle Error:', error);
        }
    };

    const handleReset = async () => {
        try {
            setIsRefreshing(true);
            const updatedRoutine = await api.resetRoutine();
            setRoutine(updatedRoutine);
        } catch (error) {
            console.error('Reset Error:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const openModal = (task: any = null) => {
        if (task) {
            setEditingTask(task);
            setTaskName(task.task || '');
            setTaskDesc(task.description || '');
            setSelectedDays(task.days || DAYS_OF_WEEK);
            setReminderEnabled(task.isReminderEnabled || false);
            
            if (task.reminderTime) {
                const [h, m] = task.reminderTime.split(':');
                const d = new Date();
                d.setHours(parseInt(h), parseInt(m), 0, 0);
                setReminderTime(d);
            } else {
                const d = new Date();
                d.setHours(activeTab === 'morning' ? 8 : 20, 0, 0, 0);
                setReminderTime(d);
            }
        } else {
            setEditingTask(null);
            setTaskName('');
            setTaskDesc('');
            setSelectedDays(DAYS_OF_WEEK);
            setReminderEnabled(false);
            const d = new Date();
            d.setHours(activeTab === 'morning' ? 8 : 20, 0, 0, 0);
            setReminderTime(d);
        }
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setShowTimePicker(false);
        setEditingTask(null);
        setTaskName('');
        setTaskDesc('');
        setIsSaving(false);
    };

    const scheduleNotification = async (task: string, time: Date, days: string[]) => {
        try {
            if (Platform.OS === 'web' || !Notifications || !reminderEnabled) return;
            
            const triggerHours = time.getHours();
            const triggerMinutes = time.getMinutes();
            const dayMap: any = { 'Sun': 1, 'Mon': 2, 'Tue': 3, 'Wed': 4, 'Thu': 5, 'Fri': 6, 'Sat': 7 };

            for (const day of days) {
                const weekday = dayMap[day];
                if (!weekday) continue;
                await Notifications.scheduleNotificationAsync({
                    content: { title: "Skin Routine", body: `Time: ${task}` },
                    trigger: { weekday: weekday, hour: triggerHours, minute: triggerMinutes, repeats: true } as any
                });
            }
        } catch (error) {
            console.error('Notification Schedule Error:', error);
        }
    };

    const handleSaveTask = async () => {
        if (!taskName.trim()) {
            Alert.alert('Required', 'Please enter a step name');
            return;
        }

        try {
            setIsSaving(true);
            Keyboard.dismiss();

            const h = reminderTime.getHours().toString().padStart(2, '0');
            const m = reminderTime.getMinutes().toString().padStart(2, '0');
            const timeStr = `${h}:${m}`;
            
            const taskData = {
                task: taskName.trim(),
                description: taskDesc.trim(),
                days: selectedDays,
                reminderTime: timeStr,
                isReminderEnabled: reminderEnabled
            };

            let result;
            if (editingTask) {
                result = await api.updateRoutineTask(activeTab, editingTask._id, taskData);
            } else {
                result = await api.addTaskToRoutine(activeTab, taskData);
            }
            
            if (result) {
                setRoutine(result);
                if (reminderEnabled && Platform.OS !== 'web') {
                    scheduleNotification(taskName, reminderTime, selectedDays).catch(err => console.error('Schedule Error:', err));
                }
                closeModal();
                Alert.alert('Success', 'Step saved!');
            }
        } catch (error: any) {
            console.error('Save Error:', error);
            Alert.alert('Error', error.message || 'Failed to save step');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTask = (id: string) => {
        Alert.alert('Delete', 'Remove this step?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                    const res = await api.deleteRoutineTask(activeTab, id);
                    if (res) setRoutine(res);
                } catch (e) {
                    Alert.alert('Error', 'Failed to delete task');
                }
            }}
        ]);
    };

    const toggleDay = (day: string) => {
        setSelectedDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    if (loading) {
        return <SafeAreaView className="flex-1 bg-white justify-center items-center"><ActivityIndicator size="large" color="#A855F7" /></SafeAreaView>;
    }

    const currentDayIdx = new Date().getDay();
    const currentDay = DAYS_OF_WEEK[currentDayIdx === 0 ? 6 : currentDayIdx - 1];
    const tasks = activeTab === 'morning' ? routine?.morningRoutine : routine?.eveningRoutine;
    const todayTasks = tasks?.filter((t: any) => !t.days || t.days.includes(currentDay)) || [];
    const doneCount = todayTasks.filter((t: any) => t.isCompleted).length;
    const totalToday = todayTasks.length;
    const prog = totalToday > 0 ? (doneCount / totalToday) * 100 : 0;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}><Text className="text-purple-600 font-bold">Back</Text></TouchableOpacity>
                <View className="items-center">
                    <Text className="text-lg font-bold">Skin Routine</Text>
                    <Text className="text-[8px] text-gray-300">v1.2</Text>
                </View>
                <TouchableOpacity onPress={handleReset} disabled={isRefreshing}>
                    {isRefreshing ? <ActivityIndicator size="small" color="#A855F7" /> : <RefreshCw size={20} color="#6B7280" />}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <View className="bg-purple-600 rounded-3xl p-6 shadow-md mb-6">
                    <Text className="text-purple-100 text-sm mb-1">Daily Progress</Text>
                    <Text className="text-white text-3xl font-bold mb-4">{doneCount}/{totalToday} Steps</Text>
                    <View className="h-2 bg-purple-400/30 rounded-full overflow-hidden">
                        <View className="h-full bg-white" style={{ width: `${prog}%` }} />
                    </View>
                </View>

                {/* Tabs */}
                <View className="flex-row bg-gray-100 rounded-2xl p-1 mb-6">
                    {(['morning', 'evening'] as const).map(t => (
                        <TouchableOpacity key={t} onPress={() => setActiveTab(t)} className={`flex-1 py-3 rounded-xl items-center ${activeTab === t ? 'bg-white shadow-sm' : ''}`}>
                            <Text className={`font-bold capitalize ${activeTab === t ? 'text-gray-900' : 'text-gray-500'}`}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold">Current Routine</Text>
                    <TouchableOpacity onPress={() => openModal()} className="bg-purple-100 p-2 rounded-full"><Plus size={20} color="#7E22CE" /></TouchableOpacity>
                </View>

                {/* List */}
                {tasks?.length > 0 ? tasks.map((t: any) => (
                    <TouchableOpacity key={t._id} onPress={() => handleToggleTask(t._id)} className={`flex-row items-center bg-gray-50 p-4 rounded-2xl mb-3 border ${t.isCompleted ? 'border-purple-100 bg-purple-50' : 'border-gray-50'}`}>
                        <View className="flex-1">
                            <Text className={`font-bold text-base ${t.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.task}</Text>
                            <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>{t.description}</Text>
                            <View className="flex-row gap-1">
                                {DAYS_OF_WEEK.map(d => (
                                    <View key={d} className={`px-1.5 py-0.5 rounded ${t.days?.includes(d) ? 'bg-purple-100' : 'bg-gray-200'}`}>
                                        <Text className={`text-[8px] font-bold ${t.days?.includes(d) ? 'text-purple-700' : 'text-gray-400'}`}>{d[0]}</Text>
                                    </View>
                                ))}
                                {t.reminderTime && <Text className="text-[10px] text-purple-600 font-bold ml-2">{t.reminderTime}</Text>}
                            </View>
                        </View>
                        <View className="flex-row items-center gap-2">
                             <TouchableOpacity onPress={() => openModal(t)} className="p-2"><Edit2 size={16} color="#9CA3AF" /></TouchableOpacity>
                             <TouchableOpacity onPress={() => handleDeleteTask(t._id)} className="p-2"><Trash2 size={16} color="#F87171" /></TouchableOpacity>
                             {t.isCompleted ? <CheckCircle2 size={24} color="#A855F7" /> : <Circle size={24} color="#D1D5DB" />}
                        </View>
                    </TouchableOpacity>
                )) : (
                    <View className="py-10 items-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                        <Text className="text-gray-400">No steps added yet</Text>
                    </View>
                )}
                <View className="h-10" />
            </ScrollView>

            <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={closeModal}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/40">
                    <TouchableOpacity className="flex-1" activeOpacity={1} onPress={Keyboard.dismiss} />
                    <View className="bg-white rounded-t-[40px] p-8">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold">{editingTask ? 'Edit Step' : 'New Routine Step'}</Text>
                            <TouchableOpacity onPress={closeModal} className="p-2 bg-gray-50 rounded-full"><X size={20} color="#666" /></TouchableOpacity>
                        </View>

                        <TextInput className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100" placeholder="Step Name (e.g., Use SPF)" value={taskName} onChangeText={setTaskName} />
                        <TextInput className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100" placeholder="Instructions/Description" value={taskDesc} onChangeText={setTaskDesc} multiline />

                        <Text className="font-bold mb-3">Repeat On</Text>
                        <View className="flex-row justify-between mb-6">
                            {DAYS_OF_WEEK.map(d => (
                                <TouchableOpacity key={d} onPress={() => toggleDay(d)} className={`w-9 h-9 items-center justify-center rounded-lg ${selectedDays.includes(d) ? 'bg-purple-600' : 'bg-gray-100'}`}>
                                    <Text className={`text-[10px] font-bold ${selectedDays.includes(d) ? 'text-white' : 'text-gray-500'}`}>{d[0]}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                            <Text className="font-bold">Reminders</Text>
                            <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: '#EEE', true: '#C084FC' }} />
                        </View>

                        {reminderEnabled && (
                            <TouchableOpacity onPress={() => setShowTimePicker(true)} className="bg-purple-50 p-4 rounded-xl flex-row justify-between mb-4 border border-purple-100">
                                <Text className="text-purple-700 font-bold">Select Time</Text>
                                <Text className="text-purple-700 font-bold">{reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </TouchableOpacity>
                        )}

                        {showTimePicker && (
                            <View className="mb-4">
                                <DateTimePicker
                                    value={reminderTime}
                                    mode="time"
                                    is24Hour={false}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(e, d) => {
                                        if (Platform.OS === 'android') setShowTimePicker(false);
                                        if (d) setReminderTime(d);
                                    }}
                                />
                                {Platform.OS === 'ios' && <TouchableOpacity onPress={() => setShowTimePicker(false)} className="items-center py-2"><Text className="text-purple-600 font-bold">Done</Text></TouchableOpacity>}
                            </View>
                        )}

                        <TouchableOpacity onPress={handleSaveTask} disabled={isSaving} className={`py-4 rounded-2xl shadow-sm ${isSaving ? 'bg-purple-300' : 'bg-purple-600'}`}>
                            {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold text-lg">{editingTask ? 'Save Changes' : 'Create Step'}</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

// End of file
