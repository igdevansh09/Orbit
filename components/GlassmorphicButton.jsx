import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getGlassmorphicButtonStyle } from '../lib/glassmorphism';

/**
 * Glassmorphic button component with consistent styling
 */
export default function GlassmorphicButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  variant = 'primary', // 'primary', 'secondary', 'ghost'
  size = 'medium', // 'small', 'medium', 'large'
  style,
  textStyle,
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => getStyles(theme), [theme]);

  const baseStyle = [
    styles.button,
    styles[`size_${size}`],
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={baseStyle}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.textPrimary} size="small" />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={variant === 'primary' ? theme.white : theme.primary}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.text,
                variant === 'primary' && styles.textPrimary,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    button: {
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      marginRight: 8,
    },
    // Variants
    primary: {
      backgroundColor: theme.primary,
      borderWidth: 0,
      shadowColor: theme.primary,
      shadowOpacity: 0.3,
      elevation: 4,
    },
    secondary: {
      backgroundColor: theme.glassBackgroundDark,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadowColorLight,
      shadowOpacity: 0.15,
      elevation: 2,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.border,
    },
    disabled: {
      opacity: 0.5,
    },
    // Sizes
    size_small: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    size_medium: {
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    size_large: {
      paddingVertical: 16,
      paddingHorizontal: 28,
      minHeight: 54,
    },
    // Text styles
    text: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textSecondary,
      letterSpacing: 0.3,
    },
    textPrimary: {
      color: theme.white,
      fontWeight: '700',
    },
  });
