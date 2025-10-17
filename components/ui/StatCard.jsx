import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

const StatCard = React.memo(({ 
  title, 
  value, 
  icon, 
  color = 'primary',
  onPress,
  style 
}) => {
  const theme = useTheme();
  
  const getColor = () => {
    switch (color) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Card 
      mode="elevated" 
      style={[styles.card, style]}
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <Avatar.Icon 
            icon={icon} 
            size={48} 
            style={[styles.avatar, { backgroundColor: getColor() }]}
          />
        </View>
        <Text variant="displaySmall" style={[styles.value, { color: getColor() }]}>
          {value}
        </Text>
        <Text variant="labelMedium" style={styles.title}>
          {title}
        </Text>
      </Card.Content>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    minHeight: 120,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: '#0EA5E9',
  },
  value: {
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    textAlign: 'center',
    color: '#525252',
  },
});

export default StatCard;
