import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import StatCard from '../components/StatCard';
import { useDataStorage } from '../hooks/useDataStorage';
import { 
  calculateUserProfile, 
  calculateProfitabilityAnalysis,
  GAME_TYPES,
  formatCurrency, 
  formatPercentage 
} from '../utils/calculations';

const screenWidth = Dimensions.get('window').width;

export default function ProfitTrackerScreen() {
  const { sessions } = useDataStorage();
  const [customAnalysis, setCustomAnalysis] = useState({
    bankroll: '',
    averageBet: '',
    gameType: 'Slots (Low Variance)',
    sessionsPerMonth: ''
  });

  const profile = calculateUserProfile(sessions);
  
  // Calculate current profitability analysis
  const currentAnalysis = calculateProfitabilityAnalysis(
    profile.totalGambled || 1000, // Default bankroll
    profile.averageSessionLoss || 100, // Default average bet
    profile.personalEdge || 5, // Default edge
    Math.ceil(sessions.length / 3) || 4 // Estimate sessions per month
  );

  const handleCustomAnalysis = () => {
    const bankroll = parseFloat(customAnalysis.bankroll) || 0;
    const averageBet = parseFloat(customAnalysis.averageBet) || 0;
    const sessionsPerMonth = parseInt(customAnalysis.sessionsPerMonth) || 0;
    const gameEdge = GAME_TYPES[customAnalysis.gameType as keyof typeof GAME_TYPES]?.edge || 5;

    if (bankroll === 0 || averageBet === 0 || sessionsPerMonth === 0) {
      Alert.alert('Error', 'Please fill in all fields for custom analysis');
      return;
    }

    const analysis = calculateProfitabilityAnalysis(bankroll, averageBet, gameEdge, sessionsPerMonth);
    
    Alert.alert(
      'Custom Analysis Results',
      `Monthly Loss: ${formatCurrency(analysis.monthlyLoss)}\n` +
      `Time to Zero: ${analysis.timeToZero.toFixed(1)} months\n` +
      `Probability of Profit: ${formatPercentage(analysis.probabilityOfProfit)}`,
      [{ text: 'OK' }]
    );
  };

  const getImpossibilityMessage = () => {
    if (currentAnalysis.probabilityOfProfit < 1) {
      return "Mathematically IMPOSSIBLE to profit long-term with your current pattern.";
    } else if (currentAnalysis.probabilityOfProfit < 5) {
      return "Nearly impossible to profit. You're fighting impossible odds.";
    } else {
      return "Very low probability of profit. The house edge is too strong.";
    }
  };

  const getTimeToZeroMessage = () => {
    if (currentAnalysis.timeToZero < 6) {
      return "You'll be broke in less than 6 months at this rate.";
    } else if (currentAnalysis.timeToZero < 12) {
      return "You'll be broke within a year at this rate.";
    } else {
      return `You'll be broke in ${currentAnalysis.timeToZero.toFixed(1)} months at this rate.`;
    }
  };

  // Prepare chart data for different scenarios
  const chartData = {
    labels: ['Current', 'Conservative', 'Aggressive'],
    datasets: [
      {
        data: [
          currentAnalysis.monthlyLoss,
          currentAnalysis.monthlyLoss * 0.5,
          currentAnalysis.monthlyLoss * 2
        ]
      }
    ]
  };

  const getProfitabilityScenarios = () => {
    const scenarios = [
      {
        name: 'Current Pattern',
        bankroll: currentAnalysis.bankroll,
        monthlyLoss: currentAnalysis.monthlyLoss,
        timeToZero: currentAnalysis.timeToZero,
        probability: currentAnalysis.probabilityOfProfit
      },
      {
        name: 'Conservative (Half Bet Size)',
        bankroll: currentAnalysis.bankroll,
        monthlyLoss: currentAnalysis.monthlyLoss * 0.5,
        timeToZero: currentAnalysis.bankroll / (currentAnalysis.monthlyLoss * 0.5),
        probability: Math.max(0, currentAnalysis.probabilityOfProfit + 5)
      },
      {
        name: 'Aggressive (Double Bet Size)',
        bankroll: currentAnalysis.bankroll,
        monthlyLoss: currentAnalysis.monthlyLoss * 2,
        timeToZero: currentAnalysis.bankroll / (currentAnalysis.monthlyLoss * 2),
        probability: Math.max(0, currentAnalysis.probabilityOfProfit - 10)
      }
    ];

    return scenarios;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profit Impossibility Tracker</Text>
          <Text style={styles.subtitle}>The Math Doesn't Lie</Text>
        </View>

        {/* Impossibility Alert */}
        <View style={styles.impossibilityContainer}>
          <Ionicons name="close-circle" size={24} color="#dc2626" />
          <Text style={styles.impossibilityText}>{getImpossibilityMessage()}</Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Your Profitability Reality</Text>
          
          <View style={styles.metricsGrid}>
            <StatCard
              title="Monthly Loss"
              value={formatCurrency(currentAnalysis.monthlyLoss)}
              subtitle="Expected monthly losses"
              color="red"
              size="large"
            />
            
            <StatCard
              title="Time to Zero"
              value={`${currentAnalysis.timeToZero.toFixed(1)} months`}
              subtitle="Until you're broke"
              color="orange"
            />
            
            <StatCard
              title="Profit Probability"
              value={formatPercentage(currentAnalysis.probabilityOfProfit)}
              subtitle="Chance of long-term profit"
              color="purple"
            />
            
            <StatCard
              title="Current Bankroll"
              value={formatCurrency(currentAnalysis.bankroll)}
              subtitle="Starting amount"
              color="blue"
            />
          </View>
        </View>

        {/* Time to Zero Warning */}
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#f59e0b" />
          <Text style={styles.warningText}>{getTimeToZeroMessage()}</Text>
        </View>

        {/* Chart */}
        {sessions.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Monthly Loss Scenarios</Text>
            <BarChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              yAxisLabel="$"
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#1f2937',
                backgroundGradientFrom: '#1f2937',
                backgroundGradientTo: '#1f2937',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                barPercentage: 0.7,
              }}
              style={styles.chart}
            />
          </View>
        )}

        {/* Scenarios Comparison */}
        <View style={styles.scenariosContainer}>
          <Text style={styles.sectionTitle}>Different Scenarios</Text>
          {getProfitabilityScenarios().map((scenario, index) => (
            <View key={index} style={styles.scenarioCard}>
              <Text style={styles.scenarioName}>{scenario.name}</Text>
              <View style={styles.scenarioStats}>
                <View style={styles.scenarioStat}>
                  <Text style={styles.scenarioStatLabel}>Monthly Loss:</Text>
                  <Text style={styles.scenarioStatValue}>
                    {formatCurrency(scenario.monthlyLoss)}
                  </Text>
                </View>
                <View style={styles.scenarioStat}>
                  <Text style={styles.scenarioStatLabel}>Time to Zero:</Text>
                  <Text style={styles.scenarioStatValue}>
                    {scenario.timeToZero.toFixed(1)} months
                  </Text>
                </View>
                <View style={styles.scenarioStat}>
                  <Text style={styles.scenarioStatLabel}>Profit Chance:</Text>
                  <Text style={styles.scenarioStatValue}>
                    {formatPercentage(scenario.probability)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Custom Analysis */}
        <View style={styles.customContainer}>
          <Text style={styles.sectionTitle}>Custom Analysis</Text>
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Bankroll ($)</Text>
            <TextInput
              style={styles.input}
              value={customAnalysis.bankroll}
              onChangeText={(text) => setCustomAnalysis({...customAnalysis, bankroll: text})}
              placeholder="Enter your bankroll"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Average Bet ($)</Text>
            <TextInput
              style={styles.input}
              value={customAnalysis.averageBet}
              onChangeText={(text) => setCustomAnalysis({...customAnalysis, averageBet: text})}
              placeholder="Enter average bet size"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Game Type</Text>
            <View style={styles.pickerContainer}>
              {Object.keys(GAME_TYPES).map((gameType) => (
                <TouchableOpacity
                  key={gameType}
                  style={[
                    styles.pickerOption,
                    customAnalysis.gameType === gameType && styles.pickerOptionSelected
                  ]}
                  onPress={() => setCustomAnalysis({...customAnalysis, gameType})}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    customAnalysis.gameType === gameType && styles.pickerOptionTextSelected
                  ]}>
                    {gameType}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Sessions per Month</Text>
            <TextInput
              style={styles.input}
              value={customAnalysis.sessionsPerMonth}
              onChangeText={(text) => setCustomAnalysis({...customAnalysis, sessionsPerMonth: text})}
              placeholder="Enter sessions per month"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.analyzeButton} onPress={handleCustomAnalysis}>
              <Text style={styles.analyzeButtonText}>Analyze Profitability</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mathematical Reality */}
        <View style={styles.realityContainer}>
          <Text style={styles.sectionTitle}>The Mathematical Reality</Text>
          <View style={styles.realityCard}>
            <Text style={styles.realityText}>
              • Every casino game has a built-in house edge{'\n'}
              • This edge ensures the casino profits long-term{'\n'}
              • Your "luck" is just short-term variance{'\n'}
              • The longer you play, the more you lose{'\n'}
              • No strategy can overcome the house edge{'\n'}
              • The only winning move is not to play
            </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  impossibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  impossibilityText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    fontWeight: '600',
  },
  metricsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  scenariosContainer: {
    marginBottom: 24,
  },
  scenarioCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  scenarioName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scenarioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scenarioStat: {
    alignItems: 'center',
  },
  scenarioStatLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  scenarioStatValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  customContainer: {
    marginBottom: 24,
  },
  formContainer: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerOption: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#2563eb',
  },
  pickerOptionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  pickerOptionTextSelected: {
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  realityContainer: {
    marginBottom: 24,
  },
  realityCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  realityText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
}); 