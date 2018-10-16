import { StreamedBy, StreamedByMessages } from '../modules/streamedby';
import { checkIfAutoplayIsSupported } from '../modules/autoplay'
import { VTTCuePolyfill } from '../modules/vttcue'
import { CueListener } from '../modules/cuelistener'
import { PlayerUtils } from '../modules/playerutils';
import './faulty.mpd'
import './errorcodecs.mpd'
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

// Then either:
const expect = chai.expect;
// or:
const assert = chai.assert;
chai.should();

const videoOne = document.querySelector('#test_one'),
      videoTwo = document.querySelector('#test_two'),
      videoThree = document.querySelector('#test_three'),
      videoFour = document.querySelector('#test_four'),
      waitingEl = document.querySelector('#waiting-el'),
      url = 'https://delivered-by-madington.com/client/tv2/lindex/bh/';

const faultyManifest = StreamedBy('', 'faulty', videoOne);
const faultyURL = StreamedBy('', 'typo', videoTwo);
const faultyCodec = StreamedBy('', 'errorcodecs', videoThree);
const streamedBy = StreamedBy(url, 'lindex', videoFour);

describe('Test error handling when errors in DASH manifest', function() {
  let dashOnly, HLSonly;
  before(function() {
    dashOnly = window.MediaSource && (videoOne.canPlayType('application/x-mpegURL') !== 'maybe') && (videoOne.canPlayType('application/x-mpegURL') !== 'probably');
    HLSonly = !window.MediaSource && (videoOne.canPlayType('application/x-mpegURL') !== 'maybe' || videoOne.canPlayType('application/x-mpegURL') !== 'probably');
  });

  it('Should be rejected because of faulty manifest structure', function() {
    if(dashOnly) {
      return faultyManifest.should.be.rejectedWith(Error, StreamedByMessages.MANIFEST_ERROR);
    } else {
      this.skip();
    }
  });
  it('Should be rejected because of faulty manifest URL', function() {
    if(dashOnly) {
      return faultyURL.should.be.rejectedWith(Error, StreamedByMessages.FETCH_ERROR);
    } else {
      this.skip();
    }
  });
  it('Should be rejected because of faulty codecs in manifest', function() {
    if(dashOnly) {
      return faultyCodec.should.be.rejectedWith(Error, StreamedByMessages.SOURCE_BUFFER_ERROR);
    } else {
      this.skip();
    }
  });
});

describe('Setting streaming source', function() {
  let dashPresent, dashOnly, HLSonly;
  before(function() {
    dashPresent = window.MediaSource;
    dashOnly = window.MediaSource && (videoOne.canPlayType('application/x-mpegURL') !== 'maybe') && (videoOne.canPlayType('application/x-mpegURL') !== 'probably');
    HLSonly = !window.MediaSource && (videoOne.canPlayType('application/x-mpegURL') !== 'maybe' || videoOne.canPlayType('application/x-mpegURL') !== 'probably');
  });
  it('Should be streaming with DASH', function() {
    console.log('Duration: ', videoFour.duration);
    if(dashPresent) {
      return streamedBy.should.eventually.be.equal(StreamedByMessages.DASH);
    } else {
      this.skip();
    }
  });
  it('Should be streaming with HLS', function() {
    if(HLSonly) {
      return streamedBy.should.eventually.be.equal(StreamedByMessages.HLS);
    } else {
      this.skip();
    }
  });
});

describe('Testing autoplay testing function', function() {
  let isAutoSupported;
  before(function() {
    return isAutoSupported = checkIfAutoplayIsSupported(true);
  })
  it('It should fulfill promise, either fail or succeed', function() {
    return isAutoSupported.should.be.fulfilled;
  });
})

describe('Testing CueListener', function() {
  let isAutoSupported;
  let cueWorking;
  before(function() {
    return cueWorking = new Promise((resolve, reject)=>{
      checkIfAutoplayIsSupported(true).then((success)=>{
        isAutoSupported = true;
        const cueListener = new CueListener(videoFour);
        cueListener.listenToCue(0.2, 1, 'hello', (ev, mess)=>{
          resolve('working');
          console.log(`${ev} ${mess}`);
        });
      }, (reject)=>{
        reject('no autoplay');
      })
    });
  })
  it('It should report a cue after 0.2 seconds', function() {
    if(isAutoSupported) {
      return cueWorking.should.eventually.equal("working");
    } else {
      this.skip();
    }

  });
})
