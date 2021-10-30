export default function delayFetch (originalFetch, delay) {
  return function fetch (input, init) {
    return new Promise((resolve, reject) => {
      // bit of work around for delayed serialized requests and abort.
      // manually check in signal.abort has been called as fetch wouldn't have existed when first called
      if (init && init.signal && init.signal.aborted) {
        /* eslint-disable-next-line prefer-promise-reject-errors */
        reject({ name: 'AbortError' })
      } else {
        setTimeout(() => {
          originalFetch(input, init).then(resolve).catch(reject)
        }, delay)
      }
    })
  }
};
