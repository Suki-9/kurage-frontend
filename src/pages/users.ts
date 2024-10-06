import './styles/users.css'
import { h, misskey } from '@/scripts'

function relativeTime(t: number) {
  return (t = Math.ceil((new Date().getTime() - new Date(t).getTime()) / 1000)) < 60 ? t + '秒' : (t = Math.ceil(t / 60)) < 60 ? t + '分' : (t = Math.ceil(t / 60)) < 24 ? t + '時間' : (t = Math.ceil(t / 24)) < 30 ? t + '日' : (t = Math.ceil(t / 30)) < 12 ? t + 'ヶ月' : (t = Math.ceil(t / 12)) ? '年' : null
}

export function Page(): InheritsFromNode[] {
  document.qS(':root')?.setAttribute('page', 'users');

  const [_, username, host] = location.pathname.replace('/', '').split('@');
  const loginUser = misskey.users.loginUser;

  misskey.api.POST<MisskeyUser>('users/show', { username, host }).then(
    async user => {
      const change = async (btn: HTMLButtonElement) => {
        const className = btn.getAttribute('class') ?? '';
        if (className?.match('selected')) {
          for (const e of <HTMLElement[]>[...btn.parentNode?.childNodes ?? []]) {
            e.setAttribute('class', e.getAttribute('class')!.replaceAll('selected', ''))
          }

          btn.setAttribute('class', `${className.trim()} selected`);

          const notes = document.qS('#notes');
          const props = (<Record<string, [string, Record<string, any>]>>{
            'ファイル付き': ['users/notes', {
              limit: 10,
              userId: user.id,
              withChannelNotes: false,
              withFiles: true,
              withRenotes: false,
              withReplies: false
            }],
            '全て': ['users/notes', {
              limit: 10,
              userId: user.id,
              allowPartial: true,
              withChannelNotes: true,
              withFiles: false,
              withRenotes: true,
              withReplies: true,
            }],
            'ハイライト': ['users/featured-notes', {
              limit: 10,
              userId: user.id,
              allowPartial: true,
            }],
            'ノート': ['users/notes', {
              limit: 10,
              userId: user.id,
              withChannelNotes: true,
              withFiles: false,
              withRenotes: true,
              withReplies: true
            }]
          }
          )[btn.textContent ?? ''];

          if (notes && props) notes.parentNode?.replaceChild(
            h('div', { id: 'notes' }, ...await misskey.api.POST<MisskeyNote[]>(...props).then(r => r.map(n => h('mi-note', { note: JSON.stringify(n) })))),
            notes
          );
        }
      };

      document.body.append(
        h('div', { class: 'head' },
          h('icon', { name: 'arrow_back', onclick() { history.back() } }),
          h('div',
            h('h2', { class: 'name' }, ...misskey.mfm(user.name ?? user.username)),
            h('span', { class: 'notesCount' }, `${user.notesCount}件の投稿`)
          )
        ),
        user.bannerUrl ? h('img', { class: 'banner', src: user.bannerUrl, }) : h('div', { class: 'banner' }),
        h('main',
          h('img', { class: 'avater', src: user.avatarUrl }),
          h('div', { class: 'editProfile' },
            user.id == loginUser?.id && h('m3-button', {}, 'プロフィールを編集')
          ),
          h('div', { class: 'container' },
            h('h2', { class: 'name' }, ...misskey.mfm(user.name ?? user.username)),
            h('span', { class: 'username' }, '@' + user.username)
          ),
          h('div', { class: 'container' },
            ...misskey.mfm(user.description ?? '自己紹介はありません')
          ),
          h('div', { class: 'container' },
            h('div', { class: 'row' },
              h('icon', { name: 'edit_calendar' }),
              h('span', '登録日'),
              h('span', new Date(user.createdAt).toLocaleDateString('sv-SE').replaceAll('-', '/')),
              h('span', '(' + relativeTime(user.createdAt) + '前)')
            ),
            user.birthday && h('div', { class: 'row' },
              h('icon', { name: 'cake' }),
              h('span', '誕生日'),
              h('span', new Date(user.birthday).toLocaleDateString('sv-SE').replaceAll('-', '/'))
            )
          ),
          h('div', { class: 'container row' },
            h('div', { class: 'row ff' },
              h('h4', String(user.followingCount)), h('span', 'フォロー中')
            ),
            h('div', { class: 'row ff' },
              h('h4', String(user.followersCount)), h('span', 'フォロワー')
            )
          )
        ),
        h('div', { class: 'select' },
          h('m3-button', { type: 'text', onclick() { change(<HTMLButtonElement>this) } }, 'ハイライト'),
          h('m3-button', { type: 'text', onclick() { change(<HTMLButtonElement>this) }, class: 'selected' }, 'ノート'),
          h('m3-button', { type: 'text', onclick() { change(<HTMLButtonElement>this) } }, '全て'),
          h('m3-button', { type: 'text', onclick() { change(<HTMLButtonElement>this) } }, 'ファイル付き'),
        ),
        h('div', { id: 'notes' },
          ...await misskey.api.POST<MisskeyNote[]>('users/notes', {
            limit: 10,
            userId: user.id,
            withChannelNotes: true,
            withFiles: false,
            withRenotes: true,
            withReplies: true
          }).then(r => r.map(n => h('mi-note', { note: JSON.stringify(n) })))
        )
      )
    }
  );

  return [];
}