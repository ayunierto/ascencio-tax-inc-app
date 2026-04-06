import { api } from '@/core/api/api';
import { MobilePublicConfig } from '../interfaces/mobile-config.interface';

export interface MobileConfigAdapter {
  fetchPublicConfig(): Promise<MobilePublicConfig>;
}

export class ApiMobileConfigAdapter implements MobileConfigAdapter {
  async fetchPublicConfig(): Promise<MobilePublicConfig> {
    const { data } = await api.get<MobilePublicConfig>('/mobile-config');
    return data;
  }
}

export const mobileConfigAdapter: MobileConfigAdapter =
  new ApiMobileConfigAdapter();
