import { DateTime } from "luxon";
import React from "react";
import { View } from "react-native";

import { ThemedText } from "@/components/ui/ThemedText";
import { theme } from "@/components/ui/theme";
import { Log } from "@/core/logs/interfaces";

interface ActivityItemProps {
  activity: Log;
}
export const ActivityItem = ({ activity }: ActivityItemProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
      }}
    >
      <ThemedText>{activity.description}</ThemedText>

      <ThemedText style={{ color: theme.muted, fontSize: 12 }}>
        {DateTime.fromISO(activity.createdAt).toLocaleString()}
      </ThemedText>
    </View>
  );
};
