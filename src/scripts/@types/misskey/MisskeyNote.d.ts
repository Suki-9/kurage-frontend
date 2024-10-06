type NoteReaction = {
	id: ID;
	createdAt: DateString;
	user: UserLite;
	type: string;
};

interface MisskeyNote {
	reactionEmojis: Record<string, string>
}

interface MisskeyNote {
	id: ID;
	createdAt: DateString;
	text: string | null;
	cw: string | null;
	user: MisskeyUser;
	userId: User['id'];
	reply?: MisskeyNote;
	replyId: MisskeyNote['id'];
	renote?: MisskeyNote;
	renoteId: MisskeyNote['id'];
	files: DriveFile[];
	fileIds: DriveFile['id'][];
	visibility: 'public' | 'home' | 'followers' | 'specified';
	visibleUserIds?: MisskeyUser['id'][];
	localOnly?: boolean;
	myReaction?: nullable<string>;
	reactions: Record<string, number>;
	renoteCount: number;
	repliesCount: number;
	poll?: {
		expiresAt: DateString | null;
		multiple: boolean;
		choices: {
			isVoted: boolean;
			text: string;
			votes: number;
		}[];
	};
	emojis: {
		name: string;
		url: string;
	}[];
	uri?: string;
	url?: string;
	isHidden?: boolean;
}