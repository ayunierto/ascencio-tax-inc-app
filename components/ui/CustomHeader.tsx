import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';
import { theme } from './theme';

interface CustomHeaderProps {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  centerContent?: React.ReactNode;
}

/**
 * Header personalizado que resuelve problemas de renderizado en iOS
 * y maneja correctamente los safe areas.
 *
 * @example
 * <CustomHeader
 *   title="Mis Facturas"
 *   left={<HeaderButton onPress={openDrawer}><Icon name="menu" /></HeaderButton>}
 *   right={<HeaderButton onPress={onCreate}><Icon name="add" /></HeaderButton>}
 * />
 */
export function CustomHeader({
  title,
  left,
  right,
  centerContent,
}: CustomHeaderProps) {
  const insets = useSafeAreaInsets();

  // Altura del header según la plataforma
  const HEADER_HEIGHT = Platform.select({
    ios: 44,
    android: 56,
    default: 56,
  });

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
        },
      ]}
    >
      {/* Barra de estado */}
      {/* <StatusBar
        barStyle={
          theme.background === '#000000' ? 'light-content' : 'dark-content'
        }
        backgroundColor={theme.background}
      /> */}

      {/* Contenido del header */}
      <View style={[styles.content, { height: HEADER_HEIGHT }]}>
        {/* Sección izquierda */}
        <View style={styles.leftSection}>{left}</View>

        {/* Sección central */}
        <View style={styles.centerSection}>
          {centerContent ? (
            centerContent
          ) : title ? (
            <ThemedText
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </ThemedText>
          ) : null}
        </View>

        {/* Sección derecha */}
        <View style={styles.rightSection}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'flex-start',
    gap: 12,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'flex-end',
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.foreground,
  },
});
