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
import { useDataStorage } from '../hooks/useDataStorage';
import { 
  calculateUserProfile, 
  calculateInvestmentComparison,
  formatCurrency 
} from '../utils/calculations';

const screenWidth = Dimensions.get('window').width;

export default function InvestmentTrackerScreen() {
  const { sessions } = useDataStorage();
  const [customYears, setCustomYears] = useState('10');
  const [customAmount, setCustomAmount] = useState('');

  const profile = calculateUserProfile(sessions);
  const investmentComparisons = calculateInvestmentComparison(profile.netLoss, parseInt(customYears) || 10);

  const handleCustomCalculation = () => {
    const amount = parseFloat(customAmount) || 0;
    const years = parseInt(customYears) || 10;

    if (amount === 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const customComparisons = calculateInvestmentComparison(amount, years);
    
    Alert.alert(
      'Custom Investment Analysis',
      customComparisons.map(comp => 
        `${comp.scenario.name}: ${formatCurrency(comp.projectedValue)}`
      ).join('\n'),
      [{ text: 'OK' }]
    );
  };

  const getOpportunityCostMessage = () => {
    if (profile.netLoss === 0) {
      return "Start tracking your gambling losses to see the opportunity cost.";
    }

    const maxOpportunity = Math.max(...investmentComparisons.map(comp => comp.opportunityCost));
    return `You've missed out on ${formatCurrency(maxOpportunity)} in potential investment returns.`;
  };

  // Prepare chart data for investment growth
  const chartData = {
    labels: ['Now', '5 Years', '10 Years', '20 Years'],
    datasets: [
      {
        data: [
          profile.netLoss,
          profile.netLoss * Math.pow(1.1, 5), // S&P 500
          profile.netLoss * Math.pow(1.1, 10),
          profile.netLoss * Math.pow(1.1, 20)
        ],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  const getInvestmentBreakdown = () => {
    return investmentComparisons.map((comparison, index) => ({
      ...comparison,
      rank: index + 1,
      growthRate: comparison.scenario.annualReturn
    }));
  };

  const getMotivationalMessage = () => {
    if (profile.netLoss === 0) {
      return "Every dollar you save from gambling is a dollar that can work for you.";
    }

    const bestScenario = investmentComparisons.reduce((best, current) => 
      current.opportunityCost > best.opportunityCost ? current : best
    );

    return `Your gambling losses could have grown to ${formatCurrency(bestScenario.projectedValue)} in ${customYears} years.`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Alternative Investment Tracker</Text>
          <Text style={styles.subtitle}>What your gambling money could have become</Text>
        </View>

        {/* Opportunity Cost Alert */}
        <View style={styles.opportunityContainer}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <Text style={styles.opportunityText}>{getOpportunityCostMessage()}</Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Investment Reality Check</Text>
          
          <View style={styles.metricsGrid}>
            <StatCard
              title="Money Lost"
              value={formatCurrency(profile.netLoss)}
              subtitle="Total gambling losses"
              color="red"
              size="large"
            />
            
            <StatCard
              title="Best Opportunity"
              value={formatCurrency(Math.max(...investmentComparisons.map(comp => comp.opportunityCost)))}
              subtitle="Missed investment returns"
              color="green"
            />
            
            <StatCard
              title="Years Projected"
              value={customYears}
              subtitle="Investment timeline"
              color="blue"
            />
            
            <StatCard
              title="Growth Potential"
              value={`${Math.max(...investmentComparisons.map(comp => comp.scenario.annualReturn))}%`}
              subtitle="Best annual return"
              color="purple"
            />
          </View>
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationalContainer}>
          <View style={styles.motivationalCard}>
            <Ionicons name="calculator" size={20} color="#10b981" />
            <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
          </View>
        </View>

        {/* Investment Growth Chart */}
        {profile.netLoss > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Investment Growth Over Time</Text>
            <LineChart
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
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#10b981',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Investment Scenarios */}
        <View style={styles.scenariosContainer}>
          <Text style={styles.sectionTitle}>Investment Scenarios</Text>
          {getInvestmentBreakdown().map((investment, index) => (
            <View key={index} style={styles.investmentCard}>
              <View style={styles.investmentHeader}>
                <View style={styles.rankContainer}>
                  <Text style={styles.rankText}>#{investment.rank}</Text>
                </View>
                <View style={styles.investmentInfo}>
                  <Text style={styles.investmentName}>{investment.scenario.name}</Text>
                  <Text style={styles.investmentDescription}>
                    {investment.scenario.description}
                  </Text>
                </View>
              </View>
              
              <View style={styles.investmentStats}>
                <View style={styles.investmentStat}>
                  <Text style={styles.statLabel}>Growth Rate:</Text>
                  <Text style={styles.statValue}>{investment.growthRate}%</Text>
                </View>
                <View style={styles.investmentStat}>
                  <Text style={styles.statLabel}>Current Value:</Text>
                  <Text style={styles.statValue}>{formatCurrency(investment.currentValue)}</Text>
                </View>
                <View style={styles.investmentStat}>
                  <Text style={styles.statLabel}>Projected Value:</Text>
                  <Text style={[styles.statValue, styles.projectedValue]}>
                    {formatCurrency(investment.projectedValue)}
                  </Text>
                </View>
                <View style={styles.investmentStat}>
                  <Text style={styles.statLabel}>Opportunity Cost:</Text>
                  <Text style={[styles.statValue, styles.opportunityCost]}>
                    {formatCurrency(investment.opportunityCost)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Custom Calculator */}
        <View style={styles.calculatorContainer}>
          <Text style={styles.sectionTitle}>Custom Investment Calculator</Text>
          <View style={styles.calculatorForm}>
            <Text style={styles.inputLabel}>Amount Lost to Gambling ($)</Text>
            <TextInput
              style={styles.input}
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder="Enter amount"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Investment Timeline (Years)</Text>
            <TextInput
              style={styles.input}
              value={customYears}
              onChangeText={setCustomYears}
              placeholder="Enter years"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.calculateButton} onPress={handleCustomCalculation}>
              <Text style={styles.calculateButtonText}>Calculate Opportunity Cost</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Investment Wisdom */}
        <View style={styles.wisdomContainer}>
          <Text style={styles.sectionTitle}>Investment Wisdom</Text>
          <View style={styles.wisdomCard}>
            <Text style={styles.wisdomText}>
              • Compound interest is the 8th wonder of the world{'\n'}
              • Time in the market beats timing the market{'\n'}
              • Every dollar invested today is worth more tomorrow{'\n'}
              • Gambling gives you a 100% chance of losing money{'\n'}
              • Investing gives you a chance to build wealth{'\n'}
              • Your future self will thank you for investing{'\n'}
              • Start investing early, let compound interest work for you
            </Text>
          </View>
        </View>

        {/* Action Items */}
        <View style={styles.actionContainer}>
          <Text style={styles.sectionTitle}>Take Action</Text>
          <View style={styles.actionCard}>
            <Text style={styles.actionText}>
              • Stop gambling and start investing{'\n'}
              • Open a retirement account{'\n'}
              • Set up automatic contributions{'\n'}
              • Learn about index funds{'\n'}
              • Build an emergency fund{'\n'}
              • Pay off high-interest debt first{'\n'}
              • Seek professional financial advice
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
  opportunityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  opportunityText: {
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
  investmentCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  investmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankContainer: {
    backgroundColor: '#374151',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  investmentDescription: {
    color: '#9ca3af',
    fontSize: 14,
  },
  investmentStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  investmentStat: {
    width: '48%',
    marginBottom: 8,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  projectedValue: {
    color: '#10b981',
  },
  opportunityCost: {
    color: '#ef4444',
  },
  calculatorContainer: {
    marginBottom: 24,
  },
  calculatorForm: {
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
  calculateButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  wisdomContainer: {
    marginBottom: 24,
  },
  wisdomCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  wisdomText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
  actionContainer: {
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
}); 