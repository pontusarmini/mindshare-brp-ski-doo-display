import { CueListener } from './cuelistener';

class EventAction {
  constructor(videoElem, eventElem) {
    this.videoElem = videoElem;
    this.eventElem = eventElem;
    this.action = undefined;
    this._toggleAction = undefined;
    this._cb = undefined;
  }
  toggleAction() {
    if(this._toggleAction) {
      this._toggleAction();
    }
  }
  cb(ev) {
    if(this._cb) {
      this._cb(ev)
    }
  }
  andGetCallback(cb) {
    this._cb = cb;
    return this;
  }
  toggleClass(classToToggle) {
    this._toggleAction = ()=>{
      if(this.eventElem) {
        this.eventElem.classList.toggle(classToToggle)
      }
    }
    return this;
  }
  andToggleClass(classToToggle) {
    return this.toggleClass(classToToggle);
  }
}
class ClickOnAction extends EventAction {
  constructor(videoElem, clickElem) {
    super(videoElem, clickElem);
    this.setupClick();
  }
  setupClick() {
    this.eventElem.addEventListener('click', e=>{
      e.preventDefault();
      e.stopPropagation();
      if(this.action) {
        this.action(e);
      }
    }, false);
  }
  get toggleSound() {
    this.action = (e)=>{
      let pressed;
      if(this.videoElem.muted) {
        this.videoElem.muted = false;
        pressed = 'unmute';
      } else {
        this.videoElem.muted = true;
        pressed = 'mute';
      }
      this.cb({
          pressed,
          originalEvent: e
      });
      this.toggleAction();
    }
    return this;
  }
  get togglePlay() {
    this.action = (e)=>{
      let pressed;
      if(this.videoElem.paused) {
        this.videoElem.play();
        pressed = 'play';
      } else {
        this.videoElem.pause();
        pressed = 'pause';
      }
      this.cb({
          pressed,
          originalEvent: e
      });
      this.toggleAction();
    }
    return this;
  }
}
const WaitingActionTypes = {
  ADD: 'add',
  REMOVE: 'remove',
}

class WaitingAction extends EventAction {
  constructor(videoElem) {
    super(videoElem, null);
    this.cssClass = undefined;
    this.type = 'add'
    this.eventElems = [];
  }

  onElement(elem) {
    this.eventElem = elem;
    this.setupListening()
    return this;
  }
  onElements(elems) {
    this.eventElems = elems;
    this.setupListening();
    return this;
  }
  get show() {
    this.type = 'show';
    return this;
  }
  element(elem) {
    if(this.type === 'show') {
      elem.style.opacity = 0;
      elem.style.pointerEvents = 'none';
    }
    this.eventElems.push(elem);
    this.setupShowListening();
  }
  setupShowListening() {
    const listener = ev => {
      if(ev.type === 'playing') {
        this.eventElems.forEach(elem=>{
          elem.style.opacity = 0;
          elem.style.pointerEvents = 'none';
        });
      }
      if(ev.type === 'waiting') {
        this.eventElems.forEach(elem=>{
          elem.style.opacity = 1;
          elem.style.pointerEvents = 'auto';
        });
      }
    }
    this.videoElem.addEventListener('playing', listener, false);
    this.videoElem.addEventListener('waiting', listener, false);
  }
  setupListening() {
    const listener = (ev)=>{
      let action;
      if(ev.type === 'playing') {
        action = this.type === 'add' ? 'remove' : 'add';
      }
      if(ev.type === 'waiting') {
        action = this.type;
      }
      if(this.eventElems.length > 0) {
        this.eventElems.forEach(elem=>{
          elem.classList[action](this.cssClass);
        })
      } else {
        this.eventElem.classList[action](this.cssClass);
      }
      this.cb(ev);
    }
    this.videoElem.addEventListener('playing', listener, false);
    this.videoElem.addEventListener('waiting', listener, false);
    return this;
  }
  addClass(classToAdd) {
    this.cssClass = classToAdd;
    this.type = 'add';
    return this;
  }
  removeClass(classToRemove) {
    this.cssClass = classToRemove;
    this.type = 'remove';
    return this;
  }
  setupAddClassListener() {
    const listener = (ev)=>{
      if(ev.type === 'playing') {
        this.eventElem.classList.add(this.classToToggle);
      }
      if(ev.type === 'waiting') {
        this.eventElem.classList.remove(this.classToToggle);
      }
      this.cb(ev);
    }
    this.videoElem.addEventListener('playing', listener, false);
    this.videoElem.addEventListener('waiting', listener, false);
    return this;
  }
}
/**
* A set of convenience methods for use in a video ad
* @public
*
*/
export class PlayerUtils {
  constructor(videoElem){
    this.videoElem = videoElem;
    this.cueListener = new CueListener(videoElem);
    this.onPlayPauseCb = undefined;
    this.onplaying = false;
    this.onpause = false;
    this.playPromise = undefined;
  }
  get whenLoading() {
    return new WaitingAction(this.videoElem);
  }
  onClickOn(elem) {
    return new ClickOnAction(this.videoElem, elem);
  }
  getLoopCount(func) {
    this.cueListener.getLoopCount(func);
  }
  loop(xTimes) {
    return this.cueListener.loop(xTimes);
  }
  stopGettingLoopCount() {
    this.cueListener.stopGettingLoopCount();
  }
  queueCue(start, end, text, func) {
    this.cueListener.listenToCue(start, end, text, func);
  }
  stopListenToCue(cue) {
    this.cueListener.stopListenToCue(cue);
  }
  getTimingUpdatesOnce(timingObj, cb) {
    this.cueListener.getTimingUpdatesOnce(timingObj, cb);
  }
  getTimingUpdatesContinously(timingObj, cb) {
    this.cueListener.getTimingUpdatesContinously(timingObj, cb);
  }
  startListeningToCues() {
    this.cueListener.lockCues();
  }
  play() {
    if(this.videoElem.paused) {
      return this.playPromise = this.videoElem.play();
    }
  }
  pause() {
    if(this.playPromise !== undefined) {
      this.playPromise.then(_=>{
        this.videoElem.pause();
      }).catch(error=>{
        //play was prevented
        //console.log(error);
      });
    } else {
      this.videoElem.pause();
    }
  }
}
