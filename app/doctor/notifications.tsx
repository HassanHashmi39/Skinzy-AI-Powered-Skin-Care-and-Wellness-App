import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ArrowLeft, Bell, Calendar, CheckCircle, Clock, MessageCircle, UserPlus, Trash2 } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../../utils/api';

type DoctorNotificationsProps = {
  onBack: () => void;
};

type NotificationType = 'appointment' | 'message' | 'patient' | 'reminder' | 'success' | 'cancellation' | 'product';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds || 0) + " seconds ago";
}

export function DoctorNotifications({ onBack }: DoctorNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.getNotifications();
      if (response && response.notifications) {
        const mapped = response.notifications.map((n: any) => ({
          id: n._id,
          type: n.type,
          title: n.title,
          message: n.message,
          time: timeAgo(new Date(n.createdAt)),
          isRead: n.isRead,
        }));
        setNotifications(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar size={20} color="#9333ea" />;
      case 'message':
        return <MessageCircle size={20} color="#9333ea" />;
      case 'patient':
        return <UserPlus size={20} color="#9333ea" />;
      case 'reminder':
        return <Clock size={20} color="#9333ea" />;
      case 'success':
        return <CheckCircle size={20} color="#9333ea" />;
      case 'cancellation':
        return <Bell size={20} color="#dc2626" />;
      default:
        return <Bell size={20} color="#4b5563" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-purple-50';
      case 'message':
        return 'bg-purple-50';
      case 'patient':
        return 'bg-purple-50';
      case 'reminder':
        return 'bg-purple-50';
      case 'success':
        return 'bg-purple-50';
      case 'cancellation':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <TouchableOpacity
            onPress={onBack}
            className="flex-row items-center gap-2 mb-4"
          >
            <ArrowLeft size={20} color="#4b5563" />
            <Text className="text-gray-600 font-medium">Back to Dashboard</Text>
          </TouchableOpacity>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold mb-2">Notifications</Text>
              {unreadCount > 0 && (
                <Text className="text-purple-600">
                  You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </Text>
              )}
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} className="px-4 py-2 bg-purple-50 rounded-lg">
                <Text className="text-purple-600 font-medium">Mark all as read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notifications List */}
        <View className="gap-3">
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => !notification.isRead && markAsRead(notification.id)}
              activeOpacity={0.7}
              className={`bg-white rounded-2xl p-5 shadow-sm border ${!notification.isRead ? 'border-purple-200 bg-purple-50/10' : 'border-transparent'
                }`}
            >
              <View className="flex-row items-start gap-4">
                <View className={`w-12 h-12 ${getBgColor(notification.type)} rounded-full items-center justify-center`}>
                  {getIcon(notification.type)}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-start justify-between mb-1">
                    <Text className="font-bold text-gray-900 flex-1 mr-2">{notification.title}</Text>
                    {!notification.isRead && (
                      <View className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    )}
                  </View>
                  <Text className="text-gray-600 mb-2">{notification.message}</Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400 text-xs">{notification.time}</Text>
                    <TouchableOpacity onPress={() => handleDelete(notification.id)}>
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State */}
        {notifications.length === 0 && (
          <View className="bg-white rounded-3xl p-12 items-center shadow-sm">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Bell size={40} color="#9ca3af" />
            </View>
            <Text className="text-lg font-bold mb-2">No notifications yet</Text>
            <Text className="text-gray-600 text-center">
              When you receive new notifications, they will appear here
            </Text>
          </View>
        )}

        <View className="h-8" />
      </View>
    </ScrollView>
  );
}

export default function DoctorNotificationsPage() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <DoctorNotifications onBack={() => router.back()} />
        </SafeAreaView>
    );
}
