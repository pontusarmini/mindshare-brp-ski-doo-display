require('intersection-observer');

var perc = 0;
export function fakeSf(elem){
  window.$sf = {
    ext: {
      register: (width, height, cb)=>{
        createObserver(elem, (entries, observer)=>{
          //console.log(entries);
          perc = entries[0].intersectionRatio;
          cb();
        })
      },
      inViewPercentage: ()=>{
        return parseInt(perc * 100);
      }
    }
  };
}

function createObserver(elem, cb) {
    var observer;

    var options = {
      root: null,
      rootMargin: "0px",
      threshold:  [0, 0.25, 0.5, 0.75, 1]
    };

    observer = new IntersectionObserver(cb, options);
    observer.observe(elem);
}
