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
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { GamblingSession } from '../types';
import { formatCurrency, formatPercentage } from '../utils/calculations';

type SessionHistoryStackParamList = {
  SessionHistory: undefined;
  SessionDetail: { session: GamblingSession };
  SessionEdit: { session: GamblingSession };
};

type SessionDetailScreenNavigationProp = StackNavigationProp<SessionHistoryStackParamList, 'SessionDetail'>;
type SessionDetailScreenRouteProp = RouteProp<SessionHistoryStackParamList, 'SessionDetail'>;

interface SessionDetailScreenProps {
  navigation: SessionDetailScreenNavigationProp;
  route: SessionDetailScreenRouteProp;
}

export default function SessionDetailScreen({ route, navigation }: SessionDetailScreenProps) {
  const { session } = route.params;

  const handleEditSession = () => {
    navigation.navigate('SessionEdit', { session });
  };

  const handleDeleteSession = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // This will be handled by the parent screen
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getSessionResultColor = () => {
    return session.netResult >= 0 ? '#10b981' : '#ef4444';
  };

  const getSessionResultIcon = () => {
    return session.netResult >= 0 ? 'trending-up' : 'trending-down';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Session Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={handleEditSession}
            >
              <Ionicons name="create-outline" size={24} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={handleDeleteSession}
            >
              <Ionicons name="trash-outline" size={24} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Session Result Card */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons 
              name={getSessionResultIcon() as any} 
              size={32} 
              color={getSessionResultColor()} 
            />
            <Text style={styles.resultLabel}>Session Result</Text>
          </View>
          <Text style={[styles.resultAmount, { color: getSessionResultColor() }]}>
            {session.netResult >= 0 ? '+' : ''}{formatCurrency(session.netResult)}
          </Text>
        </View>

        {/* Session Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Session Information</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Game Type</Text>
              <Text style={styles.infoValue}>{session.gameType}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bet Amount</Text>
              <Text style={styles.infoValue}>{formatCurrency(session.betAmount)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Win Amount</Text>
              <Text style={[styles.infoValue, { color: '#10b981' }]}>
                {formatCurrency(session.winAmount)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Loss Amount</Text>
              <Text style={[styles.infoValue, { color: '#ef4444' }]}>
                {formatCurrency(session.lossAmount)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{session.duration} minutes</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(session.date)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{formatTime(session.date)}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        {session.location && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <Ionicons name="location-outline" size={20} color="#9ca3af" />
              <Text style={styles.locationText}>{session.location}</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {session.notes && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Ionicons name="document-text-outline" size={20} color="#9ca3af" />
              <Text style={styles.notesText}>{session.notes}</Text>
            </View>
          </View>
        )}

        {/* Session Analysis */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Quick Analysis</Text>
          
          <View style={styles.analysisGrid}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Return on Investment</Text>
              <Text style={[
                styles.analysisValue,
                { color: session.netResult >= 0 ? '#10b981' : '#ef4444' }
              ]}>
                {session.betAmount > 0 
                  ? formatPercentage((session.netResult / session.betAmount) * 100)
                  : '0%'
                }
              </Text>
            </View>
            
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Win Rate</Text>
              <Text style={styles.analysisValue}>
                {session.betAmount > 0 
                  ? formatPercentage((session.winAmount / session.betAmount) * 100)
                  : '0%'
                }
              </Text>
            </View>
            
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Loss Rate</Text>
              <Text style={styles.analysisValue}>
                {session.betAmount > 0 
                  ? formatPercentage((session.lossAmount / session.betAmount) * 100)
                  : '0%'
                }
              </Text>
            </View>
            
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Hourly Rate</Text>
              <Text style={[
                styles.analysisValue,
                { color: session.netResult >= 0 ? '#10b981' : '#ef4444' }
              ]}>
                {session.duration > 0 
                  ? formatCurrency((session.netResult / session.duration) * 60)
                  : formatCurrency(0)
                }/hour
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditSession}
          >
            <Ionicons name="create-outline" size={20} color="#ffffff" />
            <Text style={styles.editButtonText}>Edit Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              // TODO: Implement share functionality
              Alert.alert('Coming Soon', 'Share functionality will be available soon!');
            }}
          >
            <Ionicons name="share-outline" size={20} color="#ffffff" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#1f2937',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  resultAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  infoSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoGrid: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  locationCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 8,
  },
  notesCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notesText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  analysisGrid: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  analysisLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  analysisValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 