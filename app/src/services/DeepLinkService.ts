/**
 * Deep linking service for handling URL schemes
 * Manages centscape://add?url= deep links
 */

import * as Linking from 'expo-linking';
import { DeepLinkParams } from '../types';
import { UrlNormalizationService } from './UrlNormalizationService';

export class DeepLinkService {
  private static readonly SCHEME = 'centscape';
  private static readonly HOST = 'add';

  /**
   * Initializes deep linking listeners
   */
  static initialize(): void {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        this.handleDeepLink(url);
      }
    });

    // Handle deep links when app is already running
    Linking.addEventListener('url', ({ url }) => {
      this.handleDeepLink(url);
    });
  }

  /**
   * Handles incoming deep link URLs
   */
  private static handleDeepLink(url: string): void {
    try {
      const parsed = Linking.parse(url);
      
      if (parsed.scheme === this.SCHEME && parsed.hostname === this.HOST) {
        const params: DeepLinkParams = {
          action: 'add',
          url: parsed.queryParams?.url as string,
        };
        
        this.processDeepLinkParams(params);
      }
    } catch (error) {
      console.error('Failed to parse deep link:', error);
    }
  }

  /**
   * Processes deep link parameters
   */
  private static processDeepLinkParams(params: DeepLinkParams): void {
    if (params.action === 'add' && params.url) {
      // Validate and normalize URL
      const normalizedUrl = UrlNormalizationService.sanitizeUrl(params.url);
      
      if (UrlNormalizationService.isValidUrl(normalizedUrl)) {
        // Emit event for navigation
        this.emitAddItemEvent(normalizedUrl);
      } else {
        console.error('Invalid URL in deep link:', params.url);
      }
    }
  }

  /**
   * Creates a deep link URL for adding an item
   */
  static createAddItemUrl(url: string): string {
    const encodedUrl = encodeURIComponent(url);
    return `${this.SCHEME}://${this.HOST}?url=${encodedUrl}`;
  }

  /**
   * Opens the app with a deep link to add an item
   */
  static async openAddItem(url: string): Promise<void> {
    try {
      const deepLinkUrl = this.createAddItemUrl(url);
      await Linking.openURL(deepLinkUrl);
    } catch (error) {
      console.error('Failed to open deep link:', error);
      throw error;
    }
  }

  /**
   * Event emitter for deep link events
   */
  private static listeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Adds an event listener
   */
  static addEventListener(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Removes an event listener
   */
  static removeEventListener(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  /**
   * Emits an event to all listeners
   */
  private static emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Emits add item event
   */
  private static emitAddItemEvent(url: string): void {
    this.emit('addItem', { url });
  }

  /**
   * Gets the app's deep link URL scheme
   */
  static getAppUrlScheme(): string {
    return `${this.SCHEME}://`;
  }

  /**
   * Checks if a URL is a valid deep link for this app
   */
  static isValidDeepLink(url: string): boolean {
    try {
      const parsed = Linking.parse(url);
      return parsed.scheme === this.SCHEME;
    } catch {
      return false;
    }
  }
}
