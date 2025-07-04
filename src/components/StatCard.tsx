import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: 'red' | 'green' | 'blue' | 'orange' | 'purple';
  size?: 'small' | 'medium' | 'large';
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  color = 'blue',
  size = 'medium' 
}: StatCardProps) {
  const getGradientColors = (): [string, string] => {
    switch (color) {
      case 'red':
        return ['#dc2626', '#991b1b'];
      case 'green':
        return ['#059669', '#047857'];
      case 'blue':
        return ['#2563eb', '#1d4ed8'];
      case 'orange':
        return ['#ea580c', '#c2410c'];
      case 'purple':
        return ['#7c3aed', '#6d28d9'];
      default:
        return ['#2563eb', '#1d4ed8'];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { padding: 12, borderRadius: 8 };
      case 'large':
        return { padding: 20, borderRadius: 16 };
      default:
        return { padding: 16, borderRadius: 12 };
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={[styles.container, getSizeStyles()]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={[styles.title, size === 'large' && styles.titleLarge]}>
        {title}
      </Text>
      <Text style={[styles.value, size === 'large' && styles.valueLarge]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, size === 'large' && styles.subtitleLarge]}>
          {subtitle}
        </Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.9,
  },
  titleLarge: {
    fontSize: 16,
  },
  value: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  valueLarge: {
    fontSize: 32,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.8,
  },
  subtitleLarge: {
    fontSize: 14,
  },
}); 