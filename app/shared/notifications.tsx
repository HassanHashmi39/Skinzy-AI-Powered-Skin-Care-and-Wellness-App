import { useRouter } from 'expo-router';
import { SafeAreaView, Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native';
import { Bell, Calendar, Check, Clock, MessageCircle, ShoppingBag, Trash2, X } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../../utils/api';

export type Page = 'landing' | 'analysis' | 'results' | 'products' | 'routine' | 'appointments' | 'remedies' | 'chat' | 'history' | 'notifications' | 'profile' | 'feedback';

type NotificationsProps = {
  onNavigate: (page: Page) => void;
};

type NotificationType = 'appointment' | 'message' | 'reminder' | 'product' | 'cancellation';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
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

function Notifications({ onNavigate }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

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
        const mappedNotifications = response.notifications.map((n: any) => mapNotification(n));
        setNotifications(mappedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapNotification = (n: any): Notification => {
    let icon, iconColor, bgColor;

    switch (n.type) {
      case 'appointment':
        icon = <Calendar size={20} />;
        iconColor = 'text-green-600';
        bgColor = 'bg-green-50';
        break;
      case 'message':
        icon = <MessageCircle size={20} />;
        iconColor = 'text-purple-600';
        bgColor = 'bg-purple-50';
        break;
      case 'reminder':
        icon = <Clock size={20} />;
        iconColor = 'text-blue-600';
        bgColor = 'bg-blue-50';
        break;
      case 'product':
        icon = <ShoppingBag size={20} />;
        iconColor = 'text-pink-600';
        bgColor = 'bg-pink-50';
        break;
      case 'cancellation':
        icon = <X size={20} />;
        iconColor = 'text-red-600';
        bgColor = 'bg-red-50';
        break;
      default:
        icon = <Bell size={20} />;
        iconColor = 'text-gray-600';
        bgColor = 'bg-gray-50';
    }

    return {
      id: n._id,
      type: n.type as NotificationType,
      title: n.title,
      message: n.message,
      time: timeAgo(new Date(n.createdAt)),
      isRead: n.isRead,
      icon,
      iconColor,
      bgColor,
    };
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#9333ea" />
        <Text className="mt-4 text-gray-600">Loading notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 py-8 px-4">
      <View className="max-w-4xl mx-auto">
        {/* Header */}
        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-purple-600" />
            <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
          </View>
          <Text className="text-gray-600">
            Stay updated with your appointments, messages, and reminders
          </Text>
        </View>

        {/* Actions Bar */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row flex-wrap items-center justify-between gap-4">
            {/* Filter Tabs */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setFilter('all')}
                className={`px-4 py-2 rounded-full ${filter === 'all'
                    ? 'bg-purple-600'
                    : 'bg-gray-100'
                  }`}
              >
                <Text className={filter === 'all' ? 'text-white font-medium' : 'text-gray-700'}>
                  All ({notifications.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter('unread')}
                className={`px-4 py-2 rounded-full ${filter === 'unread'
                    ? 'bg-purple-600'
                    : 'bg-gray-100'
                  }`}
              >
                <Text className={filter === 'unread' ? 'text-white font-medium' : 'text-gray-700'}>
                  Unread ({unreadCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2">
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={markAllAsRead}
                  className="px-4 py-2"
                >
                  <Text className="text-purple-600 font-medium">Mark all as read</Text>
                </TouchableOpacity>
              )}
              {notifications.length > 0 && (
                <TouchableOpacity
                  onPress={clearAll}
                  className="px-4 py-2"
                >
                  <Text className="text-red-600 font-medium">Clear all</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <View className="bg-white rounded-2xl p-12 items-center justify-center shadow-sm border border-gray-100">
            <Bell className="w-16 h-16 text-gray-300 mb-4" />
            <Text className="text-lg font-semibold text-gray-900 mb-2">No Notifications</Text>
            <Text className="text-gray-600 text-center">
              {filter === 'unread'
                ? 'You\'re all caught up! No unread notifications.'
                : 'You don\'t have any notifications yet.'}
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={handleDeleteNotification}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

type NotificationCardProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
};

function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationCardProps) {
  return (
    <View
      className={`bg-white rounded-2xl p-5 shadow-sm border ${notification.isRead ? 'border-gray-100' : 'border-purple-200 bg-purple-50/30'
        }`}
    >
      <View className="flex-row gap-4">
        {/* Icon */}
        <View className={`w-12 h-12 ${notification.bgColor} rounded-full items-center justify-center ${notification.iconColor}`}>
          {notification.icon}
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2 mb-1">
            <Text className="text-base font-bold text-gray-900 flex-1">{notification.title}</Text>
            {!notification.isRead && (
              <View className="w-2.5 h-2.5 bg-purple-500 rounded-full mt-1.5"></View>
            )}
          </View>
          <Text className="text-gray-600 mb-2">{notification.message}</Text>
          <Text className="text-xs text-gray-400">{notification.time}</Text>
        </View>

        {/* Actions */}
        <View className="gap-2">
          {!notification.isRead && (
            <TouchableOpacity
              onPress={() => onMarkAsRead(notification.id)}
              className="p-2 bg-purple-50 rounded-lg"
            >
              <Check className="w-5 h-5 text-purple-600" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onDelete(notification.id)}
            className="p-2 bg-red-50 rounded-lg"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function NotificationsPage() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Notifications onNavigate={(page: Page) => router.push(`/${page}` as any)} />
        </SafeAreaView>
    );
}
