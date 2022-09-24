
let activeEffect // 当前正在执行的effect
let shouldTrack // 判断是否需要收集依赖
const targetMap = new Map() // 收集所有的 target

class ReactiveEffect {
  private _cb: any;
  deps = [];
  active = true
  onStop?: () => void
  constructor(cb, public scheduler?) {
    this._cb = cb
    this.scheduler = scheduler
  }
  run() {

    if (!this.active) {
      return this._cb()
    }
    shouldTrack = true
    activeEffect = this

    const res = this._cb()
    // 当函数执行结束后，需要将 当前正在执行的函数重置
    // 不然清空依赖的时候，之前执行的函数依然在，触发get的时候会再次被收集
    shouldTrack = false
    activeEffect = undefined
    return res
  }
  stop() {
    if (this.active) {
      this.deps.forEach((dep: any) => {
        dep.delete(this)
      })
      this.onStop && this.onStop()
      this.active = false
    }
  }
}

// 触发 get
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  triggerEffects(dep)
}

export function triggerEffects (dep) {
  dep.forEach(cb =>{
    // 有 scheduler 就执行 scheduler
    if (cb.scheduler) {
      cb.scheduler()
    } else {
      cb.run()
    }
  })
}


export function track(target, key) {

  if (!isTracking()) return

  // 取出 target 对应的所有 deps
  let depsMap = targetMap.get(target)

  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 拿到对应的 dep
  let dep = depsMap.get(key)

  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffects(dep)

}

export function trackEffects (dep) {
  // 如果 dep 中已经存在，就不用收集了
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  // 反向收集，stop 时候方便清除
  activeEffect.deps.push(dep)
}

// 判断是否需要收集依赖
export function isTracking () {
  return shouldTrack && activeEffect !== undefined
}

export function stop (runner) {
  runner.effect.stop()
}

export function effect(cb, options = {}) {
  const { scheduler, onStop } = options as any
  const _effect = new ReactiveEffect(cb, scheduler)
  _effect.onStop = onStop

  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}