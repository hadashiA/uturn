import { Observable } from 'rxjs-es/Observable'
import Variable from './variable'

function toVariable(initialValue) {
  return new Variable(initialValue, this)
}

Observable.prototype.toVariable = toVariable
