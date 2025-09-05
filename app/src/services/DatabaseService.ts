/**
 * Database service using AsyncStorage for persistence
 * Handles CRUD operations and schema migrations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistItem } from '../types';
import { UrlNormalizationService } from './UrlNormalizationService';

export class DatabaseService {
  private static readonly STORAGE_KEY = 'centscape_wishlist';
  private static readonly SCHEMA_VERSION_KEY = 'centscape_schema_version';
  private static readonly CURRENT_SCHEMA_VERSION = 2;

  /**
   * Initializes the database and runs migrations if needed
   */
  static async initialize(): Promise<void> {
    try {
      const currentVersion = await this.getSchemaVersion();
      
      if (currentVersion < this.CURRENT_SCHEMA_VERSION) {
        await this.runMigrations(currentVersion);
        await this.setSchemaVersion(this.CURRENT_SCHEMA_VERSION);
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Adds a new item to the wishlist with deduplication
   */
  static async addItem(item: Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<WishlistItem> {
    try {
      const items = await this.getAllItems();
      
      // Check for duplicates using normalized URL
      const isDuplicate = items.some(existingItem => 
        existingItem.normalizedUrl === item.normalizedUrl
      );
      
      if (isDuplicate) {
        throw new Error('Item already exists in wishlist');
      }

      const newItem: WishlistItem = {
        ...item,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      items.push(newItem);
      await this.saveItems(items);
      
      return newItem;
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  }

  /**
   * Retrieves all wishlist items
   */
  static async getAllItems(): Promise<WishlistItem[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const items = JSON.parse(data);
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Failed to get items:', error);
      return [];
    }
  }

  /**
   * Retrieves items with pagination
   */
  static async getItems(page: number = 1, limit: number = 20): Promise<{
    items: WishlistItem[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const allItems = await this.getAllItems();
      const sortedItems = allItems.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const items = sortedItems.slice(startIndex, endIndex);
      
      return {
        items,
        total: allItems.length,
        hasMore: endIndex < allItems.length,
      };
    } catch (error) {
      console.error('Failed to get paginated items:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Updates an existing item
   */
  static async updateItem(id: string, updates: Partial<WishlistItem>): Promise<WishlistItem | null> {
    try {
      const items = await this.getAllItems();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) return null;
      
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await this.saveItems(items);
      return items[index];
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  }

  /**
   * Deletes an item by ID
   */
  static async deleteItem(id: string): Promise<boolean> {
    try {
      const items = await this.getAllItems();
      const filteredItems = items.filter(item => item.id !== id);
      
      if (filteredItems.length === items.length) {
        return false; // Item not found
      }
      
      await this.saveItems(filteredItems);
      return true;
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  }

  /**
   * Checks if an item exists by normalized URL
   */
  static async itemExists(normalizedUrl: string): Promise<boolean> {
    try {
      const items = await this.getAllItems();
      return items.some(item => item.normalizedUrl === normalizedUrl);
    } catch (error) {
      console.error('Failed to check item existence:', error);
      return false;
    }
  }

  /**
   * Clears all wishlist data
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Saves items to storage
   */
  private static async saveItems(items: WishlistItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save items:', error);
      throw error;
    }
  }

  /**
   * Gets current schema version
   */
  private static async getSchemaVersion(): Promise<number> {
    try {
      const version = await AsyncStorage.getItem(this.SCHEMA_VERSION_KEY);
      return version ? parseInt(version, 10) : 1;
    } catch (error) {
      console.error('Failed to get schema version:', error);
      return 1;
    }
  }

  /**
   * Sets schema version
   */
  private static async setSchemaVersion(version: number): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SCHEMA_VERSION_KEY, version.toString());
    } catch (error) {
      console.error('Failed to set schema version:', error);
      throw error;
    }
  }

  /**
   * Runs database migrations
   */
  private static async runMigrations(fromVersion: number): Promise<void> {
    try {
      if (fromVersion < 2) {
        await this.migrateToV2();
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Migration to v2: Add normalizedUrl field
   */
  private static async migrateToV2(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!data) return;
      
      const items = JSON.parse(data);
      if (!Array.isArray(items)) return;
      
      const migratedItems = items.map((item: any) => {
        if (!item.normalizedUrl && item.originalUrl) {
          return {
            ...item,
            normalizedUrl: UrlNormalizationService.normalizeUrl(item.originalUrl),
          };
        }
        return item;
      });
      
      await this.saveItems(migratedItems);
    } catch (error) {
      console.error('V2 migration failed:', error);
      throw error;
    }
  }

  /**
   * Generates a unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
