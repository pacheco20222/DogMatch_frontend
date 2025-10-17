import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Image, 
  Alert,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  Card,
  Surface,
  FAB,
  Chip,
  Menu,
  IconButton,
  Button,
  Avatar,
  ActivityIndicator,
  Snackbar,
  Portal,
} from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  Layout,
} from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchMyDogs, deleteDog, clearError } from '../store/slices/dogsSlice';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/ui/EmptyState';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const MyDogsScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { myDogs, loading, error } = useAppSelector(state => state.dogs);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  const loadDogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      await dispatch(fetchMyDogs()).unwrap();
    } catch (e) {
      setSnackbarVisible(true);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDogs();
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardsOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDogs();
    }, [])
  );

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleDeleteDog = (dogId, dogName) => {
    Alert.alert(
      'Delete Dog',
      `Are you sure you want to delete ${dogName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteDog(dogId)).unwrap();
              Alert.alert('Success', 'Dog deleted successfully');
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete dog');
            }
          }
        }
      ]
    );
  };

  const handleEditDog = (dog) => {
    // TODO: Navigate to edit dog screen
    Alert.alert('Coming Soon', 'Edit dog functionality will be added soon!');
  };

  const toggleMenu = (dogId) => {
    setMenuVisible(prev => ({
      ...prev,
      [dogId]: !prev[dogId]
    }));
  };

  const closeMenu = (dogId) => {
    setMenuVisible(prev => ({
      ...prev,
      [dogId]: false
    }));
  };

  const renderDogCard = (dog, index) => (
    <Animated.View
      key={dog.id}
      entering={FadeIn.delay(index * 100).duration(600)}
      layout={Layout.springify()}
    >
      <Card mode="elevated" style={styles.dogCard}>
        <Card.Content style={styles.cardContent}>
          {/* Dog Photo and Basic Info */}
          <View style={styles.dogHeader}>
            <View style={styles.photoContainer}>
              {dog.primary_photo_url ? (
                <Avatar.Image
                  size={80}
                  source={{ 
                    uri: dog.primary_photo_url.startsWith('http') 
                      ? dog.primary_photo_url 
                      : `https://dogmatch-backend.onrender.com${dog.primary_photo_url}`
                  }}
                  style={styles.dogPhoto}
                />
              ) : (
                <Avatar.Icon
                  size={80}
                  icon="dog"
                  style={styles.placeholderPhoto}
                />
              )}
            </View>

            <View style={styles.dogInfo}>
              <View style={styles.nameContainer}>
                <Text variant="titleLarge" style={styles.dogName}>
                  {dog.name}
                </Text>
                <Chip 
                  mode="outlined" 
                  compact 
                  style={styles.ageChip}
                  textStyle={styles.ageChipText}
                >
                  {dog.age_string}
                </Chip>
              </View>
              
              <Text variant="bodyMedium" style={styles.dogBreed}>
                {dog.breed}
              </Text>
              
              <View style={styles.detailsRow}>
                <Chip 
                  mode="outlined" 
                  compact 
                  icon="ruler"
                  style={styles.detailChip}
                >
                  {dog.size}
                </Chip>
                <Chip 
                  mode="outlined" 
                  compact 
                  icon="gender-male-female"
                  style={styles.detailChip}
                >
                  {dog.gender}
                </Chip>
              </View>
            </View>

            {/* Menu Button */}
            <Menu
              visible={menuVisible[dog.id] || false}
              onDismiss={() => closeMenu(dog.id)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => toggleMenu(dog.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  closeMenu(dog.id);
                  handleEditDog(dog);
                }}
                title="Edit"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => {
                  closeMenu(dog.id);
                  handleDeleteDog(dog.id, dog.name);
                }}
                title="Delete"
                leadingIcon="delete"
                titleStyle={styles.deleteMenuItem}
              />
            </Menu>
          </View>

          {/* Description */}
          {dog.description && (
            <View style={styles.descriptionContainer}>
              <Text variant="bodyMedium" style={styles.dogDescription} numberOfLines={2}>
                {dog.description}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => handleEditDog(dog)}
              icon="pencil"
              style={styles.actionButton}
              compact
            >
              Edit
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleDeleteDog(dog.id, dog.name)}
              icon="delete"
              style={[styles.actionButton, styles.deleteButton]}
              textColor={Colors.error[600]}
              compact
            >
              Delete
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading your dogs...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Modern Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
        <Surface style={styles.headerSurface} elevation={2}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineMedium" style={styles.title}>
                My Dogs
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Manage your dog profiles
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AddDog')}
              icon="plus"
              style={styles.addButton}
              compact
            >
              Add Dog
            </Button>
          </View>
        </Surface>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDogs(true)}
            colors={[Colors.primary[500]]}
            tintColor={Colors.primary[500]}
          />
        }
      >
        {error ? (
          <Animated.View entering={FadeIn.duration(600)}>
            <EmptyState
              icon="alert-circle"
              title="Oops! Something went wrong"
              subtitle={error}
              action={{
                label: "Try Again",
                onPress: () => loadDogs()
              }}
            />
          </Animated.View>
        ) : myDogs.length === 0 ? (
          <Animated.View entering={FadeIn.duration(600)}>
            <EmptyState
              icon="dog"
              title="No dogs added yet"
              subtitle="Add your first dog to start connecting with other dog owners!"
              action={{
                label: "Add Your First Dog",
                onPress: () => navigation.navigate('AddDog')
              }}
            />
          </Animated.View>
        ) : (
          <Animated.View style={[styles.dogsContainer, cardsAnimatedStyle]}>
            <View style={styles.dogsHeader}>
              <Text variant="titleMedium" style={styles.dogsCount}>
                {myDogs.length} dog{myDogs.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {myDogs.map((dog, index) => renderDogCard(dog, index))}
          </Animated.View>
        )}
      </ScrollView>

      {/* FAB for quick add */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddDog')}
        label="Add Dog"
      />

      {/* Snackbar for errors */}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {error || 'Something went wrong'}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  
  loadingText: {
    color: Colors.text.secondary,
  },
  
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  
  headerSurface: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  title: {
    color: Colors.text.primary,
    marginBottom: -Spacing.xs,
  },
  
  subtitle: {
    color: Colors.text.secondary,
  },
  
  addButton: {
    borderRadius: BorderRadius.md,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100, // Space for FAB
  },
  
  dogsContainer: {
    flex: 1,
  },
  
  dogsHeader: {
    marginBottom: Spacing.lg,
  },
  
  dogsCount: {
    color: Colors.text.primary,
  },
  
  dogCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  
  cardContent: {
    padding: Spacing.md,
  },
  
  dogHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  
  photoContainer: {
    marginRight: Spacing.md,
  },
  
  dogPhoto: {
    backgroundColor: Colors.neutral[100],
  },
  
  placeholderPhoto: {
    backgroundColor: Colors.primary[100],
  },
  
  dogInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  
  dogName: {
    color: Colors.text.primary,
    flex: 1,
  },
  
  ageChip: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
  },
  
  ageChipText: {
    color: Colors.primary[700],
    fontSize: Typography.fontSize.xs,
  },
  
  dogBreed: {
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  
  detailChip: {
    backgroundColor: Colors.neutral[50],
    borderColor: Colors.neutral[200],
  },
  
  descriptionContainer: {
    marginBottom: Spacing.md,
  },
  
  dogDescription: {
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  
  actionButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  
  deleteButton: {
    borderColor: Colors.error[300],
  },
  
  deleteMenuItem: {
    color: Colors.error[600],
  },
  
  fab: {
    position: 'absolute',
    margin: Spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary[500],
  },
});

export default MyDogsScreen;
