function CallbackQueue() {
  let q = [];
  return {
    reset() {
      q.length = 0;
    },
    enqueue(fn) {
      return q.push(fn);
    },
    flush() {
      const _q = q.slice();
      let err;
      try {
        err = true;
        while (q.length) {
          const fn = q.pop();
          fn.call(undefined);
        }
        err = false;
      } finally {
        if (err) {
          this.flush();
        } else {
          this.reset();
        }
      }
    },
    flushseq(i) {
      const _q = q.slice();
      let err;
      try {
        err = true;
        for (i = i === undefined ? 0 : i; i < _q.length; i++) {
          const fn = _q[i];
          fn.call(undefined);
        }
        err = false;
      } finally {
        if (err) {
          this.flushseq(i + 1);
        } else {
          this.reset();
        }
      }
    }
  };
}

module.exports = CallbackQueue;
