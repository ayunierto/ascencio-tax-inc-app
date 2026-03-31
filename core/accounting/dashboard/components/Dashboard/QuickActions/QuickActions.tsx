import React from "react";

import { Button, ButtonText } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card/Card";
import { CardContent } from "@/components/ui/Card/CardContent";
import { SimpleCardHeader } from "@/components/ui/Card/SimpleCardHeader";
import { SimpleCardHeaderTitle } from "@/components/ui/Card/SimpleCardHeaderTitle";
import { theme } from "@/components/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

interface QuickActionsProps {
  actions: {
    label: string;
    onPress: () => void;
  }[];
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  return (
    <Card>
      <CardContent>
        <SimpleCardHeader>
          <Ionicons name={"flash-outline"} size={24} color={theme.foreground} />
          <SimpleCardHeaderTitle>Quick Actions</SimpleCardHeaderTitle>
        </SimpleCardHeader>
        <View>
          {actions.map((action, index) => (
            <Button key={index} onPress={action.onPress}>
              <ButtonText>{action.label}</ButtonText>
            </Button>
          ))}
        </View>
      </CardContent>
    </Card>
  );
};
