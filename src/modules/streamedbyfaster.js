/**
* @public
* @enum Success and error messages for StreamedBy
**/
export const StreamedByMessages = {
  HLS: 'HLS',
  DASH: 'DASH',
  NONE: 'NOT ABLE TO STREAM',
  SOURCE_BUFFER_ERROR: 'addSourceBuffer error',
  NO_MEDIA_SOURCE: 'Media Source Api not avilable',
  FETCH_ERROR: 'Error fetching manifest',
  MANIFEST_ERROR: 'Error parsing manifest'
}
/**
* Sets the source of a video element to a DASH stream
* @private
* @class
* @param {object} params - an object containing duration, codecsString, numberOfSegments, name and baseUrl.
* @param {HTMLVideoElement} videoElem - the video element that should play the stream
* @returns {Promise.<string>} a Promise that resolves with a success string or an Error.
*/
function DashPlayer(params, videoElem) {

  let sourceBuffer,
      ms,
      index = 0,
      isFetching = false,
      stuckTimeout = undefined,
      canPlay = false;

  const video = videoElem,
        BASE_URL = params.baseUrl;

  return new Promise((success, reject) =>{

    if (!window.MediaSource) {
      reject(new Error(StreamedByMessages.NO_MEDIA_SOURCE));
    }

    init();

    function init() {
      ms = new MediaSource();
      video.src = window.URL.createObjectURL(ms);
      ms.addEventListener('sourceopen', onMediaSourceOpen);
      video.addEventListener('canplay', ()=>{
        canPlay = true;
      });
    }

    function onMediaSourceOpen() {
      try {
        ms.duration = params.duration;
        sourceBuffer = ms.addSourceBuffer(`video/mp4; codecs=${params.codecsString}`);
      } catch(e) {
        reject(new Error(StreamedByMessages.SOURCE_BUFFER_ERROR));
        return;
      }

      sourceBuffer.addEventListener('updateend', initSegmentAdded);

      fetch(`${BASE_URL}init.mp4`)
        .then(response => response.arrayBuffer())
        .then(appendToBuffer);

      success('Streaming');

    }
    function initSegmentAdded() {
      sourceBuffer.removeEventListener('updateend', initSegmentAdded);
      index = 1;
      fetchAndAppendToBuffer(`${BASE_URL}${params.name}0.m4s`).then(fetchNext);
    }
    function checkIfStuck() {
      const cT = video.currentTime;
      clearTimeout(stuckTimeout);
      stuckTimeout = setTimeout(()=>{
        if(!video.paused && video.currentTime === cT) {
          video.currentTime = video.currentTime - 0.5;
        }
      }, 500);
    }
    function bufferOnTimeUpdate() {
      const onTimeUpdate = (e)=>{
        if(video.currentTime >= (sourceBuffer.buffered.end(0) - 2.0)) {
          if(!isFetching) {
            if(index >= params.numberOfSegments) {
              video.removeEventListener('timeupdate', onTimeUpdate);
              endStream();
              return;
            }
            const url = `${BASE_URL}${params.name}${index.toString()}.m4s`;
            index += 1;
            fetchAndAppendToBuffer(url).then(checkIfStuck);
          }
        }
      }
      video.addEventListener('timeupdate', onTimeUpdate);
    }
    function fetchNext() {
      const url = `${BASE_URL}${params.name}${index.toString()}.m4s`;
      index += 1;
      if(index >= params.numberOfSegments) {
        endStream();
      } else {
        if(canPlay) {
          fetchAndAppendToBuffer(url).then(bufferOnTimeUpdate);
        } else {
          fetchAndAppendToBuffer(url).then(fetchNext);
        }

      }
    }
    function appendToBuffer(videoChunk) {
      if (videoChunk) {
        sourceBuffer.appendBuffer(new Uint8Array(videoChunk));
      }
    }
    function fetchAndAppendToBuffer(url) {
      isFetching = true
      return fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          return new Promise((success, reject)=>{
            const updateEnd = ()=>{
              sourceBuffer.removeEventListener('updateend', updateEnd);
              isFetching = false;
              success('appended');
            }
            sourceBuffer.addEventListener('updateend', updateEnd);
            sourceBuffer.appendBuffer(new Uint8Array(buffer));
          });
        }).catch(e=>{
          //
        });
    }
    function endStream() {
      if (!sourceBuffer.updating && ms.readyState === 'open') {
        ms.endOfStream();
      }
    }
  });

}
/**
* Sets the source of a video element to a stream. Fallbacks to HLS when DASH is not possible. Uses DashPlayer internally.
* @public
* @class
* @param {string} params - an object width dashparams containing duration, codecsString, numberOfSegments, name and baseUrl. And an hls manifest string.
* @param {HTMLVideoElement} videoElem - the video element that should play the stream
* @returns {Promise.<string>} a Promise that resolves with a success message or rejects with an Error, see {@link StreamedByMessages}.
*/
export function StreamedByFaster(params, videoElem) {
  return new Promise((ohYeah, ohNo)=>{
    const dash = DashPlayer(params.dash, videoElem);
    dash.then(success=>{
       ohYeah(StreamedByMessages.DASH)
    }, reject=>{
      if(videoElem.canPlayType('application/x-mpegURL') === 'maybe' || videoElem.canPlayType('application/x-mpegURL') === 'probably') {
        try {
          //if Samsung
          if(navigator.userAgent.match(/SamsungBrowser/i)) {
            if(params.smsng) {
              videoElem.src = params.smsng
            } else {
              throw 'no manifest for Samsung Internet';
            }
          } else {
            if(params.hls) {
              const hlsMimeType = "application/vnd.apple.mpegurl";
              videoElem.type = hlsMimeType;
              videoElem.src = `data:${hlsMimeType};base64,${btoa(params.hls)}`;
            } else {
              videoElem.src = `${params.dash.baseUrl}${params.name}.m3u8`;
            }
          }
        } catch(e) {
          ohNo(e);
        }
        ohYeah(StreamedByMessages.HLS);
      } else {
        ohNo(reject);
      }
    }).catch((err)=>{
      ohNo(err);
    });
  });
}
