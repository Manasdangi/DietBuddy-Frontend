import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import useStore from '../store/useStore';
import { useThemeColors, spacing, typography, borderRadius } from '../utils/theme';

export default function HistoryScreen() {
  const { theme, logs } = useStore();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const renderItem = ({ item, index }) => (
    <View style={styles.logWrapper}>
      <LinearGradient
        colors={theme === 'dark' ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.01)']}
        style={styles.logGradient}
      >
        <BlurView intensity={theme === 'dark' ? 20 : 60} tint={theme === 'dark' ? "dark" : "light"} style={styles.logCard}>
          <View style={styles.logAccent} />
          <View style={styles.logContent}>
            <Text style={styles.logTitle}>{item.foodName}</Text>
            <View style={styles.macrosRow}>
              <View style={styles.macroPill}>
                <Text style={styles.macroText}>{item.macros?.calories} kcal</Text>
              </View>
              <View style={[styles.macroPill, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
                <Text style={[styles.macroText, { color: colors.primary }]}>{item.macros?.protein}g P</Text>
              </View>
              <View style={[styles.macroPill, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Text style={[styles.macroText, { color: colors.secondary }]}>{item.macros?.carbs}g C</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>History</Text>
          
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No logs yet. Your AI analysis will appear here.</Text>
            </View>
          ) : (
            <FlatList
              data={logs}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  logWrapper: {
    marginBottom: spacing.md,
  },
  logGradient: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  logCard: {
    flexDirection: 'row',
  },
  logAccent: {
    width: 4,
    backgroundColor: colors.primary,
  },
  logContent: {
    flex: 1,
    padding: spacing.md,
  },
  logTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  macrosRow: {
    flexDirection: 'row',
  },
  macroPill: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
  },
  macroText: {
    ...typography.caption,
    color: colors.text,
  }
});
