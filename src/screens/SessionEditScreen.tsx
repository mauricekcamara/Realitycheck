import React, { useState, useEffect } from 'react';
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
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useDataStorage } from '../hooks/useDataStorage';
import { GamblingSession } from '../types';
import { GAME_TYPES } from '../utils/calculations';

type SessionHistoryStackParamList = {
  SessionHistory: undefined;
  SessionDetail: { session: GamblingSession };
  SessionEdit: { session: GamblingSession };
};

type SessionEditScreenNavigationProp = StackNavigationProp<SessionHistoryStackParamList, 'SessionEdit'>;
type SessionEditScreenRouteProp = RouteProp<SessionHistoryStackParamList, 'SessionEdit'>;

interface SessionEditScreenProps {
  navigation: SessionEditScreenNavigationProp;
  route: SessionEditScreenRouteProp;
}

export default function SessionEditScreen({ route, navigation }: SessionEditScreenProps) {
  const { session } = route.params;
  const { updateSession } = useDataStorage();
  
  const [editedSession, setEditedSession] = useState({
    gameType: session.gameType,
    betAmount: session.betAmount.toString(),
    winAmount: session.winAmount.toString(),
    lossAmount: session.lossAmount.toString(),
    duration: session.duration.toString(),
    location: session.location || '',
    notes: session.notes || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!editedSession.betAmount || parseFloat(editedSession.betAmount) <= 0) {
      newErrors.betAmount = 'Bet amount must be greater than 0';
    }
    
    if (!editedSession.duration || parseInt(editedSession.duration) <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    const winAmount = parseFloat(editedSession.winAmount) || 0;
    const lossAmount = parseFloat(editedSession.lossAmount) || 0;
    
    if (winAmount < 0) {
      newErrors.winAmount = 'Win amount cannot be negative';
    }
    
    if (lossAmount < 0) {
      newErrors.lossAmount = 'Loss amount cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    const updatedSession: GamblingSession = {
      ...session,
      gameType: editedSession.gameType,
      betAmount: parseFloat(editedSession.betAmount),
      winAmount: parseFloat(editedSession.winAmount) || 0,
      lossAmount: parseFloat(editedSession.lossAmount) || 0,
      netResult: (parseFloat(editedSession.winAmount) || 0) - (parseFloat(editedSession.lossAmount) || 0),
      duration: parseInt(editedSession.duration),
      location: editedSession.location || undefined,
      notes: editedSession.notes || undefined,
    };

    updateSession(session.id, updatedSession);
    Alert.alert('Success', 'Session updated successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  const getSessionResult = () => {
    const winAmount = parseFloat(editedSession.winAmount) || 0;
    const lossAmount = parseFloat(editedSession.lossAmount) || 0;
    return winAmount - lossAmount;
  };

  const sessionResult = getSessionResult();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Session</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Type</Text>
          <View style={styles.gameTypeContainer}>
            {Object.keys(GAME_TYPES).slice(0, 6).map((gameType) => (
              <TouchableOpacity
                key={gameType}
                style={[
                  styles.gameTypeOption,
                  editedSession.gameType === gameType && styles.gameTypeOptionSelected
                ]}
                onPress={() => setEditedSession({...editedSession, gameType})}
              >
                <Text style={[
                  styles.gameTypeText,
                  editedSession.gameType === gameType && styles.gameTypeTextSelected
                ]}>
                  {gameType}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Session Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bet Amount ($)</Text>
              <TextInput
                style={[styles.input, errors.betAmount && styles.inputError]}
                value={editedSession.betAmount}
                onChangeText={(text) => {
                  setEditedSession({...editedSession, betAmount: text});
                  if (errors.betAmount) {
                    setErrors({...errors, betAmount: ''});
                  }
                }}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={() => {}}
                blurOnSubmit={true}
              />
              {errors.betAmount && <Text style={styles.errorText}>{errors.betAmount}</Text>}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (min)</Text>
              <TextInput
                style={[styles.input, errors.duration && styles.inputError]}
                value={editedSession.duration}
                onChangeText={(text) => {
                  setEditedSession({...editedSession, duration: text});
                  if (errors.duration) {
                    setErrors({...errors, duration: ''});
                  }
                }}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={() => {}}
                blurOnSubmit={true}
              />
              {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Win Amount ($)</Text>
              <TextInput
                style={[styles.input, errors.winAmount && styles.inputError]}
                value={editedSession.winAmount}
                onChangeText={(text) => {
                  setEditedSession({...editedSession, winAmount: text});
                  if (errors.winAmount) {
                    setErrors({...errors, winAmount: ''});
                  }
                }}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={() => {}}
                blurOnSubmit={true}
              />
              {errors.winAmount && <Text style={styles.errorText}>{errors.winAmount}</Text>}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Loss Amount ($)</Text>
              <TextInput
                style={[styles.input, errors.lossAmount && styles.inputError]}
                value={editedSession.lossAmount}
                onChangeText={(text) => {
                  setEditedSession({...editedSession, lossAmount: text});
                  if (errors.lossAmount) {
                    setErrors({...errors, lossAmount: ''});
                  }
                }}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={() => {}}
                blurOnSubmit={true}
              />
              {errors.lossAmount && <Text style={styles.errorText}>{errors.lossAmount}</Text>}
            </View>
          </View>

          {/* Result Preview */}
          {sessionResult !== 0 && (
            <View style={styles.resultPreview}>
              <Text style={styles.resultLabel}>Session Result:</Text>
              <Text style={[
                styles.resultValue,
                sessionResult >= 0 ? styles.positiveResult : styles.negativeResult
              ]}>
                {sessionResult >= 0 ? '+' : ''}${sessionResult.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={editedSession.location}
            onChangeText={(text) => setEditedSession({...editedSession, location: text})}
            placeholder="Casino name, city, etc."
            placeholderTextColor="#9ca3af"
            returnKeyType="done"
            onSubmitEditing={() => {}}
            blurOnSubmit={true}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={editedSession.notes}
            onChangeText={(text) => setEditedSession({...editedSession, notes: text})}
            placeholder="How you felt, what happened, etc."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Session Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Original Date:</Text>
              <Text style={styles.infoValue}>
                {session.date.toLocaleDateString()} at {session.date.toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Session ID:</Text>
              <Text style={styles.infoValue}>{session.id}</Text>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  gameTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gameTypeOption: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  gameTypeOptionSelected: {
    backgroundColor: '#2563eb',
  },
  gameTypeText: {
    color: '#ffffff',
    fontSize: 12,
  },
  gameTypeTextSelected: {
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    width: '48%',
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
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#374151',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  resultPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  resultLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  positiveResult: {
    color: '#10b981',
  },
  negativeResult: {
    color: '#ef4444',
  },
  infoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
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
}); 