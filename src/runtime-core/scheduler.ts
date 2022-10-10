
const queue:any[] = []
let isFlushPedding = false

export function queueJobs (job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }
  queueFlush()
}

function queueFlush () {
  if (isFlushPedding) return 
  isFlushPedding = true
  Promise.resolve().then(() => {
    isFlushPedding = false
    let job
    while ((job = queue.shift())) {
      job && job()
    }
  })
}