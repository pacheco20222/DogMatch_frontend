import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  Layout,
} from 'react-native-reanimated';
import { AuthContext } from '../auth/AuthContext';
import { apiFetch } from '../api/client';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const MyDogsScreen = ({ navigation }) => {
  const { user, accessToken } = useContext(AuthContext);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  const fetchMyDogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const data = await apiFetch('/api/dogs/my-dogs', { token: accessToken });
      setDogs(data.dogs || []);
    } catch (e) {
      setError(e.message || 'Failed to load dogs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyDogs();
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardsOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchMyDogs();
    }, [])
  );

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
              await apiFetch(`/api/dogs/${dogId}`, {
                method: 'DELETE',
                token: accessToken
              });
              fetchMyDogs();
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

  const renderDogCard = (dog, index) => (
    <Animated.View
      key={dog.id}
      entering={FadeIn.delay(index * 100).duration(600)}
      layout={Layout.springify()}
    >
      <AnimatedCard
        variant="elevated"
        style={styles.dogCard}
        onPress={() => handleEditDog(dog)}
      >
        <View style={styles.cardContent}>
          {/* Dog Photo */}
          <View style={styles.photoContainer}>
            {dog.primary_photo_url ? (
              <Image
                source={{ 
                  uri: dog.primary_photo_url.startsWith('http') 
                    ? dog.primary_photo_url 
                    : `https://dogmatch-backend.onrender.com${dog.primary_photo_url}`
                }}
                style={styles.dogPhoto}
                onError={() => {
                  console.log('Image failed to load:', dog.primary_photo_url);
                }}
              />
            ) : (
              <View style={styles.placeholderPhoto}>
                <Text style={styles.placeholderEmoji}>🐕</Text>
              </View>
            )}
          </View>

          {/* Dog Info */}
          <View style={styles.dogInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.dogName}>{dog.name}</Text>
              <View style={styles.ageBadge}>
                <Text style={styles.ageText}>{dog.age_string}</Text>
              </View>
            </View>
            
            <Text style={styles.dogBreed}>{dog.breed}</Text>
            <Text style={styles.dogDetails}>
              {dog.size} • {dog.gender}
            </Text>
            
            {dog.description && (
              <Text style={styles.dogDescription} numberOfLines={2}>
                {dog.description}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <AnimatedButton
              title="Edit"
              onPress={() => handleEditDog(dog)}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="Delete"
              onPress={() => handleDeleteDog(dog.id, dog.name)}
              variant="outline"
              size="small"
              style={[styles.actionButton, styles.deleteButton]}
              textStyle={styles.deleteButtonText}
            />
          </View>
        </View>
      </AnimatedCard>
    </Animated.View>
  );

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading your dogs..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Dogs</Text>
          <Text style={styles.subtitle}>Manage your dog profiles</Text>
        </View>
        <AnimatedButton
          title="Add Dog"
          onPress={() => navigation.navigate('AddDog')}
          size="medium"
          style={styles.addButton}
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMyDogs(true)}
            colors={[Colors.primary[500]]}
            tintColor={Colors.primary[500]}
          />
        }
      >
        {error ? (
          <Animated.View entering={FadeIn.duration(600)}>
            <AnimatedCard variant="outlined" style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Text style={styles.errorEmoji}>😔</Text>
                <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                <Text style={styles.errorText}>{error}</Text>
                <AnimatedButton
                  title="Try Again"
                  onPress={() => fetchMyDogs()}
                  variant="outline"
                  size="medium"
                  style={styles.retryButton}
                />
              </View>
            </AnimatedCard>
          </Animated.View>
        ) : dogs.length === 0 ? (
          <Animated.View entering={FadeIn.duration(600)}>
            <AnimatedCard variant="outlined" style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyEmoji}>🐕</Text>
                </View>
                <Text style={styles.emptyTitle}>No dogs added yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add your first dog to start connecting with other dog owners!
                </Text>
                <AnimatedButton
                  title="Add Your First Dog"
                  onPress={() => navigation.navigate('AddDog')}
                  size="large"
                  style={styles.firstDogButton}
                />
              </View>
            </AnimatedCard>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.dogsContainer, cardsAnimatedStyle]}>
            <View style={styles.dogsHeader}>
              <Text style={styles.dogsCount}>
                {dogs.length} dog{dogs.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {dogs.map((dog, index) => renderDogCard(dog, index))}
          </Animated.View>
        )}
      </ScrollView>
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
  },
  
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: -Spacing.xs,
  },
  
  addButton: {
    paddingHorizontal: Spacing.lg,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: Spacing.lg,
  },
  
  dogsContainer: {
    flex: 1,
  },
  
  dogsHeader: {
    marginBottom: Spacing.lg,
  },
  
  dogsCount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  
  dogCard: {
    marginBottom: Spacing.lg,
  },
  
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  photoContainer: {
    marginRight: Spacing.lg,
  },
  
  dogPhoto: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
  },
  
  placeholderPhoto: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  placeholderEmoji: {
    fontSize: Typography.fontSize['2xl'],
  },
  
  dogInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  dogName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginRight: Spacing.sm,
  },
  
  ageBadge: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  
  ageText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  
  dogBreed: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  
  dogDetails: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  
  dogDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  
  actionsContainer: {
    alignItems: 'center',
  },
  
  actionButton: {
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minWidth: 70,
  },
  
  deleteButton: {
    borderColor: Colors.error[300],
  },
  
  deleteButtonText: {
    color: Colors.error[600],
  },
  
  errorCard: {
    marginVertical: Spacing.lg,
  },
  
  errorContent: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  errorEmoji: {
    fontSize: Typography.fontSize['4xl'],
    marginBottom: Spacing.lg,
  },
  
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
  
  emptyCard: {
    marginVertical: Spacing.lg,
  },
  
  emptyContent: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  
  emptyEmoji: {
    fontSize: 64,
  },
  
  emptyTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  
  firstDogButton: {
    paddingHorizontal: Spacing.xl,
  },
});

export default MyDogsScreen;
