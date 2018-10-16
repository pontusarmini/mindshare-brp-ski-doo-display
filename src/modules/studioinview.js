export function inView(callback, options) {
  return new Promise((resolve, reject)=>{
    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          defaultPercentage = 0.5,
          defaultCheckRate = 500,
          percentage = options ? (options.percentage ? options.percentage : defaultPercentage) : defaultPercentage,
          checkRate = options ? (options.checkRate ? options.checkRate : defaultCheckRate) : defaultCheckRate;
    let parentHasCheckedIn = false;
    const listener = function(msg){
      try {
        var message = JSON.parse(msg.data);
        if(message.uid && message.uid === uid) {
          callback(message.inView);
          if(!parentHasCheckedIn) {
            resolve('contact');
            parentHasCheckedIn = true;
          }
        }
      } catch(e) {}
    }
    window.addEventListener('message', listener, false);

    Enabler.invokeExternalJsFunction(`(function() {
      try {
        var adFrame = document.querySelector('iframe');
        if(!adFrame) {
          return;
        }
        var checkedOnLoad = false;
        var isInViewPort;
        var interval = setInterval(function(){
          if(!checkedOnLoad) {
            isInViewPort = isElementInViewport(frameElement, ${percentage});
            var messageObj = {
              uid: \"${uid}\",
              inView: isInViewPort
            };
            adFrame.contentWindow.postMessage(JSON.stringify(messageObj), '*');
            checkedOnLoad = true;
          } else {
            var currentStatus = isElementInViewport(frameElement, ${percentage});
            if(currentStatus !== isInViewPort) {
              var newStatus = {
                uid: \"${uid}\",
                inView: currentStatus
              };
              adFrame.contentWindow.postMessage(JSON.stringify(newStatus), '*');
              isInViewPort = currentStatus;
            }
          }
        }, ${checkRate});
        function isElementInViewport (el, percentage) {
          var rect = el.getBoundingClientRect();
          var intersection = {
            t: rect.bottom,
            r: window.top.innerWidth - rect.left,
            b: window.top.innerHeight - rect.top,
            l: rect.right
          };
          var threshold = {
            x: percentage * rect.width,
            y: percentage * rect.height
          };
          return (
            intersection.t > threshold.y &&
            intersection.r > threshold.x &&
            intersection.b > threshold.y &&
            intersection.l > threshold.x
          );
        }
      } catch(e) {}
    })()`);
    setTimeout(()=>{
      if(!parentHasCheckedIn) {
        window.removeEventListener('message', listener, false);
        reject('no_contact');
      }
    }, 3000);
  });
}
/*
* Anropa funktionen så här. 'isInView' är en boolean.
*

inView((isInView)=>{
  isInView ? videoElem.play() : videoElem.pause();
}).catch(()=>{
  track('unmeasureable')
});
*/
