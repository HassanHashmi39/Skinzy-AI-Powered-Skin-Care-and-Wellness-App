import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Activity, ArrowLeft, Calendar, FileText, Mail, Phone, Send, User, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as api from '../../utils/api';

type PatientDetailProps = {
  appointmentId: string;
  onBack: () => void;
  onOpenChat?: () => void;
};

export function PatientDetail({ appointmentId, onBack, onOpenChat }: PatientDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'prescription' | 'routine'>('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [prescription, setPrescription] = useState('');
  const [sendingPrescription, setSendingPrescription] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [appointmentId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await api.getPatientDetailsForDoctor(appointmentId);
      setData(response);
      if (response.appointment && response.appointment.prescription) {
        setPrescription(response.appointment.prescription);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setLoading(false);
    }
  };

  const handleSendPrescription = async () => {
    if (!prescription.trim()) {
      Alert.alert('Error', 'Please enter a prescription');
      return;
    }
    try {
      setSendingPrescription(true);
      await api.updatePrescription(appointmentId, prescription);
      if (Platform.OS === 'web') {
        window.alert('Prescription updated successfully');
      } else {
        Alert.alert('Success', 'Prescription updated successfully');
      }
      setSendingPrescription(false);
    } catch (error) {
      console.error('Failed to update prescription:', error);
      setSendingPrescription(false);
      Alert.alert('Error', 'Failed to update prescription');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  if (!data || !data.patient) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-gray-500 mb-4">Patient details not found</Text>
        <TouchableOpacity onPress={onBack} className="bg-purple-600 px-6 py-2 rounded-lg">
          <Text className="text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { patient, medicalHistory, aiAnalyses, routine } = data;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={onBack}
            className="flex-row items-center gap-2 mb-4"
          >
            <ArrowLeft size={20} color="#4b5563" />
            <Text className="text-gray-600 font-medium ml-2">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Patient Info Card */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <View className="flex-col md:flex-row gap-6">
            <View className="w-24 h-24 bg-purple-200 rounded-full overflow-hidden items-center justify-center self-center md:self-start">
              {patient.profileImage ? (
                  <Image source={{ uri: patient.profileImage }} className="w-full h-full" />
              ) : (
                <Text className="text-4xl text-purple-700 font-bold">{patient.name?.charAt(0) || 'P'}</Text>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-2xl font-bold mb-2 text-center md:text-left">{patient.name || 'Anonymous'}</Text>
              <View className="flex-row flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <View className="flex-row items-center gap-3 w-full md:w-[48%]">
                  <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
                    <User size={20} color="#9333ea" />
                  </View>
                  <View>
                    <Text className="text-gray-600">Age & Gender</Text>
                    <Text className="text-gray-900 font-medium">{patient.age || 'N/A'} yrs, {patient.gender || 'N/A'}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3 w-full md:w-[48%]">
                  <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
                    <Phone size={20} color="#9333ea" />
                  </View>
                  <View>
                    <Text className="text-gray-600">Phone</Text>
                    <Text className="text-gray-900 font-medium">{patient.phone || 'N/A'}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3 w-full md:w-[48%]">
                  <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
                    <Mail size={20} color="#9333ea" />
                  </View>
                  <View>
                    <Text className="text-gray-600">Email</Text>
                    <Text className="text-gray-900 font-medium">{patient.email || 'N/A'}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3 w-full md:w-[48%]">
                  <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
                    <Calendar size={20} color="#9333ea" />
                  </View>
                  <View>
                    <Text className="text-gray-600">Joined</Text>
                    <Text className="text-gray-900 font-medium">{patient.joinDate || 'Recently'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white rounded-2xl p-2 mb-6 shadow-sm flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-xl mr-2 ${activeTab === 'overview' ? 'bg-purple-500' : 'bg-white'}`}
          >
            <Text className={`font-medium ${activeTab === 'overview' ? 'text-white' : 'text-gray-700'}`}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('analysis')}
            className={`px-6 py-3 rounded-xl mr-2 ${activeTab === 'analysis' ? 'bg-purple-500' : 'bg-white'}`}
          >
            <Text className={`font-medium ${activeTab === 'analysis' ? 'text-white' : 'text-gray-700'}`}>AI Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('prescription')}
            className={`px-6 py-3 rounded-xl mr-2 ${activeTab === 'prescription' ? 'bg-purple-500' : 'bg-white'}`}
          >
            <Text className={`font-medium ${activeTab === 'prescription' ? 'text-white' : 'text-gray-700'}`}>Prescription</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('routine')}
            className={`px-6 py-3 rounded-xl ${activeTab === 'routine' ? 'bg-purple-500' : 'bg-white'}`}
          >
            <Text className={`font-medium ${activeTab === 'routine' ? 'text-white' : 'text-gray-700'}`}>Routine</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View className="flex-col md:flex-row gap-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm flex-1">
              <Text className="text-lg font-bold mb-4">Medical Profile</Text>
              <View className="gap-3">
                <View className="p-4 bg-gray-50 rounded-xl">
                  <Text className="text-gray-600 mb-1">Skin Type</Text>
                  <Text className="text-gray-900 font-medium">{patient.skinType || 'Not specified'}</Text>
                </View>
                <View className="p-4 bg-gray-50 rounded-xl">
                  <Text className="text-gray-600 mb-1">Main Concern</Text>
                  <Text className="text-gray-900 font-medium">{patient.mainConcerns?.join(', ') || 'General Checkup'}</Text>
                </View>
                <View className="p-4 bg-gray-50 rounded-xl">
                  <Text className="text-gray-600 mb-1">Allergies</Text>
                  <Text className="text-gray-900 font-medium">{patient.allergies || 'None reported'}</Text>
                </View>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-6 shadow-sm flex-1">
              <Text className="text-lg font-bold mb-4">Medical History Form</Text>
              {medicalHistory ? (
                  <View className="gap-2">
                    {medicalHistory.diagnosis ? (
                      <HistoryItem icon={<Activity size={16} color="#4B5563" />} label="Diagnosis" value={medicalHistory.diagnosis} />
                    ) : (
                      <HistoryItem icon={<Activity size={16} color="#4B5563" />} label="Family History" value={medicalHistory.hasFamilyHistory ? medicalHistory.familyHistoryDetails || 'Yes' : 'No family history'} />
                    )}
                    {medicalHistory.medications ? (
                      <HistoryItem icon={<FileText size={16} color="#4B5563" />} label="Medications" value={medicalHistory.medications} />
                    ) : (
                      <HistoryItem icon={<FileText size={16} color="#4B5563" />} label="Allergies" value={medicalHistory.hasAllergies ? medicalHistory.allergyDetails || 'Yes' : 'No known allergies'} />
                    )}
                    <HistoryItem icon={<Calendar size={16} color="#4B5563" />} label="Last Visit/Update" value={medicalHistory.lastVisit ? new Date(medicalHistory.lastVisit).toLocaleDateString() : new Date(medicalHistory.updatedAt || medicalHistory.createdAt).toLocaleDateString()} />
                  </View>
              ) : (
                  <Text className="text-gray-500 italic">No medical history form completed by patient.</Text>
              )}
            </View>
          </View>
        )}


        {activeTab === 'analysis' && (
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-bold mb-6">Recent and All AI Skin Analyses</Text>
            {aiAnalyses && aiAnalyses.length > 0 ? (
                aiAnalyses.map((analysis: any, index: number) => (
                    <View key={analysis._id} className="mb-6 p-4 border border-gray-100 rounded-2xl bg-gray-50">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="font-bold text-gray-700">Scan #{aiAnalyses.length - index}</Text>
                            <Text className="text-xs text-gray-500">{new Date(analysis.createdAt).toLocaleString()}</Text>
                        </View>
                        <View className="flex-row gap-4 mb-4">
                            {analysis.imageUrl && (
                                <Image source={{ uri: analysis.imageUrl }} className="w-24 h-24 rounded-xl" />
                            )}
                            <View className="flex-1">
                                <Text className="font-medium text-purple-700 mb-2">Results:</Text>
                                {Object.entries(analysis.results || {}).map(([key, val]: [string, any]) => (
                                    <View key={key} className="flex-row justify-between mb-1">
                                        <Text className="text-gray-600 capitalize text-xs">{key}</Text>
                                        <Text className="text-gray-900 font-bold text-xs">{typeof val === 'number' ? `${val}%` : val.toString()}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                ))
            ) : (
              <View className="py-12 items-center">
                <Text className="text-gray-500">No AI Skin Analysis results found.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'prescription' && (
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-bold mb-6">Patient Prescription</Text>
            <View>
                <Text className="text-gray-700 mb-2 font-medium">Doctor's Prescription & Instructions</Text>
                <TextInput
                  value={prescription}
                  onChangeText={setPrescription}
                  placeholder="Enter diagnosis, medications, dosage and instructions..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white min-h-[250px]"
                  multiline
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  onPress={handleSendPrescription}
                  disabled={sendingPrescription}
                  className={`mt-6 flex-row items-center justify-center gap-2 px-6 py-4 bg-purple-600 rounded-xl ${sendingPrescription ? 'opacity-70' : ''}`}
                >
                  {sendingPrescription ? <ActivityIndicator size="small" color="white" /> : <Send size={20} color="white" />}
                  <Text className="text-white font-bold">Update Prescription</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'routine' && (
           <View className="bg-white rounded-2xl p-6 shadow-sm">
           <Text className="text-lg font-bold mb-6">Patient Daily Routine</Text>
           {routine ? (
               <View>
                   <Text className="font-bold text-purple-700 mb-3">Morning Routine</Text>
                   {routine.morningRoutine?.length > 0 ? routine.morningRoutine.map((item: any, idx: number) => (
                       <View key={idx} className="p-3 bg-blue-50 rounded-xl mb-2 flex-row justify-between items-center">
                           <Text className="font-medium text-gray-800">{item.task}</Text>
                           <Text className="text-xs text-gray-500">{item.isCompleted ? 'Completed' : 'Pending'}</Text>
                       </View>
                   )) : <Text className="text-gray-400 italic mb-4">No morning tasks</Text>}

                   <Text className="font-bold text-purple-700 mt-4 mb-3">Evening Routine</Text>
                   {routine.eveningRoutine?.length > 0 ? routine.eveningRoutine.map((item: any, idx: number) => (
                       <View key={idx} className="p-3 bg-purple-50 rounded-xl mb-2 flex-row justify-between items-center">
                           <Text className="font-medium text-gray-800">{item.task}</Text>
                           <Text className="text-xs text-gray-500">{item.isCompleted ? 'Completed' : 'Pending'}</Text>
                       </View>
                   )) : <Text className="text-gray-400 italic">No evening tasks</Text>}
               </View>
           ) : (
             <Text className="text-gray-500">Patient has not set up a routine yet.</Text>
           )}
         </View>
        )}

        <View className="h-10" />
      </View>
    </ScrollView>
  );
}

function HistoryItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <View className="flex-row items-center gap-3 p-3 bg-gray-50 rounded-xl">
            {icon}
            <View>
                <Text className="text-xs text-gray-500">{label}</Text>
                <Text className="text-sm font-medium text-gray-900">{value}</Text>
            </View>
        </View>
    );
}

export default function PatientDetailPage() {
    const router = useRouter();
    // This is just a wrapper for when it's used as a standalone page, 
    // usually it's used as a component within DoctorDashboard
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4">
                <Text>Please select a patient from the dashboard.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 p-3 bg-purple-600 rounded-lg self-start">
                    <Text className="text-white">Back</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
