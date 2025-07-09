import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GamblingSession } from './src/types';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import EdgeCalculatorScreen from './src/screens/EdgeCalculatorScreen';
import ProfitTrackerScreen from './src/screens/ProfitTrackerScreen';
import DebtTrackerScreen from './src/screens/DebtTrackerScreen';
import InvestmentTrackerScreen from './src/screens/InvestmentTrackerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SessionHistoryScreen from './src/screens/SessionHistoryScreen';
import SessionDetailScreen from './src/screens/SessionDetailScreen';
import SessionEditScreen from './src/screens/SessionEditScreen';

type SessionHistoryStackParamList = {
  SessionHistory: undefined;
  SessionDetail: { session: GamblingSession };
  SessionEdit: { session: GamblingSession };
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<SessionHistoryStackParamList>();

function SessionHistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen 
        name="SessionHistory" 
        component={SessionHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SessionDetail" 
        component={SessionDetailScreen}
        options={{ title: 'Session Details' }}
      />
      <Stack.Screen 
        name="SessionEdit" 
        component={SessionEditScreen}
        options={{ title: 'Edit Session' }}
      />
    </Stack.Navigator>
  );
}

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
          } else if (route.name === 'Session History') {
            iconName = focused ? 'document-text' : 'document-text-outline';
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
      <Tab.Screen name="Session History" component={SessionHistoryStack} />
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
