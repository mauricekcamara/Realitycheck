import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDataStorage } from '../hooks/useDataStorage';
import { GamblingSession } from '../types';
import { formatCurrency, formatPercentage } from '../utils/calculations';

type SessionHistoryStackParamList = {
  SessionHistory: undefined;
  SessionDetail: { session: GamblingSession };
  SessionEdit: { session: GamblingSession };
};

type SessionHistoryScreenNavigationProp = StackNavigationProp<SessionHistoryStackParamList, 'SessionHistory'>;

interface SessionHistoryScreenProps {
  navigation: SessionHistoryScreenNavigationProp;
}

export default function SessionHistoryScreen({ navigation }: SessionHistoryScreenProps) {
  const { sessions, deleteSession } = useDataStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGameType, setFilterGameType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'result'>('date');

  // Get unique game types for filter
  const gameTypes = useMemo(() => {
    const types = [...new Set(sessions.map(s => s.gameType))];
    return ['all', ...types];
  }, [sessions]);

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(session => {
      const matchesSearch = searchQuery === '' || 
        session.gameType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGameType = filterGameType === 'all' || session.gameType === filterGameType;
      
      return matchesSearch && matchesGameType;
    });

    // Sort sessions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount':
          return b.betAmount - a.betAmount;
        case 'result':
          return a.netResult - b.netResult;
        default:
          return 0;
      }
    });

    return filtered;
  }, [sessions, searchQuery, filterGameType, sortBy]);

  const handleEditSession = (session: GamblingSession) => {
    navigation.navigate('SessionEdit', { session });
  };

  const handleDeleteSession = (session: GamblingSession) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSession(session.id);
            Alert.alert('Success', 'Session deleted successfully.');
          },
        },
      ]
    );
  };

  const handleViewSession = (session: GamblingSession) => {
    navigation.navigate('SessionDetail', { session });
  };

  const renderSessionCard = ({ item: session }: { item: GamblingSession }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => handleViewSession(session)}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionGame}>{session.gameType}</Text>
        <Text style={styles.sessionDate}>
          {session.date.toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.sessionDetails}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionBet}>
            Bet: {formatCurrency(session.betAmount)}
          </Text>
          <Text style={styles.sessionDuration}>
            {session.duration} min
          </Text>
        </View>
        
        <View style={styles.sessionResult}>
          <Text 
            style={[
              styles.resultAmount,
              session.netResult >= 0 ? styles.positive : styles.negative
            ]}
          >
            {session.netResult >= 0 ? '+' : ''}{formatCurrency(session.netResult)}
          </Text>
        </View>
      </View>

      {session.location && (
        <Text style={styles.sessionLocation}>
          📍 {session.location}
        </Text>
      )}

      {session.notes && (
        <Text style={styles.sessionNotes} numberOfLines={2}>
          📝 {session.notes}
        </Text>
      )}

      <View style={styles.sessionActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditSession(session)}
        >
          <Ionicons name="create-outline" size={16} color="#2563eb" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteSession(session)}
        >
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterChip = (gameType: string) => (
    <TouchableOpacity
      key={gameType}
      style={[
        styles.filterChip,
        filterGameType === gameType && styles.filterChipActive
      ]}
      onPress={() => setFilterGameType(gameType)}
    >
      <Text style={[
        styles.filterChipText,
        filterGameType === gameType && styles.filterChipTextActive
      ]}>
        {gameType === 'all' ? 'All Games' : gameType}
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (sort: 'date' | 'amount' | 'result', label: string) => (
    <TouchableOpacity
      style={[
        styles.sortButton,
        sortBy === sort && styles.sortButtonActive
      ]}
      onPress={() => setSortBy(sort)}
    >
      <Text style={[
        styles.sortButtonText,
        sortBy === sort && styles.sortButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Session History</Text>
        <Text style={styles.subtitle}>
          {filteredSessions.length} of {sessions.length} sessions
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sessions..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {gameTypes.map(renderFilterChip)}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {renderSortButton('date', 'Date')}
        {renderSortButton('amount', 'Bet Amount')}
        {renderSortButton('result', 'Result')}
      </View>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>
            {sessions.length === 0 ? 'No sessions yet' : 'No sessions match your filters'}
          </Text>
          {sessions.length === 0 && (
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => {
                // Navigate to the main tab navigator's Edge Calculator
                // This is a workaround since we're in a stack navigator
                navigation.getParent()?.navigate('Edge Calculator');
              }}
            >
              <Text style={styles.addFirstButtonText}>Add Your First Session</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderSessionCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
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
    fontSize: 14,
    color: '#9ca3af',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  filterChipTextActive: {
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sortLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginRight: 12,
  },
  sortButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#059669',
  },
  sortButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  sortButtonTextActive: {
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionGame: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionBet: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 2,
  },
  sessionDuration: {
    color: '#9ca3af',
    fontSize: 12,
  },
  sessionResult: {
    alignItems: 'flex-end',
  },
  resultAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  sessionLocation: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  sessionNotes: {
    color: '#9ca3af',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    color: '#2563eb',
    fontSize: 12,
    marginLeft: 4,
  },
  deleteText: {
    color: '#dc2626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  addFirstButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addFirstButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 