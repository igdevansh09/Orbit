import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { ANIMATION_TIMING, EASE } from '../lib/animations';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedFilterPill({
  filters,
  selectedFilter,
  onSelectFilter,
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Shared value for background animation
  const backgroundScale = useSharedValue(0);

  const handlePillPress = (filter) => {
    backgroundScale.value = withTiming(1, {
      duration: ANIMATION_TIMING.medium,
      easing: EASE.spring,
    });

    // Reset after animation
    setTimeout(() => {
      backgroundScale.value = 0;
    }, ANIMATION_TIMING.medium);

    onSelectFilter(filter);
  };

  return (
    <FlatList
      horizontal
      data={filters}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item}
      contentContainerStyle={{ gap: 8, paddingRight: 16 }}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const isActive = selectedFilter === item;

        return (
          <TouchableOpacity
            onPress={() => handlePillPress(item)}
            activeOpacity={0.7}
            style={[
              styles.pill,
              isActive && styles.pillActive,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                isActive && styles.pillTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    pill: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 24,
      backgroundColor: theme.glassBackgroundDark,
      borderWidth: 1.5,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 70,
      shadowColor: theme.shadowColorLight,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    pillActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      shadowColor: theme.primary,
      shadowOpacity: 0.4,
      elevation: 5,
    },
    pillText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
      letterSpacing: 0.3,
    },
    pillTextActive: {
      color: theme.white,
      fontWeight: '700',
    },
  });
