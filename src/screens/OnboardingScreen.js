import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import useStore from '../store/useStore';
import { useThemeColors, spacing, typography, gradients, borderRadius, shadows } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { setGoal, theme } = useStore();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={theme === 'dark' ? [colors.background, '#1a1a2e', colors.background] : [colors.background, '#E2E8F0', colors.background]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Decorative Blur Circles */}
      <View style={[styles.blurCircle, { top: -100, left: -50, backgroundColor: 'rgba(0, 255, 163, 0.15)' }]} />
      <View style={[styles.blurCircle, { bottom: -100, right: -50, backgroundColor: 'rgba(176, 38, 255, 0.15)' }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Diet<Text style={{ color: colors.primary }}>Buddy</Text></Text>
          <Text style={styles.subtitle}>Supercharge your nutrition journey with AI.</Text>
        </View>

        <Text style={styles.prompt}>Choose your objective</Text>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => setGoal('bulking')}
          style={styles.cardWrapper}
        >
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <BlurView intensity={theme === 'dark' ? 20 : 60} tint={theme === 'dark' ? "dark" : "light"} style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="barbell" size={32} color={colors.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Bulking</Text>
                <Text style={styles.cardDesc}>Maximize muscle growth with a strategic caloric surplus.</Text>
              </View>
            </BlurView>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => setGoal('cutting')}
          style={styles.cardWrapper}
        >
          <LinearGradient
            colors={gradients.secondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <BlurView intensity={theme === 'dark' ? 20 : 60} tint={theme === 'dark' ? "dark" : "light"} style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="flame" size={32} color={colors.secondary} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Cutting</Text>
                <Text style={styles.cardDesc}>Shred fat and reveal definition with a caloric deficit.</Text>
              </View>
            </BlurView>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  blurCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: 999,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  prompt: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cardWrapper: {
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientBorder: {
    borderRadius: borderRadius.lg,
    padding: 1, 
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    fontSize: 14,
  }
});
