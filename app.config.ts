import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const env = process.env.APP_ENV;

  const isProd = env === 'production';
  const isPreview = env === 'preview';

  return {
    ...config,

    name: isProd ? 'Ascencio Tax' : isPreview ? 'Ascencio Tax Preview' : 'Ascencio Tax Dev',
    slug: 'ascencio-tax-inc',
    version: '1.1.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'ascenciotaxinc',
    userInterfaceStyle: 'light',
    backgroundColor: '#002e5d',

    ios: {
      supportsTablet: true,
      bundleIdentifier: isProd
        ? 'com.ayunierto.ascenciotaxinc'
        : isPreview
          ? 'com.ayunierto.ascenciotaxinc.preview'
          : 'com.ayunierto.ascenciotaxinc.dev',
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleAllowMixedLocalizations: true,
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      backgroundColor: '#002e5d',
      package: isProd
        ? 'com.ascenciotax.ascenciotaxinc'
        : isPreview
          ? 'com.ascenciotax.ascenciotaxinc.preview'
          : 'com.ascenciotax.ascenciotaxinc.dev',
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      'expo-secure-store',
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.519032916581-5boec27sn68bochdu5cvc7paptfcl5dd',
        },
      ],
      'expo-apple-authentication',
      'expo-localization',
      [
        'expo-navigation-bar',
        {
          enforceContrast: false,
          barStyle: 'light',
          visibility: 'visible',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission:
            'Allow $(PRODUCT_NAME) to use your camera to take photos of receipts and upload them for tax reporting purposes.',
          recordAudioAndroid: false,
        },
      ],
      [
        'expo-media-library',
        {
          photosPermission:
            'Allow $(PRODUCT_NAME) to access your photo library so you can select and upload photos of receipts for tax reporting.',
          savePhotosPermission:
            'Allow $(PRODUCT_NAME) to save receipt images processed within the app to your photo library.',
          isAccessMediaLocationEnabled: false,
          granularPermissions: ['photo'],
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: '47aef967-befa-4704-8ca3-520e9ea6c34d',
      },
    },

     updates: {
      url: `https://u.expo.dev/${config.extra?.eas?.projectId}`,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  };
};
