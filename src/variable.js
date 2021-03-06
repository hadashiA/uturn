import { BehaviorSubject } from 'rxjs-es/BehaviorSubject'

class Variable {
  constructor(value, source) {
    this.subject = new BehaviorSubject(value)
    if (source) {
      this.sourceDisposable = source.subscribe(v => this.value = v)
    }
  }

  get value() {
    return this.subject.value
  }

  set value(newValue) {
    this.subject.next(newValue)
  }

  get isUnsubscribed() {
    return this.subject.isUnsubscribed
  }

  get observable() {
    return this.subject
  }

  next(value) {
    this.subject.next(value)
  }

  error(error) {
    this.subject.error(error)
  }

  complete() {
    this.subject.complete()
  }

  unsubscribe() {
    if (this.sourceDisposable) {
      this.sourceDisposable.unsubscribe()
    }
    this.subject.complete()
  }
}

export default Variable
