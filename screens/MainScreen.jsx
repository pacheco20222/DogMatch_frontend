import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import AnimatedButton from '../components/AnimatedButton';
import AIAssistantModal from '../components/ui/AIAssistantModal';
import { MapPin, Heart, Sparkles } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { getDesignTokens } from '../styles/designTokens';

const { width: screenWidth } = Dimensions.get('window');

const FeatureCard = ({ icon: Icon, title, description, tokens }) => (
  <View style={[styles.featureCard, { backgroundColor: tokens.cardBackground, borderColor: tokens.border }]}>
    <View style={[styles.featureIcon, { backgroundColor: tokens.overlayLikeBg }]}>
      <Icon size={20} color={tokens.primaryContrast} />
    </View>
    <Text style={[styles.featureTitle, { color: tokens.textPrimary }]}>{title}</Text>
    <Text style={[styles.featureDescription, { color: tokens.textSecondary }]}>{description}</Text>
  </View>
);

const MainScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const tokens = React.useMemo(() => getDesignTokens(isDark), [isDark]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }} edges={['top', 'left', 'right']}>
      <LinearGradient colors={tokens.gradientBackground} style={StyleSheet.absoluteFill} />

      <AIAssistantModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      <View
        style={[
          styles.container,
          {
            paddingHorizontal: tokens.spacingLarge,
            paddingTop: insets.top + tokens.spacingLarge,
            paddingBottom: insets.bottom + 32,
          },
        ]}
      >
        <Animated.View
          entering={FadeIn.duration(800)}
          style={[styles.heroCard, { backgroundColor: tokens.cardBackground, borderColor: tokens.border }]}
        >
          <View style={[styles.heroBadge, { backgroundColor: tokens.actionLikeBg }]}>
            <Text style={[styles.heroBadgeText, { color: tokens.primaryContrast }]}>DOGMATCH</Text>
          </View>

          <Text style={[styles.heroTitle, { color: tokens.textPrimary }]}>
            Connect your dog with their next best friend
          </Text>
          <Text style={[styles.heroSubtitle, { color: tokens.textSecondary }]}>
            Premium matchmaking for modern dog owners. Discover local pups, schedule playdates and
            join curated events in a polished experience.
          </Text>

          <View style={styles.heroActions}>
            <AnimatedButton
              title="Create an account"
              size="large"
              onPress={() => navigation.navigate('Register')}
              style={{ marginBottom: tokens.spacing }}
            />
            <AnimatedButton
              title="Sign in"
              variant="outline"
              size="large"
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(700)} style={styles.featuresWrapper}>
          <FeatureCard
            icon={Heart}
            title="Smart Matching"
            description="Curated profiles powered by your dog's preferences and behaviour."
            tokens={tokens}
          />
          <FeatureCard
            icon={MapPin}
            title="Local Events"
            description="Meetups, group walks and curated experiences hosted by DogMatch."
            tokens={tokens}
          />
          <FeatureCard
            icon={Sparkles}
            title="Safety First"
            description="Verified owners, profile badges and AI support keep playdates safe."
            tokens={tokens}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(400).duration(600)} style={styles.footer}>
          <Text style={[styles.footerTitle, { color: tokens.textPrimary }]}>Trusted by thousands of dog owners</Text>
          <Text style={[styles.footerText, { color: tokens.textSecondary }]}>
            As seen in Dog Weekly, Woof Times and BarkJournal. Join the community today.
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 32,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 12,
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  heroActions: {
    marginTop: 4,
  },
  featuresWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureCard: {
    flex: 1,
    minWidth: (screenWidth - 80) / 2,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MainScreen;
