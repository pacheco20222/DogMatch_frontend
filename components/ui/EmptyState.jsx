import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

const EmptyState = React.memo(({ 
  icon = 'inbox',
  title = 'No items found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction,
  style 
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Avatar.Icon 
        icon={icon} 
        size={80} 
        style={[styles.icon, { backgroundColor: theme.colors.surfaceVariant }]}
      />
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button 
          mode="contained" 
          onPress={onAction}
          style={styles.button}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#525252',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
});

export default EmptyState;
