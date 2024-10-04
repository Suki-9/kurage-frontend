type MisskeyStreamEvent = {
  type: 'noteUpdated';
  body: {
    id: string;
    type: 'unreacted' | 'reacted';
    body: MisskeyReaction;
  }
} | {
  type: 'noteUpdated';
  body: {
    id: string;
    type: 'deleted';
    body: {
      deletedAt: string;
    };
  }
} | {
  type: 'channel';
  body: {
    id: string;
    type: 'note';
    body: MisskeyNote;
  }
}