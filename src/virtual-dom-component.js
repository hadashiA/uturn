import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import h from 'virtual-dom/h'
import diff from 'virtual-dom/diff'
import patch from 'virtual-dom/patch'
import createElement from 'virtual-dom/create-element'

import 'rxjs/add/observable/of'
import 'rxjs/add/observable/fromEvent'

class VirtualDOMComponent {
  constructor(el) {
    this.el = el
  }

  bindDOM(bindElement) {
    let tree = null
    let node = null

    if (!this.subscription) {
      this.subscription = new Subscription
    }

    this.subscription.add(
      this.render()
        .subscribe(newTree => {
          if (tree) {
            const patches = diff(tree, newTree)
            node = patch(node, patches)
            tree = newTree
          } else {
            tree = newTree
            node = createElement(tree)
            const el = bindElement || this.el
            el.innerText = ''
            el.appendChild(node)
          }
        }))
  }

  event(className, eventName) {
    return Observable.fromEvent(this.el, eventName)
      .filter(e => {
        let el = e.target
        while (el) {
          if (el.classList && el.classList.contains(className)) return true
          el = el.parentNode;
        }
        return false
      });
  }

  render() {
    return Observable.of(h('div'))
  }

  dispose() {
    this.subscription && this.subscription.unsubscribe()
    this.subscription = null
  }
}

export default VirtualDOMComponent
