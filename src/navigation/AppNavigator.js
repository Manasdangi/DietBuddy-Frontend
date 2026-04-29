import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import useStore from '../store/useStore';
import { useThemeColors, borderRadius, spacing } from '../utils/theme';

import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import LogScreen from '../screens/LogScreen';
import HistoryScreen from '../screens/HistoryScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import AddScreen from '../screens/AddScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation, colors, theme }) => {
  const styles = getStyles(colors);
  return (
    <View style={styles.tabBarContainer}>
      <BlurView tint={theme === 'dark' ? "dark" : "light"} intensity={theme === 'dark' ? 80 : 100} style={styles.tabBarBackground} />
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName;
          if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
          else if (route.name === 'Workout') iconName = isFocused ? 'barbell' : 'barbell-outline';
          else if (route.name === 'Add') iconName = 'add';
          else if (route.name === 'Log') iconName = isFocused ? 'restaurant' : 'restaurant-outline';
          else if (route.name === 'History') iconName = isFocused ? 'person' : 'person-outline';

          // Center "Add" button gets special styling
          const isCenter = route.name === 'Add';

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              {isCenter ? (
                <View style={styles.centerButtonContainer}>
                  <View style={styles.centerButton}>
                    <Ionicons name={iconName} size={32} color="#FFF" />
                  </View>
                </View>
              ) : (
                <View style={styles.iconWrapper}>
                  <Ionicons 
                    name={iconName} 
                    size={24} 
                    color={isFocused ? colors.primary : colors.textSecondary} 
                  />
                  {isFocused && <View style={styles.activeDot} />}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function AppNavigator() {
  const { goal, theme } = useStore();
  const colors = useThemeColors();

  if (!goal) {
    return <OnboardingScreen />;
  }

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: 'transparent',
      text: colors.text,
      border: 'transparent',
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={MyTheme}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} colors={colors} theme={theme} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Workout" component={WorkoutScreen} />
        <Tab.Screen name="Add" component={AddScreen} />
        <Tab.Screen name="Log" component={LogScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const getStyles = (colors) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    width: width * 0.9,
    height: 70,
    borderRadius: borderRadius.pill,
    overflow: 'visible', // Allows center button to overlap
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  activeDot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 4,
    borderColor: colors.background,
  }
});
