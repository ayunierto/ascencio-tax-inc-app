import React from 'react';
import { Text, View } from 'react-native';

type LoadingErrorProps = {
  name: string;
  message?: string;
};

export const LoadingError = ({
  name,
  message = 'An unexpected error occurred. Please try again later.',
}: LoadingErrorProps) => {
  return (
    <View className="w-screen h-screen items-center justify-center flex-grow">
      <Text>
        Error loading {name}: {message}
      </Text>
    </View>
  );
};
