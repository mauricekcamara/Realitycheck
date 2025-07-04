import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StatCard from '../components/StatCard';
import { useDataStorage } from '../hooks/useDataStorage';
import { calculateUserProfile, formatCurrency, formatPercentage } from '../utils/calculations';

export default function HomeScreen() {
  const { sessions, loading } = useDataStorage();
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your reality check...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const profile = calculateUserProfile(sessions);
  const recentSessions = sessions.slice(-5).reverse();

  const getRealityMessage = () => {
    if (sessions.length === 0) {
      return "Start tracking your gambling sessions to see the harsh reality.";
    }
    
    if (profile.personalEdge > profile.theoreticalEdge) {
      return "You're performing WORSE than random chance. The house edge is crushing you.";
    }
    
    if (profile.netLoss > 0) {
      return "You've lost money overall. The math doesn't lie.";
    }
    
    return "Even if you're ahead, the house edge will catch up eventually.";
  };

  const getMotivationalMessage = () => {
    if (profile.netLoss === 0) return "Start tracking to see the truth.";
    
    const months = Math.ceil(profile.netLoss / 1000); // Rough estimate
    return `This money could have been debt-free in ~${months} months instead.`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reality Check</Text>
          <Text style={styles.subtitle}>The Gambling Truth Platform</Text>
        </View>

        {/* Reality Message */}
        <View style={styles.realityContainer}>
          <Ionicons name="warning" size={24} color="#dc2626" />
          <Text style={styles.realityText}>{getRealityMessage()}</Text>
        </View>

        {/* Key Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Reality</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Lost"
              value={formatCurrency(profile.netLoss)}
              subtitle="Net gambling losses"
              color="red"
              size="large"
            />
            
            <StatCard
              title="Personal Edge"
              value={formatPercentage(profile.personalEdge)}
              subtitle="Your actual house edge"
              color="orange"
            />
            
            <StatCard
              title="Sessions"
              value={profile.sessionsCount.toString()}
              subtitle="Total gambling sessions"
              color="blue"
            />
            
            <StatCard
              title="Avg Loss/Session"
              value={formatCurrency(profile.averageSessionLoss)}
              subtitle="Average per session"
              color="purple"
            />
          </View>
        </View>

        {/* Motivational Section */}
        <View style={styles.motivationalContainer}>
          <Text style={styles.sectionTitle}>What You're Missing</Text>
          <View style={styles.motivationalCard}>
            <Ionicons name="trending-up" size={20} color="#059669" />
            <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
          </View>
        </View>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            {recentSessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionGame}>{session.gameType}</Text>
                  <Text style={styles.sessionDate}>
                    {session.date.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionBet}>
                    Bet: {formatCurrency(session.betAmount)}
                  </Text>
                  <Text 
                    style={[
                      styles.sessionResult,
                      session.netResult >= 0 ? styles.positive : styles.negative
                    ]}
                  >
                    {session.netResult >= 0 ? '+' : ''}{formatCurrency(session.netResult)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Coming Soon', 'Add new session feature will be available soon!')}
            >
              <Ionicons name="add-circle" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Add Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Coming Soon', 'View detailed analysis will be available soon!')}
            >
              <Ionicons name="analytics" size={24} color="#7c3aed" />
              <Text style={styles.actionText}>View Analysis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  realityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  realityText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  motivationalContainer: {
    marginBottom: 24,
  },
  motivationalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  motivationalText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  recentContainer: {
    marginBottom: 24,
  },
  sessionCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionGame: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDate: {
    color: '#9ca3af',
    fontSize: 14,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionBet: {
    color: '#9ca3af',
    fontSize: 14,
  },
  sessionResult: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
}); 