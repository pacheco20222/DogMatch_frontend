import React, { useState } from 'react';
import { View, Text, Image, Alert, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAuth } from '../hooks/useAuth';
import { updateUser } from '../store/slices/authSlice';
import { apiFetch } from '../api/client';
import { useTheme } from '../theme/ThemeContext';
import { getDesignTokens } from '../styles/designTokens';

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user, accessToken, fetchProfile } = useAuth();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const styles = React.useMemo(() => createStyles(tokens), [isDark]);

  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [localImage, setLocalImage] = useState(user?.profile_photo_url || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Ask permission and pick image from library
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'We need permission to access your photos to let you choose a profile picture. You can change this in Settings.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.cancelled) {
        setLocalImage(result.uri);
        // Optionally upload immediately
        await uploadPhoto(result.uri);
      }
    } catch (e) {
      console.error('Pick image error', e);
      Alert.alert('Error', 'Unable to access photo library.');
    }
  };

  // Ask permission and take a photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'We need camera permission to take a photo. You can change this in Settings.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.cancelled) {
        setLocalImage(result.uri);
        await uploadPhoto(result.uri);
      }
    } catch (e) {
      console.error('Take photo error', e);
      Alert.alert('Error', 'Unable to open camera.');
    }
  };

  // Upload selected image to backend S3 endpoint
  const uploadPhoto = async (uri) => {
    if (!uri) return;
    if (!accessToken) {
      Alert.alert('Not authenticated', 'Please login again.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = filename.match(/\.([0-9a-z]+)$/i);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photo', {
        uri,
        name: filename,
        type,
      });

      const response = await apiFetch('/api/s3/upload/user-profile', {
        method: 'POST',
        body: formData,
        token: accessToken,
      });

      if (response && response.photo_url) {
        // Update local and redux user
        dispatch(updateUser({ profile_photo_url: response.photo_url }));
        Alert.alert('Success', 'Profile photo updated.');
      }
    } catch (error) {
      console.error('Upload photo error', error);
      Alert.alert('Upload failed', error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  // Save username and phone
  const saveProfile = async () => {
    if (!accessToken) {
      Alert.alert('Not authenticated', 'Please login again.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        username: username || user?.username,
        phone: phone || null,
      };

      const response = await apiFetch('/api/users/profile', {
        method: 'PUT',
        body: payload,
        token: accessToken,
      });

      if (response && response.user) {
        dispatch(updateUser(response.user));
        Alert.alert('Saved', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Save profile error', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const placeholderUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${user?.first_name || ''} ${user?.last_name || ''}`
  )}&background=6366F1&color=fff&size=256`;

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark ? styles.textLight : styles.textDark]}>Edit Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarRow}>
          <Image
            source={{ uri: localImage || user?.profile_photo_url || placeholderUri }}
            style={styles.avatar}
          />
          <View style={styles.avatarButtons}>
            <TouchableOpacity style={styles.smallButton} onPress={takePhoto}>
              <Text style={styles.smallButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallButton} onPress={pickImage}>
              <Text style={styles.smallButtonText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, isDark ? styles.textLight : styles.textDark]}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
            placeholder="Username"
            placeholderTextColor={tokens.placeholder}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, isDark ? styles.textLight : styles.textDark]}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
            placeholder="Phone number"
            placeholderTextColor={tokens.placeholder}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={loading || uploading}>
            {loading ? (
                <ActivityIndicator color={tokens.primaryContrast} />
              ) : (
                <Text style={styles.saveText}>{uploading ? 'Uploading...' : 'Save'}</Text>
              )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

function createStyles(tokens) {
  return StyleSheet.create({
    container: { flex: 1 },
    darkBg: { backgroundColor: tokens.background },
    lightBg: { backgroundColor: tokens.surface },
    header: { paddingHorizontal: tokens.spacingLarge, paddingTop: 10 },
    title: { fontSize: 28, fontWeight: '700', color: tokens.textPrimary },
    textLight: { color: tokens.textPrimary },
    textDark: { color: tokens.textPrimary },
    content: { padding: tokens.spacingLarge },
    avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: tokens.spacingLarge },
    avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: tokens.cardBackground },
    avatarButtons: { marginLeft: tokens.spacingLarge, flex: 1 },
    smallButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: tokens.primary, marginBottom: 8 },
    smallButtonText: { color: tokens.primaryContrast, fontWeight: '600' },
    field: { marginBottom: tokens.spacingLarge },
    label: { marginBottom: 6, fontWeight: '600', color: tokens.textPrimary },
    input: { borderRadius: 10, padding: 12, fontSize: tokens.fontSizeBase, backgroundColor: tokens.inputBackground, color: tokens.inputText },
    inputDark: { backgroundColor: tokens.inputBackground, color: tokens.inputText },
    inputLight: { backgroundColor: tokens.surface, color: tokens.inputText },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: tokens.spacing },
    cancelButton: { flex: 1, marginRight: 8, paddingVertical: 12, borderRadius: 10, backgroundColor: tokens.cardBackground, alignItems: 'center' },
    cancelText: { color: tokens.textPrimary, fontWeight: '600' },
    saveButton: { flex: 1, marginLeft: 8, paddingVertical: 12, borderRadius: 10, backgroundColor: tokens.primaryVariant, alignItems: 'center' },
    saveText: { color: tokens.primaryContrast, fontWeight: '700' },
  });
}

export default EditProfileScreen;
