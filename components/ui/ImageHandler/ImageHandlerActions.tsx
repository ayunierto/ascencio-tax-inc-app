import React from 'react';
import { View, ViewProps } from 'react-native';

export const ImageHandlerActions: React.FC<ViewProps> = ({
  children,
  ...props
}) => {
  return <View {...props}>{children}</View>;
};
