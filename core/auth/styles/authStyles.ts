import { theme } from '@/components/ui/theme';
import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  logoContainer: {
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallLogoContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldsContainer: {
    gap: 16,
  },
  linkText: {
    color: theme.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  phoneInput: {
    flex: 2,
  },
  buttonGroup: {
    gap: 0,
  },
});
