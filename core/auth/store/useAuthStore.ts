import { create } from 'zustand';

import { StorageAdapter } from '@/core/adapters/storage.adapter';
import {
  checkAuthStatusAction,
  deleteAccountAction,
  forgotPasswordAction,
  resetPasswordAction,
  signInAction,
  signInWithGoogleAction,
  signUpAction,
  verifyCodeAction,
} from '../actions';
import {
  DeleteAccountRequest,
  DeleteAccountResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  User,
  VerifyEmailCodeRequest,
  VerifyEmailCodeResponse,
} from '@ascencio/shared';

type AuthStatus =
  | 'authenticated'
  | 'unauthenticated'
  | 'loading'
  | 'network-error';

export interface AuthState {
  // Properties
  authStatus: AuthStatus;
  access_token: string | null;
  user: User | null;
  tempEmail?: string; // For storing email during password reset

  // Getters
  isAdmin: () => boolean;

  // Methods
  signUp: (data: SignUpRequest) => Promise<SignUpResponse>;
  verifyCode: (
    data: VerifyEmailCodeRequest,
  ) => Promise<VerifyEmailCodeResponse>;
  signIn: (credentials: SignInRequest) => Promise<SignInResponse>;
  signInWithGoogle: (idToken: string) => Promise<SignInResponse>;
  checkAuthStatus: () => Promise<boolean>;
  deleteAccount: (data: DeleteAccountRequest) => Promise<DeleteAccountResponse>;
  logout: () => Promise<void>;
  forgotPassword: (
    data: ForgotPasswordRequest,
  ) => Promise<ForgotPasswordResponse>;
  resetPassword: (data: ResetPasswordRequest) => Promise<ResetPasswordResponse>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  access_token: null,
  user: null,
  authStatus: 'loading',
  tempEmail: undefined,

  isAdmin: () => {
    const roles = get().user?.roles || [];
    return roles.includes('admin');
  },

  checkAuthStatus: async () => {
    const access_token = await StorageAdapter.getItem('access_token');
    if (!access_token) {
      set({ authStatus: 'unauthenticated', user: null, access_token: null });
      return false;
    }

    try {
      const response = await checkAuthStatusAction();
      await StorageAdapter.setItem('access_token', response.access_token);
      set({
        user: response.user,
        access_token: response.access_token,
        authStatus: 'authenticated',
      });
      return true;
    } catch (error) {
      console.error(error);
      await StorageAdapter.removeItem('access_token');
      set({
        user: undefined,
        access_token: undefined,
        authStatus: 'unauthenticated',
      });
      return false;
    }
  },

  signUp: async (data: SignUpRequest) => {
    set({ tempEmail: data.email });

    return await signUpAction(data);
  },

  verifyCode: async (data: VerifyEmailCodeRequest) => {
    try {
      const response = await verifyCodeAction(data);
      await StorageAdapter.setItem('access_token', response.access_token);
      set({
        user: response.user,
        access_token: response.access_token,
        authStatus: 'authenticated',
      });
      return response;
    } catch (error) {
      await StorageAdapter.removeItem('access_token');
      set({ user: null, access_token: null, authStatus: 'unauthenticated' });
      throw error;
    }
  },

  signIn: async (credentials: SignInRequest) => {
    // Store the email temporarily for verification purposes
    set({ tempEmail: credentials.email });

    try {
      const response = await signInAction(credentials);
      await StorageAdapter.setItem('access_token', response.access_token);
      set({
        user: response.user,
        access_token: response.access_token,
        authStatus: 'authenticated',
      });
      return response;
    } catch (error) {
      await StorageAdapter.removeItem('access_token');
      set({ user: null, access_token: null, authStatus: 'unauthenticated' });
      throw error;
    }
  },

  signInWithGoogle: async (idToken: string) => {
    try {
      const response = await signInWithGoogleAction(idToken);
      await StorageAdapter.setItem('access_token', response.access_token);
      set({
        user: response.user,
        access_token: response.access_token,
        authStatus: 'authenticated',
      });
      return response;
    } catch (error) {
      await StorageAdapter.removeItem('access_token');
      set({ user: null, access_token: null, authStatus: 'unauthenticated' });
      throw error;
    }
  },

  deleteAccount: async (data: DeleteAccountRequest) => {
    const response = await deleteAccountAction(data);

    await StorageAdapter.removeItem('access_token'); // Clear token on account deletion
    set({ user: null, access_token: null, authStatus: 'unauthenticated' });
    return response;
  },

  logout: async () => {
    await StorageAdapter.removeItem('access_token');
    set({ user: null, access_token: null, authStatus: 'unauthenticated' });
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    try {
      const response = await forgotPasswordAction(data);
      set({ tempEmail: data.email });
      return response;
    } catch (error) {
      console.error('Error sending forgot password request', error);
      throw error;
    }
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    try {
      const response = await resetPasswordAction(data);
      return response;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },
}));
