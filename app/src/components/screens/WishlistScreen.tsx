/**
 * Modern Dashboard-style Wishlist Screen
 * Features savings progress, motivational messaging, and beautiful UI
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useWishlistStore } from '../../stores/wishlistStore';
import { LoadingState } from '../../types';
import { WishlistItemSkeleton } from '../ui/SkeletonLoader';
import { WishlistItemComponent } from '../ui/WishlistItem';

export default function WishlistScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const {
    items,
    loadingState,
    error,
    hasMore,
    totalItems,
    initialize,
    loadItems,
    refreshItems,
    clearError,
  } = useWishlistStore();

  // Dummy data for demonstration
  const dummyItems = [
    {
      id: 'dummy-1',
      title: 'Airpods Max- Midnight',
      imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-hero-select-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604709293000',
      price: '$499.99',
      sourceDomain: 'apple.com',
      originalUrl: 'https://www.apple.com/airpods-max/',
      normalizedUrl: 'https://apple.com/airpods-max-dummy-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dummy-2',
      title: 'Stretch Bandeau top',
      imageUrl: 'https://static.zara.net/photos///2024/I/0/1/p/1234/123/123/2/w/750/1234-123-123.jpg',
      price: '$79.99',
      sourceDomain: 'zara.com',
      originalUrl: 'https://www.zara.com/us/en/stretch-bandeau-top-p1234123123.html',
      normalizedUrl: 'https://zara.com/us/en/stretch-bandeau-top-dummy-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Use dummy data if no real items exist
  const displayItems = items.length > 0 ? items : dummyItems;

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle error display
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        error.message,
        [
          {
            text: 'Retry',
            onPress: () => {
              clearError();
              refreshItems();
            },
          },
          { text: 'OK', onPress: clearError },
        ]
      );
    }
  }, [error, clearError, refreshItems]);

  // Load more items when scrolling
  const handleLoadMore = useCallback(() => {
    if (hasMore && loadingState !== LoadingState.LOADING) {
      loadItems(Math.ceil(items.length / 20) + 1, 20);
    }
  }, [hasMore, loadingState, items.length, loadItems]);

  // Handle item press
  const handleItemPress = useCallback((item: any) => {
    // Navigate to item details or open URL
    console.log('Item pressed:', item);
  }, []);

  // Calculate savings progress
  const totalValue = displayItems.reduce((sum, item) => {
    const price = item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : 0;
    return sum + price;
  }, 0);

  const goalAmount = 499.99;
  const savedAmount = 125; // This would come from actual savings tracking
  const remainingAmount = goalAmount - savedAmount;
  const progressPercentage = Math.min((savedAmount / goalAmount) * 100, 100);
  const daysToGoal = Math.ceil(remainingAmount / (savedAmount / 30)); // Rough estimate

  // Render dashboard header
  const renderDashboardHeader = () => (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardLabel}>
        <Text style={styles.dashboardLabelText}>MY DASHBOARD</Text>
      </View>
      
      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Your progress</Text>
        <Text style={styles.savedAmount}>You have saved ${savedAmount}</Text>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
            {[0, 25, 50, 75, 100].map((milestone, index) => (
              <View 
                key={index}
                style={[
                  styles.progressDot,
                  { left: `${milestone}%` }
                ]} 
              />
            ))}
          </View>
          <Text style={styles.goalText}>Goal ${goalAmount}</Text>
        </View>
        
        <View style={styles.remainingTag}>
          <Text style={styles.remainingText}>${remainingAmount.toFixed(2)} to go</Text>
        </View>
      </View>
    </View>
  );

  // Render wishlist section
  const renderWishlistSection = () => (
    <View style={styles.wishlistSection}>
      <View style={styles.wishlistLabel}>
        <Text style={styles.wishlistLabelText}>MY WISHLIST</Text>
      </View>
      
      {displayItems.length > 0 ? (
        <FlatList
          data={displayItems}
          renderItem={({ item }) => (
            <WishlistItemComponent item={item} onPress={() => handleItemPress(item)} />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.wishlistList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl
              refreshing={loadingState === LoadingState.LOADING}
              onRefresh={refreshItems}
              tintColor={Colors[colorScheme ?? 'light'].tint}
            />
          }
        />
      ) : (
        <View style={styles.emptyWishlist}>
          <Ionicons
            name="heart-outline"
            size={48}
            color={Colors[colorScheme ?? 'light'].icon}
          />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>Start adding items to track your savings</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.addItemButton}
        onPress={() => router.push('/add')}
        accessibilityLabel="Add new item"
        accessibilityHint="Navigate to add item screen"
      >
        <View style={styles.addButtonCircle}>
          <Ionicons name="add" size={24} color="white" />
        </View>
        <Text style={styles.addButtonText}>Add items to your Centscape Wishlist</Text>
      </TouchableOpacity>
    </View>
  );

  // Render motivational message
  const renderMotivationalMessage = () => (
    <View style={styles.motivationalContainer}>
      <Text style={styles.motivationalText}>
        Keep going! According to your spending habits you will reach your goal of ${goalAmount} in{' '}
        <Text style={styles.daysHighlight}>{daysToGoal} DAYS!</Text>
      </Text>
    </View>
  );

  // Show loading skeleton if initial loading
  if (loadingState === LoadingState.LOADING && items.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme ?? 'light'].background },
        ]}
      >
        {renderDashboardHeader()}
        <WishlistItemSkeleton count={3} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].background },
      ]}
    >
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View>
            {renderDashboardHeader()}
            {renderWishlistSection()}
            {renderMotivationalMessage()}
          </View>
        )}
        keyExtractor={() => 'main'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loadingState === LoadingState.LOADING}
            onRefresh={refreshItems}
            tintColor={Colors[colorScheme ?? 'light'].tint}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
  },
  dashboardContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  dashboardLabel: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  dashboardLabelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  savedAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 20,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressDot: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    transform: [{ translateX: -6 }],
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  remainingTag: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-end',
    marginTop: -10,
  },
  remainingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  wishlistSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  wishlistLabel: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  wishlistLabelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  wishlistList: {
    paddingBottom: 20,
  },
  emptyWishlist: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  motivationalContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  motivationalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
  daysHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
});
