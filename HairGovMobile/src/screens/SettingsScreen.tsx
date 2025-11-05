import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingItem = ({ 
  icon, 
  title, 
  value, 
  onPress, 
  isSwitch = false, 
  switchValue, 
  onValueChange 
}: {
  icon: string;
  title: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onValueChange?: (value: boolean) => void;
}) => (
  <TouchableOpacity 
    style={styles.settingItem} 
    onPress={!isSwitch ? onPress : undefined}
    disabled={isSwitch}
  >
    <View style={styles.settingLeft}>
      <Ionicons name={icon as any} size={22} color="#666" style={styles.settingIcon} />
      <View>
        <Text style={styles.settingTitle}>{title}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
    </View>
    {isSwitch ? (
      <Switch
        value={switchValue}
        onValueChange={onValueChange}
        trackColor={{ false: '#f0f0f0', true: '#007AFF' }}
        thumbColor="#fff"
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    )}
  </TouchableOpacity>
);

export const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive', 
          onPress: () => {
            // Logique de déconnexion
          } 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.sectionHeader}>Compte</Text>
        <View style={styles.sectionContainer}>
          <SettingItem 
            icon="person-outline" 
            title="Profil" 
            value="Gérez vos informations personnelles"
            onPress={() => {}}
          />
          <SettingItem 
            icon="key-outline" 
            title="Mot de passe" 
            value="••••••••"
            onPress={() => {}}
          />
          <SettingItem 
            icon="card-outline" 
            title="Moyens de paiement" 
            onPress={() => {}}
          />
        </View>

        <Text style={styles.sectionHeader}>Préférences</Text>
        <View style={styles.sectionContainer}>
          <SettingItem 
            icon="notifications-outline" 
            title="Notifications" 
            isSwitch
            switchValue={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SettingItem 
            icon="moon-outline" 
            title="Mode sombre" 
            isSwitch
            switchValue={darkMode}
            onValueChange={setDarkMode}
          />
          <SettingItem 
            icon="finger-print-outline" 
            title="Authentification biométrique" 
            isSwitch
            switchValue={biometricEnabled}
            onValueChange={setBiometricEnabled}
          />
          <SettingItem 
            icon="language-outline" 
            title="Langue" 
            value="Français"
            onPress={() => {}}
          />
        </View>

        <Text style={styles.sectionHeader}>Aide & Support</Text>
        <View style={styles.sectionContainer}>
          <SettingItem 
            icon="help-circle-outline" 
            title="Centre d'aide" 
            onPress={() => {}}
          />
          <SettingItem 
            icon="information-circle-outline" 
            title="À propos" 
            onPress={() => {}}
          />
          <SettingItem 
            icon="shield-checkmark-outline" 
            title="Confidentialité et sécurité" 
            onPress={() => {}}
          />
          <SettingItem 
            icon="document-text-outline" 
            title="Conditions d'utilisation" 
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});

export default SettingsScreen;
