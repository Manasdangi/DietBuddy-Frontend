import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Instagram story sized card (9:16). Rendered at 360x640 and captured at 1080x1920.
export const CARD_WIDTH = 360;
export const CARD_HEIGHT = 640;

const Stat = ({ label, value, target, color }) => {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  return (
    <View style={styles.stat}>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>
          {value}
          {target > 0 && <Text style={styles.statTarget}> / {target}</Text>}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const ShareCard = forwardRef(({ dateLabel, currentDay, dailyGoal, streak, proteinHit, roastLine }, ref) => {
  const headline = proteinHit
    ? 'Protein goal smashed 💪'
    : streak > 1
      ? `${streak} days of tracking 🔥`
      : 'Tracking my macros today';

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <LinearGradient colors={['#1A0B12', '#09090B', '#0B1220']} style={StyleSheet.absoluteFill} />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.header}>
        <Text style={styles.brand}>DietBuddy</Text>
        <Text style={styles.date}>{dateLabel}</Text>
      </View>

      <Text style={styles.headline}>{headline}</Text>

      {/* The headline already mentions the streak unless the protein goal was hit */}
      {proteinHit && streak > 0 && (
        <View style={styles.streakPill}>
          <Text style={styles.streakText}>🔥 {streak}-day streak</Text>
        </View>
      )}

      <View style={styles.calories}>
        <Text style={styles.kcal}>{currentDay.calories}</Text>
        <Text style={styles.kcalLabel}>kcal of {dailyGoal.calories}</Text>
      </View>

      <View style={styles.stats}>
        <Stat label="PROTEIN" value={currentDay.protein} target={dailyGoal.protein} color="#10B981" />
        <Stat label="CARBS" value={currentDay.carbs} target={dailyGoal.carbs} color="#3B82F6" />
        <Stat label="FAT" value={currentDay.fat || 0} target={dailyGoal.fat || 0} color="#F59E0B" />
      </View>

      {roastLine ? (
        <View style={styles.roast}>
          <Text style={styles.roastLabel}>{"TODAY'S ROAST 🔥"}</Text>
          <Text style={styles.roastText} numberOfLines={3}>{`"${roastLine}"`}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Snap. Log. Done. — DietBuddy</Text>
      </View>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 28,
    backgroundColor: '#09090B',
  },
  glowTop: {
    position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(244, 63, 94, 0.25)',
  },
  glowBottom: {
    position: 'absolute', bottom: -90, left: -70, width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: 'Outfit_800ExtraBold', fontSize: 20, color: '#F43F5E' },
  date: { fontFamily: 'Outfit_500Medium', fontSize: 13, color: '#A1A1AA' },
  headline: { fontFamily: 'Outfit_800ExtraBold', fontSize: 30, lineHeight: 36, color: '#FAFAFA', marginTop: 40 },
  streakPill: {
    alignSelf: 'flex-start', marginTop: 14, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  streakText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#FDA4AF' },
  calories: { marginTop: 32 },
  kcal: { fontFamily: 'Outfit_800ExtraBold', fontSize: 64, color: '#FAFAFA', letterSpacing: -1 },
  kcalLabel: { fontFamily: 'Outfit_500Medium', fontSize: 15, color: '#A1A1AA', marginTop: -4 },
  stats: { marginTop: 28 },
  stat: { marginBottom: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  statLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#A1A1AA', letterSpacing: 1 },
  statValue: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#FAFAFA' },
  statTarget: { fontFamily: 'Outfit_500Medium', color: '#71717A' },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  roast: {
    marginTop: 8, padding: 14, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  roastLabel: { fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#F43F5E', letterSpacing: 1, marginBottom: 6 },
  roastText: { fontFamily: 'Outfit_500Medium', fontSize: 14, lineHeight: 20, color: '#E4E4E7' },
  footer: { position: 'absolute', bottom: 24, left: 28, right: 28 },
  footerText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: '#71717A', textAlign: 'center' },
});

export default ShareCard;
