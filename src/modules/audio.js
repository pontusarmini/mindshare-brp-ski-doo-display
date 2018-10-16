// WIP
export function downloadAndAppendAudio(url, parentEl) {
    const audioElem = document.createElement('audio');
    const parent = parentEl ? parentEl : document.body;
    parent.appendChild(audioElem);
    audioElem.src = url;
    return audioElem;
}
// WIP
export function syncAudioWithVideo(audioElem, videoElem) {
  audioElem.load();
  audioElem.addEventListener('canplayall');
}
