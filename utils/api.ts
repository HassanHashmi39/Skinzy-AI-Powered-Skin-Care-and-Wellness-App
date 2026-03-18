import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ MERN Backend Base URL
// Change this to your deployed backend URL when going to production
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.175.179.82:4444/api';

// ─────────────────────────────────────────────
// Token helpers (stored in AsyncStorage)
// ─────────────────────────────────────────────

async function getSessionToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('sessionToken');
  } catch (e) {
    console.error('Failed to get session token', e);
    return null;
  }
}

export async function setSessionToken(token: string) {
  try {
    await AsyncStorage.setItem('sessionToken', token);
  } catch (e) {
    console.error('Failed to set session token', e);
  }
}

export async function clearSessionToken() {
  try {
    await AsyncStorage.removeItem('sessionToken');
  } catch (e) {
    console.error('Failed to clear session token', e);
  }
}

// ─────────────────────────────────────────────
// Generic API call helper
// ─────────────────────────────────────────────

async function apiCall(endpoint: string, options: RequestInit = {}, requiresAuth = false) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (requiresAuth) {
    const token = await getSessionToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Create an AbortController for a 15-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🔵 [API Request]:', {
        url,
        method: options.method || 'GET',
        headers: { ...headers, Authorization: headers.Authorization ? '[FILTERED]' : undefined }
    });

    const startTime = Date.now();
    const response = await fetch(url, { 
        ...options, 
        headers,
        signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const data = await response.json();

    console.log(`🟢 [API Success]: ${endpoint} (${endTime - startTime}ms)`);

    if (!response.ok) {
      console.error('❌ [API Error]:', { status: response.status, data });
      throw new Error(data.message || data.error || 'Server returned an error');
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('⌛ [API Timeout]: Request took too long');
      throw new Error('Connection timeout. Please check your network or server IP.');
    }
    console.error('❌ [API Exception]:', error.message || error);
    throw error;
  }
}

// ─────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────

export async function signUp(data: {
  email: string;
  password: string;
  name: string;
  userType: 'patient' | 'doctor';
  [key: string]: any;
}) {
  const response = await apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.token) await setSessionToken(response.token);
  return response;
}

export async function login(email: string, password: string) {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.token) await setSessionToken(response.token);
  return response;
}

// Alias — some components use signIn
export const signIn = login;

export async function getCurrentUser() {
  return await apiCall('/auth/me', {}, true);
}

export async function logout() {
  await clearSessionToken();
}

// ─────────────────────────────────────────────
// PROFILE API
// ─────────────────────────────────────────────

export async function getProfile(userId: string) {
  return await apiCall(`/patients/${userId}`, {}, true);
}

export async function updateProfile(userId: string, updates: any) {
  return await apiCall(`/patients/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }, true);
}

// ─────────────────────────────────────────────
// ANALYSIS API
// ─────────────────────────────────────────────

export async function createAnalysis(analysisData: any) {
  return await apiCall('/analyses', {
    method: 'POST',
    body: JSON.stringify(analysisData),
  }, true);
}

export async function getAnalysisHistory(patientId?: string) {
  const query = patientId ? `?patientId=${patientId}` : '';
  return await apiCall(`/analyses${query}`, {}, true);
}

// ─────────────────────────────────────────────
// ROUTINE API
// ─────────────────────────────────────────────

export async function getRoutine() {
  return await apiCall('/routine', {}, true);
}

export async function toggleTaskCompletion(type: 'morning' | 'evening', taskId: string) {
  return await apiCall(`/routine/toggle/${type}/${taskId}`, {
    method: 'PUT',
  }, true);
}

export async function resetRoutine() {
  return await apiCall('/routine/reset', {
    method: 'POST',
  }, true);
}

export async function addTaskToRoutine(type: 'morning' | 'evening', taskData: any) {
  return await apiCall(`/routine/task/${type}`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  }, true);
}

export async function updateRoutineTask(type: 'morning' | 'evening', taskId: string, taskData: any) {
  return await apiCall(`/routine/task/${type}/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  }, true);
}

export async function deleteRoutineTask(type: 'morning' | 'evening', taskId: string) {
  return await apiCall(`/routine/task/${type}/${taskId}`, {
    method: 'DELETE',
  }, true);
}

// ─────────────────────────────────────────────
// APPOINTMENT API
// ─────────────────────────────────────────────

export async function createAppointment(appointmentData: any) {
  return await apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  }, true);
}

export async function getAppointments() {
  return await apiCall('/appointments', {}, true);
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  return await apiCall(`/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, true);
}

export async function updatePrescription(appointmentId: string, prescription: string) {
  return await apiCall(`/appointments/${appointmentId}/prescription`, {
    method: 'PATCH',
    body: JSON.stringify({ prescription }),
  }, true);
}

export async function getPatientDetailsForDoctor(appointmentId: string) {
  return await apiCall(`/appointments/${appointmentId}/patient-details`, {}, true);
}

// ─────────────────────────────────────────────
// CHAT API
// ─────────────────────────────────────────────

export async function sendChatMessage(receiverId: string, content: string, attachment?: { type: 'image' | 'document'; url: string; name?: string }) {
  return await apiCall('/chat/send', {
    method: 'POST',
    body: JSON.stringify({ receiverId, content, attachment }),
  }, true);
}

export async function getConversation(userId: string) {
  return await apiCall(`/chat/conversation/${userId}`, {}, true);
}

export async function getRecentChats() {
  return await apiCall('/chat/recent', {}, true);
}

export async function markMessagesAsRead(userId: string) {
  return await apiCall(`/chat/read/${userId}`, {
    method: 'PUT',
  }, true);
}

// ─────────────────────────────────────────────
// MEDICAL HISTORY API
// ─────────────────────────────────────────────

export async function saveMedicalHistory(historyData: any) {
  return await apiCall('/medical-history', {
    method: 'POST',
    body: JSON.stringify(historyData),
  }, true);
}

export async function getMedicalHistory(patientId: string) {
  return await apiCall(`/medical-history/${patientId}`, {}, true);
}

// ─────────────────────────────────────────────
// DOCTOR API
// ─────────────────────────────────────────────

export async function getDoctors() {
  return await apiCall('/doctors', {}, true);
}

export async function submitRating(doctorId: string, rating: number, feedback: string) {
  return await apiCall(`/doctors/${doctorId}/rating`, {
    method: 'POST',
    body: JSON.stringify({ rating, feedback }),
  }, true);
}

export async function getDoctorRatings(doctorId: string) {
  return await apiCall(`/doctors/${doctorId}/ratings`, {}, true);
}

export async function getDoctorSlots(doctorId: string) {
  return await apiCall(`/doctors/${doctorId}/slots`, {}, true);
}

export async function giveFeedback(appointmentId: string, rating: number, comment: string) {
  return await apiCall('/feedbacks', {
    method: 'POST',
    body: JSON.stringify({ appointmentId, rating, comment }),
  }, true);
}

// ─────────────────────────────────────────────
// PRODUCT API
// ─────────────────────────────────────────────

export async function getProducts(concern?: string, type?: string) {
  const params = new URLSearchParams();
  if (concern) params.append('concern', concern);
  if (type) params.append('type', type);
  const query = params.toString() ? `?${params.toString()}` : '';
  return await apiCall(`/products${query}`);
}

// ─────────────────────────────────────────────
// WEATHER API
// ─────────────────────────────────────────────

export async function getWeatherRecommendations(city: string) {
  return await apiCall(`/weather/${encodeURIComponent(city)}`, {}, true);
}

// ─────────────────────────────────────────────
// NOTIFICATION API
// ─────────────────────────────────────────────

export async function getNotifications() {
  return await apiCall('/notifications', {}, true);
}

export async function markNotificationAsRead(id: string) {
  return await apiCall(`/notifications/${id}/read`, {
    method: 'PATCH',
  }, true);
}

export async function markAllNotificationsAsRead() {
  return await apiCall('/notifications/read-all', {
    method: 'PATCH',
  }, true);
}

export async function deleteNotification(id: string) {
  return await apiCall(`/notifications/${id}`, {
    method: 'DELETE',
  }, true);
}

export async function clearAllNotifications() {
  return await apiCall('/notifications', {
    method: 'DELETE',
  }, true);
}

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────

export async function healthCheck() {
  return await apiCall('/health');
}