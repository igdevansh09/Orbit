/**
 * Reanimated animation utilities for consistent, performant animations
 */

import Animated, {
  Easing,
  runOnJS,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

/**
 * Standard timing configuration for animations
 */
export const ANIMATION_TIMING = {
  short: 200,      // Quick interactions (200ms)
  medium: 300,     // Standard animations (300ms)
  long: 500,       // Complex transitions (500ms)
};

/**
 * Standard easing functions
 */
export const EASE = {
  easeIn: Easing.inOut(Easing.cubic),
  easeOut: Easing.out(Easing.cubic),
  easeInOut: Easing.inOut(Easing.cubic),
  spring: Easing.bezier(0.34, 1.56, 0.64, 1),
  gentle: Easing.bezier(0.25, 0.1, 0.25, 1),
};

/**
 * Creates a fade-in animation
 * @param {Animated.SharedValue} opacity - Shared value for opacity
 * @param {number} duration - Animation duration in ms
 * @returns {void}
 */
export const fadeIn = (opacity, duration = ANIMATION_TIMING.medium) => {
  opacity.value = withTiming(1, {
    duration,
    easing: EASE.easeOut,
  });
};

/**
 * Creates a fade-out animation
 * @param {Animated.SharedValue} opacity - Shared value for opacity
 * @param {number} duration - Animation duration in ms
 * @param {Function} callback - Optional callback when animation ends
 * @returns {void}
 */
export const fadeOut = (opacity, duration = ANIMATION_TIMING.medium, callback) => {
  opacity.value = withTiming(0, {
    duration,
    easing: EASE.easeOut,
  }, () => {
    if (callback) {
      runOnJS(callback)();
    }
  });
};

/**
 * Creates a scale animation (pop effect)
 * @param {Animated.SharedValue} scale - Shared value for scale
 * @param {number} targetScale - Target scale value (e.g., 1.0)
 * @param {number} duration - Animation duration in ms
 * @returns {void}
 */
export const popIn = (scale, targetScale = 1, duration = ANIMATION_TIMING.short) => {
  scale.value = withTiming(targetScale, {
    duration,
    easing: EASE.spring,
  });
};

/**
 * Creates a slide-up animation
 * @param {Animated.SharedValue} translateY - Shared value for Y translation
 * @param {number} targetY - Target Y position
 * @param {number} duration - Animation duration in ms
 * @returns {void}
 */
export const slideUp = (translateY, targetY = 0, duration = ANIMATION_TIMING.medium) => {
  translateY.value = withTiming(targetY, {
    duration,
    easing: EASE.easeOut,
  });
};

/**
 * Creates a slide-down animation
 * @param {Animated.SharedValue} translateY - Shared value for Y translation
 * @param {number} targetY - Target Y position
 * @param {number} duration - Animation duration in ms
 * @returns {void}
 */
export const slideDown = (translateY, targetY, duration = ANIMATION_TIMING.medium) => {
  translateY.value = withTiming(targetY, {
    duration,
    easing: EASE.easeOut,
  });
};

/**
 * Creates a shake animation (for error states)
 * @param {Animated.SharedValue} translateX - Shared value for X translation
 * @param {number} intensity - Shake intensity in pixels
 * @returns {void}
 */
export const shake = (translateX, intensity = 10) => {
  const shakeSequence = [
    withTiming(intensity, { duration: 50 }),
    withTiming(-intensity, { duration: 50 }),
    withTiming(intensity * 0.7, { duration: 50 }),
    withTiming(-intensity * 0.7, { duration: 50 }),
    withTiming(0, { duration: 50 }),
  ];
  
  // Run through shake sequence
  shakeSequence.forEach((animation, index) => {
    setTimeout(() => {
      translateX.value = animation;
    }, index * 50);
  });
};

/**
 * Creates a height animation for expanding/collapsing content
 * @param {Animated.SharedValue} height - Shared value for height
 * @param {number} targetHeight - Target height value
 * @param {number} duration - Animation duration in ms
 * @returns {void}
 */
export const animateHeight = (height, targetHeight, duration = ANIMATION_TIMING.medium) => {
  height.value = withTiming(targetHeight, {
    duration,
    easing: EASE.easeInOut,
  });
};

/**
 * Creates a color animation through interpolation
 * @param {Animated.SharedValue} value - Shared value (0-1) controlling animation progress
 * @param {string} startColor - RGB color string at start (e.g., "rgb(100,150,200)")
 * @param {string} endColor - RGB color string at end
 * @returns {Animated.Node} Animated color value
 */
export const animateColor = (value, startColor, endColor) => {
  // Parse RGB colors
  const parseColor = (color) => {
    const match = color.match(/\d+/g);
    return match ? match.map(Number) : [0, 0, 0];
  };
  
  const [sr, sg, sb] = parseColor(startColor);
  const [er, eg, eb] = parseColor(endColor);
  
  return interpolate(
    value,
    [0, 1],
    [
      `rgb(${sr},${sg},${sb})`,
      `rgb(${er},${eg},${eb})`,
    ],
    Extrapolate.CLAMP
  );
};

/**
 * Creates a staggered animation for multiple items
 * @param {Array<Animated.SharedValue>} values - Array of shared values to animate
 * @param {number} delayBetweenItems - Delay between each item animation in ms
 * @param {Function} animationFn - Animation function to apply to each value
 * @returns {void}
 */
export const staggerAnimation = (values, delayBetweenItems = 50, animationFn) => {
  values.forEach((value, index) => {
    setTimeout(() => {
      animationFn(value);
    }, index * delayBetweenItems);
  });
};

/**
 * Creates a bounce animation
 * @param {Animated.SharedValue} value - Shared value to animate
 * @param {number} intensity - Bounce intensity/amplitude
 * @param {number} duration - Animation duration in ms
 * @returns {void}
 */
export const bounce = (value, intensity = 20, duration = ANIMATION_TIMING.medium) => {
  value.value = withTiming(intensity, {
    duration: duration * 0.3,
    easing: EASE.spring,
  });
  
  setTimeout(() => {
    value.value = withTiming(0, {
      duration: duration * 0.7,
      easing: EASE.easeOut,
    });
  }, duration * 0.3);
};

/**
 * Creates a pulse animation for loading states
 * @param {Animated.SharedValue} opacity - Shared value for opacity
 * @param {number} cycles - Number of pulse cycles
 * @returns {void}
 */
export const pulse = (opacity, cycles = 3) => {
  for (let i = 0; i < cycles; i++) {
    setTimeout(() => {
      opacity.value = withTiming(0.5, {
        duration: ANIMATION_TIMING.medium,
        easing: EASE.easeInOut,
      });
    }, i * (ANIMATION_TIMING.medium * 2));
    
    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: ANIMATION_TIMING.medium,
        easing: EASE.easeInOut,
      });
    }, i * (ANIMATION_TIMING.medium * 2) + ANIMATION_TIMING.medium);
  }
};

/**
 * Creates a rotation animation
 * @param {Animated.SharedValue} rotation - Shared value for rotation
 * @param {number} targetRotation - Target rotation in degrees
 * @param {number} duration - Animation duration in ms
 * @returns {void}
 */
export const rotate = (rotation, targetRotation = 360, duration = ANIMATION_TIMING.long) => {
  rotation.value = withTiming(targetRotation, {
    duration,
    easing: EASE.easeInOut,
  });
};
