'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rxjs_Observable = require('rxjs/Observable');
var rxjs_Subscription = require('rxjs/Subscription');
var h = _interopDefault(require('virtual-dom/h'));
var diff = _interopDefault(require('virtual-dom/diff'));
var patch = _interopDefault(require('virtual-dom/patch'));
var createElement = _interopDefault(require('virtual-dom/create-element'));
var elementClosest = require('element-closest');
var rxjs_add_observable_of = require('rxjs/add/observable/of');
var rxjs_add_observable_fromEvent = require('rxjs/add/observable/fromEvent');
var rxjs_add_operator_share = require('rxjs/add/operator/share');
var rxjs_BehaviorSubject = require('rxjs/BehaviorSubject');

class DOMComponent {
  constructor(el) {
    this.el = el;
    this.children = [];
    this.events = {};
    this.subscription = new rxjs_Subscription.Subscription();
  }

  addChild(child) {
    this.children.push(child);
    child.parent = this;
    child.didMoveToParent && child.didMoveToParent(this);
  }

  on(eventName, selector) {
    if (!this.events[eventName]) {
      this.events[eventName] = rxjs_Observable.Observable.fromEvent(this.el, eventName).share();
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
    return rxjs_Observable.Observable.of(h('div'));
  }

  dispose() {
    super.dispose();
    this.unbindDOM();
  }
}

class Variable {
  constructor(value, source) {
    this.subject = new rxjs_BehaviorSubject.BehaviorSubject(value);
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

rxjs_Observable.Observable.prototype.toVariable = toVariable;

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

exports.DOMComponent = DOMComponent;
exports.VirtualDOMComponent = VirtualDOMComponent;
exports.ViewModel = ViewModel;
//# sourceMappingURL=main.js.map
