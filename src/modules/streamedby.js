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
* @param {string} baseUrl - the url to the folder containing the manifest and chunk files
* @param {string} manifestPath - the filename of the .mpd manifest
* @param {HTMLVideoElement} videoElem - the video element that should play the stream
* @returns {Promise.<string>} a Promise that resolves with a success string or an Error.
*/
function DashPlayer(baseUrl, manifestPath, videoElem) {

  let numberOfChunks,
      initUrl,
      mimeType,
      codecs,
      sourceBuffer,
      ms,
      segmentURLs,
      index = 0,
      isFetching = false,
      stuckTimeout = undefined,
      canPlay = false;

  const video = videoElem,
        BASE_URL = baseUrl;

  return new Promise((success, reject) =>{

    if (!window.MediaSource) {
      reject(new Error(StreamedByMessages.NO_MEDIA_SOURCE));
    }

    fetch(`${BASE_URL}${manifestPath}`)
          .then(response => {
            if (!response.ok) { throw new Error(StreamedByMessages.FETCH_ERROR) }
            return response.text()
          })
          .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
          .then(parseManifest)
          .then(init)
          .catch(error=>{
            reject(error)
          });

    function parseManifest(xml) {
      try {
        const rep = xml.querySelectorAll("Representation");
        segmentURLs = rep[0].querySelectorAll('SegmentURL');
        mimeType = rep[0].getAttribute("mimeType");
        codecs = rep[0].getAttribute("codecs");
        numberOfChunks = segmentURLs.length;
        initUrl = xml.querySelector('Initialization').getAttribute('sourceURL');
      } catch(e) {
        throw new Error(StreamedByMessages.MANIFEST_ERROR);
        return;
      }
      if(segmentURLs.length === 0 || !mimeType || !codecs || !initUrl) {
        throw new Error(StreamedByMessages.MANIFEST_ERROR);
      }
    }

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
        sourceBuffer = ms.addSourceBuffer(`${mimeType}; codecs=${codecs}`);
      } catch(e) {
        reject(new Error(StreamedByMessages.SOURCE_BUFFER_ERROR));
        return;
      }

      sourceBuffer.addEventListener('updateend', initSegmentAdded);

      fetch(`${BASE_URL}${initUrl}`)
        .then(response => response.arrayBuffer())
        .then(appendToBuffer);

      success('Streaming');

    }
    function initSegmentAdded() {
      sourceBuffer.removeEventListener('updateend', initSegmentAdded);
      const url = `${BASE_URL}${segmentURLs[0].getAttribute('media')}`;
      index = 1;
      fetchAndAppendToBuffer(url).then(fetchNext);
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
            if(index >= numberOfChunks) {
              video.removeEventListener('timeupdate', onTimeUpdate);
              endStream();
              return;
            }
            const url = `${BASE_URL}${segmentURLs[index].getAttribute('media')}`;
            index += 1;
            fetchAndAppendToBuffer(url).then(checkIfStuck);
          }
        }
      }
      video.addEventListener('timeupdate', onTimeUpdate);
    }
    function fetchNext() {
      const url = `${BASE_URL}${segmentURLs[index].getAttribute('media')}`;
      index += 1;
      if(index >= numberOfChunks) {
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
* @param {string} baseUrl - the url to the folder containing the manifest and chunk files
* @param {string} manifestPath - the filename of the .mpd/.m3u8 manifests without file extensions
* @param {HTMLVideoElement} videoElem - the video element that should play the stream
* @returns {Promise.<string>} a Promise that resolves with a success message or rejects with an Error, see {@link StreamedByMessages}.
*/
export function StreamedBy(baseUrl, manifestPath, videoElem) {
  return new Promise((ohYeah, ohNo)=>{
    const dash = DashPlayer(baseUrl, `${manifestPath}.mpd`, videoElem);
    dash.then(success=>{
       ohYeah(StreamedByMessages.DASH)
    }, reject=>{
      console.log('reject: ', reject);
      if(videoElem.canPlayType('application/x-mpegURL') === 'maybe' || videoElem.canPlayType('application/x-mpegURL') === 'probably') {
        videoElem.src = `${baseUrl}${manifestPath}.m3u8`;
        ohYeah(StreamedByMessages.HLS);
      } else {
        ohNo(reject);
      }
    }).catch((err)=>{
      console.log('err', err);
    });
  });
}
