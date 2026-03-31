import React, { createContext, useContext, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from './theme';
import { Button, ButtonText } from './Button';

type AlertDialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialog components must be used within AlertDialog');
  }
  return context;
}

// Root
type AlertDialogProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AlertDialog({
  children,
  open,
  onOpenChange,
}: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <AlertDialogContext.Provider
      value={{ open: isOpen, setOpen: handleOpenChange }}
    >
      {children}
    </AlertDialogContext.Provider>
  );
}

// Trigger
type AlertDialogTriggerProps = {
  children: React.ReactNode;
  asChild?: boolean;
};

export function AlertDialogTrigger({
  children,
  asChild,
}: AlertDialogTriggerProps) {
  const { setOpen } = useAlertDialog();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPress: () => setOpen(true),
    } as any);
  }

  return <Pressable onPress={() => setOpen(true)}>{children}</Pressable>;
}

// Portal (Modal wrapper)
type AlertDialogPortalProps = {
  children: React.ReactNode;
};

export function AlertDialogPortal({ children }: AlertDialogPortalProps) {
  return <>{children}</>;
}

// Overlay
type AlertDialogOverlayProps = {
  style?: ViewStyle;
};

export function AlertDialogOverlay({ style }: AlertDialogOverlayProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }, style]} />
  );
}

// Content
type AlertDialogContentProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function AlertDialogContent({
  children,
  style,
}: AlertDialogContentProps) {
  const { open, setOpen } = useAlertDialog();
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, scaleAnim, fadeAnim]);

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable style={styles.modalContainer} onPress={() => setOpen(false)}>
        <AlertDialogOverlay />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
              style,
            ]}
          >
            {children}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Header
type AlertDialogHeaderProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function AlertDialogHeader({ children, style }: AlertDialogHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

// Footer
type AlertDialogFooterProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function AlertDialogFooter({ children, style }: AlertDialogFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

// Title
type AlertDialogTitleProps = {
  children: React.ReactNode;
  style?: TextStyle;
};

export function AlertDialogTitle({ children, style }: AlertDialogTitleProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

// Description
type AlertDialogDescriptionProps = {
  children: React.ReactNode;
  style?: TextStyle;
};

export function AlertDialogDescription({
  children,
  style,
}: AlertDialogDescriptionProps) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

// Action
type AlertDialogActionProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function AlertDialogAction({
  children,
  onPress,
  style,
  textStyle,
}: AlertDialogActionProps) {
  const { setOpen } = useAlertDialog();

  const handlePress = () => {
    onPress?.();
    setOpen(false);
  };

  return (
    <Button style={[style]} variant="destructive" onPress={handlePress}>
      <Text style={[styles.actionButtonText, textStyle]}>{children}</Text>
    </Button>
  );
}

// Cancel
type AlertDialogCancelProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function AlertDialogCancel({
  children,
  onPress,
  style,
  textStyle,
}: AlertDialogCancelProps) {
  const { setOpen } = useAlertDialog();

  const handlePress = () => {
    onPress?.();
    setOpen(false);
  };

  return (
    <Button style={[style]} onPress={handlePress} variant="outline">
      <ButtonText style={[textStyle]}>{children}</ButtonText>
    </Button>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    minWidth: 320,
    maxWidth: 512,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.foreground,
  },
  description: {
    fontSize: 14,
    color: theme.muted,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButtonPressed: {
    backgroundColor: '#f9fafb',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
});
