import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Shield, Users } from 'lucide-react-native';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PremiumLocked } from '../components/PremiumLocked';
import { SettingsSection } from '../components/SettingsSection';
import { useAppTheme } from '../hooks/useAppTheme';
import { themedIconWrap } from '../lib/themeStyles';
import {
  createCommunityPost,
  fetchCommunityFeed,
  formatCommunityPostTime,
  toggleCommunitySupport,
  type CommunityPost,
} from '../lib/community';
import { validateCommunityMessage, validateCommunityTitle } from '../lib/validation';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { TextField } from '../components/ui/TextField';
import { ThemedText } from '../components/ui/ThemedText';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';

const COMMUNITY_RULES = [
  'Be kind',
  'No shame language',
  'No medical advice',
  'Protect your privacy',
];

const COMMUNITY_BENEFITS = [
  { title: 'Anonymous support', description: 'Share and read updates without exposing your email.' },
  { title: 'Real community feed', description: 'Posts are stored securely in Supabase for Premium members.' },
  { title: 'Safe space rules', description: 'Clear guidelines for kindness and privacy.' },
];

function PostCard({
  post,
  onToggleSupport,
  supporting,
}: {
  post: CommunityPost;
  onToggleSupport: (post: CommunityPost) => void;
  supporting: boolean;
}) {
  const { colors, isDark } = useAppTheme();
  const authorLabel = post.isAnonymous ? 'Anonymous' : 'Member';

  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between">
        <ThemedText variant="primary" className="text-sm font-semibold">
          {authorLabel}
          {post.isMine ? ' · You' : ''}
        </ThemedText>
        <ThemedText variant="muted" className="text-xs">
          {formatCommunityPostTime(post.createdAt)}
        </ThemedText>
      </View>
      <ThemedText className="mt-2 text-lg font-bold">{post.title}</ThemedText>
      <ThemedText variant="body" className="mt-2 text-base leading-6">
        {post.message}
      </ThemedText>
      <View
        className="mt-4 flex-row items-center justify-between border-t pt-3"
        style={{ borderTopColor: colors.border }}
      >
        <ThemedText variant="muted" className="text-sm">
          {post.supportCount} {post.supportCount === 1 ? 'support' : 'supports'}
        </ThemedText>
        <Pressable
          onPress={() => onToggleSupport(post)}
          disabled={supporting}
          className="rounded-xl px-4 py-2 active:opacity-80"
          style={themedIconWrap(
            colors,
            isDark,
            post.supportedByMe ? 'success' : 'neutral'
          )}
        >
          {supporting ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : (
            <ThemedText
              variant={post.supportedByMe ? 'success' : 'muted'}
              className="text-sm font-semibold"
            >
              {post.supportedByMe ? 'Supported' : 'Support'}
            </ThemedText>
          )}
        </Pressable>
      </View>
    </Card>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [supportingId, setSupportingId] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    if (!isPremium) return;
    setLoading(true);
    setLoadError(null);
    const result = await fetchCommunityFeed(user?.id);
    setPosts(result.posts);
    setLoadError(result.error ?? null);
    setLoading(false);
  }, [isPremium, user?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadFeed();
    }, [loadFeed])
  );

  const handleCreatePost = async () => {
    if (!user) return;

    const nextTitleError = validateCommunityTitle(title);
    const nextMessageError = validateCommunityMessage(message);
    setTitleError(nextTitleError);
    setMessageError(nextMessageError);
    if (nextTitleError || nextMessageError) return;

    setPosting(true);
    const result = await createCommunityPost(user.id, title, message);
    setPosting(false);

    if (result.error) {
      setMessageError(result.error);
      return;
    }

    setTitle('');
    setMessage('');
    await loadFeed();
  };

  const handleToggleSupport = async (post: CommunityPost) => {
    if (!user) return;

    setSupportingId(post.id);
    const result = await toggleCommunitySupport(user.id, post.id, post.supportedByMe);
    setSupportingId(null);

    if (result.error) return;

    setPosts((current) =>
      current.map((item) => {
        if (item.id !== post.id) return item;
        const supportedByMe = !post.supportedByMe;
        return {
          ...item,
          supportedByMe,
          supportCount: Math.max(0, item.supportCount + (supportedByMe ? 1 : -1)),
        };
      })
    );
  };

  if (!isPremium) {
    return (
      <PremiumLocked
        showBack
        title="Community"
        description="Anonymous support from people building better habits."
        benefitCards={COMMUNITY_BENEFITS}
      />
    );
  }

  if (!user) {
    return (
      <ScreenContainer scroll tabBarInset={false}>
        <EmptyState
          title="Sign in required"
          message="Community posts are tied to your account. Sign in to read and share."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll tabBarInset={false}>
      <BackButton onPress={() => router.back()} className="mb-3 self-start" />

      <PageHeader
        title="Community"
        subtitle="Anonymous support from people building better habits."
      />

      <Card>
        <View className="flex-row items-start">
          <View className="mr-3 rounded-full p-2" style={themedIconWrap(colors, isDark, 'primary')}>
            <Shield size={20} color={colors.primaryStrong} />
          </View>
          <ThemedText variant="muted" className="flex-1 text-sm leading-5">
            This is a supportive space, not medical advice. If you are in immediate danger,
            contact emergency services or a crisis support line.
          </ThemedText>
        </View>
      </Card>

      <Card className="mt-4" title="Anonymous by design">
        <View className="flex-row items-start">
          <Users size={20} color={colors.mutedText} />
          <ThemedText variant="muted" className="ml-2 flex-1 text-sm leading-5">
            Posts appear as Anonymous. Do not share phone numbers, addresses, or other personal
            details.
          </ThemedText>
        </View>
      </Card>

      <Card className="mt-4" title="Share an update">
        <TextField
          label="Title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setTitleError(null);
          }}
          placeholder="A short headline"
          error={titleError}
          returnKeyType="next"
        />
        <TextField
          className="mt-3"
          label="Message"
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            setMessageError(null);
          }}
          placeholder="What would you like to share?"
          error={messageError}
          multiline
        />
        <View className="mt-4">
          <Button title="Post to community" onPress={handleCreatePost} loading={posting} />
        </View>
      </Card>

      <SettingsSection title="Recent posts">
        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={colors.primaryStrong} />
            <ThemedText variant="muted" className="mt-3 text-sm">
              Loading posts…
            </ThemedText>
          </View>
        ) : loadError ? (
          <EmptyState
            title="Could not load posts"
            message={loadError}
            actionLabel="Try again"
            onAction={() => void loadFeed()}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            message="Be the first to share an encouraging update with the community."
          />
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleSupport={handleToggleSupport}
              supporting={supportingId === post.id}
            />
          ))
        )}
      </SettingsSection>

      <Card className="mt-2" title="Community rules">
        {COMMUNITY_RULES.map((rule) => (
          <ThemedText key={rule} variant="body" className="mb-2 text-sm leading-5">
            • {rule}
          </ThemedText>
        ))}
      </Card>
    </ScreenContainer>
  );
}
