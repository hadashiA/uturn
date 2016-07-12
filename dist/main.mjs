import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import h from 'virtual-dom/h';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';
import 'element-closest';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/share';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

class DOMComponent {
  constructor(el) {
    this.el = el;
    this.children = [];
    this.events = {};
    this.subscription = new Subscription();
  }

  addChild(child) {
    this.children.push(child);
    child.parent = this;
    child.didMoveToParent && child.didMoveToParent(this);
  }

  on(eventName, selector) {
    if (!this.events[eventName]) {
      this.events[eventName] = Observable.fromEvent(this.el, eventName).share();
    }

    if (selector) {
      return this.events[eventName].filter(e => {
        const el = e.target;
        if (typeof selector === 'string') {
          return el.closest(selector);
        } else {
          return el === selector;
        }
      });
    } else {
      return this.events[eventName];
    }
  }

  dispose() {
    for (let child of this.children) {
      if (child.dispose) {
        child.dispose();
        child.parent = null;
      }
    }
    this.children = null;

    if (this.vm) {
      this.vm.unsubscribe();
      this.vm = null;
    }
    this.subscription.unsubscribe();
    this.subscription = null;
  }
}

class VirtualDOMComponent extends DOMComponent {
  bindDOM(bindElement) {
    let tree = null;
    let node = null;

    this.renderSubscription = this.render().subscribe(newTree => {
      if (tree) {
        const patches = diff(tree, newTree);
        node = patch(node, patches);
        tree = newTree;
      } else {
        tree = newTree;
        node = createElement(tree);
        const el = bindElement || this.el;
        el.innerText = '';
        el.appendChild(node);
      }
    });
  }

  unbindDOM() {
    if (this.renderSubscriptino) {
      this.renderSubscription.unsubscribe();
      this.renderSubscription = null;
    }
  }

  render() {
    return Observable.of(h('div'));
  }

  dispose() {
    super.dispose();
    this.unbindDOM();
  }
}

class Variable {
  constructor(value, source) {
    this.subject = new BehaviorSubject(value);
    if (source) {
      this.sourceDisposable = source.subscribe(v => this.value = v);
    }
  }

  get value() {
    return this.subject.value;
  }

  set value(newValue) {
    this.subject.next(newValue);
  }

  get isUnsubscribed() {
    return this.subject.isUnsubscribed;
  }

  get observable() {
    return this.subject;
  }

  next(value) {
    this.subject.next(value);
  }

  error(error) {
    this.subject.error(error);
  }

  complete() {
    this.subject.complete();
  }

  unsubscribe() {
    if (this.sourceDisposable) {
      this.sourceDisposable.unsubscribe();
    }
    this.subject.complete();
  }
}

function toVariable(initialValue) {
  return new Variable(initialValue, this);
}

Observable.prototype.toVariable = toVariable;

class ViewModel {
  constructor() {
    let attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    this.keys = Object.keys(attrs);
    for (let key of this.keys) {
      this[key] = new Variable(attrs[key]);
    }
  }

  unsubscribe() {
    for (let k in this) {
      if (this.hasOwnProperty(k)) {
        if (typeof this[k].dispose === 'function') {
          this[k].unsubscribe();
        }
      }
    }
  }
}

export { DOMComponent, VirtualDOMComponent, ViewModel };
//# sourceMappingURL=main.mjs.map
