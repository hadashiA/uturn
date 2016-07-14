import { Subscription } from 'rxjs-es/Subscription'

Subscription.prototype.with = function(subscription) {
  subscription.add(this)
  return this
}
