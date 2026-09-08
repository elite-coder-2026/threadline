import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Panel } from '../common/Panel';
import { StatusPanel } from '../common/StatusPanel';
import { ProfileHeader } from './ProfileHeader';
import { PostCard } from '../feed/PostCard';
import { useProfile } from '../../hooks/useProfile';
import { useUserPosts } from '../../hooks/useUserPosts';

// Route shell only — composition, no logic.
export const ProfilePage = (): JSX.Element => {
  const { handle = '' } = useParams<{ handle: string }>();
  const profile = useProfile(handle);
  const posts = useUserPosts(handle);

  const items = posts.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Wrap>
      {profile.status === 'pending' && <StatusPanel>Loading profile…</StatusPanel>}
      {profile.status === 'error' && (
        <StatusPanel tone="error">Couldn’t load @{handle}: {profile.error.message}</StatusPanel>
      )}
      {profile.data && <ProfileHeader profile={profile.data} />}

      <SectionTitle as="h2">Posts</SectionTitle>

      {posts.status === 'pending' && <StatusPanel>Loading posts…</StatusPanel>}
      {posts.status === 'success' && items.length === 0 && (
        <StatusPanel>@{handle} hasn’t posted yet.</StatusPanel>
      )}
      {items.length > 0 && (
        <List>
          {items.map((post) => (
            <PostCard key={post.id} post={post} as="li" />
          ))}
        </List>
      )}
    </Wrap>
  );
};

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(3)};
  max-width: 620px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.space(4)};
`;

const SectionTitle = styled(Panel)`
  margin: 0;
  font-size: 1rem;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(3)};
`;
