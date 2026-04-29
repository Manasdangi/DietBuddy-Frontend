import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import useStore from '../store/useStore';
import { useThemeColors, spacing, typography, borderRadius } from '../utils/theme';

export default function WorkoutScreen({ navigation }) {
  const { theme } = useStore();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const renderProgressRing = () => {
    const radius = 58;
    const strokeWidth = 4;
    const circumference = 2 * Math.PI * radius;
    const percentage = 70;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.ringWrapper}>
        <Svg height="128" width="128" viewBox="0 0 128 128">
          <Circle
            cx="64"
            cy="64"
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx="64"
            cy="64"
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 64 64)"
          />
        </Svg>
        <View style={styles.ringInner}>
          <Text style={styles.ringValue}>{percentage}%</Text>
          <Text style={styles.ringLabel}>DONE</Text>
        </View>
      </View>
    );
  };

  const renderCompletedExercise = (title, subtitle, sets) => (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View>
          <Text style={styles.exerciseTitle}>{title}</Text>
          <Text style={styles.exerciseSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      </View>
      <View style={styles.exerciseBody}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 1 }]}>SET</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>LBS</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>REPS</Text>
          <Text style={[styles.tableHeader, { flex: 1, textAlign: 'right' }]}>STATUS</Text>
        </View>
        {sets.map((set, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1, color: colors.textSecondary }]}>{set.num}</Text>
            <Text style={[styles.tableCell, { flex: 1, color: colors.secondary }]}>{set.lbs}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{set.reps}</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Ionicons name="checkmark" size={16} color={colors.textSecondary} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderActiveExercise = () => (
    <View style={[styles.exerciseCard, { borderLeftColor: colors.textSecondary }]}>
      <View style={[styles.exerciseHeader, { backgroundColor: colors.surfaceLight }]}>
        <View>
          <Text style={styles.exerciseTitle}>Incline Dumbbell Fly</Text>
          <Text style={styles.exerciseSubtitle}>UPPER CHEST / DUMBBELL</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={24} color={colors.textSecondary} />
      </View>
      <View style={styles.exerciseBody}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 1 }]}>SET</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>LBS</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>REPS</Text>
          <Text style={[styles.tableHeader, { flex: 1, textAlign: 'right' }]}>STATUS</Text>
        </View>
        
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, color: colors.textSecondary }]}>1</Text>
          <Text style={[styles.tableCell, { flex: 1, color: colors.secondary }]}>45</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>12</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Ionicons name="checkmark" size={16} color={colors.textSecondary} />
          </View>
        </View>

        <View style={[styles.tableRow, { backgroundColor: 'rgba(244, 63, 94, 0.1)', marginHorizontal: -16, paddingHorizontal: 16 }]}>
          <Text style={[styles.tableCell, { flex: 1, color: colors.textSecondary }]}>2</Text>
          <Text style={[styles.tableCell, { flex: 1, color: colors.secondary }]}>50</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>—</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>START</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, color: colors.textSecondary }]}>3</Text>
          <Text style={[styles.tableCell, { flex: 1, color: colors.secondary }]}>50</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>—</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <BlurView intensity={theme === 'dark' ? 40 : 80} tint={theme === 'dark' ? "dark" : "light"} style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>WORKOUT SESSION</Text>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>42:15</Text>
            <Ionicons name="timer-outline" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
          </View>
        </BlurView>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Progress Ring */}
          <View style={styles.progressSection}>
            {renderProgressRing()}
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderColor: 'rgba(244, 63, 94, 0.2)' }]}>
              <Ionicons name="heart" size={24} color={colors.primary} />
              <Text style={styles.statLabel}>HEART RATE</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>142</Text>
              <Text style={styles.statUnit}>BPM</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={24} color={colors.tertiary} />
              <Text style={styles.statLabel}>CALORIES</Text>
              <Text style={[styles.statValue, { color: colors.tertiary }]}>384</Text>
              <Text style={styles.statUnit}>KCAL</Text>
            </View>
          </View>

          {/* Exercise List */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Exercises</Text>
            <Text style={styles.listSubtitle}>4 OF 6 COMPLETED</Text>
          </View>

          <View style={styles.listContainer}>
            {renderCompletedExercise('Bench Press', 'CHEST / BARBELL', [
              { num: 1, lbs: 185, reps: 10 },
              { num: 2, lbs: 185, reps: 8 },
              { num: 3, lbs: 195, reps: 6 },
            ])}
            
            {renderActiveExercise()}

            <View style={[styles.exerciseCard, { opacity: 0.4 }]}>
              <View style={[styles.exerciseHeader, { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.exerciseTitle}>Triceps Pushdown</Text>
                  <Text style={styles.exerciseSubtitle}>TRICEPS / CABLE</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Imagery */}
          <View style={styles.imageCard}>
            <ImageBackground 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2Pj_9JDehjJXf_GX9Fa4kFQSIp0TWy3xSASKVFXWJW8H4iHoCpIMciK3qn_ls1TVNFYzEWh4uL2BG3FL0WBQ91jGeYzPUtGTUZJeQ8PIPhYatLsPHfafOGoNzzairck0Hc7JE7kBBGRtWas27T4pcG4n0RVPvQBtKSm9c_0ti1zZ_7ZlQtLPFUXq4xiS6DKOOvwNEXYjW6Kej0Enq7a1xNjGfSL5aYPdxdDyqjiAe_STXm5mMDJU7uS4nRGJdKLJDTJlhfXyzioC6' }}
              style={styles.imageBg}
            >
              <LinearGradient colors={['transparent', 'rgba(9,9,11,0.8)']} style={styles.imageOverlay}>
                <Text style={styles.imageLabel}>UP NEXT</Text>
                <Text style={styles.imageTitle}>Finish strong with Cable Rows</Text>
              </LinearGradient>
            </ImageBackground>
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
    zIndex: 10,
  },
  headerTitle: {
    ...typography.caption,
    color: colors.text,
    fontSize: 14,
    letterSpacing: 1.5,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 14,
  },
  content: {
    padding: spacing.lg,
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  ringWrapper: {
    position: 'relative',
    width: 128,
    height: 128,
  },
  ringInner: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    ...typography.h1,
    color: colors.text,
    fontSize: 36,
  },
  ringLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  statValue: {
    ...typography.h1,
    fontSize: 32,
  },
  statUnit: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  listTitle: {
    ...typography.h2,
    color: colors.text,
    fontSize: 24,
  },
  listSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  listContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
  },
  exerciseSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  exerciseBody: {
    padding: spacing.md,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeader: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  tableCell: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  startButtonText: {
    ...typography.caption,
    color: '#FFF',
    fontSize: 10,
  },
  imageCard: {
    height: 160,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  imageBg: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingTop: 40,
  },
  imageLabel: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 10,
  },
  imageTitle: {
    ...typography.h3,
    color: '#FFF',
    fontSize: 14,
    marginTop: 4,
  }
});
