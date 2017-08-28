
<!--#echo json="package.json" key="name" underline="=" -->
tracecb
=======
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
How often was my callback called, from where, with which arguments?
<!--/#echo -->


Usage
-----

from [test.usage.js](test.usage.js):

<!--#include file="test.usage.js" start="  //#u" stop="  //#r"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="87" -->
```javascript
var trCb = require('tracecb')(), async = require('async'),
  toJson = trCb(JSON.stringify);

toJson({ hello: 'world' }, null, 2);
toJson({ pi: 3.1415 });
({ foo: toJson, bar: 'qux' }).foo(toJson);

function task1(done) { return (asyncSuccess(trCb('done 1', done)) || 1.11); }
function task2(done) { return (asyncFail(trCb('done 2', done)) || 2.22); }
function task3(done) { return (asyncSuccess(trCb('done 3', done)) || 3.33); }

async.series([
  trCb(task1),
  trCb(task2),
  trCb(task3),
], trCb(function allDone(err) {
  equal((err && typeof err), 'object');
  equal(err.message, 'Oh noez!');
}));

afterTest(function verifyCallbackLog() {
  equal(trCb.cbs.length, 7);

  equal(simplifyLogCb(trCb.cbs[0]), { installedFrom: placeholder.traceArray,
    invoCnt: 3, origName: JSON.stringify.name,
    invo: [
      { args: [ { hello: 'world' }, null, 2 ], ctx: undefined,
        result: '{\n  "hello": "world"\n}', threw: false,
        time: placeholder.number, from: placeholder.traceArray },
      { args: [ { pi: 3.1415 } ], ctx: undefined,
        result: '{"pi":3.1415}', threw: false,
        time: placeholder.number, from: placeholder.traceArray },
      { args: [ placeholder.func ], ctx: { foo: toJson, bar: 'qux' },
        result: undefined, threw: false,
        time: placeholder.number, from: placeholder.traceArray },
    ] });

  equal(simplifyLogCb(trCb.cbs[1]), { installedFrom: placeholder.traceArray,
    invoCnt: 1, origName: 'task1',
    invo: [
      { args: [ placeholder.func ], ctx: undefined,
        result: 1.11, threw: false,
        time: placeholder.number, from: placeholder.traceArray },
    ] });

  equal(simplifyLogCb(trCb.cbs[2]), { installedFrom: placeholder.traceArray,
    invoCnt: 1, origName: 'task2',
    invo: [
      { args: [ placeholder.func ], ctx: undefined,
        result: 2.22, threw: false,
        time: placeholder.number, from: placeholder.traceArray },
    ] });

  equal(simplifyLogCb(trCb.cbs[3]), { installedFrom: placeholder.traceArray,
    invoCnt: 0, origName: 'task3',
    invo: [] });

  equal(simplifyLogCb(trCb.cbs[4]), { installedFrom: placeholder.traceArray,
    invoCnt: 1, origName: 'allDone',
    invo: [
      { args: [ placeholder.error('Oh noez!'),
                [undefined, undefined] ],
        ctx: undefined,
        result: undefined, threw: false,
        time: placeholder.number, from: placeholder.traceArray },
    ] });

  equal(simplifyLogCb(trCb.cbs[5]), { installedFrom: placeholder.traceArray,
    invoCnt: 1, hint: 'done 1',
    invo: [
      { args: [ null ], ctx: undefined,
        result: undefined, threw: false,
        time: placeholder.number, from: placeholder.traceArray },
    ] });

  equal(simplifyLogCb(trCb.cbs[6]), { installedFrom: placeholder.traceArray,
    invoCnt: 1, hint: 'done 2',
    invo: [
      { args: [ placeholder.error('Oh noez!') ], ctx: undefined,
        result: undefined, threw: false,
        time: placeholder.number, from: placeholder.traceArray },
    ] });

  equal(trCb.cbs[7], undefined);
});
```
<!--/include-->


<!--#toc stop="scan" -->



Known issues
------------

* needs more/better tests and docs




&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
