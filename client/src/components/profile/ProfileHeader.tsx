import styled from 'styled-components';
import { Panel } from '../common/Panel';
import { FollowButton } from './FollowButton';
import type { Profile } from '../../types/models';

interface ProfileHeaderProps {
  profile: Profile;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps): JSX.Element => (
  <Wrap>
    <TopRow>
      <Identity>
        <Avatar aria-hidden>{profile.user.handle.charAt(0).toUpperCase()}</Avatar>
        <div>
          <Name>{profile.user.displayName}</Name>
          <Handle>@{profile.user.handle}</Handle>
        </div>
      </Identity>
      <FollowButton profile={profile} />
    </TopRow>

    <Counts>
      <Count>
        <strong>{profile.followerCount}</strong> Followers
      </Count>
      <Count>
        <strong>{profile.followingCount}</strong> Following
      </Count>
    </Counts>
  </Wrap>
);

const Wrap = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(3)};
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};
`;

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: ${({ theme }) => theme.border};
  display: grid;
  place-items: center;
  font-weight: 700;
  background: ${({ theme }) => theme.color.hover};
`;

const Name = styled.div`
  font-weight: 700;
`;

const Handle = styled.div`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.9em;
`;

const Counts = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space(4)};
`;

const Count = styled.span`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.9em;

  strong {
    color: ${({ theme }) => theme.color.text};
  }
`;
