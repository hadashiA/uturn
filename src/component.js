import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import h from 'virtual-dom/h'
import diff from 'virtual-dom/diff'
import patch from 'virtual-dom/patch'
import createElement from 'virtual-dom/create-element'

import 'rxjs/add/observable/of'
import 'rxjs/add/observable/fromEvent'

class Component {
  constructor(el) {
    this.el = el
    this.children = []
    this.events = {}
    this.subscription = new Subscription
  }

  on(eventName, simpleSelector) {
    if (!this.events[eventName]) {
      this.events[eventName] = Observable.fromEvent(this.el, eventName).share()
    }

    if (simpleSelector) {
      if (simpleSelector[0] === '#') {
        const id = simpleSelector.substr(1)
        return this.events[eventName].filter(e => {
          let el = e.target
          while (el) {
            if (el.id === id) {
              return true
            }
            el = el.parentNode
          }
          return false
        })
      } else if (simpleSelector[0] === '.') {
        const className = simpleSelector.substr(1)
        return this.events[eventName].filter(e => {
          let el = e.target
          while (el) {
            if (el.classList && el.classList.contains(className)) {
              return true
            }
            el = el.parentNode
          }
          return false
        })
      }
    }
    return this.events[eventName]
  }

  dispose() {
    for (let child of this.children) {
      if (child.dispose) {
        child.dispose()
      }
    }
    this.children = null

    if (this.vm) {
      this.vm.unsubscribe()
      this.vm = null
    }
    this.subscription.unsubscribe()
    this.subscription = null
  }
}

class VirtualDOMComponent extends Component {
  render() {
    return Observable.of(h('div'))
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
}

export { Component, VirtualDOMComponent }
