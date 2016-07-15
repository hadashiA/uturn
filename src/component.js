import { Observable } from 'rxjs-es/Observable'
import { Subscription } from 'rxjs-es/Subscription'
import h from 'virtual-dom/h'
import diff from 'virtual-dom/diff'
import patch from 'virtual-dom/patch'
import createElement from 'virtual-dom/create-element'

import './composite-subscription'
import 'element-closest'
import 'rxjs-es/add/observable/of'
import 'rxjs-es/add/observable/fromEvent'
import 'rxjs-es/add/operator/share'

class DOMComponent {
  constructor(el) {
    this.el = el
    this.children = []
    this.events = {}
    this.subscription = new Subscription
  }

  addChild(child) {
    this.children.push(child)
    child.parent = this
    child.didMoveToParent && child.didMoveToParent(this)
  }

  on(eventName, selector) {
    if (!this.events[eventName]) {
      this.events[eventName] = Observable.fromEvent(this.el, eventName).share()
    }

    if (selector) {
      return this.events[eventName]
        .filter(e => {
          const el = e.target
          if (typeof selector === 'string') {
            return el.closest(selector)
          } else {
            return el === selector
          }
        })
    } else {
      return this.events[eventName]
    }
  }

  dispose() {
    this.children.forEach(child => {
      if (child.dispose) {
        child.dispose()
        child.parent = null
      }
    })
    this.children = null

    if (this.vm) {
      this.vm.unsubscribe()
      this.vm = null
    }
    this.subscription.unsubscribe()
    this.subscription = null
  }
}

class VirtualDOMComponent extends DOMComponent {
  bindDOM(bindElement) {
    let tree = null
    let node = null

    this.renderSubscription = this.render()
      .subscribe(newTree => {
        if (tree) {
          const patches = diff(tree, newTree)
          node = patch(node, patches)
          tree = newTree
        } else {
          tree = newTree
          node = createElement(tree, { document: window.document })
          const el = bindElement || this.el
          el.innerText = ''
          el.appendChild(node)
        }
      })
  }

  unbindDOM() {
    if (this.renderSubscriptino) {
      this.renderSubscription.unsubscribe()
      this.renderSubscription = null
    }
  }

  render() {
    return Observable.of(h('div'))
  }

  dispose() {
    super.dispose()
    this.unbindDOM()
  }
}

export { DOMComponent, VirtualDOMComponent }
