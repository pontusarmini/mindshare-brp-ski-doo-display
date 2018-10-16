import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch'

import './scss/980x600.scss';
import { StreamedByFaster } from './modules/streamedbyfaster';
import { PlayerUtils } from './modules/playerutils';
import getSafeFrameInViewUpdates from './modules/safeframe_inview';
//import { fakeSf } from './modules/fake_safeframe';

import { params } from './assets/9801/params';

const select = document.querySelector.bind(document),
      banner = select('.banner'),
      videoElem = select('#video'),
      playerUtils = new PlayerUtils(videoElem),
      soundBtn = select('#sound'),
      playBtn = select('.play'),
      logo = select('.logo'),
      fallback = select('.fallback'),
      CAMPAIGN = 'mindshare-ski-doo-9801',
      PROJECTNUMBER = 'mndshrescters',
      CLICKURL = 'https://ad.doubleclick.net/ddm/trackclk/N333003.1922736AMEDIA.NO/B21832408.231476720;dc_trk_aid=429339830;dc_trk_cid=107409421;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=';

      //fakeSf(banner);

      let loopCount = 0,
          endedListenerAdded = false,
          inViewPossible = getSafeFrameInViewUpdates(980, 600, inViewListener, 25),
          autoplayAvailable = true,
          noStreaming = false;

      impression()
      addExit();
      StreamedByFaster(params, videoElem).then(streaming, notStreaming);

      function streaming() {
        banner.classList.add('loaded');
        if(!inViewPossible) {
          playVideo();
          track('unmeasurable')
        } else {
          playerUtils.getTimingUpdatesOnce(params.timings, timing=>{
            track(timing);
          });
        }
        playerUtils.onClickOn(soundBtn).toggleSound.andToggleClass('on').andGetCallback(e=>{
          track(e.pressed);
        })
        playerUtils.queueCue(27.2, 29.9, 'hidden', (ev, txt)=>{
          ev === 'enter' ? logo.classList.add(txt) : logo.classList.remove(txt);
          if(ev === 'exit') {
            ended();
          }
        });
        playerUtils.startListeningToCues()
        playBtn.addEventListener('click', e=>{
          e.stopPropagation();
          track('play');
          soundBtn.classList.remove('hidden');
          playBtn.classList.add('hidden');
          banner.classList.remove('ended');
          banner.classList.remove('noautoplay');
          videoElem.currentTime = 0;
          videoElem.play();
          videoElem.loop = false;
          if(!endedListenerAdded) {
            videoElem.addEventListener('ended', ended, false);
            endedListenerAdded = true;
          }
        }, false);
        videoElem.addEventListener('playing', ()=>{
          if(!autoplayAvailable) {
            banner.classList.remove('noautoplay');
            playBtn.classList.add('hidden');
          }
        }, false);
      }

      function notStreaming() {
        banner.classList.add('loaded');
        track('fallback');
        fallback.style.backgroundImage = 'url(poster.jpg)';
        banner.classList.add('ended');
        soundBtn.classList.add('hidden');
        playBtn.classList.add('hidden');
        videoElem.classList.add('hidden');
      }

      function noAutoPlay() {
        if(noStreaming === false) {
          autoplayAvailable = false;
          banner.classList.add('noautoplay');
          playBtn.classList.remove('hidden');
        }
      }

      function ended() {
        videoElem.pause();
        videoElem.currentTime = 5.0
        banner.classList.add('ended');
        soundBtn.classList.add('hidden');
        playBtn.classList.remove('hidden');
      }

      function inViewListener(isInView) {
        if(autoplayAvailable) {
          isInView ? playVideo() : videoElem.pause();
        }
      }

      function playVideo() {
        let failed = false
        try {
          const playPromise = videoElem.play();
          if (playPromise !== undefined) {
            playPromise.then(function() {
              // Automatic playback started!
            }).catch(function(error) {
              // Automatic playback failed.
              // Show a UI element to let the user manually start playback.
              failed = true;
              noAutoPlay();
            });
          }
        } catch(e) {
          noAutoPlay()
        }
        setTimeout(()=>{
          if(videoElem.currentTime === 0) {
            if(!failed) {
              noAutoPlay();
            }
          }
        }, 2000);
      }

      function impression() {
        track('impression');
        addPxl(`https://ad.doubleclick.net/ddm/trackimpj/N333003.1922736AMEDIA.NO/B21832408.231476720;dc_trk_aid=429339830;dc_trk_cid=107409421;ord=${Date.now()};dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=?`)
      }

      function track(counter) {
        const src = `https://dwdd02ymf0wbc.cloudfront.net?c=${CAMPAIGN}&count=${counter}&ord=${new Date().getTime()}&po=${PROJECTNUMBER}`;
        addPxl(src);
      }
      function addPxl(src) {
        const pxl = document.createElement('img');
        pxl.src = src;
        pxl.width = 1;
        pxl.height = 1;
        pxl.classList.add('pxl');
        banner.appendChild(pxl);
      }
      function addExit() {
        banner.addEventListener('click', ()=>{
          window.open(`${window.name ? decodeURI(window.name) : ''}${CLICKURL}`, '_blank');
          track('exit');
        }, false);
      }
