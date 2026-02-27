import React, { useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { ANIMATION_TIMING } from '../lib/animations';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8 }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => getStyles(theme), [theme]);

  const shimmerAnim = useSharedValue(0);

  useEffect(() => {
    shimmerAnim.value = withRepeat(
      withTiming(1, {
        duration: ANIMATION_TIMING.long,
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmerAnim.value,
      [0, 1],
      [0.5, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <AnimatedView
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
      ]}
    />
  );
}

// Skeleton card for loading experiences
export function ExperienceCardSkeleton() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.headerSkeleton}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <SkeletonLoader width="80%" height={16} borderRadius={6} />
          <SkeletonLoader width="60%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
      </View>

      <View style={styles.contentSkeleton}>
        <SkeletonLoader width="70%" height={24} borderRadius={6} />
        <SkeletonLoader width="50%" height={14} borderRadius={6} style={{ marginTop: 12 }} />
        <SkeletonLoader width="100%" height={80} borderRadius={12} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    skeleton: {
      backgroundColor: theme.skeleton,
    },
    cardSkeleton: {
      backgroundColor: theme.cardBackground,
      marginBottom: 32,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerSkeleton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 0,
    },
    contentSkeleton: {
      paddingHorizontal: 0,
    },
  });
