import { Ionicons } from '@expo/vector-icons';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from './theme';
import { ThemedText } from './ThemedText';

type SelectContextType = {
  value?: string;
  label?: string;
  setValue: (val: string, label: string) => void;
  open: boolean;
  setOpen: (val: boolean) => void;
  error?: boolean;
  disabled?: boolean;
};

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  value?: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
  errorTextStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  options?: { label: string; value: string }[];
}

export function Select({
  value,
  onValueChange,
  children,
  error,
  errorMessage,
  helperText,
  disabled,
  errorTextStyle,
  containerStyle,
  options,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState<string | undefined>(undefined);

  const collectItemsFromChildren = useCallback(
    (nodes: React.ReactNode): { val: string; lbl: string }[] => {
      const out: { val: string; lbl: string }[] = [];
      React.Children.forEach(nodes, (child) => {
        if (!React.isValidElement(child)) return;
        const props: any = child.props;
        if (
          props &&
          typeof props.value === 'string' &&
          typeof props.label === 'string'
        ) {
          out.push({ val: props.value, lbl: props.label });
        }
        if (props && props.children) {
          out.push(...collectItemsFromChildren(props.children));
        }
      });
      return out;
    },
    []
  );

  useEffect(() => {
    if (!value) {
      setLabel(undefined);
      return;
    }

    // Si se proporcionan options directamente, úsalas
    let items: { val: string; lbl: string }[] = [];
    if (options && options.length > 0) {
      items = options.map((opt) => ({ val: opt.value, lbl: opt.label }));
    } else {
      items = collectItemsFromChildren(children);
    }

    const found = items.find((i) => i.val === value);
    if (found && found.lbl !== label) {
      setLabel(found.lbl);
    } else if (!found) {
      setLabel(undefined);
    }
  }, [value, children, collectItemsFromChildren, label, options]);

  const setValue = useCallback(
    (val: string, lbl: string) => {
      onValueChange(val);
      setLabel(lbl);
      setOpen(false);
    },
    [onValueChange]
  );

  const handleSetOpen = useCallback(
    (val: boolean) => {
      if (!disabled) setOpen(val);
    },
    [disabled]
  );

  const contextValue = useMemo(
    () => ({
      value,
      label,
      setValue,
      open,
      setOpen: handleSetOpen,
      error,
      disabled,
    }),
    [value, label, setValue, open, handleSetOpen, error, disabled]
  );

  const helperTextStyles = useMemo(
    () => [
      styles.helperTextBase,
      error && [styles.errorMessage, errorTextStyle],
    ],
    [error, errorTextStyle]
  );

  return (
    <View style={containerStyle}>
      <SelectContext.Provider value={contextValue}>
        {children}
      </SelectContext.Provider>
      {(helperText || errorMessage) && (
        <Text style={helperTextStyles}>
          {error ? errorMessage : helperText}
        </Text>
      )}
    </View>
  );
}

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('Select components must be used within <Select>');
  return ctx;
}

export function SelectTrigger({
  placeholder = 'Select...',
  labelText,
  style,
  icon,
}: {
  placeholder?: string;
  labelText?: string;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}) {
  const { label, setOpen, error, disabled } = useSelectContext();

  const handlePress = useCallback(() => {
    if (!disabled) setOpen(true);
  }, [disabled, setOpen]);

  const triggerStyles = useMemo(
    () => [
      styles.trigger,
      error && styles.triggerError,
      disabled && styles.triggerDisabled,
      style,
    ],
    [error, disabled, style]
  );

  const floatingLabelStyles = useMemo(
    () => [
      styles.floatingLabel,
      { color: error ? theme.destructive : theme.primary },
    ],
    [error]
  );

  const triggerTextStyles = useMemo(
    () => ({
      color: disabled
        ? theme.mutedForeground
        : error
        ? theme.destructive
        : label
        ? theme.foreground
        : theme.muted,
    }),
    [label, disabled, error]
  );

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={labelText || placeholder}
      accessibilityState={{ disabled, selected: !!label }}
      accessibilityHint="Tap to open options"
      style={triggerStyles}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      {labelText && (
        <ThemedText style={floatingLabelStyles}>{labelText}</ThemedText>
      )}

      {icon && <View style={{ marginRight: 8 }}>{icon}</View>}

      <Text style={triggerTextStyles}>{label || placeholder}</Text>

      <Text style={styles.chevron}>
        <Ionicons
          name="chevron-down-outline"
          color={theme.foreground}
          size={18}
        />
      </Text>
    </TouchableOpacity>
  );
}

export function SelectContent({
  children,
  maxHeight = '80%',
  style,
}: {
  children: React.ReactNode;
  maxHeight?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
}) {
  const { open, setOpen, disabled } = useSelectContext();

  const handleClose = useCallback(() => {
    if (!disabled) setOpen(false);
  }, [disabled, setOpen]);

  const contentStyles = useMemo(
    () => [styles.content, { maxHeight }, style],
    [maxHeight, style]
  );

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={handleClose}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Close options"
      >
        <TouchableOpacity
          style={contentStyles}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* <ScrollView
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingVertical: 4 }}
          > */}
          {children}
          {/* </ScrollView> */}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export function SelectItem({
  label,
  value,
  disabled = false,
  style,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const {
    setValue,
    value: selectedValue,
    disabled: selectDisabled,
  } = useSelectContext();

  const isSelected = selectedValue === value;
  const isDisabled = disabled || selectDisabled;

  const handlePress = useCallback(() => {
    if (!isDisabled) {
      setValue(value, label);
    }
  }, [isDisabled, setValue, value, label]);

  const itemStyles = useMemo(
    () => [
      styles.item,
      isSelected && styles.itemSelected,
      isDisabled && styles.itemDisabled,
      style,
    ],
    [isSelected, isDisabled, style]
  );

  const textStyles = useMemo(
    () => [
      styles.itemText,
      isSelected && styles.itemTextSelected,
      isDisabled && styles.itemTextDisabled,
    ],
    [isSelected, isDisabled]
  );

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, selected: isSelected }}
      style={itemStyles}
      onPress={handlePress}
      activeOpacity={isDisabled ? 1 : 0.7}
      disabled={isDisabled}
    >
      <Text style={textStyles}>{label}</Text>
      {isSelected && (
        <Text style={styles.checkmark}>
          <Ionicons name="checkmark" />
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 54,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    backgroundColor: theme.background,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerError: {
    borderColor: theme.destructive,
    borderWidth: 2,
  },
  triggerDisabled: {
    opacity: 0.5,
    backgroundColor: theme.muted + '10',
  },
  floatingLabel: {
    position: 'absolute',
    top: -8,
    left: 15,
    backgroundColor: theme.background,
    paddingHorizontal: 6,
    fontSize: 13,
    fontWeight: '500',
    borderRadius: theme.radius,
  },
  chevron: {
    marginLeft: 'auto',
    fontSize: 12,
    color: theme.mutedForeground,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  content: {
    backgroundColor: theme.popover,
    borderRadius: theme.radius,
    padding: 8,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginVertical: 2,
  },
  itemSelected: {
    backgroundColor: theme.primary + '20',
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemText: {
    fontSize: 16,
    color: theme.foreground,
    flex: 1,
  },
  itemTextSelected: {
    color: theme.primary,
    fontWeight: '600',
  },
  itemTextDisabled: {
    color: theme.mutedForeground,
  },
  checkmark: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  helperTextBase: {
    marginTop: 6,
    fontSize: 12,
    paddingLeft: 4,
    color: theme.mutedForeground,
  },
  errorMessage: {
    color: theme.destructive,
  },
});
