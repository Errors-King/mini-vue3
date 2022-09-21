let obj = new Proxy({age: 13}, {
  get (target, key) {
    console.log('get')
    return Reflect.get(target, key)
  },
  set (target, key, value) {
    console.log('set')
    return Reflect.set(target, key,value)
  }
})

obj.age = 12