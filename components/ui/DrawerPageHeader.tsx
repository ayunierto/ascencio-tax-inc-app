import React from 'react';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { CustomHeader, HeaderButton } from '@/components/ui';

interface DrawerPageHeaderProps {
  title: string;
}

export function DrawerPageHeader({ title }: DrawerPageHeaderProps) {
  const navigation = useNavigation();

  return (
    <CustomHeader
      title={title}
      left={
        <HeaderButton onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name='menu' size={24} color='#ffffff' />
        </HeaderButton>
      }
    />
  );
}
