import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * A simple shimmer-effect skeleton placeholder for loading states.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = theme.borderRadius.sm,
  style,
}: SkeletonProps) {
  const animValue = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [animValue]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.colors.skeleton,
          opacity: animValue,
        },
        style,
      ]}
    />
  );
}

/**
 * Pre-built skeleton card matching the product grid card shape.
 */
export function ProductCardSkeleton({ cardWidth }: { cardWidth: number }) {
  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <Skeleton width="100%" height={cardWidth} borderRadius={0} />
      <View style={styles.cardContent}>
        <Skeleton width="80%" height={16} />
        <Skeleton width="40%" height={20} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  cardContent: {
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
});
