import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../store/useStore';
import { useThemeColors, spacing, typography, gradients, borderRadius } from '../utils/theme';
import { loggingStreak, proteinSuggestions, weeklyProteinChallenge } from '../utils/nutrition';
import ShareModal from '../components/ShareModal';

const CHALLENGE_TARGET_DAYS = 5;

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default function HomeScreen() {
  const { goal, dailyGoal, currentDay, theme, toggleTheme, logs, dayKey } = useStore();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [shareVisible, setShareVisible] = useState(false);

  const todayLogs = useMemo(() => logs.filter((l) => l.dayKey === dayKey), [logs, dayKey]);
  const latestMeal = todayLogs[0];
  const streak = useMemo(() => loggingStreak(logs), [logs]);
  const challenge = useMemo(() => weeklyProteinChallenge(logs, dailyGoal.protein), [logs, dailyGoal.protein]);
  const proteinGap = Math.max(0, Math.round(dailyGoal.protein - currentDay.protein));
  const proteinHit = dailyGoal.protein > 0 && proteinGap === 0;
  const suggestions = proteinSuggestions(proteinGap);
  const roastLine = todayLogs.find((l) => l.roast && l.comment)?.comment;
  const caloriePct = dailyGoal.calories > 0 ? Math.round((currentDay.calories / dailyGoal.calories) * 100) : 0;

  const challengeFriend = () => {
    Share.share({
      message: `Protein challenge 💪 Can you hit ${dailyGoal.protein}g protein on ${CHALLENGE_TARGET_DAYS} days this week? I'm at ${challenge.hitCount}/${CHALLENGE_TARGET_DAYS}. Track yours with DietBuddy — just snap your plate and it logs the macros.`,
    });
  };

  const renderProgress = (current, target, gradientColors) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
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
            <View style={[styles.avatarContainer, styles.avatarIcon]}>
              <Ionicons name="nutrition" size={20} color={colors.primary} />
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
            <TouchableOpacity onPress={() => setShareVisible(true)} style={styles.themeToggle} accessibilityLabel="Share my day">
              <Ionicons name="share-social-outline" size={20} color={colors.text} />
            </TouchableOpacity>
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
                    {caloriePct}%
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
                <Text style={styles.footerText}>{currentDay.fat || 0}g fat</Text>
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

          {/* Protein gap / goal hit */}
          <View style={styles.sectionCard}>
            {proteinHit ? (
              <>
                <Text style={styles.sectionTitle}>Protein goal hit 💪</Text>
                <Text style={styles.sectionSub}>{currentDay.protein}g today. Flex a little.</Text>
                <TouchableOpacity style={styles.inlineButton} onPress={() => setShareVisible(true)}>
                  <Ionicons name="share-social" size={16} color="#FFF" />
                  <Text style={styles.inlineButtonText}>Share it</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>You need {proteinGap}g more protein</Text>
                <Text style={styles.sectionSub}>Any one of these gets you closer:</Text>
                <View style={styles.chipRow}>
                  {suggestions.map((f) => (
                    <View key={f.name} style={styles.chip}>
                      <Text style={styles.chipText}>{f.name} · {f.portion}</Text>
                      <Text style={styles.chipProtein}>~{f.protein}g</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Weekly challenge */}
          <View style={styles.sectionCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Weekly protein challenge</Text>
              <Text style={[styles.mealTime, { color: colors.tertiary }]}>{challenge.hitCount}/{CHALLENGE_TARGET_DAYS}</Text>
            </View>
            <Text style={styles.sectionSub}>Hit {dailyGoal.protein}g on {CHALLENGE_TARGET_DAYS} days this week</Text>
            <View style={styles.weekRow}>
              {challenge.days.map((d) => (
                <View key={d.key} style={styles.dayCol}>
                  <View style={[
                    styles.dayDot,
                    d.hit && { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
                    d.isToday && !d.hit && { borderColor: colors.primary },
                    d.isFuture && { opacity: 0.4 },
                  ]}>
                    {d.hit && <Ionicons name="checkmark" size={14} color="#FFF" />}
                  </View>
                  <Text style={styles.dayLabel}>{d.label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.inlineButton, { backgroundColor: colors.surfaceLight }]} onPress={challengeFriend}>
              <Ionicons name="people" size={16} color={colors.text} />
              <Text style={[styles.inlineButtonText, { color: colors.text }]}>Challenge a friend</Text>
            </TouchableOpacity>
          </View>

          {/* Latest Meal */}
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>Latest Meal</Text>
              <Text style={styles.mealTime}>{latestMeal ? formatTime(latestMeal.loggedAt) : 'TODAY'}</Text>
            </View>
            {latestMeal ? (
              <View style={styles.mealImageContainer}>
                <ImageBackground
                  source={latestMeal.imageUri ? { uri: latestMeal.imageUri } : undefined}
                  style={[styles.mealImage, !latestMeal.imageUri && { backgroundColor: colors.surfaceLight }]}
                >
                  {!latestMeal.imageUri && <Text style={styles.mealEmoji}>🍽️</Text>}
                  <LinearGradient colors={['transparent', 'rgba(9, 9, 11, 0.9)']} style={styles.mealOverlay}>
                    <Text style={styles.mealName} numberOfLines={1}>{latestMeal.foodName}</Text>
                    <Text style={styles.mealDesc}>
                      {latestMeal.macros?.protein || 0}g protein • {latestMeal.macros?.calories || 0} kcal
                    </Text>
                  </LinearGradient>
                </ImageBackground>
              </View>
            ) : (
              <View style={styles.emptyMeal}>
                <Ionicons name="camera-outline" size={28} color={colors.textSecondary} />
                <Text style={styles.sectionSub}>Nothing logged yet today. Tap + and snap your plate.</Text>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>FAT</Text>
              <Text style={styles.statValue}>{currentDay.fat || 0}g</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>MEALS</Text>
              <Text style={styles.statValue}>{todayLogs.length}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>STREAK</Text>
              <Text style={styles.statValue}>{streak} 🔥</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={() => setShareVisible(true)} activeOpacity={0.85}>
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shareButtonInner}>
              <Ionicons name="share-social" size={18} color="#FFF" />
              <Text style={styles.shareButtonText}>Share my day</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        cardProps={{
          dateLabel: new Date().toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }),
          currentDay,
          dailyGoal,
          streak,
          proteinHit,
          roastLine,
        }}
      />
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
  },
  avatarIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sectionCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
  },
  sectionSub: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipRow: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  chipText: {
    ...typography.bodySecondary,
    color: colors.text,
  },
  chipProtein: {
    ...typography.bodySecondary,
    fontFamily: 'Outfit_700Bold',
    color: colors.tertiary,
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
  },
  inlineButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#FFF',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  dayCol: {
    alignItems: 'center',
  },
  dayDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
  },
  mealEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginTop: 30,
  },
  emptyMeal: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  shareButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  shareButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  shareButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFF',
  },
});
