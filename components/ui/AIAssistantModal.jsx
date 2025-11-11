import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { MessageCircle, Send } from 'lucide-react-native';
import { useAuth } from '../../auth/AuthContext';
import { apiFetch } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';

/**
 * AIAssistantModal
 * Props:
 * - visible: boolean
 * - onClose: () => void
 */
const AIAssistantModal = ({ visible, onClose }) => {
  const { accessToken } = useAuth();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const [question, setQuestion] = useState('');
  const [contextType, setContextType] = useState('general');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const data = await apiFetch('/api/ai/quick-actions', { token: accessToken });
        setQuickActions(data.actions || []);
      } catch (err) {
        // Non-blocking; quick actions are optional
        setQuickActions([]);
      }
    })();
  }, [visible]);

  const handleAsk = async (ctx = contextType, q = question) => {
    if (!q || q.trim().length === 0) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const payload = { question: q, context: ctx };
      const res = await apiFetch('/api/ai/ask', { method: 'POST', token: accessToken, body: payload });
      setAnswer(res.answer);
      setContextType(res.context || ctx);
    } catch (err) {
      setError(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const renderQuick = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setQuestion(item.question);
        setContextType(item.context || 'general');
        handleAsk(item.context || 'general', item.question);
      }}
      className="px-3 py-2 mr-2 bg-gray-200 rounded-lg"
    >
      <Text className="text-sm font-medium">{item.label}</Text>
    </TouchableOpacity>
    );
  
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: isDark ? '#0b0b0b' : '#fff', padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '75%' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MessageCircle size={20} color={isDark ? '#fff' : '#111'} />
                <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: '700', color: isDark ? '#fff' : '#000' }}>AI Assistant</Text>
                <Text style={{ marginLeft: 8, fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280' }}> — Ask anything about using DogMatch</Text>
              </View>
  
              <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
                <Text style={{ color: isDark ? '#fff' : '#111' }}>Close</Text>
              </TouchableOpacity>
            </View>
  
            {/* Quick actions */}
            <View>
              <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 8 }}>Quick actions</Text>
              <FlatList
                data={quickActions}
                horizontal
                keyExtractor={(i) => i.id}
                renderItem={renderQuick}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8 }}
              />
            </View>
  
            {/* Answer / conversation */}
            <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: isDark ? '#222' : '#eee', paddingTop: 12 }}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
                {answer ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ color: isDark ? '#fff' : '#000' }}>{answer}</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>No response yet — ask a question below.</Text>
                  </View>
                )}
  
                {loading && (
                  <View style={{ marginTop: 12 }}>
                    <ActivityIndicator />
                  </View>
                )}
  
                {error && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ color: 'red' }}>{error}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
  
            {/* Input bar */}
            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={question}
                  onChangeText={setQuestion}
                  placeholder="Ask the AI assistant..."
                  placeholderTextColor="#9CA3AF"
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? '#111' : '#f3f4f6',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 999,
                    color: isDark ? '#fff' : '#000',
                  }}
                />
                <TouchableOpacity
                  onPress={() => handleAsk()}
                  disabled={loading || !question.trim()}
                  style={{ marginLeft: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#2563EB', borderRadius: 999 }}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Send size={16} color="#fff" />}
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#9CA3AF' }}>Context: {contextType}</Text>
                <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#9CA3AF' }}>Tip: Try "How do I create a dog profile?"</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  export default AIAssistantModal;