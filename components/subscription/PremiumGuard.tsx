/**
 * Premium Feature Guard Component
 * Wraps components that require premium access
 */

import React from 'react';
import { PremiumFeature } from '@ascencio/shared';
import { useSubscription } from '@/core/subscription/SubscriptionContext';
import { Paywall } from './Paywall';
import Loader from '@/components/Loader';

interface PremiumGuardProps {
  children: React.ReactNode;
  feature: PremiumFeature;
  fallback?: React.ReactNode;
}

/**
 * Component that renders children only if user has access to the feature
 * Otherwise shows a paywall
 */
export function PremiumGuard({ children, feature, fallback }: PremiumGuardProps) {
  const { canAccessFeature, isLoading } = useSubscription();

  if (isLoading) {
    return <Loader />;
  }

  const hasAccess = canAccessFeature(feature);

  if (!hasAccess) {
    return fallback || <Paywall feature={feature} />;
  }

  return <>{children}</>;
}

/**
 * HOC version for wrapping entire screens
 */
export function withPremiumGuard<P extends object>(
  Component: React.ComponentType<P>,
  feature: PremiumFeature,
) {
  return function PremiumGuardedComponent(props: P) {
    return (
      <PremiumGuard feature={feature}>
        <Component {...props} />
      </PremiumGuard>
    );
  };
}
