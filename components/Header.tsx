import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Sparkles, Menu, X, Home, Camera, User, Calendar, MessageSquare } from 'lucide-react-native';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simple context awareness based on route
  const isDoctor = pathname.includes('/doctor');
  const isPatient = pathname.includes('/patient');
  
  const NavItem = ({ title, route, icon: Icon, primary = false }: any) => {
    const isActive = pathname === route;
    return (
      <TouchableOpacity
        onPress={() => {
          setMobileMenuOpen(false);
          router.push(route as any);
        }}
        className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${
          primary ? 'bg-green-500 hover:bg-green-600' : isActive ? 'bg-green-50' : 'bg-transparent hover:bg-gray-50'
        }`}
      >
        {Icon && <Icon size={18} color={primary ? 'white' : isActive ? '#10b981' : '#4B5563'} />}
        <Text className={`font-bold ${primary ? 'text-white' : isActive ? 'text-green-600' : 'text-gray-700'}`}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="z-50 bg-white/95 border-b border-gray-100 shadow-sm" style={{ width: '100%' }}>
      <View className="flex-row justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <TouchableOpacity 
          className="flex-row items-center gap-2"
          onPress={() => { setMobileMenuOpen(false); router.push('/'); }}
        >
          <View className="w-10 h-10 bg-green-500 rounded-xl items-center justify-center shadow-sm shadow-green-200">
            <Sparkles size={24} color="white" />
          </View>
          <Text className="text-2xl font-black text-gray-900 tracking-tighter">SKINZY</Text>
        </TouchableOpacity>

        {/* Desktop Nav */}
        {isDesktop ? (
          <View className="flex-row items-center gap-2">
            <NavItem title="Home" route="/" icon={Home} />
            {isDoctor ? (
              <>
                <NavItem title="Dashboard" route="/doctor/dashboard" icon={User} />
                <NavItem title="Chat" route="/doctor/chat" icon={MessageSquare} />
              </>
            ) : isPatient ? (
              <>
                <NavItem title="Dashboard" route="/patient/dashboard" icon={User} />
                <NavItem title="Appointments" route="/patient/appointment-booking" icon={Calendar} />
                <NavItem title="Products" route="/patient/product-recommendations" />
                <NavItem title="Chat" route="/patient/chat" icon={MessageSquare} />
                <NavItem title="Scan Skin" route="/patient/skin-analysis" icon={Camera} primary />
              </>
            ) : (
                <>
                    <NavItem title="Login" route="/shared/login" />
                    <NavItem title="Scan Skin" route="/patient/skin-analysis" icon={Camera} primary />
                </>
            )}
          </View>
        ) : (
          <View className="flex-row items-center gap-3">
            {!isDoctor && (
              <TouchableOpacity
                onPress={() => router.push('/patient/skin-analysis')}
                className="px-4 py-2 bg-green-500 rounded-full shadow-sm shadow-green-200"
              >
                <Text className="font-bold text-white text-xs">Scan</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full"
            >
              {mobileMenuOpen ? <X size={24} color="#1F2937" /> : <Menu size={24} color="#1F2937" />}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mobile Menu */}
      {mobileMenuOpen && !isDesktop && (
        <View className="absolute top-[72px] left-0 w-full bg-white border-b border-gray-100 p-4 shadow-lg z-50">
          <View className="gap-2">
            <NavItem title="Home" route="/" icon={Home} />
            {isDoctor ? (
              <>
                <NavItem title="Dashboard" route="/doctor/dashboard" icon={User} />
                <NavItem title="Chat" route="/doctor/chat" icon={MessageSquare} />
              </>
            ) : isPatient ? (
              <>
                <NavItem title="Dashboard" route="/patient/dashboard" icon={User} />
                <NavItem title="Appointments" route="/patient/appointment-booking" icon={Calendar} />
                <NavItem title="Products" route="/patient/product-recommendations" />
                <NavItem title="Chat" route="/patient/chat" icon={MessageSquare} />
                <View className="mt-2 pt-2 border-t border-gray-100">
                    <NavItem title="Scan Skin" route="/patient/skin-analysis" icon={Camera} primary />
                </View>
              </>
            ) : (
                <>
                    <NavItem title="Login" route="/shared/login" />
                    <NavItem title="Sign Up" route="/shared/user-type-selection" />
                    <View className="mt-2 pt-2 border-t border-gray-100">
                        <NavItem title="Scan Skin" route="/patient/skin-analysis" icon={Camera} primary />
                    </View>
                </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
