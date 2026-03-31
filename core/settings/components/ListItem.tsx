import React from 'react';

import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const ListItem = ({
  icon,
  label,
  external = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  external?: boolean;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={theme.foreground} />
        <ThemedText style={styles.itemLabel}>{label}</ThemedText>
      </View>
      {external ? (
        <Feather name="external-link" size={18} color={theme.mutedForeground} />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.mutedForeground}
        />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: theme.foreground,
  },
});

export default ListItem;
