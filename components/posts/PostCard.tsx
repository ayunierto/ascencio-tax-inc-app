import { Ionicons } from '@expo/vector-icons';
import { DateTime } from 'luxon';
import React from 'react';
import {
  Linking,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { Post } from '@/core/posts/interfaces';
import { Card, CardContent } from '../ui/Card';
import { theme } from '../ui/theme';
import { ThemedText } from '../ui/ThemedText';

interface PostCardProps {
  post: Post;
  style?: StyleProp<ViewStyle>;
}

export const PostCard = ({ post, style }: PostCardProps) => {
  const handlePress = () => {
    Linking.openURL(post.url);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[style]} activeOpacity={0.7}>
      <Card>
        <CardContent>
          {/* Title with padding to avoid overlap with icon */}
          <View style={{ marginBottom: 12, paddingRight: 36 }}>
            <ThemedText
              style={{
                fontSize: 18,
                fontWeight: '600',
                lineHeight: 24,
              }}
              numberOfLines={2}
            >
              {post.title}
            </ThemedText>
          </View>

          {/* Footer */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: theme.border,
            }}
          >
            {/* Author */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                flex: 1,
              }}
            >
              <Ionicons
                name='person-circle-outline'
                size={16}
                color={theme.mutedForeground}
              />
              <ThemedText
                style={{
                  fontSize: 12,
                  color: theme.mutedForeground,
                }}
                numberOfLines={1}
              >
                {post.user.firstName} {post.user.lastName}
              </ThemedText>
            </View>

            {/* Date */}
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Ionicons
                name='time-outline'
                size={16}
                color={theme.mutedForeground}
              />
              <ThemedText
                style={{
                  fontSize: 12,
                  color: theme.mutedForeground,
                }}
              >
                {DateTime.fromISO(post.createdAt).toRelative()}
              </ThemedText>
            </View>
          </View>

          {/* External link indicator */}
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: theme.card,
              borderRadius: 20,
              width: 36,
              height: 36,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: theme.primary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Ionicons name='open-outline' size={18} color={theme.primary} />
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};
