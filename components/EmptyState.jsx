import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export default function EmptyState({
  iconName = 'search-outline',
  title = 'No Results Found',
  subtitle = 'Try a different keyword or category.',
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => getStyles(theme), [theme]);

  const floatAnim = useSharedValue(0);

  React.useEffect(() => {
    floatAnim.value = withRepeat(
      withTiming(1, {
        duration: ANIMATION_TIMING.long * 2,
      }),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      floatAnim.value,
      [0, 0.5, 1],
      [0, -12, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  const animatedOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      floatAnim.value,
      [0, 0.5, 1],
      [0.6, 1, 0.6],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <AnimatedView style={animatedIconStyle}>
        <Ionicons
          name={iconName}
          size={64}
          color={theme.textSecondary}
          style={styles.icon}
        />
      </AnimatedView>

      <AnimatedView style={animatedOpacityStyle}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </AnimatedView>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 80,
    },
    icon: {
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginTop: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
  });
