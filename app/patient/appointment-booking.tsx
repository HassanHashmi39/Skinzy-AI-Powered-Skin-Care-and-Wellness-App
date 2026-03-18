import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View, Image } from 'react-native';
import { ArrowLeft, Calendar, Check, MapPin, Star, Video, Clock } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as api from '../../utils/api';

type AppointmentBookingProps = {
  onNavigate: (page: string) => void;
};

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  experience?: string;
  rating?: number;
  reviews?: number;
  location?: string;
  consultationFee?: string;
  profileImage?: string;
  availability?: { day: string, isActive: boolean }[];
  hospital?: string;
};

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// TIME_SLOTS and AVAILABLE_DATES are now fetched dynamically from the backend for each doctor.

function AppointmentBooking({ onNavigate }: AppointmentBookingProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [consultationType, setConsultationType] = useState<'online' | 'in-person'>('online');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      setAvailableSlots([]); // Clear previous slots
      setSelectedDate('');
      setSelectedTime('');
      fetchSlots(selectedDoctor._id);
    }
  }, [selectedDoctor]);

  const fetchSlots = async (doctorId: string) => {
    try {
      setLoadingSlots(true);
      console.log('🔍 Fetching slots for doctorId:', doctorId);
      const response = await api.getDoctorSlots(doctorId);
      
      if (response && response.slots) {
        setAvailableSlots(response.slots);
      } else {
        setAvailableSlots([]);
      }
      setLoadingSlots(false);
    } catch (err: any) {
      console.error('❌ Error fetching slots:', err);
      Alert.alert('Error', 'Failed to fetch slots: ' + err.message);
      setLoadingSlots(false);
    }
  };

  const uniqueDates = Array.from(new Set(availableSlots.map(s => s.date))).filter(Boolean).sort().map(dateStr => {
    // Adding T00:00:00 ensures it's treated as a local date start, not UTC
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let label = '';
    if (dateStr === today) label = 'Today';
    else if (dateStr === tomorrowStr) label = 'Tomorrow';
    else label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return { label, value: dateStr };
  });

  const availableTimes = availableSlots
    .filter(s => s.date === selectedDate)
    .map(s => s.time);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.getDoctors();
      if (response && response.doctors) {
        setDoctors(response.doctors);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      Alert.alert('Error', 'Could not load doctors list. Please check your connection.');
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert('Incomplete Selection', 'Please select a doctor, a date, and a time slot before booking.');
      return;
    }

    try {
      setIsBooking(true);
      await api.createAppointment({
          doctorId: selectedDoctor._id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          reason: `Consultation (${consultationType})`
      });
      setBookingComplete(true);
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message || 'Something went wrong while booking.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
        <View className="flex-1 items-center justify-center bg-gray-50 p-4">
            <ActivityIndicator size="large" color="#9333ea" />
            <Text className="mt-4 text-gray-500">Loading dermatologists...</Text>
        </View>
    );
  }

  if (bookingComplete) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <View className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 items-center">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
            <Check size={40} color="#16a34a" />
          </View>
          <Text className="text-2xl font-bold mb-3 text-center">Appointment Booked!</Text>
          <Text className="text-gray-600 mb-6 text-center leading-6">
            Your {consultationType} consultation with {selectedDoctor?.name} is successfully requested. 
          </Text>
          <TouchableOpacity
            onPress={() => onNavigate('dashboard')}
            className="w-full px-6 py-4 bg-purple-500 rounded-full items-center"
          >
            <Text className="text-white font-bold">Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        <TouchableOpacity onPress={() => onNavigate('dashboard')} className="flex-row items-center gap-2 mb-8">
          <ArrowLeft size={20} color="#4b5563" />
          <Text className="text-gray-600 font-medium ml-2">Back to Dashboard</Text>
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold mb-3 text-gray-900">Book a Dermatologist</Text>
          <Text className="text-gray-600">Consult with certified dermatologists for personalized skin care advice</Text>
        </View>

        <View className="bg-white rounded-2xl p-2 mb-8 flex-row shadow-sm self-start">
          <TouchableOpacity
            onPress={() => setConsultationType('online')}
            className={`flex-row items-center gap-2 px-6 py-3 rounded-xl ${consultationType === 'online' ? 'bg-purple-500' : 'bg-white'}`}
          >
            <Video size={20} color={consultationType === 'online' ? 'white' : '#374151'} />
            <Text className={`font-medium ${consultationType === 'online' ? 'text-white' : 'text-gray-700'}`}>Online</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setConsultationType('in-person')}
            className={`flex-row items-center gap-2 px-6 py-3 rounded-xl ${consultationType === 'in-person' ? 'bg-purple-500' : 'bg-white'}`}
          >
            <MapPin size={20} color={consultationType === 'in-person' ? 'white' : '#374151'} />
            <Text className={`font-medium ${consultationType === 'in-person' ? 'text-white' : 'text-gray-700'}`}>In-Person</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-col lg:flex-row gap-8">
          <View className="flex-1 gap-4">
            <Text className="text-lg font-bold mb-4">Available Dermatologists</Text>
            {doctors.map((doctor) => (
              <View key={doctor._id}>
                <DoctorCard
                  doctor={doctor}
                  selected={selectedDoctor?._id === doctor._id}
                  onSelect={() => setSelectedDoctor(doctor)}
                />

                {selectedDoctor?._id === doctor._id && (
                  <View className="mt-4 bg-white rounded-2xl p-6 shadow-sm">
                    <Text className="text-lg font-bold mb-4">Select Date & Time</Text>
                    <View className="gap-6">
                      <View className="pb-4 border-b border-gray-200">
                        <Text className="text-gray-600 mb-1">Consulting with</Text>
                        <Text className="text-gray-900 font-bold">{selectedDoctor.name}</Text>
                        <Text className="text-purple-600 font-medium">PKR {selectedDoctor.consultationFee || '2500'}</Text>
                          
                          {selectedDoctor.availability && selectedDoctor.availability.length > 0 && (
                            <View className="mt-2 flex-row flex-wrap gap-1">
                                {selectedDoctor.availability
                                  .filter((item: any) => typeof item === 'string' || item.isActive)
                                  .sort((a: any, b: any) => {
                                      const dayA = typeof a === 'string' ? a : a.day;
                                      const dayB = typeof b === 'string' ? b : b.day;
                                      return DAY_ORDER.indexOf(dayA) - DAY_ORDER.indexOf(dayB);
                                  })
                                  .map((item: any, idx) => {
                                    const dayName = typeof item === 'string' ? item : (item.day || 'N/A');
                                    return (
                                        <View key={idx} className="bg-gray-100 px-2 py-0.5 rounded-md">
                                            <Text className="text-gray-600 text-[10px]">{dayName}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                          )}
                        </View>

                        <View>
                          <Text className="text-gray-700 mb-3 font-medium">Select Date</Text>
                          {loadingSlots ? (
                            <ActivityIndicator size="small" color="#9333ea" />
                          ) : uniqueDates && uniqueDates.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2">
                              {uniqueDates.map((dateObj) => (
                                <TouchableOpacity
                                  key={dateObj.value}
                                  onPress={() => {
                                      setSelectedDate(dateObj.value);
                                      setSelectedTime('');
                                  }}
                                  className={`px-4 py-2 rounded-lg border-2 ${selectedDate === dateObj.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                                >
                                  <Text className={`${selectedDate === dateObj.value ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>{dateObj.label}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ) : (
                            <View className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                               <Text className="text-orange-700 text-sm">
                                 No appointment slots are currently open for this doctor. Please check back later or try another specialist.
                               </Text>
                            </View>
                          )}
                        </View>
     
                      
                      {selectedDate && (
                        <View>
                          <Text className="text-gray-700 mb-3 font-medium">Select Time Slot</Text>
                          <View className="flex-row flex-wrap gap-2">
                            {availableTimes.map((time) => (
                              <TouchableOpacity
                                key={time}
                                onPress={() => setSelectedTime(time)}
                                className={`px-4 py-2 rounded-lg border-2 ${selectedTime === time ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                              >
                                <Text className={`${selectedTime === time ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>{time}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={handleBooking}
                        disabled={!selectedDate || !selectedTime || isBooking}
                        className={`w-full py-4 rounded-full items-center mt-4 ${selectedDate && selectedTime ? 'bg-purple-600' : 'bg-purple-300'}`}
                      >
                        {isBooking ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold text-lg">Confirm Appointment</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
        <View className="h-10" />
      </View>
    </ScrollView>
  );
}

function DoctorCard({
  doctor,
  selected,
  onSelect,
}: {
  doctor: Doctor;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`w-full bg-white rounded-2xl p-6 shadow-sm border ${selected ? 'border-2 border-purple-500' : 'border-gray-200'}`}
    >
      <View className="flex-row items-start gap-4">
        {/* Avatar */}
        <View className="w-16 h-16 bg-purple-200 rounded-full items-center justify-center overflow-hidden">
            {doctor.profileImage ? (
                <Image source={{ uri: doctor.profileImage }} className="w-full h-full" />
            ) : (
                <Text className="text-2xl text-purple-700 font-bold">{doctor.name?.charAt(0)}</Text>
            )}
        </View>

        <View className="flex-1">
          {/* Name & Specialization */}
          <Text className="text-lg font-bold mb-1 text-gray-900">{doctor.name}</Text>
          <Text className="text-purple-600 mb-2 font-medium">{doctor.specialization || 'Clinical Dermatologist'}</Text>

          {/* Rating & Experience */}
          <View className="flex-row items-center gap-4 mb-3">
            <View className="flex-row items-center gap-1">
              <Star size={16} fill="#facc15" color="#facc15" />
              <Text className="font-medium text-gray-900">{doctor.rating || 5.0}</Text>
              <Text className="text-gray-500 text-xs">({doctor.reviews || 0} reviews)</Text>
            </View>
            <Text className="text-gray-600 text-sm">{doctor.experience || '3+'} years exp.</Text>
          </View>

          {/* Location & Fee */}
          <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row gap-1 items-center flex-1">
                <Clock size={14} color="#6B7280" />
                <Text className="text-gray-500 text-[10px]" numberOfLines={1}>
                    {doctor.availability && doctor.availability.length > 0 
                        ? doctor.availability
                            .filter((a: any) => typeof a === 'string' || a.isActive)
                            .sort((a: any, b: any) => {
                                const dayA = typeof a === 'string' ? a : a.day;
                                const dayB = typeof b === 'string' ? b : b.day;
                                return DAY_ORDER.indexOf(dayA) - DAY_ORDER.indexOf(dayB);
                            })
                            .map((a: any) => (typeof a === 'string' ? a : a.day).slice(0,3)).join(', ')
                        : 'Mon - Sat'}
                </Text>
              </View>
            <Text className="text-purple-600 font-bold ml-2">PKR {doctor.consultationFee || '2500'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AppointmentBookingPage() {
    const router = useRouter();

    const handleNavigate = (page: string) => {
        if (page === 'dashboard') router.replace('/patient/dashboard');
        else router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <AppointmentBooking onNavigate={handleNavigate} />
        </SafeAreaView>
    );
}
