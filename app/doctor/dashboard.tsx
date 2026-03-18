import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Bell, Calendar, Clock, MessageCircle, Settings, Trash2, TrendingUp, User } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../../utils/api';
import { DoctorChat } from './chat';
import { DoctorNotifications } from './notifications';
import { DoctorSettings } from './settings';
import { PatientDetail } from './patient-detail';

type Appointment = {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    age?: number;
    gender?: string;
    skinType?: string;
    profileImage?: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  prescription?: string;
};

type Patient = {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  skinType?: string;
  lastVisit?: string;
  totalVisits?: number;
  mainConcern?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
};

function DoctorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'patients' | 'schedule' | 'settings'>('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const profile = await api.getCurrentUser();
      if (profile && profile.user) {
        setDoctorData(profile.user);
      }
      
      const apts = await api.getAppointments();
      if (apts && apts.appointments) {
        setAppointments(apts.appointments);
        
        // Derive unique patients from appointments
        const patientMap = new Map();
        apts.appointments.forEach((apt: Appointment) => {
          if (apt.patient && !patientMap.has(apt.patient._id)) {
            patientMap.set(apt.patient._id, {
              id: apt.patient._id,
              name: apt.patient.name || 'Anonymous',
              email: apt.patient.email || 'N/A',
              phone: apt.patient.phone,
              age: apt.patient.age,
              gender: apt.patient.gender,
              skinType: apt.patient.skinType,
              profileImage: apt.patient.profileImage
            });
          }
        });
        setPatients(Array.from(patientMap.values()));
      }

      // Fetch notifications
      const notifs = await api.getNotifications();
      if (notifs && notifs.notifications) {
        const unread = notifs.notifications.filter((n: any) => !n.isRead).length;
        setUnreadNotifications(unread);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setIsLoading(false);
    }
  };

  const doctorInfo = {
    name: doctorData?.name || 'Doctor',
    specialization: doctorData?.specialization || 'Clinical Dermatologist',
    experience: doctorData?.experience || '0',
    rating: doctorData?.rating || 5.0,
    reviews: doctorData?.reviews || 0,
    patients: doctorData?.totalPatientsServed || patients.length,
    consultationFee: doctorData?.consultationFee ? `PKR ${doctorData.consultationFee}` : 'PKR 0',
  };

  const handleAcceptAppointment = async (id: string) => {
    try {
      await api.updateAppointmentStatus(id, 'confirmed');
      setAppointments(appointments.map(apt =>
        apt._id === id ? { ...apt, status: 'confirmed' as const } : apt
      ));
      if (Platform.OS === 'web') {
        window.alert('Appointment confirmed');
      } else {
        Alert.alert('Success', 'Appointment confirmed');
      }
    } catch (error) {
      console.error('Failed to accept appointment:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    const confirmDelete = () => {
        // In a real app, we might call an API to cancel/delete
        // For now, let's just update status to cancelled locally and on server
        api.updateAppointmentStatus(id, 'cancelled').then(() => {
            setAppointments(appointments.filter(apt => apt._id !== id));
        }).catch(err => console.error(err));
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this appointment?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Cancel Appointment',
        'Are you sure you want to cancel this appointment?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  };

  const handleLogout = async () => {
    console.log('🔘 Doctor Logout clicked');
    await api.logout();
    router.replace('/');
  };

  if (isLoading && !doctorData) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#9333EA" />
      </SafeAreaView>
    );
  }

  const stats = {
    todayAppointments: appointments.filter(a => {
        // Simple string check or date comparison
        return a.appointmentDate.toLowerCase().includes('today') || 
               new Date(a.appointmentDate).toDateString() === new Date().toDateString();
    }).length,
    weeklyAppointments: appointments.length,
    newPatients: patients.length,
  };

  if (selectedAppointmentId) {
    return (
      <PatientDetail
        appointmentId={selectedAppointmentId}
        onBack={() => setSelectedAppointmentId(null)}
        onOpenChat={() => {
          setSelectedAppointmentId(null);
          setShowChat(true);
        }}
      />
    );
  }

  if (showChat) return <DoctorChat onBack={() => setShowChat(false)} />;
  if (showNotifications) return <DoctorNotifications onBack={() => setShowNotifications(false)} />;
  if (activeTab === 'settings') return <DoctorSettings doctorInfo={doctorInfo} onBack={() => setActiveTab('overview')} onLogout={handleLogout} />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-4 flex-1">
              <View className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center overflow-hidden">
                {doctorData?.profileImage ? (
                  <Image source={{ uri: doctorData.profileImage }} className="w-full h-full" />
                ) : (
                  <Text className="text-2xl text-purple-700 font-bold">{(doctorData?.name || doctorInfo.name).charAt(0)}</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{doctorInfo.name}</Text>
                <Text className="text-purple-600 font-medium">{doctorInfo.specialization}</Text>
                <Text className="text-gray-500 text-xs">{doctorInfo.experience} years experience</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => setShowChat(true)} className="p-3 bg-gray-50 rounded-lg">
                <MessageCircle color="#4B5563" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowNotifications(true)} className="p-3 bg-gray-50 rounded-lg relative">
                <Bell color="#4B5563" size={20} />
                {unreadNotifications > 0 && (
                  <View className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full items-center justify-center border border-white">
                    <Text className="text-white text-[10px] font-bold">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab('settings')} className="p-3 bg-gray-50 rounded-lg">
                <Settings color="#4B5563" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap gap-2 justify-between">
            <StatCard
              icon={<Calendar color="#2563EB" size={20} />}
              label="Today"
              value={stats.todayAppointments.toString()}
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={<TrendingUp color="#16A34A" size={20} />}
              label="Total"
              value={stats.weeklyAppointments.toString()}
              bgColor="bg-green-50"
            />
            <StatCard
              icon={<User color="#EA580C" size={20} />}
              label="Patients"
              value={doctorInfo.patients.toString()}
              bgColor="bg-orange-50"
            />
          </View>
        </View>

        {/* Tabs - Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6 py-1">
          {['overview', 'appointments', 'patients', 'schedule'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-xl mr-2 ${activeTab === tab ? 'bg-purple-600' : 'bg-white'}`}
            >
              <Text className={`font-medium ${activeTab === tab ? 'text-white' : 'text-gray-700'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View className="gap-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-lg font-bold mb-4">Today's Appointments</Text>
              {appointments.filter(apt => apt.appointmentDate.toLowerCase().includes('today')).map((appointment) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  onAccept={handleAcceptAppointment}
                  onDelete={handleDeleteAppointment}
                  onViewDetails={(id) => setSelectedAppointmentId(id)}
                />
              ))}
              {appointments.filter(apt => apt.appointmentDate.toLowerCase().includes('today')).length === 0 && (
                <Text className="text-gray-500 text-center py-4">No appointments today</Text>
              )}
            </View>

            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-lg font-bold mb-4">Pending Requests</Text>
              {appointments.filter(apt => apt.status === 'pending').map((appointment) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  onAccept={handleAcceptAppointment}
                  onDelete={handleDeleteAppointment}
                  onViewDetails={(id) => setSelectedAppointmentId(id)}
                />
              ))}
              {appointments.filter(apt => apt.status === 'pending').length === 0 && (
                <Text className="text-gray-500 text-center py-4">No pending requests</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'appointments' && (
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-bold mb-4">All Appointments</Text>
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                onAccept={handleAcceptAppointment}
                onDelete={handleDeleteAppointment}
                onViewDetails={(id) => setSelectedAppointmentId(id)}
              />
            ))}
            {appointments.length === 0 && (
                <Text className="text-gray-500 text-center py-4">No appointments found</Text>
            )}
          </View>
        )}

        {activeTab === 'patients' && (
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-bold mb-4">Patient Records</Text>
            {patients.map((patient) => (
              <View key={patient.id} className="p-4 bg-gray-50 rounded-xl mb-3 border border-gray-100">
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                    {patient.profileImage ? (
                        <Image source={{ uri: patient.profileImage }} className="w-full h-full" />
                    ) : (
                        <Text className="text-purple-700 font-bold">{patient.name?.charAt(0) || 'P'}</Text>
                    )}
                  </View>
                  <View>
                    <Text className="font-bold text-gray-900">{patient.name || 'Anonymous'}</Text>
                    <Text className="text-gray-500 text-xs">{patient.skinType || 'Patient'}</Text>
                  </View>
                </View>
                <Text className="text-gray-600 mb-2">Email: {patient.email || 'N/A'}</Text>
                <TouchableOpacity
                  onPress={() => {
                      // Find most recent appointment for this patient to show details
                      const lastApt = appointments.find(a => a.patient?._id === patient.id);
                      if (lastApt) setSelectedAppointmentId(lastApt._id);
                  }}
                  className="bg-purple-500 py-2 rounded-lg items-center"
                >
                  <Text className="text-white font-medium">View Patient History</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Stats Card at bottom of overview */}
        {activeTab === 'overview' && (
          <View className="mt-6 bg-purple-600 rounded-2xl p-6 mb-10">
            <Text className="text-white font-bold text-lg mb-4">Performance</Text>
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-purple-100">Consultations</Text>
                <Text className="text-white font-bold">{appointments.filter(a => a.status === 'completed').length}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-purple-100">Satisfaction</Text>
                <Text className="text-white font-bold">98%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Padding for bottom */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, bgColor }: { icon: React.ReactNode; label: string; value: string; bgColor: string }) {
  return (
    <View className={`${bgColor} rounded-xl p-3 flex-1 min-w-[30%]`}>
      <View className="flex-row items-center gap-2 mb-1">
        {icon}
      </View>
      <Text className="text-gray-600 text-xs">{label}</Text>
      <Text className="text-gray-900 font-bold text-lg">{value}</Text>
    </View>
  );
}

function AppointmentCard({
  appointment,
  onAccept,
  onDelete,
  onViewDetails
}: {
  appointment: Appointment;
  onAccept: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  if (!appointment.patient) return null;

  return (
    <View className="p-4 bg-gray-50 rounded-xl mb-3 border border-gray-100">
      <View className="flex-row justify-between mb-2">
        <View className="flex-row gap-3">
          <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center overflow-hidden">
            {appointment.patient.profileImage ? (
                <Image source={{ uri: appointment.patient.profileImage }} className="w-full h-full" />
            ) : (
                <Text className="text-purple-700 font-bold">{appointment.patient.name?.charAt(0) || 'P'}</Text>
            )}
          </View>
          <View>
            <Text className="font-bold text-gray-900">{appointment.patient.name || 'Anonymous'}</Text>
            <View className="flex-row items-center gap-1">
              <Clock size={12} color="#6B7280" />
              <Text className="text-gray-500 text-xs">{appointment.appointmentTime}</Text>
            </View>
          </View>
        </View>
        <View className={`px-2 py-1 rounded-full self-start ${appointment.status === 'confirmed' ? 'bg-green-100' :
          appointment.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
          }`}>
          <Text className={`text-xs ${appointment.status === 'confirmed' ? 'text-green-700' :
            appointment.status === 'pending' ? 'text-yellow-700' : 'text-gray-700'
            }`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text className="text-gray-600 text-sm mb-3" numberOfLines={1}>Reason: {appointment.reason}</Text>

      <View className="flex-row gap-2 mt-2">
        {appointment.status === 'pending' && (
          <TouchableOpacity
            onPress={() => onAccept(appointment._id)}
            className="flex-1 bg-green-500 py-2 rounded-lg items-center"
          >
            <Text className="text-white font-medium text-xs">Accept</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => onViewDetails(appointment._id)}
          className="flex-1 bg-blue-500 py-2 rounded-lg items-center"
        >
          <Text className="text-white font-medium text-xs">Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(appointment._id)}
          className="p-2 bg-red-100 rounded-lg items-center justify-center"
        >
          <Trash2 size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DoctorDashboardPage() {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <DoctorDashboard />
        </View>
    );
}
