import { theme } from '@/components/ui';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Tab = {
  key: string;
  label: string;
};

interface CustomTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export const CustomTabs = ({ tabs, activeTab, onChange }: CustomTabsProps) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.activeLabel : styles.inactiveLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeLabel: {
    color: theme.primary,
  },
  inactiveLabel: {
    color: theme.mutedForeground,
  },
});
