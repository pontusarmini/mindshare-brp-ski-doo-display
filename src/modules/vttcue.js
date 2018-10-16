export function VTTCuePolyfill() {

  if (window.VTTCue) {
    return true;
  }
  if (!window.TextTrackCue) {
    return false;
  }
  const constructorLength = TextTrackCue.length;
  if (constructorLength == 3) {
    window.VTTCue = from3ArgsTextTrackCue_;
  } else if (constructorLength == 6) {
    window.VTTCue = from6ArgsTextTrackCue_;
  } else if (canUse3ArgsTextTrackCue_()) {
    window.VTTCue = from3ArgsTextTrackCue_;
  }
  return true;

}

function from3ArgsTextTrackCue_(startTime, endTime, text) {
  return new window.TextTrackCue(startTime, endTime, text);
}
function from6ArgsTextTrackCue_(startTime, endTime, text) {
  const id = startTime + '-' + endTime + '-' + text;
  return new window['TextTrackCue'](id, startTime, endTime, text);
}
function canUse3ArgsTextTrackCue_() {
  try {
    return from3ArgsTextTrackCue_(1, 2, '');
  } catch (error) {
    return false;
  }
}
