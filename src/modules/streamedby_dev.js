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
      bufferQue = [],
      lastIndex;

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
      if(segmentURLs.length === 0 || !mimeType || !codecs || !initUrl) {
        throw new Error(StreamedByMessages.MANIFEST_ERROR);
      }
    }

    function init() {
      ms = new MediaSource();
      video.src = window.URL.createObjectURL(ms);
      ms.addEventListener('sourceopen', onMediaSourceOpen);
    }

    function onMediaSourceOpen() {
      try {
        sourceBuffer = ms.addSourceBuffer(`${mimeType}; codecs=${codecs}`);
      } catch(e) {
        reject(new Error(StreamedByMessages.SOURCE_BUFFER_ERROR));
        return;
      }

      sourceBuffer.addEventListener('updateend', nextSegment);

      GET(`${BASE_URL}${initUrl}`, appendToBuffer, index);

      success('Streaming');

    }

    function nextSegment(e) {
      const outOfBounds = (index + 1) > numberOfChunks;
      const url = !outOfBounds ? `${BASE_URL}${segmentURLs[index].getAttribute('media')}` : '';

      if(video.paused) {
        if(!outOfBounds){
          video.addEventListener('playing', nextSegment);
          sourceBuffer.removeEventListener('updateend', nextSegment);
          GET(url, appendToBuffer, index);
          index++;
        }
        return;
      }
      if(outOfBounds) {
        sourceBuffer.removeEventListener('updateend', nextSegment);
        return;
      }
      if(e.type === 'playing') {
        sourceBuffer.addEventListener('updateend', nextSegment);
      }
      GET(url, appendToBuffer, index);
      index++;
    }

    function appendToBuffer(videoChunk, idx) {
      if (videoChunk) {
        console.log('idx: ', idx);
        if(sourceBuffer.updating) {
          console.error('updating ', idx);
          bufferQue.push(videoChunk);
          //console.log('bufferQue.length: ', bufferQue.length);
          let listener = (e)=> {
            //console.log('updating updateend')
            sourceBuffer.removeEventListener('updateend', listener);
            if(bufferQue.length) {
              //console.log('we got que');
              //console.log('bufferQue.length in listener: ', bufferQue.length);
              sourceBuffer.appendBuffer(new Uint8Array(bufferQue.shift()));
            }
            if((idx + 1) === numberOfChunks) {
              sourceBuffer.addEventListener('updateend', (e)=> {
                if (!ms.updating && ms.readyState === 'open') {
                  ms.endOfStream();
                }
              });
            }
          };
          sourceBuffer.addEventListener('updateend', listener);
          return;
        }
        lastIndex = idx;
        sourceBuffer.appendBuffer(new Uint8Array(videoChunk));
      }
      if((idx + 1) === numberOfChunks) {
        sourceBuffer.addEventListener('updateend', (e)=> {
          if (!ms.updating && ms.readyState === 'open') {
            ms.endOfStream();
          }
        });
      }
    }

    function GET(url, callback, idx) {
      fetch(url)
        .then(response => response.arrayBuffer())
        .then((buffer) => {
          callback(buffer, idx);
        });
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
