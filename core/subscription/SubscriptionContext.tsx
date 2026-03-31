/**
 * Subscription Provider and Hook
 * Manages subscription state, trial period, and feature access using RevenueCat
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SubscriptionTier,
  PremiumFeature,
  SubscriptionStatus,
  UsageLimits,
  ENTITLEMENTS,
  canAccessFeature,
  isWithinTrialLimits,
  calculateTrialEndDate,
  isTrialExpired,
} from '@ascencio/shared';

interface SubscriptionContextType {
  // Subscription state
  subscriptionStatus: SubscriptionStatus;
  usageLimits: UsageLimits;
  offerings: PurchasesOfferings | null;
  isLoading: boolean;

  // Feature access checks
  canAccessFeature: (feature: PremiumFeature) => boolean;
  canCreateItem: (feature: PremiumFeature) => boolean;
  getRemainingItems: (feature: PremiumFeature) => number;

  // Actions
  refreshSubscription: () => Promise<void>;
  purchasePackage: (packageToPurchase: any) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  incrementUsage: (feature: PremiumFeature) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

// ⚠️ TEMPORARY: Set to true to bypass subscription checks for testing
const BYPASS_SUBSCRIPTION_CHECKS = true;

const STORAGE_KEYS = {
  TRIAL_START_DATE: '@trial_start_date',
  USAGE_LIMITS: '@usage_limits',
} as const;

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>({
      tier: SubscriptionTier.FREE,
      isActive: false,
      isInTrial: false,
      trialEndDate: null,
      expirationDate: null,
      willRenew: false,
    });

  const [usageLimits, setUsageLimits] = useState<UsageLimits>({
    companies: 0,
    clients: 0,
    expenses: 0,
    invoices: 0,
  });

  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize subscription data on mount
   */
  useEffect(() => {
    initializeSubscription();
  }, []);

  /**
   * Initialize subscription state from storage and RevenueCat
   */
  const initializeSubscription = async () => {
    try {
      setIsLoading(true);

      // Load usage limits from storage
      const storedUsage = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_LIMITS);
      if (storedUsage) {
        setUsageLimits(JSON.parse(storedUsage));
      }

      // Check trial status
      await checkTrialStatus();

      // ⚠️ TEMPORARY: Skip RevenueCat calls when bypass is enabled
      if (!BYPASS_SUBSCRIPTION_CHECKS) {
        // Refresh subscription from RevenueCat
        await refreshSubscription();

        // Load offerings
        await loadOfferings();
      }
    } catch (error) {
      console.error('Error initializing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check and initialize trial period
   */
  const checkTrialStatus = async () => {
    try {
      const trialStartDateStr = await AsyncStorage.getItem(
        STORAGE_KEYS.TRIAL_START_DATE,
      );

      if (!trialStartDateStr) {
        // First time user - start trial
        const now = new Date();
        await AsyncStorage.setItem(
          STORAGE_KEYS.TRIAL_START_DATE,
          now.toISOString(),
        );

        const trialEndDate = calculateTrialEndDate(now);
        setSubscriptionStatus((prev: SubscriptionStatus) => ({
          ...prev,
          isInTrial: true,
          trialEndDate,
        }));
      } else {
        // Existing user - check trial expiration
        const trialStartDate = new Date(trialStartDateStr);
        const trialEndDate = calculateTrialEndDate(trialStartDate);
        const expired = isTrialExpired(trialEndDate);

        setSubscriptionStatus((prev: SubscriptionStatus) => ({
          ...prev,
          isInTrial: !expired,
          trialEndDate,
        }));
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    }
  };

  /**
   * Refresh subscription status from RevenueCat
   */
  const refreshSubscription = useCallback(async () => {
    // ⚠️ TEMPORARY: Skip when bypass is enabled
    if (BYPASS_SUBSCRIPTION_CHECKS) {
      return;
    }

    try {
      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();

      // Check for active entitlements
      const hasPremium =
        typeof customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !==
        'undefined';
      const hasEnterprise =
        typeof customerInfo.entitlements.active[ENTITLEMENTS.ENTERPRISE] !==
        'undefined';

      let tier: SubscriptionTier = SubscriptionTier.FREE;
      if (hasEnterprise) {
        tier = SubscriptionTier.ENTERPRISE;
      } else if (hasPremium) {
        tier = SubscriptionTier.PREMIUM;
      }

      const isActive = hasPremium || hasEnterprise;

      // Get expiration date
      let expirationDate: Date | null = null;
      if (hasPremium) {
        const premiumEntitlement =
          customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM];
        expirationDate = premiumEntitlement.expirationDate
          ? new Date(premiumEntitlement.expirationDate)
          : null;
      }

      setSubscriptionStatus((prev: SubscriptionStatus) => ({
        ...prev,
        tier,
        isActive,
        expirationDate,
        willRenew: customerInfo.managementURL !== null,
      }));

      return customerInfo;
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      throw error;
    }
  }, []);

  /**
   * Load available subscription offerings
   */
  const loadOfferings = async () => {
    // ⚠️ TEMPORARY: Skip when bypass is enabled
    if (BYPASS_SUBSCRIPTION_CHECKS) {
      return;
    }

    try {
      const offerings = await Purchases.getOfferings();
      if (
        offerings.current !== null &&
        offerings.current.availablePackages.length !== 0
      ) {
        setOfferings(offerings);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  /**
   * Purchase a subscription package
   */
  const purchasePackage = async (packageToPurchase: any): Promise<boolean> => {
    // ⚠️ TEMPORARY: Return success when bypass is enabled
    if (BYPASS_SUBSCRIPTION_CHECKS) {
      return true;
    }

    try {
      const { customerInfo } =
        await Purchases.purchasePackage(packageToPurchase);

      // Refresh subscription status
      await refreshSubscription();

      return (
        typeof customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !==
        'undefined'
      );
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Error purchasing package:', error);
      }
      return false;
    }
  };

  /**
   * Restore previous purchases
   */
  const restorePurchases = async (): Promise<boolean> => {
    // ⚠️ TEMPORARY: Return success when bypass is enabled
    if (BYPASS_SUBSCRIPTION_CHECKS) {
      return true;
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      await refreshSubscription();

      return (
        typeof customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !==
        'undefined'
      );
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  };

  /**
   * Increment usage counter for a feature
   */
  const incrementUsage = async (feature: PremiumFeature) => {
    try {
      const newUsage = { ...usageLimits };

      switch (feature) {
        case PremiumFeature.COMPANIES:
          newUsage.companies += 1;
          break;
        case PremiumFeature.CLIENTS:
          newUsage.clients += 1;
          break;
        case PremiumFeature.EXPENSES:
          newUsage.expenses += 1;
          break;
        case PremiumFeature.INVOICES:
          newUsage.invoices += 1;
          break;
      }

      setUsageLimits(newUsage);
      await AsyncStorage.setItem(
        STORAGE_KEYS.USAGE_LIMITS,
        JSON.stringify(newUsage),
      );
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  /**
   * Check if user can access a feature
   */
  const checkCanAccessFeature = (feature: PremiumFeature): boolean => {
    // ⚠️ TEMPORARY: Bypass for testing
    if (BYPASS_SUBSCRIPTION_CHECKS) {
      return true;
    }

    // Premium subscribers have full access
    if (subscriptionStatus.isActive) {
      return true;
    }

    // Check trial limits
    const limits = isWithinTrialLimits(
      usageLimits,
      subscriptionStatus.isInTrial,
    );
    return limits[feature];
  };

  /**
   * Check if user can create a new item for a feature
   */
  const checkCanCreateItem = (feature: PremiumFeature): boolean => {
    // ⚠️ TEMPORARY: Bypass for testing
    if (BYPASS_SUBSCRIPTION_CHECKS) {
      return true;
    }

    // Premium subscribers have unlimited access
    if (subscriptionStatus.isActive) {
      return true;
    }

    // Check trial limits
    const limits = isWithinTrialLimits(
      usageLimits,
      subscriptionStatus.isInTrial,
    );
    return limits[feature];
  };

  /**
   * Get remaining items for a feature
   */
  const getRemainingItemsCount = (feature: PremiumFeature): number => {
    // ⚠️ TEMPORARY: Bypass for testing
    if (BYPASS_SUBSCRIPTION_CHECKS) {
      return Infinity;
    }

    // Premium subscribers have unlimited access
    if (subscriptionStatus.isActive) {
      return Infinity;
    }

    // Calculate remaining based on current usage
    let currentUsage = 0;
    switch (feature) {
      case PremiumFeature.COMPANIES:
        currentUsage = usageLimits.companies;
        break;
      case PremiumFeature.CLIENTS:
        currentUsage = usageLimits.clients;
        break;
      case PremiumFeature.EXPENSES:
        currentUsage = usageLimits.expenses;
        break;
      case PremiumFeature.INVOICES:
        currentUsage = usageLimits.invoices;
        break;
    }

    const limits = isWithinTrialLimits(
      usageLimits,
      subscriptionStatus.isInTrial,
    );
    return limits[feature] ? Infinity : 0; // Simplified for now
  };

  const value: SubscriptionContextType = {
    subscriptionStatus,
    usageLimits,
    offerings,
    isLoading,
    canAccessFeature: checkCanAccessFeature,
    canCreateItem: checkCanCreateItem,
    getRemainingItems: getRemainingItemsCount,
    refreshSubscription: async () => {
      await refreshSubscription();
    },
    purchasePackage,
    restorePurchases,
    incrementUsage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook to access subscription context
 */
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider',
    );
  }
  return context;
}
