/**
 * Skeleton loading component for wishlist items
 */

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from '../../../hooks/useColorScheme';

interface SkeletonItemProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
}

export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  marginBottom = 8,
}) => {
  const colorScheme = useColorScheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          marginBottom,
          opacity,
          backgroundColor: Colors[colorScheme ?? 'light'].skeleton,
        },
      ]}
    />
  );
};

interface WishlistItemSkeletonProps {
  count?: number;
}

export const WishlistItemSkeleton: React.FC<WishlistItemSkeletonProps> = ({ count = 3 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.itemContainer}>
          {/* Image skeleton */}
          <SkeletonItem width={80} height={80} borderRadius={8} marginBottom={12} />
          
          {/* Content skeleton */}
          <View style={styles.contentContainer}>
            <SkeletonItem width="80%" height={16} marginBottom={8} />
            <SkeletonItem width="60%" height={14} marginBottom={8} />
            <SkeletonItem width="40%" height={14} marginBottom={8} />
            <SkeletonItem width="30%" height={12} marginBottom={0} />
          </View>
        </View>
      ))}
    </View>
  );
};

interface ProductCardSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <View style={styles.cardContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.cardSkeleton}>
          {/* Card header */}
          <View style={styles.cardHeader}>
            <SkeletonItem width={24} height={24} borderRadius={12} marginBottom={0} />
            <SkeletonItem width={140} height={16} borderRadius={4} marginBottom={0} />
          </View>
          
          {/* Card content */}
          <View style={styles.cardContent}>
            {/* Image skeleton */}
            <SkeletonItem width="100%" height={160} borderRadius={8} marginBottom={12} />
            
            {/* Product info skeleton */}
            <View style={styles.productInfoContainer}>
              <SkeletonItem width="95%" height={18} borderRadius={4} marginBottom={8} />
              <SkeletonItem width="45%" height={20} borderRadius={4} marginBottom={6} />
              <SkeletonItem width="70%" height={14} borderRadius={4} marginBottom={0} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cardContainer: {
    width: '100%',
    paddingHorizontal: 0,
  },
  cardSkeleton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  cardContent: {
    // Container for card content
  },
  productInfoContainer: {
    gap: 6,
  },
  skeleton: {
    // Styles are applied inline
  },
});
