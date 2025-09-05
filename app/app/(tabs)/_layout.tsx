import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => null, // Remove background component
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent', // No background
            borderTopWidth: 0,
            borderRadius: 16,
            marginHorizontal: 20,
            marginBottom: 20,
            height: 70,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          },
          default: {
            backgroundColor: 'transparent', // No background
            borderTopWidth: 0,
            height: 70,
            borderRadius: 16,
            marginHorizontal: 20,
            marginBottom: 20,
          },
        }),
        tabBarLabelStyle: {
          display: 'none', // Hide tab bar labels
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.tabIconContainer,
              { backgroundColor: focused ? '#4CAF50' : '#666666' }
            ]}>
              <Ionicons 
                name="home-outline" 
                size={20} 
                color="white" 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.tabIconContainer,
              { backgroundColor: focused ? '#4CAF50' : '#666666' }
            ]}>
              <Ionicons 
                name="heart-outline" 
                size={20} 
                color="white" 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.tabIconContainer,
              { backgroundColor: focused ? '#4CAF50' : '#666666' }
            ]}>
              <Ionicons 
                name="add-circle-outline" 
                size={20} 
                color="white" 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
