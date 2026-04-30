import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL } from '../config/constants';

const API_BASE_URL = API_URL.replace('/api/v1', '');

type RootStackParamList = {
  Settings: undefined;
  Login: undefined;
  Favorites: undefined;
  Statistics: undefined;
  Bookings: undefined;
  Payments: undefined;
  Logout: undefined;
};

type MenuItem = { id: string; title: string; icon: string; screen: string; color: string };

const MENU_ITEMS: MenuItem[] = [
  { id: '1', title: 'Favoris',      icon: 'heart-outline',       screen: 'Favorites',  color: '#FF6B6B' },
  { id: '2', title: 'Statistiques', icon: 'stats-chart-outline',  screen: 'Statistics', color: '#6C63FF' },
  { id: '3', title: 'Paiements',    icon: 'card-outline',         screen: 'Payments',   color: '#4CAF50' },
  { id: '4', title: 'Paramètres',   icon: 'settings-outline',     screen: 'Settings',   color: '#FF9800' },
  { id: '5', title: 'Déconnexion',  icon: 'log-out-outline',      screen: 'Logout',     color: '#F44336' },
];

const getProfileImageUrl = (profilePhoto?: string, profilePicture?: string): string | null => {
  const photo = profilePhoto || profilePicture;
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  if (photo.startsWith('file://')) return null;
  if (photo.startsWith('/')) return `${API_BASE_URL}${photo}`;
  // nom de fichier seul ex: "photos-uuid.jpg"
  return `${API_BASE_URL}/uploads/photos/${photo}`;
};

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, updateUser, logout } = useAuth();
  const { colors } = useTheme();

  const [editModal, setEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(0);

  // Edit form state
  const [editName, setEditName] = useState(user?.full_name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editPhoto, setEditPhoto] = useState<string | null>(null);

  const openEditModal = () => {
    setEditName(user?.full_name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditPhoto(null);
    setEditModal(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'L\'accès à la galerie est nécessaire pour changer votre photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setEditPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'L\'accès à la caméra est nécessaire.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setEditPhoto(result.assets[0].uri);
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert('Photo de profil', 'Choisissez une option', [
      { text: 'Galerie',   onPress: pickImage },
      { text: 'Caméra',    onPress: takePhoto },
      { text: 'Annuler',   style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('userToken');

      const formData = new FormData();
      formData.append('full_name', editName.trim());
      if (editEmail.trim()) formData.append('email', editEmail.trim());
      if (editPhone.trim()) formData.append('phone', editPhone.trim());

      if (editPhoto) {
        const fileName = editPhoto.split('/').pop() || 'photo.jpg';
        const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
        formData.append('profile_photo', { uri: editPhoto, name: fileName, type: fileType } as any);
      }

      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        updateUser(data.data?.user ?? data.data ?? { full_name: editName, email: editEmail, phone: editPhone });
        setPhotoVersion(v => v + 1);
        setEditModal(false);
        Alert.alert('Succès', 'Profil mis à jour avec succès !');
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de mettre à jour le profil');
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
    }
  };

  const handleMenuPress = (screen: string) => {
    if (screen === 'Logout') {
      Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: handleLogout },
      ]);
    } else {
      navigation.navigate(screen as any);
    }
  };

  const profileImageUrl = getProfileImageUrl(user?.profile_photo, user?.profile_picture);
  const profileImageUrlCacheBusted = profileImageUrl ? `${profileImageUrl}?v=${photoVersion}` : null;
  const currentPhotoUri = editPhoto || profileImageUrl;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header gradient */}
        <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.headerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mon Profil</Text>
            <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.editBtnText}>Modifier</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarWrap} onPress={openEditModal}>
              {profileImageUrlCacheBusted ? (
                <Image source={{ uri: profileImageUrlCacheBusted }} style={styles.avatar} resizeMode="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={52} color="#fff" />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>{user?.full_name || 'Utilisateur'}</Text>
            {user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
            {user?.phone ? (
              <View style={styles.phonePill}>
                <Ionicons name="call-outline" size={12} color="#fff" />
                <Text style={styles.phoneText}>{user.phone}</Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* Stats row */}
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Réservations</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Favoris</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avis</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuRow, index < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              onPress={() => handleMenuPress(item.screen)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, { color: item.screen === 'Logout' ? '#F44336' : colors.text }]}>
                {item.title}
              </Text>
              {item.screen !== 'Logout' && (
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
              )}
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOuter}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le profil</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Photo picker */}
              <View style={styles.photoPickerSection}>
                <TouchableOpacity style={styles.photoPicker} onPress={handlePhotoOptions}>
                  {currentPhotoUri ? (
                    <Image source={{ uri: currentPhotoUri }} style={styles.photoPreview} resizeMode="cover" />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="person" size={44} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.photoCameraBadge}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.photoHint}>Appuyez pour changer la photo</Text>
              </View>

              {/* Fields */}
              <View style={styles.fields}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Nom complet *</Text>
                  <View style={styles.fieldInputWrap}>
                    <Ionicons name="person-outline" size={17} color="#999" />
                    <TextInput
                      style={styles.fieldInput}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Votre nom complet"
                      placeholderTextColor="#ccc"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <View style={styles.fieldInputWrap}>
                    <Ionicons name="mail-outline" size={17} color="#999" />
                    <TextInput
                      style={styles.fieldInput}
                      value={editEmail}
                      onChangeText={setEditEmail}
                      placeholder="votre@email.com"
                      placeholderTextColor="#ccc"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Téléphone</Text>
                  <View style={styles.fieldInputWrap}>
                    <Ionicons name="call-outline" size={17} color="#999" />
                    <TextInput
                      style={styles.fieldInput}
                      value={editPhone}
                      onChangeText={setEditPhone}
                      placeholder="+225 XX XX XX XX XX"
                      placeholderTextColor="#ccc"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <LinearGradient colors={['#6C63FF', '#8B84FF']} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                      <Text style={styles.saveBtnText}>Enregistrer</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerGrad: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18 },
  editBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  avatarSection: { alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF6B6B', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  userName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  phonePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  phoneText: { fontSize: 12, color: '#fff', fontWeight: '500' },

  // Stats
  statsCard: { flexDirection: 'row', marginHorizontal: 20, marginTop: -16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1 },

  // Menu
  menuCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginBottom: 32 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIconWrap: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '500' },

  // Modal
  modalOuter: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, maxHeight: '92%' },
  modalHandle: { width: 36, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a2e' },

  photoPickerSection: { alignItems: 'center', marginBottom: 24 },
  photoPicker: { position: 'relative' },
  photoPreview: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#6C63FF' },
  photoPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#e0e0e0' },
  photoCameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  photoHint: { marginTop: 8, fontSize: 12, color: '#999' },

  fields: { gap: 16, marginBottom: 24 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555' },
  fieldInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: '#fafafa' },
  fieldInput: { flex: 1, fontSize: 15, color: '#333' },

  saveBtn: { borderRadius: 14, overflow: 'hidden' },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ProfileScreen;
