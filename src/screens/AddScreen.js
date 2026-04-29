import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  FlatList, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';

import useStore from '../store/useStore';
import { useThemeColors, typography, spacing, borderRadius } from '../utils/theme';
import { analyzeDietInput } from '../services/geminiService';

export default function AddScreen({ navigation }) {
  const { theme, addLog } = useStore();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      type: 'text',
      content: 'Hi! I am DietBuddy AI. You can type what you ate, upload a photo of your meal, or send a voice note about your workout.',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recording, setRecording] = useState(null);

  const addMessage = (msg) => {
    const id = msg.id || Date.now().toString() + Math.random();
    setMessages(prev => [...prev, { id, ...msg }]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    return id;
  };

  const processAI = async (uri, mimeType, type, textContent = '', userMsgId = null) => {
    setIsAnalyzing(true);
    addMessage({ role: 'assistant', type: 'loading' });
    try {
      const result = await analyzeDietInput(uri || textContent, mimeType, type);
      
      // Remove loading message
      setMessages(prev => {
        let updated = prev.filter(m => m.type !== 'loading');
        // Update user message with transcription if available
        if (result.transcription && userMsgId) {
          updated = updated.map(m => m.id === userMsgId ? { ...m, content: result.transcription } : m);
        }
        return updated;
      });
      
      // Add result message
      addMessage({ 
        role: 'assistant', 
        type: 'result', 
        parsedData: result 
      });
      
      // Save globally
      addLog(result);
    } catch (e) {
      setMessages(prev => prev.filter(m => m.type !== 'loading'));
      addMessage({ role: 'assistant', type: 'text', content: 'Oops! I had trouble analyzing that. Please try again.' });
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    addMessage({ role: 'user', type: 'text', content: text });
    processAI(null, null, 'text', text);
  };

  const openCameraOrGallery = () => {
    Alert.alert('Upload Image', 'Choose an option', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Choose from Gallery', onPress: openGallery },
      { text: 'Take Photo', onPress: openCamera },
    ]);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Camera permission is required.');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      addMessage({ role: 'user', type: 'image', uri: result.assets[0].uri });
      processAI(result.assets[0].uri, result.assets[0].mimeType || 'image/jpeg', 'image');
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Gallery permission is required.');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      addMessage({ role: 'user', type: 'image', uri: result.assets[0].uri });
      processAI(result.assets[0].uri, result.assets[0].mimeType || 'image/jpeg', 'image');
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return Alert.alert('Permission needed', 'Microphone permission is required.');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      Alert.alert("Error", "Failed to start recording");
      console.error(err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    const currentRecording = recording;
    setRecording(null);
    try {
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      const msgId = addMessage({ role: 'user', type: 'audio', content: 'Voice Note' });
      processAI(uri, 'audio/m4a', 'audio', '', msgId);
    } catch (e) {
      Alert.alert("Error", "Failed to process audio");
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';

    if (item.type === 'loading') {
      return (
        <View style={[styles.messageRow, styles.assistantRow]}>
          <View style={styles.assistantAvatar}>
            <Ionicons name="sparkles" size={16} color="#FFF" />
          </View>
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        </View>
      );
    }

    if (item.type === 'result') {
      return (
        <View style={[styles.messageRow, styles.assistantRow]}>
          <View style={styles.assistantAvatar}>
            <Ionicons name="sparkles" size={16} color="#FFF" />
          </View>
          <View style={[styles.messageBubble, styles.assistantBubble, { minWidth: 200 }]}>
            <Text style={styles.resultTitle}>{item.parsedData.foodName || 'Activity Logged'}</Text>
            <View style={styles.macrosRow}>
              <View style={styles.macroBadge}><Text style={styles.macroText}>🔥 {item.parsedData.macros?.calories || 0} kcal</Text></View>
              <View style={styles.macroBadge}><Text style={styles.macroText}>🥩 {item.parsedData.macros?.protein || 0}g P</Text></View>
              <View style={styles.macroBadge}><Text style={styles.macroText}>🍞 {item.parsedData.macros?.carbs || 0}g C</Text></View>
            </View>
            <Text style={styles.resultNotes}>{item.parsedData.notes}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Ionicons name="sparkles" size={16} color="#FFF" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {item.type === 'text' && <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>}
          {item.type === 'image' && <Image source={{ uri: item.uri }} style={styles.messageImage} />}
          {item.type === 'audio' && (
            <View style={styles.audioBubble}>
              <Ionicons name="mic" size={20} color="#FFF" />
              <Text style={styles.audioText}>{item.content}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>DietBuddy AI</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <BlurView intensity={theme === 'dark' ? 80 : 100} tint={theme === 'dark' ? "dark" : "light"} style={styles.inputContainer}>
          {recording ? (
            <View style={styles.recordingState}>
              <View style={styles.recordingIndicator} />
              <Text style={styles.recordingText}>Listening...</Text>
              <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                <Ionicons name="stop-circle" size={32} color={colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.iconButton} onPress={openCameraOrGallery}>
                <Ionicons name="camera-outline" size={26} color={colors.textSecondary} />
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                placeholder="Log a meal or workout..."
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={200}
              />

              {inputText.trim() ? (
                <TouchableOpacity style={styles.iconButtonPrimary} onPress={handleSendText}>
                  <Ionicons name="arrow-up" size={20} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.iconButton} onPress={startRecording}>
                  <Ionicons name="mic-outline" size={26} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </>
          )}
        </BlurView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  chatContainer: {
    padding: spacing.lg,
    paddingBottom: 200, // extra space for bottom input bar and tab bar
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    ...typography.body,
    color: colors.text,
  },
  userMessageText: {
    color: '#FFF',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.sm,
  },
  audioBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioText: {
    ...typography.body,
    color: '#FFF',
    marginLeft: spacing.sm,
  },
  resultTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  macrosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  macroBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  macroText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 10,
  },
  resultNotes: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'absolute',
    bottom: 100, // Move above the custom floating TabBar
    left: 0,
    right: 0,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.body,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  recordingState: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: 44,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recordingText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.md,
  },
  stopButton: {
    padding: spacing.xs,
  }
});
