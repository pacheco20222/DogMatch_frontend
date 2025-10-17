import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Avatar, Menu, IconButton } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

const DogCard = ({ 
  dog, 
  onPress, 
  onEdit, 
  onDelete, 
  showActions = false,
  style 
}) => {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const getSizeColor = (size) => {
    switch (size) {
      case 'small':
        return theme.colors.primary;
      case 'medium':
        return theme.colors.secondary;
      case 'large':
        return theme.colors.tertiary;
      case 'extra_large':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getEnergyColor = (energy) => {
    switch (energy) {
      case 'low':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'high':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  return (
    <Card 
      mode="elevated" 
      style={[styles.card, style]}
      onPress={onPress}
    >
      <Card.Cover 
        source={{ uri: dog.photo_url || 'https://via.placeholder.com/300x200?text=No+Photo' }}
        style={styles.cover}
      />
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleLarge" style={styles.name}>
              {dog.name}
            </Text>
            <Text variant="bodyMedium" style={styles.breed}>
              {dog.breed}
            </Text>
          </View>
          {showActions && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={() => {
                setMenuVisible(false);
                onEdit?.(dog);
              }} title="Edit" />
              <Menu.Item onPress={() => {
                setMenuVisible(false);
                onDelete?.(dog);
              }} title="Delete" />
            </Menu>
          )}
        </View>

        <View style={styles.chipsContainer}>
          <Chip 
            mode="outlined" 
            compact
            style={[styles.chip, { borderColor: getSizeColor(dog.size) }]}
            textStyle={{ color: getSizeColor(dog.size) }}
          >
            {dog.size?.replace('_', ' ').toUpperCase()}
          </Chip>
          <Chip 
            mode="outlined" 
            compact
            style={[styles.chip, { borderColor: getEnergyColor(dog.energy_level) }]}
            textStyle={{ color: getEnergyColor(dog.energy_level) }}
          >
            {dog.energy_level?.toUpperCase()}
          </Chip>
          <Chip 
            mode="outlined" 
            compact
            style={styles.chip}
          >
            {dog.age} years
          </Chip>
        </View>

        <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
          {dog.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: dog.availability_status === 'available' ? theme.colors.success : theme.colors.error }
            ]} />
            <Text variant="labelSmall" style={styles.status}>
              {dog.availability_status?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text variant="labelSmall" style={styles.location}>
            📍 {dog.location}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    minHeight: 280,
  },
  cover: {
    height: 160,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: 2,
  },
  breed: {
    color: '#666',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  chip: {
    marginRight: 6,
    marginBottom: 4,
  },
  description: {
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    fontWeight: '500',
  },
  location: {
    color: '#666',
  },
});

export default DogCard;
