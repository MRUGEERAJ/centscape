/**
 * Modern Home Screen with Goal Achievement Popup
 * Features beautiful popup design and motivational messaging
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useWishlistStore } from '../../src/stores/wishlistStore';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { items } = useWishlistStore();
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate popup on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Calculate goal achievement
  const goalAmount = 100.00;
  const savedAmount = 100.00; // This would come from actual savings tracking
  const daysToGoal = 58; // This would be calculated based on savings rate

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].background },
      ]}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={['#E8F5E8', '#D4E8D4']}
        style={styles.backgroundGradient}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Centscape</Text>
          <Text style={styles.welcomeSubtitle}>
            Your smart wishlist and savings companion
          </Text>
        </View>

        {/* Goal Achievement Popup */}
        <Animated.View
          style={[
            styles.popupContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.popup}>
            <View style={styles.popupHeader}>
              <Ionicons name="trophy" size={32} color="#4CAF50" />
              <Text style={styles.popupTitle}>Goal Achieved!</Text>
            </View>

            <Text style={styles.achievementText}>
              Thank you for reaching your goal of ${goalAmount.toFixed(2)} in
            </Text>

            <Text style={styles.daysHighlight}>{daysToGoal} DAYS!</Text>

                         <Text style={styles.congratulationsText}>
               You&apos;ve shown incredible discipline and smart saving habits. Keep up the great work!
             </Text>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{items.length}</Text>
                <Text style={styles.statLabel}>Items</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>${savedAmount.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{daysToGoal}</Text>
                <Text style={styles.statLabel}>Days</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/wishlist')}
                accessibilityLabel="View wishlist"
                accessibilityHint="Navigate to your wishlist"
              >
                <Ionicons name="heart" size={20} color="white" />
                <Text style={styles.primaryButtonText}>View Wishlist</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/add')}
                accessibilityLabel="Add new item"
                accessibilityHint="Add a new item to your wishlist"
              >
                <Ionicons name="add" size={20} color="#4CAF50" />
                <Text style={styles.secondaryButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  popupContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: width - 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  popupHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
  },
  achievementText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  daysHighlight: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  congratulationsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  tipsSection: {
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
