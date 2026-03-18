import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar, Clock, Download, Eye, Filter, MessageCircle, Star, X, CheckCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as api from '../../utils/api';

type FeedbackFormProps = {
  doctorName: string;
  appointmentDate: string;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
};

function FeedbackForm({ doctorName, appointmentDate, onSubmit, onClose }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, comment);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold">Rate Your Experience</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <X size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>
          <View className="bg-purple-50 rounded-2xl p-4 mb-6">
            <Text className="text-gray-900 mb-1 font-bold">{doctorName}</Text>
            <Text className="text-gray-600 text-sm">Appointment: {appointmentDate}</Text>
          </View>
          <View className="mb-6 items-center">
            <Text className="text-gray-700 mb-3 font-medium">How was your experience?</Text>
            <View className="flex-row items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star size={40} fill={star <= rating ? "#facc15" : "transparent"} color={star <= rating ? "#facc15" : "#d1d5db"} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us about your experience..."
            multiline
            numberOfLines={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl min-h-[100px] bg-gray-50 mb-6"
          />
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-full items-center">
              <Text className="text-gray-700 font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} disabled={rating === 0} className={`flex-1 px-6 py-3 rounded-full items-center ${rating > 0 ? 'bg-purple-500' : 'bg-gray-300'}`}>
              <Text className="text-white font-bold">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type HistoryEntry = {
  _id: string;
  date: string;
  time: string;
  type: 'analysis' | 'appointment' | 'prescription';
  title: string;
  description: string;
  status: string;
  doctorName?: string;
  feedbackGiven?: boolean;
  appointmentId?: string;
  prescriptionText?: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'analysis' | 'appointment' | 'prescription'>((params.filter as any) || 'all');
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [analysisRes, appointmentRes] = await Promise.all([
        api.getAnalysisHistory(),
        api.getAppointments()
      ]);

      const history: HistoryEntry[] = [];

      // Process Analyses
      analysisRes.analyses?.forEach((a: any) => {
        history.push({
          _id: a._id,
          date: a.createdAt,
          time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'analysis',
          title: 'Skin Analysis',
          description: `Analysis revealed: ${Object.entries(a.results || {}).map(([k, v]) => `${k} (${v}%)`).join(', ')}`,
          status: 'Completed'
        });
      });

      // Process Appointments & Prescriptions
      appointmentRes.appointments?.forEach((apt: any) => {
        history.push({
          _id: apt._id,
          date: apt.appointmentDate,
          time: apt.appointmentTime,
          type: 'appointment',
          title: `Consultation with ${apt.doctor.name}`,
          description: apt.reason || 'General checkup',
          status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1),
          doctorName: apt.doctor.name,
          feedbackGiven: false // TODO: check if feedback exists
        });

        if (apt.prescription) {
            history.push({
                _id: `${apt._id}_prescription`,
                date: apt.updatedAt || apt.appointmentDate,
                time: apt.appointmentTime,
                type: 'prescription',
                title: 'Prescription Received',
                description: `Received from ${apt.doctor.name}: ${apt.prescription.substring(0, 50)}...`,
                status: 'Active',
                prescriptionText: apt.prescription,
                appointmentId: apt._id
            });
        }
      });

      // Sort by date desc
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistoryData(history);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching history:', err);
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (selectedEntry) {
      try {
          // api implementation needed if we want to save ratings
          Alert.alert('Feedback Submitted', `Thank you for your ${rating}-star feedback!`);
          setShowFeedbackForm(false);
          setSelectedEntry(null);
      } catch (e) {
          Alert.alert('Error', 'Failed to submit feedback');
      }
    }
  };

  const filteredHistory = filterType === 'all' ? historyData : historyData.filter(e => e.type === filterType);

  if (loading) {
      return (
          <SafeAreaView className="flex-1 bg-white justify-center items-center">
              <ActivityIndicator size="large" color="#9333EA" />
          </SafeAreaView>
      );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        <View className="mb-8">
          <Text className="text-3xl font-bold mb-2 text-gray-900">Medical History</Text>
          <Text className="text-gray-600">View your past skin analyses, appointments, and prescriptions</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row gap-2">
            {['all', 'analysis', 'appointment', 'prescription'].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setFilterType(t as any)}
                  className={`px-4 py-2 rounded-lg ${filterType === t ? 'bg-purple-500' : 'bg-white border border-gray-200'}`}
                >
                  <Text className={filterType === t ? 'text-white' : 'text-gray-700'}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View className="gap-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((entry) => (
              <View key={entry._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <View className="flex-row items-start gap-4">
                  <View className="flex-1">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-lg font-bold text-gray-900">{entry.title}</Text>
                        <View className={`px-2 py-1 rounded-full ${entry.type === 'analysis' ? 'bg-purple-100' : entry.type === 'appointment' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            <Text className={`text-[10px] font-bold ${entry.type === 'analysis' ? 'text-purple-700' : entry.type === 'appointment' ? 'text-blue-700' : 'text-green-700'}`}>{entry.type.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-4 mb-3">
                        <View className="flex-row items-center gap-1">
                            <Calendar size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-xs">{new Date(entry.date).toLocaleDateString()}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Clock size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-xs">{entry.time}</Text>
                        </View>
                    </View>
                    <Text className="text-gray-600 mb-4 leading-5">{entry.description}</Text>
                    
                    <View className="flex-row items-center justify-between">
                        <View className={`px-3 py-1 rounded-full ${entry.status === 'Confirmed' ? 'bg-green-100' : entry.status === 'Pending' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                            <Text className={`text-xs ${entry.status === 'Confirmed' ? 'text-green-700' : entry.status === 'Pending' ? 'text-yellow-700' : 'text-gray-700'}`}>{entry.status}</Text>
                        </View>
                        
                        {entry.type === 'prescription' && (
                            <TouchableOpacity 
                                onPress={() => Alert.alert('Prescription Details', entry.prescriptionText)}
                                className="flex-row items-center gap-1"
                            >
                                <Eye size={16} color="#7c3aed" />
                                <Text className="text-purple-600 font-bold text-xs">View Full</Text>
                            </TouchableOpacity>
                        )}
                        {entry.type === 'appointment' && entry.status === 'Completed' && (
                            <TouchableOpacity onPress={() => { setSelectedEntry(entry); setShowFeedbackForm(true); }}>
                                <Text className="text-purple-600 font-bold text-xs">Rate Doctor</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white rounded-2xl p-12 items-center shadow-sm">
              <Text className="text-xl font-bold mb-2">No History Found</Text>
              <Text className="text-gray-600 mb-6 text-center">You haven't had any {filterType === 'all' ? 'records' : filterType} yet.</Text>
              <TouchableOpacity onPress={() => router.push('/patient/skin-analysis')} className="px-6 py-3 bg-purple-500 rounded-full">
                <Text className="text-white font-bold">Analyze Skin Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {showFeedbackForm && selectedEntry && (
          <FeedbackForm
            doctorName={selectedEntry.doctorName || 'Doctor'}
            appointmentDate={`${new Date(selectedEntry.date).toLocaleDateString()} at ${selectedEntry.time}`}
            onSubmit={handleFeedbackSubmit}
            onClose={() => { setShowFeedbackForm(false); setSelectedEntry(null); }}
          />
        )}
        <View className="h-10" />
      </View>
    </ScrollView>
  );
}
