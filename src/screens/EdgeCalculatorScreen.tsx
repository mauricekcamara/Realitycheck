import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import StatCard from '../components/StatCard';
import QuickAddSession from '../components/QuickAddSession';
import EdgeAnalytics from '../components/EdgeAnalytics';
import { useDataStorage } from '../hooks/useDataStorage';
import { 
  calculateUserProfile, 
  calculatePersonalEdge, 
  GAME_TYPES,
  formatCurrency, 
  formatPercentage 
} from '../utils/calculations';
import { GamblingSession } from '../types';

const screenWidth = Dimensions.get('window').width;

export default function EdgeCalculatorScreen() {
  const { sessions, addSession } = useDataStorage();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'add'>('overview');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSession, setNewSession] = useState({
    gameType: 'Slots (Low Variance)',
    betAmount: '',
    winAmount: '',
    lossAmount: '',
    duration: '',
    location: '',
    notes: ''
  });

  const profile = calculateUserProfile(sessions);
  const personalEdge = calculatePersonalEdge(sessions);

  // Prepare chart data
  const chartData = {
    labels: ['Theoretical', 'Your Edge'],
    datasets: [
      {
        data: [profile.theoreticalEdge, profile.personalEdge],
        color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  const handleAddSession = (sessionData?: {
    gameType: string;
    betAmount: number;
    winAmount: number;
    lossAmount: number;
    duration: number;
  }) => {
    if (sessionData) {
      // Quick add session
      const session: GamblingSession = {
        id: Date.now().toString(),
        gameType: sessionData.gameType,
        betAmount: sessionData.betAmount,
        winAmount: sessionData.winAmount,
        lossAmount: sessionData.lossAmount,
        netResult: sessionData.winAmount - sessionData.lossAmount,
        duration: sessionData.duration,
        location: '',
        notes: '',
        date: new Date()
      };
      addSession(session);
      Alert.alert('Success', 'Session added successfully!');
      return;
    }

    // Manual form submission
    const betAmount = parseFloat(newSession.betAmount) || 0;
    const winAmount = parseFloat(newSession.winAmount) || 0;
    const lossAmount = parseFloat(newSession.lossAmount) || 0;
    const duration = parseInt(newSession.duration) || 0;

    if (betAmount === 0) {
      Alert.alert('Error', 'Please enter a bet amount');
      return;
    }

    const session: GamblingSession = {
      id: Date.now().toString(),
      gameType: newSession.gameType,
      betAmount,
      winAmount,
      lossAmount,
      netResult: winAmount - lossAmount,
      duration,
      location: newSession.location,
      notes: newSession.notes,
      date: new Date()
    };

    addSession(session);
    setNewSession({
      gameType: 'Slots (Low Variance)',
      betAmount: '',
      winAmount: '',
      lossAmount: '',
      duration: '',
      location: '',
      notes: ''
    });
    setShowAddForm(false);
    Alert.alert('Success', 'Session added successfully!');
  };

  const getEdgeComparison = () => {
    const difference = profile.personalEdge - profile.theoreticalEdge;
    if (difference > 0) {
      return `You're performing ${formatPercentage(difference)} WORSE than the theoretical house edge.`;
    } else if (difference < 0) {
      return `You're performing ${formatPercentage(Math.abs(difference))} BETTER than the theoretical house edge.`;
    } else {
      return "You're performing exactly at the theoretical house edge.";
    }
  };

  const getGameTypeBreakdown = () => {
    const gameTypeStats: { [key: string]: { count: number; totalBet: number; totalLoss: number } } = {};
    
    sessions.forEach(session => {
      if (!gameTypeStats[session.gameType]) {
        gameTypeStats[session.gameType] = { count: 0, totalBet: 0, totalLoss: 0 };
      }
      gameTypeStats[session.gameType].count++;
      gameTypeStats[session.gameType].totalBet += session.betAmount;
      gameTypeStats[session.gameType].totalLoss += Math.abs(Math.min(0, session.netResult));
    });

    return Object.entries(gameTypeStats).map(([gameType, stats]) => {
      // Calculate personal edge using the same formula as calculatePersonalEdge
      const totalNetResult = sessions
        .filter(s => s.gameType === gameType)
        .reduce((sum, session) => sum + session.netResult, 0);
      const edge = stats.totalBet > 0 ? (-totalNetResult / stats.totalBet) * 100 : 0;
      const theoreticalEdge = GAME_TYPES[gameType as keyof typeof GAME_TYPES]?.edge || 0;
      
      return {
        gameType,
        count: stats.count,
        totalBet: stats.totalBet,
        totalLoss: stats.totalLoss,
        edge,
        theoreticalEdge
      };
    }).sort((a, b) => b.count - a.count);
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Edge Comparison */}
      <View style={styles.edgeComparison}>
        <View style={styles.edgeCards}>
          <StatCard
            title="Theoretical Edge"
            value={formatPercentage(profile.theoreticalEdge)}
            subtitle="Expected house edge"
            color="blue"
          />
          <StatCard
            title="Your Edge"
            value={formatPercentage(profile.personalEdge)}
            subtitle="Your actual performance"
            color={profile.personalEdge > profile.theoreticalEdge ? "red" : "green"}
          />
        </View>
        
        <View style={styles.comparisonText}>
          <Ionicons 
            name={profile.personalEdge > profile.theoreticalEdge ? "trending-down" : "trending-up"} 
            size={20} 
            color={profile.personalEdge > profile.theoreticalEdge ? "#dc2626" : "#10b981"} 
          />
          <Text style={styles.comparisonMessage}>{getEdgeComparison()}</Text>
        </View>
      </View>

      {/* Chart */}
      {sessions.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Edge Comparison Chart</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#1f2937',
              backgroundGradientFrom: '#1f2937',
              backgroundGradientTo: '#1f2937',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#dc2626',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Game Type Breakdown */}
      {sessions.length > 0 && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.sectionTitle}>Game Type Breakdown</Text>
          {getGameTypeBreakdown().map((game) => (
            <View key={game.gameType} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <Text style={styles.gameName}>{game.gameType}</Text>
                <Text style={styles.gameCount}>{game.count} sessions</Text>
              </View>
              <View style={styles.gameStats}>
                <View style={styles.gameStat}>
                  <Text style={styles.gameStatLabel}>Your Edge:</Text>
                  <Text style={[styles.gameStatValue, game.edge > game.theoreticalEdge && styles.worse]}>
                    {formatPercentage(game.edge)}
                  </Text>
                </View>
                <View style={styles.gameStat}>
                  <Text style={styles.gameStatLabel}>Theoretical:</Text>
                  <Text style={styles.gameStatValue}>
                    {formatPercentage(game.theoreticalEdge)}
                  </Text>
                </View>
                <View style={styles.gameStat}>
                  <Text style={styles.gameStatLabel}>Total Bet:</Text>
                  <Text style={styles.gameStatValue}>
                    {formatCurrency(game.totalBet)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick Add Button */}
      <TouchableOpacity 
        style={styles.quickAddButton}
        onPress={() => setShowQuickAdd(true)}
      >
        <Ionicons name="add-circle" size={24} color="#ffffff" />
        <Text style={styles.quickAddButtonText}>Quick Add Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <EdgeAnalytics 
      sessions={sessions}
      personalEdge={personalEdge}
      theoreticalEdge={profile.theoreticalEdge}
    />
  );

  const renderAddTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.addTabHeader}>
        <Text style={styles.addTabTitle}>Add New Session</Text>
        <Text style={styles.addTabSubtitle}>Track your gambling reality</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Session Details</Text>
        
        <Text style={styles.inputLabel}>Game Type</Text>
        <View style={styles.pickerContainer}>
          {Object.keys(GAME_TYPES).map((gameType) => (
            <TouchableOpacity
              key={gameType}
              style={[
                styles.pickerOption,
                newSession.gameType === gameType && styles.pickerOptionSelected
              ]}
              onPress={() => setNewSession({...newSession, gameType})}
            >
              <Text style={[
                styles.pickerOptionText,
                newSession.gameType === gameType && styles.pickerOptionTextSelected
              ]}>
                {gameType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bet Amount ($)</Text>
            <TextInput
              style={styles.input}
              value={newSession.betAmount}
              onChangeText={(text) => setNewSession({...newSession, betAmount: text})}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Duration (min)</Text>
            <TextInput
              style={styles.input}
              value={newSession.duration}
              onChangeText={(text) => setNewSession({...newSession, duration: text})}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Win Amount ($)</Text>
            <TextInput
              style={styles.input}
              value={newSession.winAmount}
              onChangeText={(text) => setNewSession({...newSession, winAmount: text})}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Loss Amount ($)</Text>
            <TextInput
              style={styles.input}
              value={newSession.lossAmount}
              onChangeText={(text) => setNewSession({...newSession, lossAmount: text})}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Location (Optional)</Text>
        <TextInput
          style={styles.input}
          value={newSession.location}
          onChangeText={(text) => setNewSession({...newSession, location: text})}
          placeholder="Casino name, online site, etc."
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.inputLabel}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={newSession.notes}
          onChangeText={(text) => setNewSession({...newSession, notes: text})}
          placeholder="Any additional notes about this session..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.submitButton} onPress={() => handleAddSession()}>
          <Ionicons name="add-circle" size={20} color="#ffffff" />
          <Text style={styles.submitButtonText}>Add Session</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Edge Calculator</Text>
        <Text style={styles.subtitle}>Your Personal Casino Reality</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons 
            name="home" 
            size={20} 
            color={activeTab === 'overview' ? '#2563eb' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Ionicons 
            name="analytics" 
            size={20} 
            color={activeTab === 'analytics' ? '#2563eb' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.activeTab]}
          onPress={() => setActiveTab('add')}
        >
          <Ionicons 
            name="add" 
            size={20} 
            color={activeTab === 'add' ? '#2563eb' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>
            Add Session
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
      {activeTab === 'add' && renderAddTab()}

      {/* Quick Add Modal */}
      <QuickAddSession
        visible={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onAddSession={handleAddSession}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#374151',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#2563eb',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  edgeComparison: {
    marginBottom: 24,
  },
  edgeCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  comparisonText: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  comparisonMessage: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  chartContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  breakdownContainer: {
    marginBottom: 24,
  },
  gameCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gameName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  gameCount: {
    color: '#9ca3af',
    fontSize: 14,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gameStat: {
    alignItems: 'center',
  },
  gameStatLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  gameStatValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  worse: {
    color: '#ef4444',
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  quickAddButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addTabHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  addTabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  addTabSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  formContainer: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  formTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    width: '48%',
  },
  input: {
    backgroundColor: '#374151',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  pickerOption: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#2563eb',
  },
  pickerOptionText: {
    color: '#ffffff',
    fontSize: 12,
  },
  pickerOptionTextSelected: {
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 