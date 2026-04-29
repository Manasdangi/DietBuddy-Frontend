import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../store/useStore';
import { useThemeColors, spacing, typography, gradients, borderRadius } from '../utils/theme';

export default function HomeScreen() {
  const { goal, dailyGoal, currentDay, theme, toggleTheme } = useStore();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const renderProgress = (current, target, gradientColors) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
      <View style={styles.progressContainer}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${percentage}%` }]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFDWphd2uHSz2AMG20H8bSbWiY2dbhimqffaCNXeTIZBvhjFdJkt3JkW6biiP4fIhsxRcinC8kGR-n0E9HiCoRK_-zxw6_Fe6CBDEibR1ca2bl0WvHPcwP1j_rjo3D9o9aYg8laCh3LKi9lMB-MpdT-qYLACB88usAeT6y8LqDN2NI9mYXexdtJtw6kcqg-yfugF2eF2O9otx8BuWCbUvHgKPNMiwx9gb4xy_1zTLix7T4NxYQiwmC62jnNZYsU4-LkSJfWirzs7B1' }} 
                style={styles.avatar} 
              />
            </View>
            <Text style={styles.headerTitle}>DietBuddy</Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.badge}>
              <Ionicons name="flash" size={14} color={colors.primary} />
              <Text style={styles.badgeText}>
                {goal === 'bulking' ? 'BULKING' : 'CUTTING'}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Main Calorie Card */}
          <View style={styles.mainCard}>
            <BlurView intensity={theme === 'dark' ? 20 : 60} tint={theme === 'dark' ? "dark" : "light"} style={styles.glassInner}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardLabel}>DAILY CALORIES</Text>
                  <View style={styles.calorieRow}>
                    <Text style={styles.calorieValue}>{currentDay.calories}</Text>
                    <Text style={styles.calorieTarget}>/ {dailyGoal.calories}</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.percentageText}>
                    {Math.round((currentDay.calories / dailyGoal.calories) * 100)}%
                  </Text>
                </View>
              </View>

              {renderProgress(currentDay.calories, dailyGoal.calories, gradients.primary)}

              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.footerText}>
                    {Math.max(0, dailyGoal.calories - currentDay.calories)} kcal remaining
                  </Text>
                </View>
                <Text style={styles.footerText}>Target: Active</Text>
              </View>
            </BlurView>
          </View>

          {/* Macro Grid */}
          <View style={styles.macroGrid}>
            <View style={[styles.macroCard, { borderLeftColor: colors.tertiary }]}>
              <BlurView intensity={theme === 'dark' ? 20 : 60} tint={theme === 'dark' ? "dark" : "light"} style={styles.glassInnerMacro}>
                <View style={styles.macroHeader}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="restaurant" size={20} color={colors.tertiary} />
                  </View>
                  <Text style={[styles.macroCurrentText, { color: colors.tertiary }]}>{currentDay.protein}g</Text>
                </View>
                <Text style={styles.macroLabel}>PROTEIN</Text>
                <Text style={styles.macroSubtext}>Target: {dailyGoal.protein}g</Text>
                {renderProgress(currentDay.protein, dailyGoal.protein, [colors.tertiary, colors.tertiary])}
              </BlurView>
            </View>

            <View style={[styles.macroCard, { borderLeftColor: colors.secondary }]}>
              <BlurView intensity={theme === 'dark' ? 20 : 60} tint={theme === 'dark' ? "dark" : "light"} style={styles.glassInnerMacro}>
                <View style={styles.macroHeader}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Ionicons name="leaf" size={20} color={colors.secondary} />
                  </View>
                  <Text style={[styles.macroCurrentText, { color: colors.secondary }]}>{currentDay.carbs}g</Text>
                </View>
                <Text style={styles.macroLabel}>CARBS</Text>
                <Text style={styles.macroSubtext}>Target: {dailyGoal.carbs}g</Text>
                {renderProgress(currentDay.carbs, dailyGoal.carbs, [colors.secondary, colors.secondary])}
              </BlurView>
            </View>
          </View>

          {/* Latest Meal */}
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>Latest Meal</Text>
              <Text style={styles.mealTime}>12:30 PM</Text>
            </View>
            <View style={styles.mealImageContainer}>
              <ImageBackground 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYvZRZAw5ervWRP7BpyT-n70z1n6Ko4zvLjaY-vatrm4hqCoAVo2kPOsypPSZEDdhZmJh9QHJ7LYiDNhRgJky1vtR333qP6yeDh6RCzFgErxPPn26dCutQM9jnf7CS37PhYazjGHuyDfTRSevTuCoznL3iI2MqCodan8jLw8wbmUZiSC4RBodQtSM3yJu1DU97VYiO1EiJvz5L7b4Sov7BB6JD_csEGWPIGcAuVZCriGldsAxqwZ1ZwLnvEKK3NySnGcrtB0sNiBUk' }}
                style={styles.mealImage}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(9, 9, 11, 0.9)']}
                  style={styles.mealOverlay}
                >
                  <Text style={styles.mealName}>Grilled Chicken Salad</Text>
                  <Text style={styles.mealDesc}>High Protein • 420 kcal</Text>
                </LinearGradient>
              </ImageBackground>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>WATER</Text>
              <Text style={styles.statValue}>2.4L</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>FIBER</Text>
              <Text style={styles.statValue}>28g</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>STEPS</Text>
              <Text style={styles.statValue}>8.4k</Text>
            </View>
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontStyle: 'italic',
    color: colors.primary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
    fontSize: 10,
  },
  themeToggle: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    padding: spacing.lg,
  },
  mainCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  glassInner: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calorieValue: {
    ...typography.h1,
    color: colors.text,
    fontSize: 48,
  },
  calorieTarget: {
    ...typography.h3,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  percentageText: {
    ...typography.h3,
    color: colors.primary,
  },
  progressContainer: {
    height: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.pill,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  macroCard: {
    width: '48%',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderLeftWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  glassInnerMacro: {
    padding: spacing.md,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconBox: {
    padding: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroCurrentText: {
    ...typography.h3,
    fontSize: 18,
  },
  macroLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  macroSubtext: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  mealCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mealTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
  },
  mealTime: {
    ...typography.caption,
    color: colors.primary,
  },
  mealImageContainer: {
    height: 160,
    width: '100%',
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  mealOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  mealName: {
    ...typography.h3,
    color: '#FFF',
  },
  mealDesc: {
    ...typography.bodySecondary,
    color: '#CCC',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: 4,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    fontSize: 20,
  },
  statDivider: {
    width: 1,
    height: 30,
  }
});
