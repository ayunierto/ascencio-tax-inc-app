import React from "react";

import { Ionicons } from "@expo/vector-icons";

import Loader from "@/components/Loader";
import { Card } from "@/components/ui/Card/Card";
import { CardContent } from "@/components/ui/Card/CardContent";
import { SimpleCardHeader } from "@/components/ui/Card/SimpleCardHeader";
import { SimpleCardHeaderTitle } from "@/components/ui/Card/SimpleCardHeaderTitle";
import { theme } from "@/components/ui/theme";
import { Log } from "@/core/logs/interfaces";
import { ActivityList } from "./ActivityList";

interface RecentActivityProps {
  activities: Log[];
  loading: boolean;
}

export const RecentActivity = ({
  activities,
  loading,
}: RecentActivityProps) => {
  return (
    <Card style={{ flex: 1 }}>
      <CardContent style={{ flex: 1 }}>
        <SimpleCardHeader>
          <Ionicons name={"flash-outline"} size={20} color={theme.foreground} />
          <SimpleCardHeaderTitle>Recent Activity</SimpleCardHeaderTitle>
        </SimpleCardHeader>
        {loading ? <Loader /> : <ActivityList activities={activities} />}
      </CardContent>
    </Card>
  );
};
