import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView, Platform, SafeAreaView, ScrollView,
  Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image, useWindowDimensions,
} from 'react-native';
import { ArrowLeft, FileText, Image as ImageIcon, MoreVertical, Paperclip, Search, Send, Trash2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getRecentChats, getConversation, sendChatMessage, markMessagesAsRead, getCurrentUser } from '../../utils/api';

type Attachment = { type: 'image' | 'document'; url: string; name?: string; };
type Message = { _id: string; sender: string | { _id: string; name: string }; receiver: string; content: string; attachment?: Attachment; isRead: boolean; createdAt: string; };
type ChatUser = { _id: string; name: string; email: string; profileImage?: string; userType: string; specialization?: string; };
type Conversation = { user: ChatUser; lastMessage: Message | null; unreadCount: number; };
type CurrentUser = { _id: string; name: string; };

// ─── Convert a data: URI to a Blob URL for reliable browser opening ───
function dataURItoBlob(dataURI: string): string {
  const [header, base64] = dataURI.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const byteChars = atob(base64);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
  const blob = new Blob([byteArr], { type: mime });
  return URL.createObjectURL(blob);
}

// ─── Open a document ───
async function openDocument(attachment: Attachment) {
  try {
    const { url, name } = attachment;
    const fileName = name || 'document';

    if (Platform.OS === 'web') {
      const blobUrl = url.startsWith('data:') ? dataURItoBlob(url) : url;
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Native: write to cache then share
    const destPath = `${FileSystem.cacheDirectory}${fileName}`;
    if (url.startsWith('data:')) {
      const base64 = url.split(',')[1];
      await FileSystem.writeAsStringAsync(destPath, base64, { encoding: FileSystem.EncodingType.Base64 });
    } else {
      // @ts-ignore
      await FileSystem.downloadAsync(url, destPath);
    }
    await Sharing.shareAsync(destPath);
  } catch (e) {
    console.error('Failed to open document:', e);
    alert('Could not open file. Please try again.');
  }
}

// ─── Open an image ───
async function openImage(url: string) {
  try {
    if (Platform.OS === 'web') {
      const blobUrl = url.startsWith('data:') ? dataURItoBlob(url) : url;
      window.open(blobUrl, '_blank');
    } else {
      const { Linking } = require('react-native');
      await Linking.openURL(url);
    }
  } catch (e) {
    console.error('Failed to open image:', e);
  }
}

type DoctorChatProps = { onBack: () => void; };

export function DoctorChat({ onBack }: DoctorChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  useEffect(() => { fetchCurrentUser(); fetchRecentChats(); }, []);

  const fetchCurrentUser = async () => {
    try {
      const data = await getCurrentUser();
      // Backend returns { user: {...} } so extract accordingly
      setCurrentUser(data.user ?? data);
    }
    catch (e) { console.error('Error fetching current user:', e); }
  };

  const fetchRecentChats = async () => {
    try { setLoadingChats(true); setConversations(await getRecentChats()); }
    catch (e) { console.error('Failed to load recent chats:', e); }
    finally { setLoadingChats(false); }
  };

  const loadConversation = async (userId: string) => {
    try {
      setLoadingMessages(true);
      setMessages(await getConversation(userId));
      await markMessagesAsRead(userId);
      fetchRecentChats();
    } catch (e) { console.error('Failed to load conversation:', e); }
    finally { setLoadingMessages(false); }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (selectedChatUser) {
      interval = setInterval(async () => {
        const data = await getConversation(selectedChatUser._id).catch(() => null);
        if (data && data.length > messages.length) { setMessages(data); markMessagesAsRead(selectedChatUser._id); }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [selectedChatUser, messages.length]);

  const filteredConversations = conversations.filter(c =>
    c.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async (content = messageText, attachment?: Attachment) => {
    if (!selectedChatUser || (!content.trim() && !attachment)) return;
    setMessageText('');

    const optimistic: Message = {
      _id: Date.now().toString(),
      sender: currentUser!._id,
      receiver: selectedChatUser._id,
      content,
      attachment,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      const sent = await sendChatMessage(selectedChatUser._id, content, attachment);
      setMessages(prev => prev.map(m => m._id === optimistic._id ? sent : m));
      fetchRecentChats();
    } catch (e) {
      console.error('Send failed:', e);
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.6 });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      await handleSend('', { type: 'image', url: `data:${a.mimeType || 'image/jpeg'};base64,${a.base64}`, name: a.fileName || 'image.jpg' });
    }
  };

  const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const avatarColors = ['#F59E0B', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = (name || '').charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };
  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P';

  const renderMessages = () => {
    if (loadingMessages || !currentUser) return <ActivityIndicator size="large" color="#9333ea" style={{ marginTop: 40 }} />;
    return messages.map((msg, index) => {
      const prevMsg = index > 0 ? messages[index - 1] : null;
      const msgDate = new Date(msg.createdAt);
      const prevDate = prevMsg ? new Date(prevMsg.createdAt) : null;
      const showDateSeparator = !prevDate || msgDate.toDateString() !== prevDate.toDateString();

      let dateText = msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (msgDate.toDateString() === new Date().toDateString()) dateText = 'Today, ' + dateText;

      const senderId = typeof msg.sender === 'object' && msg.sender !== null
        ? (msg.sender as { _id: string })._id
        : msg.sender as string;
      const isMine = senderId === currentUser._id;
      const senderName = isMine ? 'You' : selectedChatUser!.name;
      const avatarColor = isMine ? '#9ca3af' : getAvatarColor(selectedChatUser!.name);

      return (
        <View key={msg._id} style={{ 
          width: '100%', 
          marginBottom: 12, 
          alignItems: isMine ? 'flex-end' : 'flex-start' 
        }}>
          {showDateSeparator && (
            <View style={{ width: '100%', alignItems: 'center', marginVertical: 16 }}>
              <View style={{ backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>{dateText}</Text>
              </View>
            </View>
          )}

          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-end', 
            maxWidth: '85%',
            gap: 8
          }}>
            {!isMine && (
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: avatarColor, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{getInitials(senderName)}</Text>
              </View>
            )}

            <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
              <View style={{
                backgroundColor: isMine ? '#7c3aed' : '#f1f5f9',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: isMine ? 20 : 4,
                borderBottomRightRadius: isMine ? 4 : 20,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 5,
                elevation: 1,
              }}>
                <Text style={{ fontWeight: '700', fontSize: 11, color: isMine ? 'rgba(255,255,255,0.7)' : '#9333ea', marginBottom: 4 }}>
                  {senderName}
                </Text>
                
                {msg.attachment?.type === 'image' && (
                  <TouchableOpacity onPress={() => openImage(msg.attachment!.url)} activeOpacity={0.85}>
                    <Image
                      source={{ uri: msg.attachment.url }}
                      style={{ width: 220, height: 160, borderRadius: 12, marginBottom: msg.content ? 8 : 0 }}
                      resizeMode="cover"
                    />
                    <Text style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.6)' : '#94a3b8', textAlign: 'center', marginTop: 2 }}>Tap to open</Text>
                  </TouchableOpacity>
                )}
                {msg.attachment?.type === 'document' && (
                  <TouchableOpacity
                    onPress={() => openDocument(msg.attachment!)}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      padding: 10, 
                      backgroundColor: isMine ? 'rgba(255,255,255,0.1)' : '#fff', 
                      borderRadius: 10, 
                      gap: 8, 
                      minWidth: 160, 
                      marginBottom: msg.content ? 8 : 0 
                    }}
                  >
                    <FileText size={20} color={isMine ? "#fff" : "#64748b"} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: isMine ? '#fff' : '#1e293b', fontSize: 13, fontWeight: '500' }} numberOfLines={1}>{msg.attachment.name || 'Document'}</Text>
                      <Text style={{ color: isMine ? 'rgba(255,255,255,0.7)' : '#94a3b8', fontSize: 10 }}>Tap to open</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {!!msg.content && (
                  <Text style={{ color: isMine ? '#ffffff' : '#1e293b', fontSize: 15, lineHeight: 22 }}>
                    {msg.content}
                  </Text>
                )}
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>
                  {formatTime(msg.createdAt)}
                </Text>
                {isMine && <Text style={{ fontSize: 10, color: '#94a3b8' }}>• Sent</Text>}
              </View>
            </View>
          </View>
        </View>
      );
    });
  };

  // ─── CHAT DETAIL ───
  const renderChatArea = () => {
    if (!selectedChatUser) return null;
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => { setSelectedChatUser(null); setShowDeleteMenu(false); }} style={{ padding: 8 }}>
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: getAvatarColor(selectedChatUser!.name), alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{getInitials(selectedChatUser!.name)}</Text>
          </View>
          <View>
            <Text style={{ fontWeight: 'bold', color: '#111827' }}>{selectedChatUser!.name}</Text>
            <Text style={{ fontSize: 12, color: '#16a34a' }}>Patient</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowDeleteMenu(v => !v)} style={{ padding: 8 }}>
          <MoreVertical size={20} color="#6b7280" />
        </TouchableOpacity>
        {showDeleteMenu && (
          <View style={{ position: 'absolute', right: 12, top: 60, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 6, minWidth: 180, zIndex: 50, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 }}>
            <TouchableOpacity
              onPress={() => { setConversations(c => c.filter(x => x.user._id !== selectedChatUser!._id)); setSelectedChatUser(null); setShowDeleteMenu(false); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 }}
            >
              <Trash2 size={18} color="#dc2626" />
              <Text style={{ color: '#dc2626' }}>Hide Conversation</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView ref={scrollViewRef} style={{ flex: 1, padding: 16, backgroundColor: '#f3f4f6' }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {renderMessages()}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Input bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderTopWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', gap: 8 }}>
        <TouchableOpacity onPress={handlePickImage} style={{ padding: 8, backgroundColor: '#f3f4f6', borderRadius: 20 }}>
          <Paperclip size={20} color="#6b7280" />
        </TouchableOpacity>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          style={{ flex: 1, backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, fontSize: 14, color: '#111827' }}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity onPress={() => handleSend()} style={{ padding: 12, backgroundColor: '#7c3aed', borderRadius: 22 }}>
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      </View>
    );
  };

  // ─── CONVERSATION LIST ───
  const renderSidebar = () => (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#e5e7eb' }}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ArrowLeft size={20} color="#4b5563" />
          <Text style={{ color: '#4b5563', fontWeight: '500' }}>Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>Messages</Text>
        <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Chat with your patients</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, gap: 8, marginBottom: 16 }}>
          <Search size={18} color="#9ca3af" />
          <TextInput placeholder="Search patients..." value={searchQuery} onChangeText={setSearchQuery} style={{ flex: 1, fontSize: 14, color: '#111827' }} />
        </View>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', marginLeft: 4 }}>All Messages</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {loadingChats ? (
          <ActivityIndicator size="large" color="#9333ea" style={{ marginTop: 40 }} />
        ) : filteredConversations.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 32 }}>
            <Text style={{ color: '#9ca3af', fontSize: 15 }}>No conversations yet.</Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 4, textAlign: 'center' }}>Confirmed patients will appear here.</Text>
          </View>
        ) : (
          filteredConversations.map(conv => (
            <TouchableOpacity key={conv.user._id}
              onPress={() => { setSelectedChatUser(conv.user); setShowDeleteMenu(false); loadConversation(conv.user._id); }}
              style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6', backgroundColor: selectedChatUser?._id === conv.user._id ? '#f5f3ff' : '#fff', gap: 12 }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: getAvatarColor(conv.user.name), alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{getInitials(conv.user.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontWeight: 'bold', color: '#111827' }}>{conv.user.name}</Text>
                  {conv.unreadCount > 0 && (
                    <View style={{ backgroundColor: '#7c3aed', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ color: '#fff', fontSize: 11 }}>{conv.unreadCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: '#9ca3af', fontSize: 13 }} numberOfLines={1}>
                  {conv.lastMessage?.attachment
                    ? conv.lastMessage.attachment.type === 'image' ? '📷 Image' : '📄 Document'
                    : conv.lastMessage?.content || 'Tap to start a conversation'}
                </Text>
                <Text style={{ color: '#d1d5db', fontSize: 11, marginTop: 2 }}>{formatTime(conv.lastMessage?.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      {isDesktop ? (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#f9fafb' }}>
          <View style={{ width: 340, borderRightWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' }}>
            {renderSidebar()}
          </View>
          <View style={{ flex: 1 }}>
            {selectedChatUser ? renderChatArea() : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                <Text style={{ color: '#9ca3af', fontSize: 16 }}>Select a patient to start chatting</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {selectedChatUser ? renderChatArea() : renderSidebar()}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

export default function DoctorChatPage() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DoctorChat onBack={() => router.back()} />
    </SafeAreaView>
  );
}
