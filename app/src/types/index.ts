/**
 * Core data types for the Centscape wishlist application
 */

export interface WishlistItem {
  id: string;
  title: string;
  imageUrl: string | null;
  price: string | null;
  sourceDomain: string;
  originalUrl: string;
  normalizedUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface UrlPreview {
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: string | null;
  sourceDomain: string;
  originalUrl: string;
  normalizedUrl: string;
}

export interface AddItemParams {
  url: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  DUPLICATE = 'duplicate',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  retryable: boolean;
}

export interface DeepLinkParams {
  action: 'add';
  url?: string;
}

export interface DatabaseSchema {
  version: number;
  tables: {
    wishlist_items: {
      id: string;
      title: string;
      image_url: string | null;
      price: string | null;
      source_domain: string;
      original_url: string;
      normalized_url: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface ProductData {
  title: string;
  description: string;
  price: string;
  brand: string;
  category: string;
  imageUrl: string;
  availability: string;
  rating?: string;
  reviews?: string;
  currency?: string;
  originalPrice?: string;
  discount?: string;
  features?: string[];
  offers?: string[];
  sourceDomain: string;
  originalUrl: string;
  normalizedUrl: string;
}
