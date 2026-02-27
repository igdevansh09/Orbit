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

/**
 * Shimmer effect component for loading states
 * Creates a moving gradient effect across the element
 */
export default function ShimmerLoader({
  width = '100%',
  height = 200,
  borderRadius = 12,
  style,
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => getStyles(theme), [theme]);

  const shimmerAnim = useSharedValue(0);

  useEffect(() => {
    shimmerAnim.value = withRepeat(
      withTiming(1, {
        duration: ANIMATION_TIMING.long * 1.5,
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmerAnim.value,
      [0, 0.5, 1],
      [0.4, 0.9, 0.4],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <AnimatedView
      style={[
        styles.shimmer,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Image loading skeleton with shimmer effect
 */
export function ImageLoadingPlaceholder({ width = '100%', height = 260 }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ShimmerLoader width={width} height={height} borderRadius={24} />
      <View style={styles.loadingText}>
        <ShimmerLoader width="60%" height={12} borderRadius={6} />
      </View>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    shimmer: {
      backgroundColor: theme.skeleton,
    },
    container: {
      marginTop: 16,
    },
    loadingText: {
      marginTop: 12,
    },
  });
