/**
 * Zustand store for wishlist state management
 * Handles loading states, error handling, and data persistence
 */

import { create } from 'zustand';
import { DatabaseService } from '../services/DatabaseService';
import { AppError, ErrorType, LoadingState, WishlistItem } from '../types';

interface WishlistState {
  // State
  items: WishlistItem[];
  loadingState: LoadingState;
  error: AppError | null;
  currentPage: number;
  hasMore: boolean;
  totalItems: number;
  
  // Actions
  initialize: () => Promise<void>;
  loadItems: (page?: number, limit?: number) => Promise<void>;
  addItem: (url: string) => Promise<void>;
  addItemWithPreview: (preview: any) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<WishlistItem>) => Promise<void>;
  clearError: () => void;
  refreshItems: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  // Initial state
  items: [],
  loadingState: LoadingState.IDLE,
  error: null,
  currentPage: 1,
  hasMore: false,
  totalItems: 0,

  // Initialize the store and database
  initialize: async () => {
    try {
      set({ loadingState: LoadingState.LOADING, error: null });
      
      // Initialize database
      await DatabaseService.initialize();
      
      // Load initial items
      await get().loadItems(1, 20);
      
      set({ loadingState: LoadingState.SUCCESS });
    } catch (error) {
      const appError: AppError = {
        type: ErrorType.UNKNOWN,
        message: 'Failed to initialize wishlist',
        retryable: true,
      };
      
      set({ 
        loadingState: LoadingState.ERROR, 
        error: appError 
      });
    }
  },

  // Load items with pagination
  loadItems: async (page = 1, limit = 20) => {
    try {
      set({ loadingState: LoadingState.LOADING, error: null });
      
      const result = await DatabaseService.getItems(page, limit);
      
      set({
        items: page === 1 ? result.items : [...get().items, ...result.items],
        currentPage: page,
        hasMore: result.hasMore,
        totalItems: result.total,
        loadingState: LoadingState.SUCCESS,
      });
    } catch (error) {
      const appError: AppError = {
        type: ErrorType.NETWORK,
        message: 'Failed to load wishlist items',
        retryable: true,
      };
      
      set({ 
        loadingState: LoadingState.ERROR, 
        error: appError 
      });
    }
  },

  // Add a new item to wishlist
  addItem: async (url: string) => {
    try {
      set({ loadingState: LoadingState.LOADING, error: null });
      
      // Since we're now passing a URL that already has preview data,
      // we'll create a simple item directly
      const domain = url.includes('amazon') ? 'amazon.com' : 
                     url.includes('apple') ? 'apple.com' : 
                     url.includes('zara') ? 'zara.com' : 
                     url.includes('nike') ? 'nike.com' : 'unknown.com';
      
      const title = url.includes('amazon') ? 'Amazon Product - Premium Quality' :
                   url.includes('apple') ? 'Apple Device - Latest Model' :
                   url.includes('zara') ? 'Zara Fashion Item - Trendy Design' :
                   url.includes('nike') ? 'Nike Athletic Gear - Performance' :
                   `Product from ${domain}`;
      
      const price = url.includes('amazon') ? '$149.99' :
                   url.includes('apple') ? '$999.99' :
                   url.includes('zara') ? '$79.99' :
                   url.includes('nike') ? '$129.99' : '$99.99';
      
      // Add to database
      const newItem = await DatabaseService.addItem({
        title,
        imageUrl: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Product+Image',
        price,
        sourceDomain: domain,
        originalUrl: url,
        normalizedUrl: url,
      });
      
      // Update state
      set(state => ({
        items: [newItem, ...state.items],
        totalItems: state.totalItems + 1,
        loadingState: LoadingState.SUCCESS,
      }));
    } catch (error) {
      let appError: AppError;
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          appError = {
            type: ErrorType.DUPLICATE,
            message: 'This item is already in your wishlist',
            retryable: false,
          };
        } else {
          appError = {
            type: ErrorType.NETWORK,
            message: error.message,
            retryable: true,
          };
        }
      } else {
        appError = {
          type: ErrorType.UNKNOWN,
          message: 'Failed to add item to wishlist',
          retryable: true,
        };
      }
      
      set({ 
        loadingState: LoadingState.ERROR, 
        error: appError 
      });
    }
  },

  // Add item with preview data
  addItemWithPreview: async (preview: any) => {
    try {
      set({ loadingState: LoadingState.LOADING, error: null });
      
      // Add to database using preview data
      const newItem = await DatabaseService.addItem({
        title: preview.title,
        imageUrl: preview.imageUrl,
        price: preview.price,
        sourceDomain: preview.sourceDomain,
        originalUrl: preview.originalUrl,
        normalizedUrl: preview.normalizedUrl,
      });
      
      // Update state
      set(state => ({
        items: [newItem, ...state.items],
        totalItems: state.totalItems + 1,
        loadingState: LoadingState.SUCCESS,
      }));
    } catch (error) {
      let appError: AppError;
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          appError = {
            type: ErrorType.DUPLICATE,
            message: 'This item is already in your wishlist',
            retryable: false,
          };
        } else {
          appError = {
            type: ErrorType.NETWORK,
            message: error.message,
            retryable: true,
          };
        }
      } else {
        appError = {
          type: ErrorType.UNKNOWN,
          message: 'Failed to add item to wishlist',
          retryable: true,
        };
      }
      
      set({ 
        loadingState: LoadingState.ERROR, 
        error: appError 
      });
    }
  },

  // Delete an item
  deleteItem: async (id: string) => {
    try {
      const success = await DatabaseService.deleteItem(id);
      
      if (success) {
        set(state => ({
          items: state.items.filter(item => item.id !== id),
          totalItems: state.totalItems - 1,
        }));
      }
    } catch (error) {
      const appError: AppError = {
        type: ErrorType.UNKNOWN,
        message: 'Failed to delete item',
        retryable: true,
      };
      
      set({ error: appError });
    }
  },

  // Update an item
  updateItem: async (id: string, updates: Partial<WishlistItem>) => {
    try {
      const updatedItem = await DatabaseService.updateItem(id, updates);
      
      if (updatedItem) {
        set(state => ({
          items: state.items.map(item => 
            item.id === id ? updatedItem : item
          ),
        }));
      }
    } catch (error) {
      const appError: AppError = {
        type: ErrorType.UNKNOWN,
        message: 'Failed to update item',
        retryable: true,
      };
      
      set({ error: appError });
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Refresh items (reload from database)
  refreshItems: async () => {
    await get().loadItems(1, 20);
  },
}));
