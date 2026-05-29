import React, { useEffect, useState } from 'react';
import { Animated, Text, View, Platform } from 'react-native';
import { CheckCircle, AlertCircle } from 'lucide-react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  onHide: () => void;
  duration?: number;
}

export default function Toast({ visible, message, type, onHide, duration = 3000 }: ToastProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          },
        ],
        position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
        top: Platform.OS === 'web' ? 24 : 60,
        left: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 600,
        alignSelf: 'center',
      }}
      className={`flex-row items-center p-4 rounded-2xl shadow-lg border ${
        type === 'success' ? 'bg-green-50 border-green-200 shadow-green-100' : 'bg-red-50 border-red-200 shadow-red-100'
      }`}
    >
      <View className="mr-3">
        {type === 'success' ? (
          <CheckCircle size={24} color="#16a34a" />
        ) : (
          <AlertCircle size={24} color="#dc2626" />
        )}
      </View>
      <Text
        className={`flex-1 font-bold ${
          type === 'success' ? 'text-green-800' : 'text-red-800'
        }`}
      >
        {message}
      </Text>
    </Animated.View>
  );
}
