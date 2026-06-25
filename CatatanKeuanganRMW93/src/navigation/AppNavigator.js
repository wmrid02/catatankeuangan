// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BerandaScreen from '../screens/BerandaScreen';
import PemasukanScreen from '../screens/PemasukanScreen';
import PengeluaranScreen from '../screens/PengeluaranScreen';
import LaporanScreen from '../screens/LaporanScreen';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Beranda:      { active: '🏠', inactive: '🏠' },
  Pemasukan:    { active: '💰', inactive: '💰' },
  Pengeluaran:  { active: '💸', inactive: '💸' },
  Laporan:      { active: '📊', inactive: '📊' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, size }) => {
            const icon = ICONS[route.name];
            return (
              <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>
                {focused ? icon.active : icon.inactive}
              </Text>
            );
          },
        })}
      >
        <Tab.Screen name="Beranda" component={BerandaScreen} />
        <Tab.Screen name="Pemasukan" component={PemasukanScreen} />
        <Tab.Screen name="Pengeluaran" component={PengeluaranScreen} />
        <Tab.Screen name="Laporan" component={LaporanScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    height: 60,
    paddingBottom: 6,
    paddingTop: 4,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
