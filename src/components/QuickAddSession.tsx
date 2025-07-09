import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GAME_TYPES } from '../utils/calculations';

interface QuickAddSessionProps {
  visible: boolean;
  onClose: () => void;
  onAddSession: (session: {
    gameType: string;
    betAmount: number;
    winAmount: number;
    lossAmount: number;
    duration: number;
  }) => void;
}

const QUICK_TEMPLATES = [
  {
    name: 'Quick Loss',
    description: 'Lost money quickly',
    icon: 'trending-down',
    color: '#dc2626',
    template: { betAmount: 100, winAmount: 0, lossAmount: 100, duration: 30 }
  },
  {
    name: 'Big Win',
    description: 'Had a lucky session',
    icon: 'trending-up',
    color: '#10b981',
    template: { betAmount: 50, winAmount: 200, lossAmount: 0, duration: 45 }
  },
  {
    name: 'Break Even',
    description: 'Came out even',
    icon: 'remove',
    color: '#f59e0b',
    template: { betAmount: 200, winAmount: 200, lossAmount: 0, duration: 60 }
  },
  {
    name: 'Small Loss',
    description: 'Lost a little bit',
    icon: 'trending-down',
    color: '#ef4444',
    template: { betAmount: 50, winAmount: 0, lossAmount: 50, duration: 20 }
  }
];

export default function QuickAddSession({ visible, onClose, onAddSession }: QuickAddSessionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof QUICK_TEMPLATES[0] | null>(null);
  const [customSession, setCustomSession] = useState({
    gameType: 'Slots (Low Variance)',
    betAmount: '',
    winAmount: '',
    lossAmount: '',
    duration: ''
  });

  const handleTemplateSelect = (template: typeof QUICK_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setCustomSession({
      gameType: 'Slots (Low Variance)',
      betAmount: template.template.betAmount.toString(),
      winAmount: template.template.winAmount.toString(),
      lossAmount: template.template.lossAmount.toString(),
      duration: template.template.duration.toString()
    });
  };

  const handleAddSession = () => {
    const betAmount = parseFloat(customSession.betAmount) || 0;
    const winAmount = parseFloat(customSession.winAmount) || 0;
    const lossAmount = parseFloat(customSession.lossAmount) || 0;
    const duration = parseInt(customSession.duration) || 0;

    if (betAmount === 0) {
      Alert.alert('Error', 'Please enter a bet amount');
      return;
    }

    onAddSession({
      gameType: customSession.gameType,
      betAmount,
      winAmount,
      lossAmount,
      duration
    });

    // Reset form
    setCustomSession({
      gameType: 'Slots (Low Variance)',
      betAmount: '',
      winAmount: '',
      lossAmount: '',
      duration: ''
    });
    setSelectedTemplate(null);
    onClose();
  };

  const getSessionResult = () => {
    const betAmount = parseFloat(customSession.betAmount) || 0;
    const winAmount = parseFloat(customSession.winAmount) || 0;
    const lossAmount = parseFloat(customSession.lossAmount) || 0;
    return winAmount - lossAmount;
  };

  const sessionResult = getSessionResult();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Quick Add Session</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Quick Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Templates</Text>
            <View style={styles.templateGrid}>
              {QUICK_TEMPLATES.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.templateCard,
                    selectedTemplate?.name === template.name && styles.templateCardSelected
                  ]}
                  onPress={() => handleTemplateSelect(template)}
                >
                  <View style={[styles.templateIcon, { backgroundColor: template.color }]}>
                    <Ionicons name={template.icon as any} size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDescription}>{template.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Game Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Type</Text>
            <View style={styles.gameTypeContainer}>
              {Object.keys(GAME_TYPES).slice(0, 6).map((gameType) => (
                <TouchableOpacity
                  key={gameType}
                  style={[
                    styles.gameTypeOption,
                    customSession.gameType === gameType && styles.gameTypeOptionSelected
                  ]}
                  onPress={() => setCustomSession({...customSession, gameType})}
                >
                  <Text style={[
                    styles.gameTypeText,
                    customSession.gameType === gameType && styles.gameTypeTextSelected
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
                  style={styles.input}
                  value={customSession.betAmount}
                  onChangeText={(text) => setCustomSession({...customSession, betAmount: text})}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => {}}
                  blurOnSubmit={true}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (min)</Text>
                <TextInput
                  style={styles.input}
                  value={customSession.duration}
                  onChangeText={(text) => setCustomSession({...customSession, duration: text})}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => {}}
                  blurOnSubmit={true}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Win Amount ($)</Text>
                <TextInput
                  style={styles.input}
                  value={customSession.winAmount}
                  onChangeText={(text) => setCustomSession({...customSession, winAmount: text})}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => {}}
                  blurOnSubmit={true}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Loss Amount ($)</Text>
                <TextInput
                  style={styles.input}
                  value={customSession.lossAmount}
                  onChangeText={(text) => setCustomSession({...customSession, lossAmount: text})}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => {}}
                  blurOnSubmit={true}
                />
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

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addButton} onPress={handleAddSession}>
              <Ionicons name="add-circle" size={24} color="#ffffff" />
              <Text style={styles.addButtonText}>Add Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
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
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateCard: {
    width: '48%',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  templateCardSelected: {
    backgroundColor: '#2563eb',
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  templateName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b7280',
    padding: 16,
    borderRadius: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 