import { Subscription } from 'rxjs/Subscription'

function compositeSubscription(...args) {
  const parent = new Subscription
  for (let subscription of args) {
    parent.add(subscription)
  }
  return parent
}

export default compositeSubscription

