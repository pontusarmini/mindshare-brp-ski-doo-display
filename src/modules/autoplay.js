/**
* A function that checks if muted autoplay is supported by the browser. You need to add an element like this to your html:
* <video id="ap-test" playsinline muted webkit-playsinline width="1" height="1"></video>
* @param {boolean} keepTestVideoElemWhenDone - set to true if you do not want to remove the test element after the tests are done
* @returns {Promise.<boolean>} - a Promise resolving if autoplay is possible, rejects if not
*/
export function checkIfAutoplayIsSupported(keepTestVideoElemWhenDone) {

  return new Promise((success, reject)=> {
    var timeout;
    var waitTime = 200;
    var retries = 10;
    var currentTry = 0;
    var elem = document.querySelector('#ap-test');
    var elemStyle = elem.style;

    if(!elem) {
      reject('no video elem with id #ap-test');
    }

    function testAutoplay(arg) {
      currentTry++;
      clearTimeout(timeout);

      var result = arg && arg.type === 'playing' || elem.currentTime !== 0;

      if (!result && currentTry < retries) {
        //Detection can be flaky if the browser is slow, so lets retry in a little bit
        timeout = setTimeout(testAutoplay, waitTime);
        return;
      }

      elem.removeEventListener('playing', testAutoplay, false);
      if(result) {
        success(result);
      } else {
        reject(result);
      }
      //callback(result, 'playing result');

      // Cleanup, but don't assume elem is still in the page -
      // an extension (eg Flashblock) may already have removed it.
      if(!keepTestVideoElemWhenDone) {
        if (elem.parentNode) {
          elem.parentNode.removeChild(elem);
        }
      }

    }

    //skip the test if video itself, or the autoplay
    //element on it isn't supported
    if (!(elem.canPlayType && elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '')) || !('autoplay' in elem)) {
      reject('cannot play video/mp4; codecs=\"avc1.42E01E\"')
      return;
    }

    elemStyle.position = 'absolute';
    elemStyle.height = "1px";
    elemStyle.width = "1px";
    elem.setAttribute('muted', '');
    elem.setAttribute('autoplay', '');
    elem.setAttribute('playsinline', '');

    try {
      elem.src = 'data:video/mp4;base64,AAAAFGZ0eXBNU05WAAACAE1TTlYAAAOUbW9vdgAAAGxtdmhkAAAAAM9ghv7PYIb+AAACWAAACu8AAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAnh0cmFrAAAAXHRraGQAAAAHz2CG/s9ghv4AAAABAAAAAAAACu8AAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAFAAAAA4AAAAAAHgbWRpYQAAACBtZGhkAAAAAM9ghv7PYIb+AAALuAAANq8AAAAAAAAAIWhkbHIAAAAAbWhscnZpZGVBVlMgAAAAAAABAB4AAAABl21pbmYAAAAUdm1oZAAAAAAAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAVdzdGJsAAAAp3N0c2QAAAAAAAAAAQAAAJdhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAFAAOABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAEmNvbHJuY2xjAAEAAQABAAAAL2F2Y0MBTUAz/+EAGGdNQDOadCk/LgIgAAADACAAAAMA0eMGVAEABGjuPIAAAAAYc3R0cwAAAAAAAAABAAAADgAAA+gAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAADgAAAAEAAABMc3RzegAAAAAAAAAAAAAADgAAAE8AAAAOAAAADQAAAA0AAAANAAAADQAAAA0AAAANAAAADQAAAA0AAAANAAAADQAAAA4AAAAOAAAAFHN0Y28AAAAAAAAAAQAAA7AAAAA0dXVpZFVTTVQh0k/Ou4hpXPrJx0AAAAAcTVREVAABABIAAAAKVcQAAAAAAAEAAAAAAAAAqHV1aWRVU01UIdJPzruIaVz6ycdAAAAAkE1URFQABAAMAAAAC1XEAAACHAAeAAAABBXHAAEAQQBWAFMAIABNAGUAZABpAGEAAAAqAAAAASoOAAEAZABlAHQAZQBjAHQAXwBhAHUAdABvAHAAbABhAHkAAAAyAAAAA1XEAAEAMgAwADAANQBtAGUALwAwADcALwAwADYAMAA2ACAAMwA6ADUAOgAwAAABA21kYXQAAAAYZ01AM5p0KT8uAiAAAAMAIAAAAwDR4wZUAAAABGjuPIAAAAAnZYiAIAAR//eBLT+oL1eA2Nlb/edvwWZflzEVLlhlXtJvSAEGRA3ZAAAACkGaAQCyJ/8AFBAAAAAJQZoCATP/AOmBAAAACUGaAwGz/wDpgAAAAAlBmgQCM/8A6YEAAAAJQZoFArP/AOmBAAAACUGaBgMz/wDpgQAAAAlBmgcDs/8A6YEAAAAJQZoIBDP/AOmAAAAACUGaCQSz/wDpgAAAAAlBmgoFM/8A6YEAAAAJQZoLBbP/AOmAAAAACkGaDAYyJ/8AFBAAAAAKQZoNBrIv/4cMeQ==';
    }

    catch (e) {
      reject('cannot set inline source');
      return;
    }

    // wait for the next tick to add the listener, otherwise the element may
    // not have time to play in high load situations (e.g. the test suite)
    setTimeout(function() {
      elem.addEventListener('playing', testAutoplay, false);
      timeout = setTimeout(testAutoplay, waitTime);
      try { elem.play() } catch (e) {}
    }, 0);
  });

};
