

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
    activeEffect = this

    const res = this._cb()
    // 当函数执行结束后，需要将 当前正在执行的函数重置
    // 不然清空依赖的时候，之前执行的函数依然在，触发get的时候会再次被收集
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

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  dep.forEach(cb =>{
    if (cb.scheduler) {
      cb.scheduler()
    } else {
      cb.run()
    }
  })
}

// 收集所有的 target
const targetMap = new Map()

export function track(target, key) {
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
  if (!activeEffect) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function stop (runner) {
  runner.effect.stop()
}

let activeEffect
export function effect(cb, options = {}) {
  const { scheduler, onStop } = options as any
  const _effect = new ReactiveEffect(cb, scheduler)
  _effect.onStop = onStop

  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}