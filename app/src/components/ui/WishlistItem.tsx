/**
 * Modern Wishlist Item Component
 * Features clean design with brand name, product title, and price
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useWishlistStore } from '../../stores/wishlistStore';
import { WishlistItem } from '../../types';
import { generateProductFallbackImage } from '../../utils';

interface WishlistItemComponentProps {
  item: WishlistItem;
  onPress?: () => void;
}

export const WishlistItemComponent: React.FC<WishlistItemComponentProps> = ({
  item,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const deleteItem = useWishlistStore(state => state.deleteItem);

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteItem(item.id),
        },
      ]
    );
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const imageSource = item.imageUrl || generateProductFallbackImage(item.title, item.price || undefined);
  
  // Extract brand name from title (first word)
  const brandName = item.title.split(' ')[0];
  const productName = item.title.substring(brandName.length + 1);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      accessibilityLabel={`Wishlist item: ${item.title}`}
      accessibilityHint="Double tap to view item details"
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageSource }}
          style={styles.image}
          contentFit="cover"
          placeholder={generateProductFallbackImage(item.title, item.price || undefined)}
          transition={200}
          onError={() => {
            console.log('Wishlist item image failed to load');
          }}
        />
      </View>

      {/* Product Details */}
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.brandName}>{brandName}</Text>
          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price || 'N/A'}</Text>
        </View>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        accessibilityLabel="Delete item"
        accessibilityHint="Double tap to delete this item from your wishlist"
      >
        <Ionicons
          name="trash-outline"
          size={18}
          color="#FF6B6B"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  priceContainer: {
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
  },
});
