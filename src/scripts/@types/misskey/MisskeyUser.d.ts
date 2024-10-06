// 独自拡張
interface MisskeyUser {
  i: Token;
  instance?: {
    origin?: string
  }
}

interface MisskeyUser {
  id: ID;
  username: string;
  host: string;
  name: string;
  onlineStatus: 'online' | 'active' | 'offline' | 'unknown';
  avatarUrl: string;
  avatarBlurhash: string;
  emojis: {
    name: string;
    url: string;
  }[];
  instance?: {
    name: Instance['name'];
    softwareName: Instance['softwareName'];
    softwareVersion: Instance['softwareVersion'];
    iconUrl: Instance['iconUrl'];
    faviconUrl: Instance['faviconUrl'];
    themeColor: Instance['themeColor'];
  };
};

interface MisskeyUser {
  bannerBlurhash: string | null;
  bannerColor: string | null;
  bannerUrl: string | null;
  birthday: string | null;
  createdAt: DateString;
  description: string | null;
  ffVisibility: 'public' | 'followers' | 'private';
  fields: { name: string; value: string }[];
  followersCount: number;
  followingCount: number;
  hasPendingFollowRequestFromYou: boolean;
  hasPendingFollowRequestToYou: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  isBlocking: boolean;
  isBot: boolean;
  isCat: boolean;
  isFollowed: boolean;
  isFollowing: boolean;
  isLocked: boolean;
  isModerator: boolean;
  isMuted: boolean;
  isSilenced: boolean;
  isSuspended: boolean;
  lang: string | null;
  lastFetchedAt?: DateString;
  location: string | null;
  notesCount: number;
  pinnedNoteIds: ID[];
  pinnedNotes: Note[];
  pinnedPage: Page | null;
  pinnedPageId: string | null;
  publicReactions: boolean;
  securityKeys: boolean;
  twoFactorEnabled: boolean;
  updatedAt: DateString | null;
  uri: string | null;
  url: string | null;
};
