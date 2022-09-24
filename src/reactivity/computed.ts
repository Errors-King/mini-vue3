import { ReactiveEffect } from './effect'
class ComputedRefImpl {
  private _dirty: boolean = true
  private _value: any
  private _effect: any

  constructor(getter) {
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty =  true
      }
    })
  }

  get value () {
    //  _dirty 为true的时候，重新计算
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed (getter) {
  return new ComputedRefImpl(getter)
}