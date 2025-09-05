/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#4CAF50';
const tintColorDark = '#4CAF50';

export const Colors = {
  light: {
    text: '#333333',
    background: '#F8F9FA',
    tint: tintColorLight,
    icon: '#666666',
    tabIconDefault: '#999999',
    tabIconSelected: tintColorLight,
    skeleton: '#E1E5E9',
    card: '#FFFFFF',
    border: '#E0E0E0',
    error: '#FF6B6B',
    success: '#4CAF50',
    warning: '#FFC107',
    progress: '#4CAF50',
    progressBackground: '#E0E0E0',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1A1A',
    tint: tintColorDark,
    icon: '#CCCCCC',
    tabIconDefault: '#999999',
    tabIconSelected: tintColorDark,
    skeleton: '#2A2D2F',
    card: '#2A2D2F',
    border: '#404040',
    error: '#FF6B6B',
    success: '#4CAF50',
    warning: '#FFC107',
    progress: '#4CAF50',
    progressBackground: '#404040',
  },
};
