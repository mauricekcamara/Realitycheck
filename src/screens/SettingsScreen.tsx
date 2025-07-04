import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStorage } from '../hooks/useDataStorage';
import { calculateUserProfile, formatCurrency } from '../utils/calculations';

export default function SettingsScreen() {
  const { sessions, settings, saveSettings, clearAllData } = useDataStorage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notifications);

  const profile = calculateUserProfile(sessions);

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSettings({ ...settings, notifications: value });
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your gambling session data, debt information, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Success', 'All data has been cleared.');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will be available in a future update. For now, your data is securely stored locally on your device.',
      [{ text: 'OK' }]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'This feature will be available in a future update. For now, your data is automatically saved locally.',
      [{ text: 'OK' }]
    );
  };

  const getDataSummary = () => {
    return {
      totalSessions: sessions.length,
      totalLost: profile.netLoss,
      averageLoss: profile.averageSessionLoss,
      personalEdge: profile.personalEdge
    };
  };

  const dataSummary = getDataSummary();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure your Reality Check experience</Text>
        </View>

        {/* Data Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Your Data Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Sessions:</Text>
              <Text style={styles.summaryValue}>{dataSummary.totalSessions}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Lost:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(dataSummary.totalLost)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average Loss:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(dataSummary.averageLoss)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Personal Edge:</Text>
              <Text style={styles.summaryValue}>{dataSummary.personalEdge.toFixed(2)}%</Text>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color="#ffffff" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get reminders and motivational messages
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#374151', true: '#10b981' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#9ca3af'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="color-palette" size={24} color="#ffffff" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dark Theme</Text>
                <Text style={styles.settingDescription}>
                  Always enabled for better experience
                </Text>
              </View>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>On</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="language" size={24} color="#ffffff" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Currency</Text>
                <Text style={styles.settingDescription}>
                  USD (more currencies coming soon)
                </Text>
              </View>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>USD</Text>
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.dataContainer}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dataItem} onPress={handleExportData}>
            <View style={styles.dataInfo}>
              <Ionicons name="download" size={24} color="#2563eb" />
              <View style={styles.dataText}>
                <Text style={styles.dataTitle}>Export Data</Text>
                <Text style={styles.dataDescription}>
                  Download your gambling data as CSV
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataItem} onPress={handleBackupData}>
            <View style={styles.dataInfo}>
              <Ionicons name="cloud-upload" size={24} color="#10b981" />
              <View style={styles.dataText}>
                <Text style={styles.dataTitle}>Backup Data</Text>
                <Text style={styles.dataDescription}>
                  Backup your data to the cloud
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataItem} onPress={handleClearData}>
            <View style={styles.dataInfo}>
              <Ionicons name="trash" size={24} color="#dc2626" />
              <View style={styles.dataText}>
                <Text style={styles.dataTitle}>Clear All Data</Text>
                <Text style={styles.dataDescription}>
                  Permanently delete all your data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.aboutContainer}>
          <Text style={styles.sectionTitle}>About Reality Check</Text>
          
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              Reality Check is designed to help you understand the true cost of gambling through data-driven insights and mathematical reality.
            </Text>
          </View>

          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.versionText}>Built with React Native & Expo</Text>
          </View>
        </View>

        {/* Support */}
        <View style={styles.supportContainer}>
          <Text style={styles.sectionTitle}>Support & Resources</Text>
          
          <TouchableOpacity style={styles.supportItem}>
            <View style={styles.supportInfo}>
              <Ionicons name="help-circle" size={24} color="#f59e0b" />
              <View style={styles.supportText}>
                <Text style={styles.supportTitle}>Help & FAQ</Text>
                <Text style={styles.supportDescription}>
                  Learn how to use the app effectively
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportItem}>
            <View style={styles.supportInfo}>
              <Ionicons name="heart" size={24} color="#dc2626" />
              <View style={styles.supportText}>
                <Text style={styles.supportTitle}>Gambling Support</Text>
                <Text style={styles.supportDescription}>
                  Resources for gambling addiction help
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportItem}>
            <View style={styles.supportInfo}>
              <Ionicons name="mail" size={24} color="#2563eb" />
              <View style={styles.supportText}>
                <Text style={styles.supportTitle}>Contact Support</Text>
                <Text style={styles.supportDescription}>
                  Get help with app issues
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Privacy */}
        <View style={styles.privacyContainer}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <View style={styles.privacyCard}>
            <Text style={styles.privacyText}>
              • All data is stored locally on your device{'\n'}
              • No data is sent to external servers{'\n'}
              • Your privacy is our priority{'\n'}
              • Data is encrypted using secure storage{'\n'}
              • You control your own data completely
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
  summaryContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsContainer: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#9ca3af',
    fontSize: 14,
  },
  settingValue: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  settingValueText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  dataContainer: {
    marginBottom: 24,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  dataInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataText: {
    marginLeft: 12,
    flex: 1,
  },
  dataTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataDescription: {
    color: '#9ca3af',
    fontSize: 14,
  },
  aboutContainer: {
    marginBottom: 24,
  },
  aboutCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  aboutText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  supportContainer: {
    marginBottom: 24,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  supportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportText: {
    marginLeft: 12,
    flex: 1,
  },
  supportTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  supportDescription: {
    color: '#9ca3af',
    fontSize: 14,
  },
  privacyContainer: {
    marginBottom: 24,
  },
  privacyCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  privacyText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
}); 