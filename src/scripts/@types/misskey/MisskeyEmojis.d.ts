type CategorizedIndex = { [K: string]: CategorizedIndex } & { $?: MisskeyEmoji[] };
type MisskeyEmoji = {
  aliases: string[];
  category: string;
  name: string;
  url: string;
}
