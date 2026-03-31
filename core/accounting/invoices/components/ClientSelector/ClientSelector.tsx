import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Client } from '@ascencio/shared/interfaces';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button, ButtonIcon, ButtonText, Input, theme } from '@/components/ui';
import { Select, SelectContent, SelectTrigger } from '@/components/ui/Select';
import NoResultsFound from '@/core/components/NoResultsFound';
import ErrorMessage from '@/core/components/ErrorMessage';

interface ClientSelectorProps {
  clients: Client[];
  selectedClientId?: string;
  onClientSelect: (clientId: string | undefined) => void;
  onManualMode: (enabled: boolean) => void;
  isManualMode: boolean;
  hasClientError?: boolean;
  hasManualFieldsError?: boolean;
  clientErrorMessage?: string;
  manualFieldsErrorMessage?: string;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  clients,
  selectedClientId,
  onClientSelect,
  onManualMode,
  isManualMode,
  hasClientError = false,
  hasManualFieldsError = false,
  clientErrorMessage,
  manualFieldsErrorMessage,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Mostrar errores según el contexto
  // En modo manual: mostrar errores de campos manuales
  // En modo búsqueda: mostrar errores de cliente seleccionado O de campos manuales si existen
  const shouldShowError = isManualMode
    ? hasManualFieldsError
    : hasClientError || hasManualFieldsError;
  const displayErrorMessage = isManualMode
    ? manualFieldsErrorMessage
    : clientErrorMessage || manualFieldsErrorMessage;

  const filteredClients = clients.filter(
    (client) =>
      client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery),
  );

  const handleSelectClient = (client: Client) => {
    onClientSelect(client.id);
    onManualMode(false);
    setSearchQuery('');
  };

  const handleManualEntry = () => {
    onClientSelect(undefined);
    onManualMode(true);
  };

  return (
    <View style={{ gap: 12 }}>
      {/* Header with toggle */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
          {t('billTo')}
        </ThemedText>

        <Button size="sm" onPress={() => onManualMode(!isManualMode)}>
          <ButtonIcon
            name={isManualMode ? 'search-outline' : 'create-outline'}
          />

          <ButtonText variant="destructive" size="sm">
            {isManualMode ? t('searchClient') : t('manualEntry')}
          </ButtonText>
        </Button>
      </View>

      {/* Search/Select Client */}
      {!isManualMode && (
        <View>
          {selectedClient ? (
            <View
              style={{
                padding: 12,
                backgroundColor: theme.background,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.primary,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1 }}>
                <ThemedText>{selectedClient.fullName}</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.muted }}>
                  {selectedClient.email}
                </ThemedText>
                {selectedClient.phone && (
                  <ThemedText style={{ fontSize: 12, color: theme.muted }}>
                    {selectedClient.phone}
                  </ThemedText>
                )}
              </View>

              <Button
                size="icon"
                variant="destructive"
                onPress={() => {
                  onClientSelect(undefined);
                }}
              >
                <ButtonIcon name="close-circle-outline" />
              </Button>
            </View>
          ) : (
            <View>
              <Select
                // value={value}
                // onValueChange={onChange}
                // options={countryCodes}
                onValueChange={() => {}}
              >
                <SelectTrigger
                  placeholder={t('searchOrSelectClient')}
                  icon={
                    <Ionicons name="search" size={20} color={theme.muted} />
                  }
                />
                <SelectContent
                  style={{
                    width: '100%',
                    gap: theme.gap,
                    flexDirection: 'column',
                  }}
                >
                  {/* Search Input */}

                  <Input
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('searchByNameEmailPhone')}
                    autoFocus
                    leadingIcon="search"
                    clearable
                  />

                  {/* Me quede refactorizando el ClientSelector */}

                  {/* Manual Entry Option */}
                  <Button onPress={handleManualEntry}>
                    <ButtonIcon name="add-circle-outline" />
                    <ButtonText>{t('enterClientManually')}</ButtonText>
                  </Button>

                  <FlatList
                    data={filteredClients}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleSelectClient(item)}
                        style={{ margin: theme.gap }}
                      >
                        <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                          {item.fullName}
                        </ThemedText>

                        <View style={{ flexDirection: 'row', gap: theme.gap }}>
                          <ThemedText
                            style={{ fontSize: 12, color: theme.muted }}
                          >
                            {item.email}
                          </ThemedText>

                          {item.phone && (
                            <>
                              <ThemedText
                                style={{ fontSize: 12, color: theme.muted }}
                              >
                                /
                              </ThemedText>
                              <ThemedText
                                style={{ fontSize: 12, color: theme.muted }}
                              >
                                {item.phone}
                              </ThemedText>
                            </>
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={<NoResultsFound />}
                  />
                </SelectContent>
              </Select>
            </View>
          )}
        </View>
      )}

      {/* Error Message - Always visible when there's an error */}
      {shouldShowError && displayErrorMessage && (
        <View style={{ marginTop: 8 }}>
          <ErrorMessage message={displayErrorMessage} />
        </View>
      )}
    </View>
  );
};
