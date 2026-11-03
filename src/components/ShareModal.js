import React, { useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Share, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import ShareCard, { CARD_WIDTH, CARD_HEIGHT } from './ShareCard';

export default function ShareModal({ visible, onClose, cardProps }) {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const { width, height } = useWindowDimensions();
  // Fit the card on screen, leaving room for the buttons
  const scale = Math.min(1, (width - 48) / CARD_WIDTH, (height - 220) / CARD_HEIGHT);

  const handleShare = async () => {
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, width: 1080, height: 1920 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your day', UTI: 'public.png' });
      } else {
        // Web fallback: share text instead of the image
        await Share.share({ message: `Day logged on DietBuddy: ${cardProps.currentDay.calories} kcal, ${cardProps.currentDay.protein}g protein 💪` });
      }
    } catch (e) {
      console.warn('Share failed', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={{ width: CARD_WIDTH * scale, height: CARD_HEIGHT * scale }}>
          <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT, transform: [{ scale }], transformOrigin: 'top left' }}>
            <ShareCard ref={cardRef} {...cardProps} />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondary} onPress={onClose} disabled={busy}>
            <Text style={styles.secondaryText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primary} onPress={handleShare} disabled={busy}>
            {busy ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Ionicons name="share-social" size={18} color="#FFF" />
                <Text style={styles.primaryText}>Share to story</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  actions: { flexDirection: 'row', marginTop: 24, gap: 12 },
  primary: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F43F5E',
    paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999, minWidth: 170, justifyContent: 'center',
  },
  primaryText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#FFF' },
  secondary: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
  secondaryText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#FAFAFA' },
});
