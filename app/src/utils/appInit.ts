/**
 * App initialization and setup
 */

import { DatabaseService } from '../services/DatabaseService';
import { DeepLinkService } from '../services/DeepLinkService';

/**
 * Initialize all app services
 */
export async function initializeApp(): Promise<void> {
  try {
    // Initialize database
    await DatabaseService.initialize();
    
    // Initialize deep linking
    DeepLinkService.initialize();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    throw error;
  }
}

/**
 * Setup deep link event listeners
 */
export function setupDeepLinkListeners(
  onAddItem: (url: string) => void
): () => void {
  const handleAddItem = (data: { url: string }) => {
    onAddItem(data.url);
  };

  DeepLinkService.addEventListener('addItem', handleAddItem);

  // Return cleanup function
  return () => {
    DeepLinkService.removeEventListener('addItem', handleAddItem);
  };
}
