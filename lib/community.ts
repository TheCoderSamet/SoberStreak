import { formatDistanceToNow } from 'date-fns';
import { supabase } from './supabase';

export interface CommunityPost {
  id: string;
  title: string;
  message: string;
  isAnonymous: boolean;
  createdAt: string;
  supportCount: number;
  supportedByMe: boolean;
  isMine: boolean;
}

type PostRow = {
  id: string;
  title: string;
  message: string;
  is_anonymous: boolean;
  created_at: string;
  community_supports: { count: number }[] | null;
};

function mapPostRow(row: PostRow, supportedPostIds: Set<string>): CommunityPost {
  const count = row.community_supports?.[0]?.count ?? 0;
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    isAnonymous: row.is_anonymous,
    createdAt: row.created_at,
    supportCount: count,
    supportedByMe: supportedPostIds.has(row.id),
    isMine: false,
  };
}

export function formatCommunityPostTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

export async function fetchCommunityFeed(userId: string | undefined): Promise<{
  posts: CommunityPost[];
  error?: string;
}> {
  const [postsResult, supportsResult] = await Promise.all([
    supabase
      .from('community_posts')
      .select(
        `
        id,
        title,
        message,
        is_anonymous,
        created_at,
        community_supports ( count )
      `
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),
    userId
      ? supabase.from('community_supports').select('post_id').eq('user_id', userId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (postsResult.error) {
    console.error('[Community] fetch posts:', postsResult.error.message);
    return { posts: [], error: postsResult.error.message };
  }

  if (supportsResult.error) {
    console.error('[Community] fetch supports:', supportsResult.error.message);
  }

  const supportedPostIds = new Set(
    (supportsResult.data ?? []).map((row) => row.post_id as string)
  );

  const posts = (postsResult.data as PostRow[] | null ?? []).map((row) =>
    mapPostRow(row, supportedPostIds)
  );

  return { posts };
}

export async function createCommunityPost(
  userId: string,
  title: string,
  message: string
): Promise<{ error?: string }> {
  const { error } = await supabase.from('community_posts').insert({
    user_id: userId,
    title: title.trim(),
    message: message.trim(),
    is_anonymous: true,
  });

  if (error) {
    console.error('[Community] create post:', error.message);
    return { error: error.message };
  }

  return {};
}

export async function toggleCommunitySupport(
  userId: string,
  postId: string,
  currentlySupported: boolean
): Promise<{ error?: string }> {
  if (currentlySupported) {
    const { error } = await supabase
      .from('community_supports')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('[Community] remove support:', error.message);
      return { error: error.message };
    }
    return {};
  }

  const { error } = await supabase.from('community_supports').insert({
    user_id: userId,
    post_id: postId,
  });

  if (error) {
    console.error('[Community] add support:', error.message);
    return { error: error.message };
  }

  return {};
}
