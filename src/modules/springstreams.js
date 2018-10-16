export function SpringStreams(f) {
  this.version = "2.2.1";
  var q = "tns-cs.net";
  var e = 200;
  var n = 2000;
  var R = "default";
  var H = new Array();
  this.namespace = "com.kma.springstreams";
  this.syncrate = 20;
  this.pausesync = 6;
  this.maxstates = 50;
  var O = {
    "+": "%2B",
    ",": "%2C",
    ";": "%3B",
    "=": "%3D",
    "~": "%7E",
    "*": "%2A",
    "'": "%27",
    "!": "%21",
    "(": "%28",
    ")": "%29"
  };
  var a = this;
  this.pageContext;
  var P;
  B(o());
  if (f) {
    R = f
  }
  y();

  function o() {
    var m = {
      "2cnt.net": {
        syncrates: [3, 7, 10, 10, 10, 10, 10, 60]
      }
    };
    return m
  }

  function B(S) {
    var T;
    if (S) {
      for (var m in S) {
        if (m == q) {
          T = S[m]
        }
      }
      if (T) {
        D(T.syncrates)
      }
    }
  }

  function D(m) {
    if (m) {
      P = m
    }
  }

  function I() {
    return P
  }
  this.getSyncRates = I;

  function u(U, S, m) {
    if (a.pageContext === undefined) {
      a.pageContext = a.defaultPageContext
    }
    if (!U) {
      return
    }
    var T = new x(this, U, S, m);
    H.push(T);
    return T
  }
  this.track = u;

  function y() {
    setInterval(k, e);
    setInterval(s, n)
  }

  function b() {
    for (var m = 0; m < H.length; ++m) {
      try {
        H[m].stop()
      } catch (S) {
        E(S)
      }
    }
  }
  this.unload = b;

  function k(T) {
    for (var m = 0; m < H.length; ++m) {
      try {
        H[m].update(T)
      } catch (S) {
        E(S)
      }
    }
  }
  this.doUpdate = k;

  function s(T) {
    for (var m = 0; m < H.length; ++m) {
      try {
        H[m].sync(T)
      } catch (S) {
        E(S)
      }
    }
  }
  this.doSync = s;

  function E(m) {
    F("", m)
  }
  this.error = E;

  function v(S, m) {
    return w([
      [S, m]
    ])
  }

  function G(m) {
    if (m && m.site != undefined) {
      return m.site
    }
    return R
  }

  function z(m) {}
  this.debug = z;

  function l() {
    if (a.pageContext.getWindowLocationURL() === undefined) {
      return "http://"
    }
    if ("https" == a.pageContext.getWindowLocationURL().slice(0, 5)) {
      return "https://ssl-"
    } else {
      return "http://"
    }
  }

  function K() {
    if (!a.nlso) {
      try {
        var m = "";
        var T = "i00";
        if (a.pageContext.getUniqueId != undefined) {
          T = q
        }
        m = a.pageContext.getLocalStorageItem(T);
        if (m) {
          return "&c=" + m
        } else {
          var S = "0000",
            V = S + Math.ceil((new Date()).getTime() / 1000).toString(16) + (32768 | Math.random() * 65535).toString(16) + S;
          a.pageContext.setLocalStorageItem(T, V)
        }
      } catch (U) {
        console.log("error" + U)
      }
    }
    return ""
  }

  function F(T, S) {
    if (typeof(S.stream) == "undefined" || S.stream == "") {
      console.warn("Stream is mandatory for measurement");
      a.debug("Stream is mandatory for measurement")
    } else {
      var m = l() + G(S) + "." + q + "/j0=" + v(T, S) + "?lt=" + (new Date()).getTime().toString(36) + K();
      a.pageContext.preloadImage(m);
      a.debug(m)
    }
  }
  this.send = F;

  function w(U) {
    var S;
    var V;
    var T;
    var m;
    var W = /[+&,;=~!*'()]/g;
    var X;
    switch (typeof U) {
      case "string":
        return W.test(U) ? encodeURIComponent(U).replace(W, function(Y) {
          var Z = O[Y];
          if (Z) {
            return Z
          }
          return Y
        }) : encodeURIComponent(U);
      case "number":
        return isFinite(U) ? U.toString() : "null";
      case "boolean":
      case "null":
        return U.toString();
      case "object":
        if (!U) {
          return "null"
        }
        S = [];
        if (typeof U.length == "number" && !(U.propertyIsEnumerable("length"))) {
          m = U.length;
          for (V = 0; V < m; V += 1) {
            S.push(w(U[V]) || "null")
          }
          return "," + S.join("+") + ";"
        }
        for (T in U) {
          if (typeof T == "string") {
            if (T != "site") {
              X = w(U[T]);
              if (X) {
                S.push(w(T) + "=" + X)
              }
            }
          }
        }
        return "," + S.join("+") + ";"
    }
    return ""
  }

  function x(ao, al, am, ap) {
    function an() {
      var av = Math.round((Math.random() * 10000000000)).toString(36);
      var aw = new Date().getTime().toString(36);
      return aw + av
    }
    var ai = an();
    var W = Math.round(new Date().getTime() / 1000);
    var ad;
    var at;
    var ag;
    var ab;
    var X = [0, 0, W.toString(36)];
    var Y = 0;
    var au = 0;
    var Z = true;
    var T = false;
    var ah;
    var V;
    var S;
    var m;
    var ar = 0;
    ad = ao;
    at = al;
    if (ap) {
      ah = ap
    } else {
      ah = ad.HTML5Adapter
    }
    ab = aj(am);
    ag = new Array();
    ag.push(X);
    m = 0;
    V = ao.syncrate;
    S = ao.getSyncRates();
    af();

    function aj(ax) {
      var av = new Object();
      for (var aw in ax) {
        av[aw] = ax[aw]
      }
      return av
    }

    function aq(av) {
      if (ag.length < ad.maxstates) {
        ag.push(av)
      }
    }

    function U(av) {
      X = [av, av, Math.round(new Date().getTime() / 1000).toString(36)];
      aq(X);
      Z = true;
      Y = 0
    }

    function af() {
      if (S != null) {
        if (m < S.length) {
          V = S[m++];
          ad.debug("switch syncrate to " + V)
        }
      }
    }

    function ae(av) {
      setTimeout(function() {
        if (av == Math.round(ah.getPosition(at)) || av + 1 == Math.round(ah.getPosition(at))) {
          ar++
        } else {
          ar = 0
        }
        if (ar >= 5) {
          var aw;
          if (av == Math.round(ah.getPosition(at))) {
            aw = av
          } else {
            aw = av + 1
          }
          ar = 0;
          if (aw - X[1] > 1 || X[1] - aw > 1) {
            U(aw)
          }
        }
      }, 1000)
    }

    function aa(ay) {
      if (T) {
        return
      }
      var av = X[1];
      var aw = av;
      try {
        aw = Math.round(ah.getPosition(at))
      } catch (az) {}
      try {
        if (av == aw) {
          if (Y >= 0) {
            Y++;
            if (Y == ad.pausesync) {
              Z = true
            }
          }
          return
        }
        if (Y >= ad.pausesync) {
          U(aw)
        } else {
          if (av < aw - 1) {
            ae(aw)
          } else {
            if (av > aw) {
              ae(aw)
            } else {
              X[1] = aw;
              if (X[1] - X[0] >= V) {
                if (aw - au >= V) {
                  Z = true;
                  af()
                }
              }
              Y = 0
            }
          }
        }
      } catch (ax) {
        E = true;
        ad.error(ax)
      }
    }
    this.update = aa;

    function ak() {
      if (T) {
        return
      }
      Z = true;
      T = true;
      ac(null)
    }
    this.stop = ak;

    function ac(ax) {
      if (Z) {
        try {
          if (at.width) {
            ab.sx = at.width
          }
          if (at.videoWidth) {
            ab.sx = at.videoWidth
          }
          if (at.height) {
            ab.sy = at.height
          }
          if (at.videoHeight) {
            ab.sy = at.videoHeight
          }
        } catch (aw) {}
        if (a.pageContext.getUniqueId != undefined) {
          ab.psid = a.pageContext.getUniqueId()
        }
        ab.uid = ai;
        ab.pst = ag;
        var av;
        try {
          if (!ab.dur || ab.dur == 0) {
            ab.dur = ah.getDuration(at)
          }
        } catch (aw) {}
        try {
          av = ah.getMeta(at);
          if (a.pageContext.getDeviceID !== undefined && a.pageContext.getDeviceID() !== undefined) {
            av[a.pageContext.getDeviceID()["id_name"]] = a.pageContext.getDeviceID()["id_value"]
          }
        } catch (aw) {}
        ab.vt = (Math.round(new Date().getTime() / 1000)) - W;
        ab.v = "js " + a.version;
        ad.send(av, ab);
        au = X[1]
      }
      Z = false
    }
    this.sync = ac
  }

  this.memStorage = new MemStorage();

  this.defaultPageContext = {
    getLocalStorageItem: this.memStorage.getItem,
    setLocalStorageItem: this.memStorage.setItem,
    preloadImage: A,
    getWindowLocationURL: d,
  };
  this.HTML5Adapter = {
    getMeta: C,
    getPosition: r,
    getDuration: p
  };
  this.DefaultAdapter = {
    getMeta: j,
    getPosition: M,
    getDuration: N
  };
  this.WMStreamAdapter = {
    getMeta: t,
    getPosition: i,
    getDuration: g
  };
  this.RVStreamAdapter = {
    getMeta: Q,
    getPosition: L,
    getDuration: J
  };

  function C(m) {
    return {
      pl: "HTML 5 Video",
      pv: "HTML 5",
      sx: screen.width,
      sy: screen.height
    }
  }

  function p(m) {
    return Math.round(m.duration)
  }

  function r(m) {
    return m.currentTime
  }

  function j(m) {
    return {
      pl: "DEF",
      pv: version,
      sx: screen.width,
      sy: screen.height
    }
  }

  function M(m) {
    return new Date().getTime() / 1000
  }

  function N(m) {
    return 0
  }

  function t(m) {
    return {
      pl: "MSWM",
      plv: m.versionInfo,
      sx: screen.width,
      sy: screen.height
    }
  }

  function i(m) {
    if (m.CurrentPosition) {
      return m.CurrentPosition
    }
    if (m.currentPosition) {
      return m.currentPosition
    }
    if (m.controls) {
      if (m.controls.currentPosition) {
        return m.controls.currentPosition
      }
    }
    if (m.Controls) {
      if (m.Controls.currentPosition) {
        return m.Controls.currentPosition
      }
    }
    return 0
  }

  function g(m) {
    if (m.currentMedia) {
      if (m.currentMedia.Duration) {
        return m.currentMedia.Duration
      }
      if (m.currentMedia.duration) {
        return m.currentMedia.duration
      }
    } else {
      if (m.CurrentMedia) {
        if (m.CurrentMedia.duration) {
          return m.CurrentMedia.duration
        }
        if (m.CurrentMedia.Duration) {
          return m.CurrentMedia.Duration
        }
      }
    }
  }

  function Q(m) {
    return {
      pl: "RV",
      plv: m.GetVersionInfo(),
      sx: screen.width,
      sy: screen.height
    }
  }

  function L(m) {
    return (m.GetPosition() / 1000)
  }

  function J(m) {
    return (m.GetLength() / 1000)
  }

  function A(m) {
    (new Image()).src = m
  }

  function d() {
    return document.location.href
  }

  function MemStorage() {
    return {
      setItem: function(name, value) {
        this[name] = value;
      },
      getItem: function(name) {
        return this[name];
      }
    }
  }

}
SpringStreams.prototype.setPageContext = function(a) {
  this.pageContext = a
};
