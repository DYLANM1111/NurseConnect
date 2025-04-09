import { router, Tabs, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const signupComplete = await AsyncStorage.getItem('userSignupComplete');
        
        const isUserAuthenticated = userData !== null && signupComplete === 'true';
        
        setIsAuthenticated(isUserAuthenticated);
        
        if (isUserAuthenticated && (pathname === '/signup' || pathname === '/Login')) {
          router.replace('/(tabs)/home');
        }
        
       
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuthStatus();
  }, [pathname]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          href: isAuthenticated ? null : undefined,
          tabBarStyle: {display:'none'}
        }}
      />     
      {isAuthenticated && (
        <Tabs.Screen
          name="home"
          options={{
            title: 'Shifts',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          }}
        />
        
      )}
     {isAuthenticated && (
        <Tabs.Screen
          name="dashboards"
          options={{
            title: 'DashBoard',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
        
      )}
       {isAuthenticated && (
        <Tabs.Screen
          name="applications"
          options={{
            title: 'Application',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text" color={color} />,
          }}
        />
        
      )}
       {isAuthenticated && (
        <Tabs.Screen
          name="notification"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
          }}
        />
        
      )}
      <Tabs.Screen
        name="apply[id]"
        options={{
          href: null, 
        }}
      />
      <Tabs.Screen
        name="Login"
        options={{
          href: null, 
          tabBarStyle:{display:'none'}
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          href: null, 
          tabBarStyle:{display:'none'}

        }}
      />
      <Tabs.Screen
        name="editProfile"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
      <Tabs.Screen
        name="shift-details"
        options={{
          href: null, 
        }}
      />
      <Tabs.Screen
  name="shift[id]"
  options={{
    href: null, 
  }}
/>
    </Tabs>
  );
}