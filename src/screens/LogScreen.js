import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import useStore from '../store/useStore';
import { useThemeColors, spacing, typography, borderRadius } from '../utils/theme';

export default function LogScreen() {
  const { theme } = useStore();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const renderRing = (color, value, max, label, valueText) => {
    const radius = 24;
    const strokeWidth = 3;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / max) * circumference;

    return (
      <View style={styles.ringWrapper}>
        <View style={styles.svgContainer}>
          <Svg height="56" width="56" viewBox="0 0 56 56">
            <Circle
              cx="28"
              cy="28"
              r={radius}
              stroke={colors.border}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx="28"
              cy="28"
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
            />
          </Svg>
          <Text style={styles.ringValue}>{valueText}</Text>
        </View>
        <Text style={styles.ringLabel}>{label}</Text>
      </View>
    );
  };

  const renderRecentItem = (title, subtext, kcal, imageUri) => (
    <TouchableOpacity style={styles.recentItem} activeOpacity={0.7}>
      <BlurView intensity={theme === 'dark' ? 20 : 60} tint={theme === 'dark' ? "dark" : "light"} style={styles.recentItemInner}>
        <View style={styles.recentItemLeft}>
          <Image source={{ uri: imageUri }} style={styles.recentItemImage} />
          <View>
            <Text style={styles.recentItemTitle}>{title}</Text>
            <Text style={styles.recentItemSubtext}>{subtext}</Text>
          </View>
        </View>
        <View style={styles.recentItemRight}>
          <Text style={styles.recentItemKcal}>{kcal}</Text>
          <Text style={styles.recentItemKcalLabel}>KCAL</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARzISq9iwSQCV-PCTf1qkXvB-Ka4RX5LMkQ2YiH1VujBrXO0LI7SNrczxyQIIwMsidVtEdEKTqVDxUobqrkcgLZCv7ta9ysYhqadY1bXWBBmfmQi9sxn1Uh2QvSGot_D6hu3yfwEi32K2GRakiRNC18rwBMk3WUTHgD6rFVNWPO62hvFXPqZTxn_me4ujl8JdJpr0RUgtSYvkO7W5sU6e0hKPv_Iwr2tLDNPQHFe-eL9KXVmQ4xMPqbAlc58FkYsUfqgaFe7Vdxy2L' }} 
              style={styles.avatar} 
            />
            <Text style={styles.headerTitle}>DietBuddy</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="barcode-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <BlurView intensity={theme === 'dark' ? 40 : 80} tint={theme === 'dark' ? "dark" : "light"} style={styles.searchInner}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search food or scan barcode"
                placeholderTextColor={colors.textSecondary}
              />
              <Ionicons name="barcode" size={20} color={colors.primary} />
            </BlurView>
          </View>

          {/* Current Meal Bento */}
          <View style={styles.bentoContainer}>
            <BlurView intensity={theme === 'dark' ? 20 : 60} tint={theme === 'dark' ? "dark" : "light"} style={styles.bentoInner}>
              <View style={styles.bentoHeader}>
                <View>
                  <Text style={styles.bentoLabel}>CURRENT MEAL</Text>
                  <View style={styles.bentoCalRow}>
                    <Text style={styles.bentoCalValue}>770</Text>
                    <Text style={styles.bentoCalUnit}>KCAL</Text>
                  </View>
                </View>
                <View style={styles.bentoIconBox}>
                  <Ionicons name="restaurant" size={20} color={colors.primary} />
                </View>
              </View>

              <View style={styles.ringsRow}>
                {renderRing(colors.tertiary, 64, 100, 'PROTEIN', '64g')}
                {renderRing(colors.secondary, 42, 100, 'CARBS', '42g')}
                {renderRing(colors.primary, 18, 100, 'FATS', '18g')}
              </View>
            </BlurView>
          </View>

          {/* Recently Eaten */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recently Eaten</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>SEE ALL</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recentList}>
              {renderRecentItem(
                'Grilled Salmon',
                'Lunch • 180g',
                '450',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCCT4XgwnzIL3WUClB1FETzBm500sC1eIyCYtHnIIc-UMH01ybAPj_a8alSca5_YawlVF9wnR3tK-NEckxvJapPxa_aEiR5jB-0Aen8ai8cJDaxTZed9E2cw-jbcMy4n9fRorveqVJoJKKl-mFSqv3HtTw8yQAjLKZEJ2D-zVpC0f2GL7Z_6x2HT_aEGC0QDs8ZcJVHyAlGhDVDgwREaZ27R-PEr1TjCKIQEWs87rdqiWNcwnRD2xrCglNfBGQIDMjjaQs8FdhLJ_Qr'
              )}
              {renderRecentItem(
                'Avocado Toast',
                'Breakfast • 1 slice',
                '320',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBVutPyHa-ctBBsP8fIDlOYEasT_QYCryyLFy2bGD3vkR5JTBj9eJ3ZjY0Akrn18UXUp5gG3akqnlEdvitw4dTFZj48qE4m0r2HE8NIvfYrvN3hJOGrLyufIlpvV3UPzaTzykU2fRAhx9UXATG8YfGXuv09xQx-fjGYUIZKRgEQgVqAQtX4YUHuYHmGPbd3swVDhNWkuqhu4yv2QNJwRTdOKivCSHnDgUYar2bDRIuUhdMMVAqBEqAKleedjLdNcCbcZErEWYG9cq8I'
              )}
              {renderRecentItem(
                'Quinoa Salad',
                'Snack • 150g',
                '210',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuC8ZZAnnSueObi0gzg8MVY7CqRe2xqcwoUXniQIL1HZ9-A2JKJ6Bra5dcdHb96GY57-A8nrdlC-9jcFLv_ZjMVUGMH5rP_5kBeMV-Sbaf8coSq7QcqHz-0wRHPK35uVxUM7QCHnInwTHI7dz6ECInNxz3pmydzbyoBUFkh8RBV2MyMrUwulHx7OhhF-c0W4Pq0avZHy3Jg-MFnf5jIH8Emf50I24Taf-RMdcaWrr3j0tLc4U_UGNTKc_8uO9A8eE9q78nDtKjD8wlXC'
              )}
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.primary,
  },
  content: {
    padding: spacing.lg,
  },
  searchContainer: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  bentoContainer: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
  },
  bentoInner: {
    padding: spacing.lg,
  },
  bentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  bentoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bentoCalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bentoCalValue: {
    ...typography.h1,
    color: colors.text,
    fontSize: 48,
  },
  bentoCalUnit: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
  },
  bentoIconBox: {
    padding: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  ringWrapper: {
    alignItems: 'center',
  },
  svgContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  ringValue: {
    position: 'absolute',
    ...typography.caption,
    fontSize: 10,
    color: colors.text,
  },
  ringLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  recentSection: {
    marginTop: spacing.md,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  recentTitle: {
    ...typography.h2,
    color: colors.text,
    fontSize: 24,
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primary,
  },
  recentList: {
    gap: spacing.md,
  },
  recentItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  recentItemInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  recentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentItemImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentItemTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
  },
  recentItemSubtext: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    fontSize: 14,
  },
  recentItemRight: {
    alignItems: 'flex-end',
  },
  recentItemKcal: {
    ...typography.h2,
    fontSize: 20,
    color: colors.primary,
  },
  recentItemKcalLabel: {
    ...typography.caption,
    fontSize: 10,
  }
});
