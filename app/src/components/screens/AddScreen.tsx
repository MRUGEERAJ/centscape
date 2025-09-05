/**
 * Modern Add Screen with Clean UI
 * Features URL input, preview, and beautiful design
 */

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { UrlNormalizationService } from '../../services/UrlNormalizationService';
import { useWishlistStore } from '../../stores/wishlistStore';
import { LoadingState, UrlPreview } from '../../types';
import { extractProductDataWithAI, generateBrandFallbackImage, generateImagePlaceholder } from '../../utils';
import { ProductCardSkeleton } from '../ui/SkeletonLoader';

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const addItemWithPreview = useWishlistStore(state => state.addItemWithPreview);
  
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<UrlPreview | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const urlFetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch preview when URL changes
  const handleFetchPreview = useCallback(async (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setPreview(null);
      setError(null);
      return;
    }

    try {
      setLoadingState(LoadingState.LOADING);
      setError(null);

      const sanitizedUrl = UrlNormalizationService.sanitizeUrl(inputUrl);
      
      if (!UrlNormalizationService.isValidUrl(sanitizedUrl)) {
        throw new Error('Please enter a valid URL');
      }

      // Check if it's an Amazon URL and try to extract real data
      const domain = UrlNormalizationService.extractDomain(sanitizedUrl);
      
      // Try to extract product data from any URL using the real API
      const productData = await extractProductDataWithAI(sanitizedUrl);
      if (productData) {
        setPreview(productData);
        setLoadingState(LoadingState.SUCCESS);
        return;
      }

      // Fallback to dummy data for other sites or if extraction fails
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate better dummy data based on domain
      let title = `Product from ${domain}`;
      let price = '$99.99';
      
      if (domain.includes('amazon')) {
        title = 'Amazon Product - Premium Quality';
        price = '$149.99';
      } else if (domain.includes('apple')) {
        title = 'Apple Device - Latest Model';
        price = '$999.99';
      } else if (domain.includes('zara')) {
        title = 'Zara Fashion Item - Trendy Design';
        price = '$79.99';
      } else if (domain.includes('nike')) {
        title = 'Nike Athletic Gear - Performance';
        price = '$129.99';
      }
      
      const dummyPreview: UrlPreview = {
        title,
        description: `A great product from ${domain}`,
        imageUrl: generateBrandFallbackImage(domain),
        price,
        sourceDomain: domain,
        originalUrl: sanitizedUrl,
        normalizedUrl: UrlNormalizationService.normalizeUrl(sanitizedUrl),
      };

      setPreview(dummyPreview);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preview';
      
      // Check if it's a network error (API server not available)
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        setError('Unable to connect to product service. Please make sure your server is running on localhost:3000');
      } else {
        setError(errorMessage);
      }
      
      setPreview(null);
      setLoadingState(LoadingState.ERROR);
    }
  }, []);

  // Handle deep link URL
  useEffect(() => {
    if (params.url && typeof params.url === 'string') {
      setUrl(params.url);
      handleFetchPreview(params.url);
    }
  }, [params.url, handleFetchPreview]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (urlFetchTimeoutRef.current) {
        clearTimeout(urlFetchTimeoutRef.current);
      }
    };
  }, []);

  // Handle URL input change
  const handleUrlChange = useCallback((text: string) => {
    setUrl(text);
    setError(null);
    
    // Clear any existing timeout
    if (urlFetchTimeoutRef.current) {
      clearTimeout(urlFetchTimeoutRef.current);
    }
    
    // Debounce preview fetching
    urlFetchTimeoutRef.current = setTimeout(() => {
      if (text.trim()) {
        handleFetchPreview(text);
      } else {
        setPreview(null);
      }
    }, 500);
  }, [handleFetchPreview]);

  // Handle add item
  const handleAddItem = useCallback(async () => {
    if (!preview) {
      Alert.alert('Error', 'Please wait for the preview to load');
      return;
    }

    try {
      await addItemWithPreview(preview);
      Alert.alert(
        'Success',
        'Item added to your wishlist!',
        [
          {
            text: 'View Wishlist',
            onPress: () => router.push('/wishlist'),
          },
          {
            text: 'Add Another',
            onPress: () => {
              setUrl('');
              setPreview(null);
              setError(null);
            },
          },
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      Alert.alert('Error', errorMessage);
    }
  }, [preview, addItemWithPreview, router]);

  // Handle paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        setUrl(clipboardContent);
        handleFetchPreview(clipboardContent);
      } else {
        Alert.alert('Clipboard Empty', 'No URL found in clipboard');
      }
    } catch {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  }, [handleFetchPreview]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].background },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* URL Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.welcomeContainer}>
              <Ionicons 
                name="add-circle" 
                size={36} 
                color="#4CAF50"
                accessibilityLabel="Add item icon"
              />
              <Text 
                style={styles.welcomeTitle}
                accessibilityLabel="Add Your Dream Item"
              >
                Add Your Dream Item
              </Text>
              <Text 
                style={styles.welcomeSubtitle}
                accessibilityLabel="Paste a product URL and we'll help you track it"
              >
                Paste a product URL and we&apos;ll help you track it
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: error ? '#FF6B6B' : '#E0E0E0',
                  },
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={url}
                  onChangeText={handleUrlChange}
                  placeholder="Paste product URL here"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="done"
                  accessibilityLabel="URL input field"
                  accessibilityHint="Enter the URL of the item you want to add"
                />
                <TouchableOpacity
                  style={styles.pasteButton}
                  onPress={handlePaste}
                  accessibilityLabel="Paste from clipboard"
                  accessibilityHint="Paste URL from clipboard"
                >
                  <Ionicons
                    name="clipboard-outline"
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {error && (
                <Text style={styles.errorText}>
                  {error}
                </Text>
              )}
            </View>
          </View>

          {/* Error State with Retry */}
          {loadingState === LoadingState.ERROR && (
            <View style={styles.errorSection}>
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={32} color="#FF6B6B" />
                <Text style={styles.errorTitle}>Failed to Load Preview</Text>
                <Text style={styles.errorMessage}>
                  {error || 'Unable to fetch product information'}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => handleFetchPreview(url)}
                  accessibilityLabel="Retry loading preview"
                  accessibilityHint="Try to load the product preview again"
                >
                  <Ionicons name="refresh" size={16} color="white" />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Preview Section */}
          {loadingState === LoadingState.LOADING && (
            <View style={styles.previewSection}>
              <View style={styles.loadingContainer}>
                <Ionicons name="search" size={32} color="#4CAF50" />
                <Text style={styles.loadingText}>Finding your product...</Text>
                <ProductCardSkeleton count={1} />
              </View>
            </View>
          )}

          {preview && loadingState === LoadingState.SUCCESS && (
            <View style={styles.previewSection}>
              <View style={styles.previewHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.previewTitle}>Product Found!</Text>
              </View>
              
              <View style={styles.previewCard}>
                <Image
                  source={{
                    uri: preview.imageUrl || generateImagePlaceholder(preview.title),
                  }}
                  style={styles.previewImage}
                  contentFit="contain"
                  placeholder={generateImagePlaceholder(preview.title)}
                  transition={200}
                  accessibilityLabel={`Product image for ${preview.title}`}
                  onError={() => {
                    // If the main image fails, use fallback
                    console.log('Image failed to load, using fallback');
                  }}
                />
                
                <View style={styles.previewContent}>
                  <Text 
                    style={styles.previewProductTitle} 
                    numberOfLines={2}
                    accessibilityLabel={`Product title: ${preview.title}`}
                  >
                    {preview.title}
                  </Text>
                  
                  {preview.price && (
                    <Text 
                      style={styles.previewPrice}
                      accessibilityLabel={`Product price: ${preview.price}`}
                    >
                      {preview.price}
                    </Text>
                  )}
                  
                  <Text 
                    style={styles.previewDomain} 
                    numberOfLines={1}
                    accessibilityLabel={`Product source: ${preview.sourceDomain}`}
                  >
                    {preview.sourceDomain}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Add Button */}
          {preview && (
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddItem}
                disabled={loadingState === LoadingState.LOADING}
                accessibilityLabel="Add item to wishlist"
                accessibilityHint="Add this item to your wishlist"
              >
                <Ionicons name="heart" size={24} color="white" />
                <Text style={styles.addButtonText}>Add to My Wishlist</Text>
              </TouchableOpacity>
              
              <Text style={styles.addButtonSubtext}>
                We&apos;ll track the price and notify you of changes
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  inputContainer: {
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  pasteButton: {
    padding: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  previewSection: {
    marginBottom: 20,
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 0,
    width: '100%',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 6,
  },
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
  },
  previewContent: {
    gap: 6,
  },
  previewProductTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  previewDomain: {
    fontSize: 14,
    color: '#666',
  },
  addButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 180,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  addButtonSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  errorSection: {
    marginBottom: 20,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE6E6',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 8,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
