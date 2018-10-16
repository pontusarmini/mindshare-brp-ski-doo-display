import { VTTCuePolyfill } from './vttcue'
export class CueListener {
  constructor(videoElem) {
    VTTCuePolyfill();
    this.videoElem = videoElem;
    this.textTrack = videoElem.addTextTrack('metadata', 'cue');
    this.loopCount = 0;
    this.firstLoopCue = null;
    this.loopCue = null;
    this.firstRun = true;
    this.cuesNotYetAdded = [];
    this.reportAfterLoopCount = null;
  }
  listenToCue(start, end, text, func, enterOnly) {
    if(!end) {
      end = start + 0.1;
    }
    const newCue = this.getCue(start, end, text)//new VTTCue(start, end, text);

    const enterListener = ()=>{
      if(enterOnly) {
        func(text);
      } else {
        func('enter', text);
      }
    };
    newCue.addEventListener('enter', enterListener, false);
    if(!enterOnly){
      const exitListener = ()=>{
        func('exit', text);
      };
      newCue.addEventListener('exit', exitListener, false);
    }
    return newCue;
  }
  listenToCueOnce(start, end, text, func, enterOnly) {
    const cue = this.listenToCue(start, end, text, (ev, text)=>{
      if(ev === 'enter') {
        if(enterOnly) {
          func(ev, text);
          this.stopListenToCue(cue);
          return;
        }
      } else {
        func(ev, text);
        this.stopListenToCue(cue);
      }
    }, enterOnly);
  }
  stopListenToCue(cue) {
    this.textTrack.removeCue(cue);
  }
  getLoopCount(func) {
    // If the video is a stream, we will not get the video duration until everything is played.
    // Hence first loop at the beginning
    this.firstLoopCue = this.getCue(0.2, 0.5, 'first loop');//new VTTCue(0.2, 0.5, 'first loop');
    const firstLoopListener = (ev)=>{
      if(this.firstRun) {
        this.firstRun = false;
      } else {
        this.loopCount++;
        func(this.loopCount);
        this.loopCue = new VTTCue(this.videoElem.duration - 0.2, this.videoElem.duration - 0.1, 'loop');
        const loopListener = ()=>{
          this.loopCount++;
          func(this.loopCount);
        }
        this.loopCue.addEventListener('enter', loopListener, false);
        this.textTrack.addCue(this.loopCue);
        if(this.firstLoopCue){
          this.textTrack.removeCue(this.firstLoopCue);
          this.firstLoopCue = undefined;
        }
      }

    };
    this.firstLoopCue.addEventListener('enter', firstLoopListener, false);
    //this.textTrack.addCue(this.firstLoopCue);
  }
  addEndOfLoopListener(func) {

  }
  loop(xTimes) {
    this.reportAfterLoopCount = xTimes;
    return this;
  }
  timesThenDo(func) {
    if(!this.reportAfterLoopCount) {
      console.warn('first call method \'loop(xTimes)\'');
      return;
    }
    this.getLoopCount((n)=>{
      if(n === this.reportAfterLoopCount) {
        func();
        this.stopGettingLoopCount();
      }
    });
    return this;
  }
  stopGettingLoopCount() {
    if(this.firstLoopCue) {
      this.textTrack.removeCue(this.firstLoopCue);
      this.firstLoopCue = undefined;
    }
    if(this.loopCue) {
      this.textTrack.removeCue(this.loopCue);
      this.loopCue = undefined;
    }
  }
  getTimingUpdatesOnce(timingObject, cb) {
    for (let prop in timingObject) {
      this.listenToCueOnce(timingObject[prop], timingObject[prop] + 0.1, prop, cb, true);
    }
  }
  getTimingUpdatesContinously(timingObject, cb) {
    for (let prop in timingObject) {
      this.listenToCue(timingObject[prop], timingObject[prop] + 0.1, prop, cb, true);
    }
  }
  getCue(start, end, text) {
    const newCue = new VTTCue(start, end, text);
    const cueObject = {
      start: start,
      cue: newCue
    }
    this.cuesNotYetAdded.push(cueObject);
    return newCue;
  }
  lockCues() {
    this.cuesNotYetAdded.sort((a, b)=>{
      return a.start - b.start;
    });
    this.cuesNotYetAdded.forEach((cueObject)=>{
      this.textTrack.addCue(cueObject.cue);
    });
  }
  startListening() {
    this.lockCues();
  }
  start() {
    this.lockCues();
  }
}
