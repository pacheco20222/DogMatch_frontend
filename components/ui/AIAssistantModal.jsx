import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Send } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';

const AIAssistantModal = ({ visible, onClose }) => {
  const { accessToken } = useAuth();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const [question, setQuestion] = useState('');
  const [contextType, setContextType] = useState('general');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const data = await apiFetch('/api/ai/quick-actions', { token: accessToken });
        setQuickActions(data.actions || []);
      } catch {
        setQuickActions([]);
      }
    })();
  }, [visible, accessToken]);

  const palette = useMemo(
    () => ({
      screenBg: isDark ? '#05060B' : '#F8FAFF',
      surface: isDark ? 'rgba(15,16,28,0.98)' : '#FFFFFF',
      border: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(148,163,184,0.35)',
      textPrimary: isDark ? '#F8FAFC' : '#0F172A',
      textSecondary: isDark ? '#CBD5F5' : '#475569',
      textMuted: isDark ? '#7C8BA1' : '#94A3B8',
      accent: '#6366F1',
      chipBg: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.08)',
      chipText: isDark ? '#E0E7FF' : '#4338CA',
      inputBg: isDark ? '#111827' : '#EEF2FF',
    }),
    [isDark]
  );

  const handleAsk = async (ctx = contextType, q = question) => {
    const trimmed = (q || question).trim();
    if (!trimmed) return;
    setQuestion('');
    setLoading(true);
    setError(null);
    const userEntry = {
      id: `${Date.now()}_q`,
      role: 'question',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    setConversation(prev => [...prev, userEntry]);
    try {
      const payload = { question: trimmed, context: ctx };
      const res = await apiFetch('/api/ai/ask', { method: 'POST', token: accessToken, body: payload });
      setContextType(res.context || ctx);
      const aiEntry = {
        id: `${Date.now()}_a`,
        role: 'answer',
        text: res.answer,
        timestamp: new Date().toISOString(),
      };
      setConversation(prev => [...prev, aiEntry]);
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
      style={[styles.quickAction, { backgroundColor: palette.chipBg, borderColor: palette.border }]}
    >
      <Text style={[styles.quickActionLabel, { color: palette.chipText }]}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      transparent={false}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <SafeAreaView style={[styles.screen, { backgroundColor: palette.screenBg }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>AI Assistant</Text>
              <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
                Ask anything about using DogMatch—profiles, safety, matches and more.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { borderColor: palette.border }]}>
              <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
          >
            <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <View style={[styles.cardIcon, { backgroundColor: palette.chipBg }]}>
                <MessageCircle size={22} color={palette.accent} />
              </View>
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>Need inspiration?</Text>
              <Text style={{ color: palette.textSecondary, marginTop: 4 }}>
                Choose one of the suggested prompts or ask anything on your mind.
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Quick actions</Text>
                <Text style={[styles.sectionHint, { color: palette.textMuted }]}>Popular prompts</Text>
              </View>
              <FlatList
                data={quickActions}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={renderQuick}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}
                ListEmptyComponent={
                  <Text style={{ color: palette.textMuted, fontSize: 13 }}>We'll suggest prompts here soon.</Text>
                }
              />
            </View>

            <View style={[styles.chatArea, { borderColor: palette.border }]}>
              {conversation.length > 0 ? (
                conversation.map(item => (
                  <View
                    key={item.id}
                    style={[
                      styles.messageBubble,
                      item.role === 'question'
                        ? styles.questionBubble
                        : styles.answerBubble,
                      {
                        backgroundColor:
                          item.role === 'question' ? palette.chipBg : palette.surface,
                        borderColor: palette.border,
                        alignSelf: item.role === 'question' ? 'flex-end' : 'flex-start',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: palette.textPrimary,
                        fontSize: 15,
                        lineHeight: 22,
                      }}
                    >
                      {item.text}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={{ color: palette.textSecondary }}>No response yet — ask a question below.</Text>
                </View>
              )}

              {loading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={palette.accent} />
                  <Text style={{ marginLeft: 8, color: palette.textSecondary }}>Thinking...</Text>
                </View>
              )}

              {error && (
                <View style={styles.errorRow}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 12 }]}>
            <View style={[styles.inputRow, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="Ask the AI assistant..."
                placeholderTextColor={palette.textMuted}
                style={[styles.input, { color: palette.textPrimary }]}
                multiline
              />
              <TouchableOpacity
                onPress={() => handleAsk()}
                disabled={loading || !question.trim()}
                style={[
                  styles.sendButton,
                  { opacity: loading || !question.trim() ? 0.5 : 1, backgroundColor: palette.accent },
                ]}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Send size={16} color="#fff" />}
              </TouchableOpacity>
            </View>
            <View style={styles.inputMetaRow}>
              <Text style={[styles.metaText, { color: palette.textMuted }]}>Context: {contextType}</Text>
              <Text style={[styles.metaText, { color: palette.textMuted }]}>Tip: Try "How do I create a dog profile?"</Text>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 12,
  },
  scrollArea: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionHint: {
    fontSize: 12,
  },
  quickAction: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 10,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  chatArea: {
    borderTopWidth: 1,
    paddingTop: 18,
    marginBottom: 16,
    minHeight: 200,
  },
  answerBubble: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  questionBubble: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  messageBubble: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    maxWidth: '85%',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 24,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  errorRow: {
    marginTop: 16,
  },
  errorText: {
    color: '#F87171',
    fontWeight: '600',
  },
  inputWrapper: {
    paddingTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    paddingRight: 12,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  inputMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
  },
});

export default AIAssistantModal;
