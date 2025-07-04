import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { GamblingSession } from '../types';
import { calculatePersonalEdge, formatCurrency, formatPercentage } from '../utils/calculations';

const screenWidth = Dimensions.get('window').width;

interface EdgeAnalyticsProps {
  sessions: GamblingSession[];
  personalEdge: number;
  theoreticalEdge: number;
}

export default function EdgeAnalytics({ sessions, personalEdge, theoreticalEdge }: EdgeAnalyticsProps) {
  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>Add some sessions to see analytics</Text>
      </View>
    );
  }

  const getTrendData = () => {
    const recentSessions = sessions.slice(-10); // Last 10 sessions
    const edgeData = recentSessions.map((session, index) => {
      const sessionsUpToThis = sessions.slice(0, sessions.length - 10 + index + 1);
      return calculatePersonalEdge(sessionsUpToThis);
    });

    return {
      labels: recentSessions.map((_, index) => `S${index + 1}`),
      datasets: [
        {
          data: edgeData,
          color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  const getSessionPatterns = () => {
    const totalSessions = sessions.length;
    const winningSessions = sessions.filter(s => s.netResult > 0).length;
    const losingSessions = sessions.filter(s => s.netResult < 0).length;
    const breakEvenSessions = sessions.filter(s => s.netResult === 0).length;

    return {
      totalSessions,
      winningSessions,
      losingSessions,
      breakEvenSessions,
      winRate: (winningSessions / totalSessions) * 100,
      lossRate: (losingSessions / totalSessions) * 100
    };
  };

  const getTimeAnalysis = () => {
    const sessionsByHour: { [key: number]: number } = {};
    const sessionsByDay: { [key: string]: number } = {};

    sessions.forEach(session => {
      const hour = session.date.getHours();
      const day = session.date.toLocaleDateString('en-US', { weekday: 'long' });
      
      sessionsByHour[hour] = (sessionsByHour[hour] || 0) + 1;
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
    });

    const mostActiveHour = Object.entries(sessionsByHour).reduce((a, b) => 
      sessionsByHour[parseInt(a[0])] > sessionsByHour[parseInt(b[0])] ? a : b
    );

    const mostActiveDay = Object.entries(sessionsByDay).reduce((a, b) => 
      sessionsByDay[a[0]] > sessionsByDay[b[0]] ? a : b
    );

    return { mostActiveHour, mostActiveDay };
  };

  const getPerformanceInsights = () => {
    const insights = [];
    
    if (personalEdge > theoreticalEdge) {
      insights.push({
        type: 'warning',
        icon: 'trending-down',
        title: 'Performing Worse Than Expected',
        description: `Your edge is ${formatPercentage(personalEdge - theoreticalEdge)} higher than the theoretical house edge.`
      });
    }

    if (personalEdge > 10) {
      insights.push({
        type: 'danger',
        icon: 'close-circle',
        title: 'Very High Loss Rate',
        description: 'You\'re losing more than 10% of your bets on average.'
      });
    }

    const patterns = getSessionPatterns();
    if (patterns.lossRate > 70) {
      insights.push({
        type: 'danger',
        icon: 'alert-circle',
        title: 'High Loss Frequency',
        description: `${patterns.lossRate.toFixed(1)}% of your sessions result in losses.`
      });
    }

    const timeAnalysis = getTimeAnalysis();
    insights.push({
      type: 'info',
      icon: 'time',
      title: 'Most Active Time',
      description: `You gamble most on ${timeAnalysis.mostActiveDay[0]}s around ${timeAnalysis.mostActiveHour[0]}:00.`
    });

    return insights;
  };

  const patterns = getSessionPatterns();
  const insights = getPerformanceInsights();
  const trendData = getTrendData();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Edge Trend Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Your Edge Trend (Last 10 Sessions)</Text>
        <LineChart
          data={trendData}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: '#1f2937',
            backgroundGradientFrom: '#1f2937',
            backgroundGradientTo: '#1f2937',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#dc2626',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Session Patterns */}
      <View style={styles.patternsContainer}>
        <Text style={styles.sectionTitle}>Session Patterns</Text>
        <View style={styles.patternsGrid}>
          <View style={styles.patternCard}>
            <Text style={styles.patternNumber}>{patterns.totalSessions}</Text>
            <Text style={styles.patternLabel}>Total Sessions</Text>
          </View>
          <View style={styles.patternCard}>
            <Text style={[styles.patternNumber, styles.winningText]}>{patterns.winningSessions}</Text>
            <Text style={styles.patternLabel}>Winning Sessions</Text>
          </View>
          <View style={styles.patternCard}>
            <Text style={[styles.patternNumber, styles.losingText]}>{patterns.losingSessions}</Text>
            <Text style={styles.patternLabel}>Losing Sessions</Text>
          </View>
          <View style={styles.patternCard}>
            <Text style={[styles.patternNumber, styles.evenText]}>{patterns.breakEvenSessions}</Text>
            <Text style={styles.patternLabel}>Break Even</Text>
          </View>
        </View>
        
        <View style={styles.ratesContainer}>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>Win Rate:</Text>
            <Text style={[styles.rateValue, styles.winningText]}>
              {patterns.winRate.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>Loss Rate:</Text>
            <Text style={[styles.rateValue, styles.losingText]}>
              {patterns.lossRate.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Performance Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={[
            styles.insightCard,
            insight.type === 'danger' && styles.insightCardDanger,
            insight.type === 'warning' && styles.insightCardWarning,
            insight.type === 'info' && styles.insightCardInfo
          ]}>
            <Ionicons 
              name={insight.icon as any} 
              size={20} 
              color={
                insight.type === 'danger' ? '#dc2626' :
                insight.type === 'warning' ? '#f59e0b' : '#2563eb'
              } 
            />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Edge Comparison */}
      <View style={styles.comparisonContainer}>
        <Text style={styles.sectionTitle}>Edge Comparison</Text>
        <View style={styles.comparisonCard}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Your Edge</Text>
            <Text style={[styles.comparisonValue, styles.personalEdge]}>
              {formatPercentage(personalEdge)}
            </Text>
          </View>
          <View style={styles.comparisonDivider} />
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Theoretical Edge</Text>
            <Text style={[styles.comparisonValue, styles.theoreticalEdge]}>
              {formatPercentage(theoreticalEdge)}
            </Text>
          </View>
        </View>
        
        <View style={styles.differenceCard}>
          <Text style={styles.differenceLabel}>Difference:</Text>
          <Text style={[
            styles.differenceValue,
            personalEdge > theoreticalEdge ? styles.worsePerformance : styles.betterPerformance
          ]}>
            {personalEdge > theoreticalEdge ? '+' : ''}{formatPercentage(personalEdge - theoreticalEdge)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 16,
  },
  chartContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  patternsContainer: {
    marginBottom: 24,
  },
  patternsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  patternCard: {
    width: '48%',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  patternNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  winningText: {
    color: '#10b981',
  },
  losingText: {
    color: '#ef4444',
  },
  evenText: {
    color: '#f59e0b',
  },
  patternLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  ratesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rateItem: {
    alignItems: 'center',
  },
  rateLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightCardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  insightCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  insightCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  insightContent: {
    marginLeft: 12,
    flex: 1,
  },
  insightTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightDescription: {
    color: '#9ca3af',
    fontSize: 12,
  },
  comparisonContainer: {
    marginBottom: 24,
  },
  comparisonCard: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    marginBottom: 12,
  },
  comparisonItem: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  comparisonDivider: {
    width: 1,
    backgroundColor: '#374151',
  },
  comparisonLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  personalEdge: {
    color: '#dc2626',
  },
  theoreticalEdge: {
    color: '#2563eb',
  },
  differenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
  },
  differenceLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginRight: 8,
  },
  differenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  worsePerformance: {
    color: '#dc2626',
  },
  betterPerformance: {
    color: '#10b981',
  },
}); 