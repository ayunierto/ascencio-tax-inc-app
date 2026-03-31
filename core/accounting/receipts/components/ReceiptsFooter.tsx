import React from 'react';
import { Text, View } from 'react-native';

import { Divider } from '@/components/ui/Divider';
import { theme } from '@/components/ui/theme';
import { Ionicons } from '@expo/vector-icons';

interface ReceiptsFooterProps {
  data: any[];
}
const ReceiptsFooter = ({ data }: ReceiptsFooterProps) => {
  const total = data.reduce((acc, item) => acc + item.total, 0);

  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >
        <Ionicons name="remove-circle-outline" color={theme.mutedForeground} />
        <Text style={{ color: theme.mutedForeground }}>{total}</Text>
      </View>
      <Divider style={{ width: '60%', marginHorizontal: 'auto' }} />
      <Text style={{ color: theme.mutedForeground, textAlign: 'center' }}>
        {data.length} Receipt(s)
      </Text>
    </View>
  );
};

export default ReceiptsFooter;
