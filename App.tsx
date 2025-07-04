import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import EdgeCalculatorScreen from './src/screens/EdgeCalculatorScreen';
import ProfitTrackerScreen from './src/screens/ProfitTrackerScreen';
import DebtTrackerScreen from './src/screens/DebtTrackerScreen';
import InvestmentTrackerScreen from './src/screens/InvestmentTrackerScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Edge Calculator') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          } else if (route.name === 'Profit Tracker') {
            iconName = focused ? 'trending-down' : 'trending-down-outline';
          } else if (route.name === 'Debt Tracker') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Investments') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else {
            iconName = 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#dc2626',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopColor: '#374151',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Edge Calculator" component={EdgeCalculatorScreen} />
      <Tab.Screen name="Profit Tracker" component={ProfitTrackerScreen} />
      <Tab.Screen name="Debt Tracker" component={DebtTrackerScreen} />
      <Tab.Screen name="Investments" component={InvestmentTrackerScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <TabNavigator />
    </NavigationContainer>
  );
}
