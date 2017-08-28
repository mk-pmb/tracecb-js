/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var arSlc = Array.prototype.slice, rgx = {
  colorCodes: /\x1b\[[0-9;]*m/g,
};


function err2stack(e) {
  return String(e.stack
    ).replace(rgx.colorCodes, ''  // packages like "pretty-error", "usnam-pmb"
    ).replace(/\s+$/, ''
    ).replace(/\t/g, '    '
    ).split(/\s*\n\s*/);
}


function dumpFalsey(x) {
  if (x === '') { return 'empty string'; }
  return (typeof x) + ' ' + String(x);
}


function dumpCbInfo(cb) {
  cb = Object.assign({}, cb);
  delete cb.installedFrom;
  delete cb.time;
  (function (invo) {
    if (invo.length === 0) { return delete cb.invo; }
    invo.forEach(function (i) {
      delete i.time;
      delete i.from;
    });
    if (invo.length === 1) { invo = invo[0]; }
    cb.invo = invo;
  }(cb.invo));
  console.dir(cb);
}


function makeTracer() {
  if (arguments.length !== 0) {
    throw new Error('The tracer factory accepts no arguments.'
      + ' Pass your callback to a tracer, not its factory.');
  }

  function traceCb(hint, origCb) {
    if (hint && hint.apply) {
      origCb = hint;
      hint = undefined;
    } else if (!origCb) {
      traceCb.cbs.push({ hint: hint,
        from: err2stack(new Error(dumpFalsey(origCb))) });
      return origCb;
    }
    function logCb() {
      var threw = false, invo = { ctx: this, args: arSlc.call(arguments),
        from: err2stack(new Error('invoked from:')),
        time: Date.now(), threw: null, };
      logCb.invo.push(invo);
      logCb.invoCnt += 1;
      try {
        invo.result = origCb.apply(this, invo.args);
      } catch (err) {
        threw = (err || new Error('[false-y] ' + String(err)));
      }
      invo.threw = threw;
      if (threw) { throw threw; }
      return invo.result;
    }
    logCb.invoCnt = 0;
    if (origCb.name) { logCb.origName = origCb.name; }
    if (hint !== undefined) { logCb.hint = hint; }
    logCb.installedFrom = err2stack(new Error('installed from:'));
    logCb.invo = [];
    traceCb.cbs.push(logCb);
    return logCb;
  }

  traceCb.cbs = [];
  traceCb.dumpLog = function () { traceCb.cbs.forEach(dumpCbInfo); };
  traceCb.nextCb = function (hint, task) {
    // Intercept task(args, …, next) to check whether it calls next().
    if (hint && hint.apply) {
      task = hint;
      hint = undefined;
    }
    return function interceptedTask() {
      var ar = Array.prototype.slice.call(arguments), nx = ar[ar.length - 1];
      if (!(nx || false).apply) { throw new Error('no next task'); }
      nx = traceCb(hint, nx);
      nx.taskName = task.name;
      ar[ar.length - 1] = nx;
      return task.apply(this, ar);
    };
  };
  return traceCb;
}






module.exports = makeTracer;
