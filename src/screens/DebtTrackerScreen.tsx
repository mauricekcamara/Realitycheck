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
import StatCard from '../components/StatCard';
import { useDataStorage } from '../hooks/useDataStorage';
import { 
  calculateUserProfile, 
  calculateDebtImpact,
  formatCurrency 
} from '../utils/calculations';
import { DebtInfo } from '../types';

export default function DebtTrackerScreen() {
  const { sessions, debtInfo, saveDebtInfo } = useDataStorage();
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [newDebtInfo, setNewDebtInfo] = useState({
    totalDebt: '',
    monthlyPayment: '',
    interestRate: ''
  });

  const profile = calculateUserProfile(sessions);

  const handleSaveDebtInfo = () => {
    const totalDebt = parseFloat(newDebtInfo.totalDebt) || 0;
    const monthlyPayment = parseFloat(newDebtInfo.monthlyPayment) || 0;
    const interestRate = parseFloat(newDebtInfo.interestRate) || 0;

    if (totalDebt === 0 || monthlyPayment === 0) {
      Alert.alert('Error', 'Please enter valid debt information');
      return;
    }

    const originalPayoffDate = new Date();
    const currentPayoffDate = new Date();

    const debtData: DebtInfo = {
      totalDebt,
      monthlyPayment,
      interestRate,
      originalPayoffDate,
      currentPayoffDate
    };

    saveDebtInfo(debtData);
    setShowDebtForm(false);
    setNewDebtInfo({ totalDebt: '', monthlyPayment: '', interestRate: '' });
    Alert.alert('Success', 'Debt information saved successfully!');
  };

  const getDebtImpact = () => {
    if (!debtInfo || profile.netLoss === 0) {
      return null;
    }

    return calculateDebtImpact(
      debtInfo.totalDebt,
      debtInfo.monthlyPayment,
      debtInfo.interestRate,
      profile.netLoss
    );
  };

  const getMotivationalMessage = () => {
    if (!debtInfo) {
      return "Add your debt information to see how gambling affects your financial freedom.";
    }

    const impact = getDebtImpact();
    if (!impact) {
      return "Your gambling losses are delaying your debt freedom.";
    }

    if (impact.delayInWeeks <= 0) {
      return "Great! You haven't delayed your debt payoff yet.";
    }

    return `Your gambling losses have delayed your debt freedom by ${impact.delayInWeeks} weeks.`;
  };

  const getAlternativeUses = () => {
    if (profile.netLoss === 0) return [];

    return [
      {
        name: 'Debt Payoff',
        value: profile.netLoss,
        description: 'Could have paid off debt'
      },
      {
        name: 'Emergency Fund',
        value: profile.netLoss,
        description: 'Could have built emergency savings'
      },
      {
        name: 'Investment',
        value: profile.netLoss * 1.1, // 10% return
        description: 'Could have invested for growth'
      },
      {
        name: 'Retirement',
        value: profile.netLoss * 1.15, // 15% return with tax benefits
        description: 'Could have contributed to retirement'
      }
    ];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Debt Impact Tracker</Text>
          <Text style={styles.subtitle}>Every dollar lost delays your freedom</Text>
        </View>

        {/* Debt Status */}
        {debtInfo ? (
          <View style={styles.debtStatusContainer}>
            <Text style={styles.sectionTitle}>Your Debt Reality</Text>
            
            <View style={styles.debtCards}>
              <StatCard
                title="Total Debt"
                value={formatCurrency(debtInfo.totalDebt)}
                subtitle="Current debt balance"
                color="red"
                size="large"
              />
              
              <StatCard
                title="Monthly Payment"
                value={formatCurrency(debtInfo.monthlyPayment)}
                subtitle="Your monthly payment"
                color="blue"
              />
              
              <StatCard
                title="Interest Rate"
                value={`${debtInfo.interestRate}%`}
                subtitle="Annual interest rate"
                color="orange"
              />
            </View>

            {/* Debt Impact */}
            {profile.netLoss > 0 && (
              <View style={styles.impactContainer}>
                <Text style={styles.sectionTitle}>Gambling Impact on Debt</Text>
                
                <View style={styles.impactCard}>
                  <Ionicons name="time" size={24} color="#dc2626" />
                  <View style={styles.impactText}>
                    <Text style={styles.impactTitle}>Debt Freedom Delayed</Text>
                    <Text style={styles.impactValue}>
                      {getDebtImpact()?.delayInWeeks || 0} weeks
                    </Text>
                    <Text style={styles.impactDescription}>
                      Your gambling losses have pushed back your debt-free date
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineContainer}>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineDate}>
                        Original Payoff: {debtInfo.originalPayoffDate.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.timelineLine} />
                  
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, styles.timelineDotDelayed]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineDate}>
                        New Payoff: {getDebtImpact()?.newPayoffDate.toLocaleDateString() || debtInfo.currentPayoffDate.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noDebtContainer}>
            <Ionicons name="card-outline" size={48} color="#9ca3af" />
            <Text style={styles.noDebtText}>No debt information added yet</Text>
            <Text style={styles.noDebtSubtext}>
              Add your debt details to see how gambling affects your payoff timeline
            </Text>
          </View>
        )}

        {/* Motivational Message */}
        <View style={styles.motivationalContainer}>
          <View style={styles.motivationalCard}>
            <Ionicons name="trending-down" size={20} color="#dc2626" />
            <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
          </View>
        </View>

        {/* Alternative Uses */}
        <View style={styles.alternativesContainer}>
          <Text style={styles.sectionTitle}>What That Money Could Have Done</Text>
          {getAlternativeUses().map((alternative, index) => (
            <View key={index} style={styles.alternativeCard}>
              <View style={styles.alternativeHeader}>
                <Text style={styles.alternativeName}>{alternative.name}</Text>
                <Text style={styles.alternativeValue}>
                  {formatCurrency(alternative.value)}
                </Text>
              </View>
              <Text style={styles.alternativeDescription}>
                {alternative.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Add Debt Info Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowDebtForm(!showDebtForm)}
        >
          <Ionicons name={showDebtForm ? "close" : "add"} size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>
            {showDebtForm ? "Cancel" : debtInfo ? "Update Debt Info" : "Add Debt Info"}
          </Text>
        </TouchableOpacity>

        {/* Add Debt Form */}
        {showDebtForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {debtInfo ? "Update Debt Information" : "Add Debt Information"}
            </Text>
            
            <Text style={styles.inputLabel}>Total Debt Amount ($)</Text>
            <TextInput
              style={styles.input}
              value={newDebtInfo.totalDebt}
              onChangeText={(text) => setNewDebtInfo({...newDebtInfo, totalDebt: text})}
              placeholder="Enter total debt amount"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Monthly Payment ($)</Text>
            <TextInput
              style={styles.input}
              value={newDebtInfo.monthlyPayment}
              onChangeText={(text) => setNewDebtInfo({...newDebtInfo, monthlyPayment: text})}
              placeholder="Enter monthly payment"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Interest Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={newDebtInfo.interestRate}
              onChangeText={(text) => setNewDebtInfo({...newDebtInfo, interestRate: text})}
              placeholder="Enter annual interest rate"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSaveDebtInfo}>
              <Text style={styles.submitButtonText}>
                {debtInfo ? "Update Debt Info" : "Add Debt Info"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Financial Freedom Message */}
        <View style={styles.freedomContainer}>
          <Text style={styles.sectionTitle}>The Path to Financial Freedom</Text>
          <View style={styles.freedomCard}>
            <Text style={styles.freedomText}>
              • Every dollar lost to gambling delays your debt freedom{'\n'}
              • Debt payoff is a guaranteed return on your money{'\n'}
              • Interest payments are money you'll never get back{'\n'}
              • Being debt-free gives you financial flexibility{'\n'}
              • Stop gambling, start building wealth{'\n'}
              • Your future self will thank you
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
  debtStatusContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  debtCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  noDebtContainer: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
  },
  noDebtText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noDebtSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  impactContainer: {
    marginBottom: 24,
  },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  impactText: {
    marginLeft: 12,
    flex: 1,
  },
  impactTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  impactValue: {
    color: '#dc2626',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  impactDescription: {
    color: '#9ca3af',
    fontSize: 14,
  },
  timelineContainer: {
    marginTop: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginRight: 12,
  },
  timelineDotDelayed: {
    backgroundColor: '#dc2626',
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: '#374151',
    marginLeft: 5,
    marginBottom: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    color: '#ffffff',
    fontSize: 14,
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
  alternativesContainer: {
    marginBottom: 24,
  },
  alternativeCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  alternativeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alternativeName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  alternativeValue: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  alternativeDescription: {
    color: '#9ca3af',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  input: {
    backgroundColor: '#374151',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  freedomContainer: {
    marginBottom: 24,
  },
  freedomCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  freedomText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
}); 