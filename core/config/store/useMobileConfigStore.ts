import { create } from 'zustand';
import { mobileConfigAdapter } from '../adapters/mobile-config.adapter';
import { MobilePublicConfig } from '../interfaces/mobile-config.interface';

const DEFAULT_MOBILE_CONFIG_CACHE_TTL_MS = 5 * 60 * 1000;

interface MobileConfigState {
  config: MobilePublicConfig | null;
  isLoaded: boolean;
  isLoading: boolean;
  expiresAt: number | null;
  loadConfig: (force?: boolean) => Promise<MobilePublicConfig | null>;
}

let inFlightRequest: Promise<MobilePublicConfig | null> | null = null;

export const useMobileConfigStore = create<MobileConfigState>((set, get) => ({
  config: null,
  isLoaded: false,
  isLoading: false,
  expiresAt: null,
  loadConfig: async (force = false): Promise<MobilePublicConfig | null> => {
    const currentState = get();
    const now = Date.now();

    const isCacheValid =
      !force &&
      !!currentState.config &&
      !!currentState.expiresAt &&
      currentState.expiresAt > now;

    if (isCacheValid) {
      return currentState.config;
    }

    if (inFlightRequest) {
      return inFlightRequest;
    }

    set({ isLoading: true });

    inFlightRequest = mobileConfigAdapter
      .fetchPublicConfig()
      .then((config) => {
        set({
          config,
          isLoaded: true,
          isLoading: false,
          expiresAt: Date.now() + DEFAULT_MOBILE_CONFIG_CACHE_TTL_MS,
        });
        return config;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Failed to load mobile runtime config: ${message}`);

        set({
          isLoaded: true,
          isLoading: false,
        });

        return get().config;
      })
      .finally(() => {
        inFlightRequest = null;
      });

    return inFlightRequest;
  },
}));

export const getMobileConfigSnapshot = (): MobilePublicConfig | null =>
  useMobileConfigStore.getState().config;

const toOptionalString = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
};

export const getCloudinaryCloudName = (): string | undefined =>
  toOptionalString(getMobileConfigSnapshot()?.cloudinaryCloudName);

export const getGoogleWebClientId = (): string | undefined =>
  toOptionalString(getMobileConfigSnapshot()?.googleWebClientId);
