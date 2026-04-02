import { Ionicons } from '@expo/vector-icons';
import RNDateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import {
  Modal,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Button, ButtonText } from '../Button';
import { theme } from '../theme';
import { ThemedText } from '../ThemedText';

/**
 * DateTimePicker UI Components
 *
 * Este archivo expone dos APIs:
 * - `DateTimeInput`: componente controlado (sin dependencia de React Hook Form).
 * - `DateTimeField`: wrapper para React Hook Form usando `Controller`.
 *
 * Objetivos del componente:
 * - Unificar UX de fecha/hora en iOS y Android.
 * - Simplificar validación visual (error/helper/disabled/clear).
 * - Evitar bugs de desfase de día por zona horaria en campos de solo fecha.
 */

/**
 * Convierte una fecha local a ISO en UTC al mediodía.
 *
 * Motivo:
 * - Si se guarda una fecha como `YYYY-MM-DDT00:00:00.000Z`, usuarios en zonas
 *   horarias negativas pueden verla como el día anterior al renderizar en local.
 * - Usar mediodía UTC evita ese corrimiento para casos "date-only".
 *
 * @param date Fecha seleccionada por el usuario.
 * @returns ISO string en UTC al mediodía del mismo día calendario.
 */
const toUtcNoonIso = (date: Date): string => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0),
  ).toISOString();
};

interface DateTimePickerProps {
  /**
   * Modo del selector.
   * - `date`: solo fecha calendario (sin hora).
   * - `time`: solo hora.
   * - `datetime`: fecha y hora.
   */
  mode?: 'date' | 'time' | 'datetime';
  /** Formato 24h para `time`/`datetime`. */
  is24Hour?: boolean;
  /**
   * Callback al cambiar el valor.
   * Devuelve ISO string o `null` al limpiar/cancelar.
   */
  onChange?: (date: string | null) => void;
  /**
   * Valor controlado del campo.
   * Puede ser `string` ISO, `Date` o `null`.
   */
  value?: string | null | Date;
  placeholder?: string;
  labelText?: string;
  helperText?: string;
  errorMessage?: string;
  error?: boolean;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  clearable?: boolean;
  displayFormat?: string;
  containerStyle?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
}

/**
 * DateTimeInput
 *
 * Componente controlado para seleccionar fecha/hora en iOS y Android.
 *
 * Reglas de uso recomendadas:
 * - Usa `mode="date"` para campos de negocio tipo "fecha de emisión".
 * - Usa `mode="datetime"` cuando la hora exacta sea relevante.
 * - Usa siempre `onChange` + `value` para mantener estado controlado.
 *
 * Comportamiento por plataforma:
 * - Android: abre picker nativo y cierra automáticamente al confirmar/cancelar.
 * - iOS: usa modal con picker inline y botones de confirmación.
 *
 * Comportamiento de zona horaria en `mode="date"`:
 * - Guarda la fecha como ISO en UTC al mediodía para evitar desfase de día.
 * - Muestra la fecha en UTC para mantener el día calendario estable.
 *
 * Ejemplo controlado (sin RHF):
 * ```tsx
 * const [date, setDate] = useState<string | null>(null);
 *
 * <DateTimeInput
 *   mode="date"
 *   labelText="Fecha"
 *   value={date}
 *   onChange={setDate}
 * />
 * ```
 */
const DateTimeInput = ({
  mode = 'date',
  is24Hour = false,
  value,
  onChange,
  placeholder,
  labelText,
  helperText,
  errorMessage,
  error,
  disabled = false,
  minimumDate,
  maximumDate,
  clearable = false,
  displayFormat,
  containerStyle,
  triggerStyle,
  errorTextStyle,
}: DateTimePickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Optimización: Memoizar la fecha parseada
  const parsedDate = useMemo(() => {
    if (!value) return null;
    try {
      return new Date(value);
    } catch {
      return null;
    }
  }, [value]);

  // Optimización: Memoizar el texto mostrado
  const displayText = useMemo(() => {
    if (!parsedDate) return placeholder || getDefaultPlaceholder(mode);

    if (displayFormat) {
      return formatDate(parsedDate, displayFormat);
    }

    switch (mode) {
      case 'time':
        return parsedDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: !is24Hour,
        });
      case 'datetime':
        return `${parsedDate.toLocaleDateString()} ${parsedDate.toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !is24Hour,
          },
        )}`;
      default:
        // Date-only fields should not shift by timezone.
        return parsedDate.toLocaleDateString([], { timeZone: 'UTC' });
    }
  }, [parsedDate, placeholder, mode, displayFormat, is24Hour]);

  // Optimización: Memoizar handler de cambio
  const handleOnChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'ios') {
        // En iOS no cerramos automáticamente
        if (selectedDate && onChange) {
          onChange(
            mode === 'date'
              ? toUtcNoonIso(selectedDate)
              : selectedDate.toISOString(),
          );
        }
      } else {
        // En Android cerramos automáticamente
        setModalVisible(false);
        if (event.type === 'set' && selectedDate && onChange) {
          onChange(
            mode === 'date'
              ? toUtcNoonIso(selectedDate)
              : selectedDate.toISOString(),
          );
        } else if (event.type === 'dismissed' && onChange) {
          onChange(null);
        }
      }
    },
    [mode, onChange],
  );

  // Optimización: Memoizar handler de apertura
  const showDatePicker = useCallback(() => {
    if (disabled) return;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: parsedDate || new Date(),
        onChange: handleOnChange,
        mode: mode === 'datetime' ? 'date' : mode,
        is24Hour,
        minimumDate,
        maximumDate,
      });
    } else {
      setModalVisible(true);
    }
  }, [
    disabled,
    parsedDate,
    handleOnChange,
    mode,
    is24Hour,
    minimumDate,
    maximumDate,
  ]);

  // Optimización: Memoizar handler de limpieza
  const handleClear = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (onChange && !disabled) {
        onChange(null);
      }
    },
    [onChange, disabled],
  );

  // Optimización: Memoizar handler de cierre de modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Optimización: Memoizar estilos del trigger
  const triggerStyles = useMemo(
    () => [
      styles.trigger,
      error && styles.triggerError,
      disabled && styles.triggerDisabled,
      triggerStyle,
    ],
    [error, disabled, triggerStyle],
  );

  // Optimización: Memoizar estilos del texto
  const textStyles = useMemo(
    () => [
      styles.triggerText,
      !parsedDate && styles.placeholderText,
      disabled && styles.disabledText,
      error && styles.errorText,
    ],
    [parsedDate, disabled, error],
  );

  // Optimización: Memoizar estilos del label flotante
  const labelStyles = useMemo(
    () => [
      styles.floatingLabel,
      { color: error ? theme.destructive : theme.primary },
    ],
    [error],
  );

  // Optimización: Memoizar estilos del helper text
  const helperTextStyles = useMemo(
    () => [styles.helperText, error && [styles.errorText, errorTextStyle]],
    [error, errorTextStyle],
  );

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        accessibilityRole='button'
        accessibilityLabel={labelText || `Select ${mode}`}
        accessibilityState={{ disabled, selected: !!parsedDate }}
        accessibilityHint={`Opens ${mode} picker`}
        style={triggerStyles}
        onPress={showDatePicker}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        {labelText && <ThemedText style={labelStyles}>{labelText}</ThemedText>}

        <Text style={textStyles}>{displayText}</Text>

        {clearable && parsedDate && (
          <TouchableOpacity
            accessibilityRole='button'
            accessibilityLabel='Clear date'
            onPress={handleClear}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>
              <Ionicons name='close-outline' color={theme.primary} size={24} />
            </Text>
          </TouchableOpacity>
        )}

        {/* Ícono de calendario */}
        <Text style={styles.calendarIcon}>
          {mode === 'time' ? (
            <Ionicons
              name='time-outline'
              color={error ? theme.destructive : theme.foreground}
              size={24}
            />
          ) : (
            <Ionicons
              name='calendar-outline'
              color={error ? theme.destructive : theme.foreground}
              size={24}
            />
          )}
        </Text>
      </TouchableOpacity>

      {/* Helper text o mensaje de error */}
      {(helperText || errorMessage) && (
        <Text style={helperTextStyles}>
          {error ? errorMessage : helperText}
        </Text>
      )}

      {/* Modal para iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          animationType='slide'
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
          accessibilityViewIsModal
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                Select {mode === 'datetime' ? 'Date & Time' : mode}
              </Text>

              <RNDateTimePicker
                testID='dateTimePicker'
                value={parsedDate || new Date()}
                mode={mode === 'datetime' ? 'date' : mode}
                is24Hour={is24Hour}
                display='spinner'
                onChange={handleOnChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
              />

              <View style={styles.modalButtons}>
                <Button variant='outline' onPress={handleCloseModal}>
                  <ButtonText>Cancel</ButtonText>
                </Button>
                <Button
                  variant='default'
                  onPress={() => {
                    handleCloseModal();
                  }}
                >
                  <ButtonText>Done</ButtonText>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

/**
 * Placeholder por defecto según modo.
 */
const getDefaultPlaceholder = (mode: 'date' | 'time' | 'datetime') => {
  switch (mode) {
    case 'time':
      return 'Select time';
    case 'datetime':
      return 'Select date & time';
    default:
      return 'Select date';
  }
};

/**
 * Formateador simple para display custom.
 *
 * Tokens soportados:
 * - `DD`, `MM`, `YYYY`, `HH`, `mm`
 *
 * Nota:
 * - Este helper es intencionalmente básico.
 * - Si se necesita i18n/formato avanzado, migrar a una librería dedicada.
 */
const formatDate = (date: Date, format: string): string => {
  // Implementación básica de formateo personalizado
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year.toString())
    .replace('HH', hours)
    .replace('mm', minutes);
};

const styles = StyleSheet.create({
  // Trigger styles
  trigger: {
    minHeight: 52,
    paddingHorizontal: 12,
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
    backgroundColor: theme.muted + '20',
  },
  triggerText: {
    fontSize: 14,
    color: theme.foreground,
    flex: 1,
  },
  placeholderText: {
    color: theme.muted,
  },
  disabledText: {
    color: theme.mutedForeground,
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: theme.background,
    borderRadius: theme.radius,
    paddingHorizontal: 4,
    paddingVertical: 0,
    fontSize: 12,
    fontWeight: '500',
  },
  clearBtn: {
    position: 'absolute',
    right: 40,
    height: 28,
    width: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card,
  },
  clearBtnText: {
    color: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    lineHeight: 18,
    marginTop: 6,
  },
  calendarIcon: {
    fontSize: 18,
    marginLeft: 8,
  },

  // Helper text styles
  helperText: {
    marginTop: 4,
    fontSize: 12,
    paddingLeft: 4,
    color: theme.mutedForeground,
  },
  errorText: {
    color: theme.destructive,
  },

  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: theme.radius,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#111',
    textTransform: 'capitalize',
  },
  picker: {
    width: '100%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
});

// React Hook Form field wrapper

/**
 * Props del wrapper `DateTimeField` para React Hook Form.
 *
 * `DateTimeField` conecta `DateTimeInput` con RHF usando `Controller`.
 */
export type DateTimeFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<DateTimePickerProps, 'value' | 'onChange'> & {
  name: TName;
  control: ControllerProps<TFieldValues, TName>['control'];
  rules?: ControllerProps<TFieldValues, TName>['rules'];
  defaultValue?: string | null;
};

/**
 * DateTimeField (React Hook Form)
 *
 * Este wrapper evita wiring manual entre `Controller` y `DateTimeInput`.
 *
 * Ejemplo:
 * ```tsx
 * <DateTimeField
 *   control={control}
 *   name="date"
 *   mode="date"
 *   labelText="Fecha"
 * />
 * ```
 */
export function DateTimeField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  defaultValue = null,
  ...dateTimeProps
}: DateTimeFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue as any}
      render={({ field: { value, onChange }, fieldState }) => (
        <DateTimeInput
          {...dateTimeProps}
          value={value ?? null}
          onChange={onChange}
          errorMessage={fieldState.error?.message}
          error={!!fieldState.error}
        />
      )}
    />
  );
}

export default DateTimeInput;
export { DateTimeInput };
