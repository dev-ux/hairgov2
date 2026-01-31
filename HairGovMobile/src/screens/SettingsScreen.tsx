import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

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
}) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color={colors.primary} style={styles.settingIcon} />
        <View>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {value && <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>}
        </View>
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor="#fff"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
};

export const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDarkMode, toggleTheme, colors } = useTheme();

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* En-tête personnalisé avec bouton de retour */}
      <View style={[styles.headerContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Paramètres</Text>
      </View> 
      <ScrollView>
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Compte</Text>
        <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
          <SettingItem 
            icon="person-outline" 
            title="Profil" 
            value="Gérez vos informations personnelles"
            onPress={() => navigation.navigate('UserProfile')}
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
            value="Ajoutez une carte"
            onPress={() => {}}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.text }]}>Préférences</Text>
        <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
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
            switchValue={isDarkMode}
            onValueChange={toggleTheme}
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

        <Text style={[styles.sectionHeader, { color: colors.text }]}>Aide & Support</Text>
        <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
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

        <View style={[styles.versionContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionContainer: {
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
    fontWeight: '500',
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
