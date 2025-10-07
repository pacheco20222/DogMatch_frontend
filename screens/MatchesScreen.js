import React, { useContext, useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/AuthContext';
import { apiFetch } from '../api/client';
import GlobalStyles from '../styles/GlobalStyles';

export default function MatchesScreen({ navigation }) {
  const { user, token } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's matches
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/matches?status=matched', { token });
      setMatches(response.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      Alert.alert('Error', 'Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const renderMatch = ({ item }) => {
    const otherDog = item.other_dog;
    const otherOwner = otherDog.owner;

    return (
      <TouchableOpacity 
        style={styles.matchCard}
        onPress={() => {
          // TODO: Navigate to chat screen
          Alert.alert('Coming Soon', 'Chat functionality will be implemented next!');
        }}
      >
        <View style={styles.matchContent}>
          <Image
            source={{ 
              uri: otherDog.photos && otherDog.photos.length > 0 
                ? otherDog.photos[0].url 
                : 'https://via.placeholder.com/80x80/4F8EF7/FFFFFF?text=No+Photo'
            }}
            style={styles.matchImage}
          />
          
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>{otherDog.name}</Text>
            <Text style={styles.ownerName}>{otherOwner.first_name} {otherOwner.last_name}</Text>
            <Text style={styles.matchDate}>
              Matched {new Date(item.matched_at).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>💕</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F8EF7" />
          <Text style={styles.loadingText}>Loading your matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Matches</Text>
        <Text style={styles.subtitle}>
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No matches yet!</Text>
          <Text style={styles.emptySubtitle}>
            Start swiping in the Discover tab to find your dog's perfect playmate.
          </Text>
          <TouchableOpacity 
            style={styles.discoverButton}
            onPress={() => navigation.navigate('Discover')}
          >
            <Text style={styles.discoverButtonText}>Start Discovering</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.matchesList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  discoverButton: {
    backgroundColor: '#4F8EF7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  discoverButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  matchesList: {
    padding: 20,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  matchImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  matchDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  matchBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBadgeText: {
    fontSize: 20,
  },
});
