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

var DOMComponent = function () {
  function DOMComponent(el) {
    babelHelpers.classCallCheck(this, DOMComponent);

    this.el = el;
    this.children = [];
    this.events = {};
    this.subscription = new rxjs_Subscription.Subscription();
  }

  babelHelpers.createClass(DOMComponent, [{
    key: 'addChild',
    value: function addChild(child) {
      this.children.push(child);
      child.parent = this;
      child.didMoveToParent && child.didMoveToParent(this);
    }
  }, {
    key: 'on',
    value: function on(eventName, selector) {
      if (!this.events[eventName]) {
        this.events[eventName] = rxjs_Observable.Observable.fromEvent(this.el, eventName).share();
      }

      if (selector) {
        return this.events[eventName].filter(function (e) {
          var el = e.target;
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
  }, {
    key: 'dispose',
    value: function dispose() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var child = _step.value;

          if (child.dispose) {
            child.dispose();
            child.parent = null;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
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
  }]);
  return DOMComponent;
}();

var VirtualDOMComponent = function (_DOMComponent) {
  babelHelpers.inherits(VirtualDOMComponent, _DOMComponent);

  function VirtualDOMComponent() {
    babelHelpers.classCallCheck(this, VirtualDOMComponent);
    return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(VirtualDOMComponent).apply(this, arguments));
  }

  babelHelpers.createClass(VirtualDOMComponent, [{
    key: 'bindDOM',
    value: function bindDOM(bindElement) {
      var _this2 = this;

      var tree = null;
      var node = null;

      this.renderSubscription = this.render().subscribe(function (newTree) {
        if (tree) {
          var patches = diff(tree, newTree);
          node = patch(node, patches);
          tree = newTree;
        } else {
          tree = newTree;
          node = createElement(tree);
          var el = bindElement || _this2.el;
          el.innerText = '';
          el.appendChild(node);
        }
      });
    }
  }, {
    key: 'unbindDOM',
    value: function unbindDOM() {
      if (this.renderSubscriptino) {
        this.renderSubscription.unsubscribe();
        this.renderSubscription = null;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return rxjs_Observable.Observable.of(h('div'));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      babelHelpers.get(Object.getPrototypeOf(VirtualDOMComponent.prototype), 'dispose', this).call(this);
      this.unbindDOM();
    }
  }]);
  return VirtualDOMComponent;
}(DOMComponent);

var Variable = function () {
  function Variable(value, source) {
    var _this = this;

    babelHelpers.classCallCheck(this, Variable);

    this.subject = new rxjs_BehaviorSubject.BehaviorSubject(value);
    if (source) {
      this.sourceDisposable = source.subscribe(function (v) {
        return _this.value = v;
      });
    }
  }

  babelHelpers.createClass(Variable, [{
    key: 'next',
    value: function next(value) {
      this.subject.next(value);
    }
  }, {
    key: 'error',
    value: function error(_error) {
      this.subject.error(_error);
    }
  }, {
    key: 'complete',
    value: function complete() {
      this.subject.complete();
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe() {
      if (this.sourceDisposable) {
        this.sourceDisposable.unsubscribe();
      }
      this.subject.complete();
    }
  }, {
    key: 'value',
    get: function get() {
      return this.subject.value;
    },
    set: function set(newValue) {
      this.subject.next(newValue);
    }
  }, {
    key: 'isUnsubscribed',
    get: function get() {
      return this.subject.isUnsubscribed;
    }
  }, {
    key: 'observable',
    get: function get() {
      return this.subject;
    }
  }]);
  return Variable;
}();

function toVariable(initialValue) {
  return new Variable(initialValue, this);
}

rxjs_Observable.Observable.prototype.toVariable = toVariable;

var ViewModel = function () {
  function ViewModel() {
    var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    babelHelpers.classCallCheck(this, ViewModel);

    this.keys = Object.keys(attrs);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        this[key] = new Variable(attrs[key]);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  babelHelpers.createClass(ViewModel, [{
    key: 'unsubscribe',
    value: function unsubscribe() {
      for (var k in this) {
        if (this.hasOwnProperty(k)) {
          if (typeof this[k].dispose === 'function') {
            this[k].unsubscribe();
          }
        }
      }
    }
  }]);
  return ViewModel;
}();

exports.DOMComponent = DOMComponent;
exports.VirtualDOMComponent = VirtualDOMComponent;
exports.ViewModel = ViewModel;
//# sourceMappingURL=main.browser.js.map
