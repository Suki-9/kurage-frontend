import { genId, misskey } from "@/scripts";

const timeLineChannels = ['homeTimeline', 'localTimeline', 'hybridTimeline', 'globalTimeline'] as const;

type TimeLineChannels = typeof timeLineChannels[number];
type StreamChannels = TimeLineChannels | 'main';

class MisskeyTimeLineStream extends WebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {
    super(url, protocols);
  }

  subNote(id: string) {
    this.send(`{"type":"s","body":{"id":"${id}"}}`);
  }
}

type StreamingAPIUtils = {
  connections: Record<string, WebSocket | MisskeyTimeLineStream>;

  streamConnection: <T extends StreamChannels>(channel: T, options?: { host: string, i: string }) => Promise<T extends TimeLineChannels ? MisskeyTimeLineStream : WebSocket>;
};

// TODO ふさわしい場所に移動する。
function includes<A extends ReadonlyArray<unknown>>(array: A, input: unknown): input is A[number] {
  return array.includes(input)
}

export const stream: StreamingAPIUtils = {
  connections: {},

  async streamConnection(channel = 'timeline', options?) {
    const
      id = genId(),
      url = `${(options?.host ?? misskey.users.loginUser?.instance?.origin)?.replace('http', 'ws')}/streaming?i=${options?.i ?? misskey.users.loginUser?.i}`;

    stream.connections[id] = includes(timeLineChannels, channel)
      ? new MisskeyTimeLineStream(url)
      : new WebSocket(url);

    return new Promise((resolve, reject) => {
      stream.connections[id].on('error', () => reject());
      stream.connections[id].on('open', () => {
        stream.connections[id].send(`{"type":"connect", "body":{"channel":"${channel}", "id":"${id}", "params": {}}}`);
        // TODO : ココの型をどうにかすべき
        resolve(<MisskeyTimeLineStream>stream.connections[id]);
      });
    });
  },
}
