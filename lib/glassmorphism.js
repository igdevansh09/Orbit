/**
 * Glassmorphism utilities for creating frosted glass effects
 * Uses React Native's styling system combined with blur effects
 */

import { Colors } from '../constants/colors';

/**
 * Creates a glassmorphic container style with blur effect appearance
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {object} StyleSheet object for glassmorphic container
 */
export const getGlassmorphicContainerStyle = (isDark = false) => {
  const colors = isDark ? Colors.dark : Colors.light;
  
  return {
    backgroundColor: colors.glassBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  };
};

/**
 * Creates a glassmorphic card style with shadow
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {object} StyleSheet object for glassmorphic card
 */
export const getGlassmorphicCardStyle = (isDark = false) => {
  const colors = isDark ? Colors.dark : Colors.light;
  
  return {
    ...getGlassmorphicContainerStyle(isDark),
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  };
};

/**
 * Creates a glassmorphic button style
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {object} StyleSheet object for glassmorphic button
 */
export const getGlassmorphicButtonStyle = (isDark = false) => {
  const colors = isDark ? Colors.dark : Colors.light;
  
  return {
    backgroundColor: colors.glassBackgroundDark,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowColorLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  };
};

/**
 * Creates a glassmorphic input style
 * @param {boolean} isDark - Whether dark mode is active
 * @param {boolean} isFocused - Whether input is focused
 * @returns {object} StyleSheet object for glassmorphic input
 */
export const getGlassmorphicInputStyle = (isDark = false, isFocused = false) => {
  const colors = isDark ? Colors.dark : Colors.light;
  
  return {
    backgroundColor: colors.glassBackgroundDark,
    borderColor: isFocused ? colors.primary : colors.border,
    borderWidth: isFocused ? 2 : 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: 'Inter',
    shadowColor: isFocused ? colors.shadowColor : colors.shadowColorLight,
    shadowOffset: { width: 0, height: isFocused ? 4 : 2 },
    shadowOpacity: isFocused ? 0.4 : 0.2,
    shadowRadius: isFocused ? 8 : 4,
    elevation: isFocused ? 5 : 2,
  };
};

/**
 * Creates a glassmorphic header style
 * @param {boolean} isDark - Whether dark mode is active
 * @param {number} blurIntensity - Intensity of blur (0-1)
 * @returns {object} StyleSheet object for glassmorphic header
 */
export const getGlassmorphicHeaderStyle = (isDark = false, blurIntensity = 0) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const opacity = 0.4 + blurIntensity * 0.3; // Increases from 0.4 to 0.7
  
  return {
    backgroundColor: isDark 
      ? `rgba(27, 46, 27, ${opacity})` 
      : `rgba(255, 255, 255, ${opacity})`,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Math.min(0.2 + blurIntensity * 0.3, 0.5),
    shadowRadius: 8,
    elevation: 5,
    backdropFilter: 'blur(20px)', // CSS-like notation for reference
  };
};

/**
 * Creates a frosted overlay style for content on glass surfaces
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {object} StyleSheet object for frosted overlay
 */
export const getFrostedOverlayStyle = (isDark = false) => {
  const colors = isDark ? Colors.dark : Colors.light;
  
  return {
    backgroundColor: colors.glassBlur,
    borderRadius: 12,
    overflow: 'hidden',
  };
};

/**
 * Creates shadow style for elevated glassmorphic elements
 * @param {boolean} isDark - Whether dark mode is active
 * @param {'small' | 'medium' | 'large'} elevation - Shadow elevation level
 * @returns {object} Shadow style object
 */
export const getGlassmorphicShadow = (isDark = false, elevation = 'medium') => {
  const colors = isDark ? Colors.dark : Colors.light;
  
  const shadowMap = {
    small: {
      shadowColor: colors.shadowColorLight,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },
    large: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
  };
  
  return shadowMap[elevation] || shadowMap.medium;
};
