import { h } from "@/scripts";

export function audioPlayer(attr: KuElementTagNameMap['audio-player']['options']) {
  const timeFormat = (t: number): string => `${('00' + Math.trunc(t / 60)).slice(-2)}:${('00' + Math.ceil(t % 60)).slice(-2)}`;

  let timer: number;

  const play = h('icon', { class: 'play', name: 'play_arrow' });
  const pause = h('icon', { class: 'play', name: 'pause' });
  const mute = h('icon', { class: 'mute', name: 'volume_off' });
  const voiced = h('icon', { class: 'mute', name: 'volume_up' });
  const settings = h('icon', { name: 'settings' });

  const playBtn = h('button', play);
  const muteBtn = h('button', voiced);
  const current = h('span', '--:--');
  const total = h('span', '--:--');
  const volume = h('input', { type: 'range', max: '1', step: '0.05' });
  const modalVolume = <HTMLInputElement>volume.cloneNode(false);
  const seekBar = h('input', { type: 'range', value: 0 });
  const audio = new Audio(attr.src);

  const settingModal = h('m3-bottom-sheet', { class: 'note-modal audio-modal', bg: true },
    h('div', { class: 'volume' },
      h('p', h('icon', { class: 'mute', name: 'volume_up' }), 'ボリューム'),
      modalVolume,
    ),
    h('m3-button', {
      type: 'text', onclick() {
        const btn = (<HTMLButtonElement>this).qS('.state');
        if (btn) btn.innerHTML = (audio.loop = !audio.loop) ? 'ループを解除' : 'ループ再生'
      }
    }, h('icon', { name: 'repeat' }), h('span', { class: 'state' }, audio.loop ? 'ループを解除' : 'ループ再生')),
    h('m3-button', { type: 'text' }, h('icon', { name: 'speed' }), '再生速度'),
    h('m3-button', { type: 'text' }, h('icon', { name: 'visibility_off' }), '隠す'),
    attr.isOwner && h('m3-button', { type: 'text' }, h('icon', { name: 'disabled_visible' }), 'センシティブとする'),
    // attr.isOwner && h('m3-Button', { type: 'text' }, 'ファイルの詳細'),
    h('m3-button', { onclick() { settingModal.remove() } }, 'キャンセル')
  );
  const root = h('div', { class: 'audio-Player' },
    h('div',
      h('div',
        playBtn,
        current, ' / ', total,
      ),
      h('div',
        volume,
        muteBtn,
        h('button', { onclick() { document.body.contains(settingModal) || document.body.append(settingModal) } }, settings),
      ),
    ),
    seekBar,
  );

  playBtn.on('click', _ => audio.paused ? audio.play() : audio.pause());
  muteBtn.on('click', _ => {
    if (audio.muted) {
      audio.muted = false;
      volume.style.display = '';
      muteBtn.replaceChild(voiced, muteBtn.childNodes[0]);
    } else {
      audio.muted = true;
      volume.style.display = 'none';
      muteBtn.replaceChild(mute, muteBtn.childNodes[0]);
    }
  });

  audio
    .on('play', _ => {
      playBtn.replaceChild(pause, playBtn.childNodes[0]);
      current.innerHTML = timeFormat(audio.currentTime);

      timer = window.setInterval(() => {
        seekBar.value = String(Math.ceil(audio.currentTime));
        current.innerHTML = timeFormat(audio.currentTime);
      }, 1000);
    })
    .on('pause', _ => {
      playBtn.replaceChild(play, playBtn.childNodes[0]);
      clearInterval(timer);
    })
    .on('loadeddata', _ => {
      total.innerHTML = timeFormat(audio.duration);

      seekBar.max = String(~~audio.duration);
      audio.volume = Number(volume.value);

      seekBar.on('input', _ => {
        audio.currentTime = Number(seekBar.value);
        current.innerHTML = timeFormat(audio.currentTime);
      });

      modalVolume.on('input', _ => {
        audio.volume = Number(modalVolume.value);
        volume.value = modalVolume.value;
      });

      volume.on('input', _ => {
        audio.volume = Number(volume.value);
        modalVolume.value = volume.value;
      })
    });

  return root;
}