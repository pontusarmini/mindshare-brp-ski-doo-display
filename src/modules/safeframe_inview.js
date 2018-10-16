export default function getSafeFrameInViewUpdates(width, height, cb, minPerc) {
  let sf, ext, callback;
  try {
    sf = window.$sf || window.parent.$sf;
    ext = sf && sf.ext;
    let minimumPercentage = minPerc ? minPerc : 0;
    var currentlyInView = false;
    callback = ()=>{
      let percentage = $sf.ext.inViewPercentage();
      if(percentage > minimumPercentage && !currentlyInView) {
        currentlyInView = true;
        cb(true);
      } else if(percentage <= minimumPercentage && currentlyInView) {
        currentlyInView = false;
        cb(false);
      }
    };
  } catch(e) {
    return false;
  }
  if(ext) {
    try {
      ext.register(width, height, callback);
      return true;
    } catch(e) {
      return false;
    }
  } else {
    return false;
  }
}
