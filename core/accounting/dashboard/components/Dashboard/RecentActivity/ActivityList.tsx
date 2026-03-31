import { ThemedText } from "@/components/ui/ThemedText";
import { theme } from "@/components/ui/theme";
import { Log } from "@/core/logs/interfaces";
import React from "react";
import { FlatList } from "react-native";
import { ActivityItem } from "./ActivityItem";

interface RecentActivityProps {
  activities: Log[];
}

export const ActivityList = ({ activities }: RecentActivityProps) => {
  return (
    <FlatList
      style={{ paddingHorizontal: 20 }}
      data={activities}
      numColumns={1}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ActivityItem activity={item} />}
      onEndReachedThreshold={0.8}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <ThemedText style={{ color: theme.muted }}>
          There is no recent activity
        </ThemedText>
      }
    />
  );
};
