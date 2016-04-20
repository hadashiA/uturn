import { Subscription } from 'rxjs/Subscription'

Subscription.prototype.with = function(subscription) {
  subscription.add(this)
  return this
}
