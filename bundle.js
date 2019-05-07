(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { createElement, Component, render } = require("./lib/bereact");

class App extends Component {
  constructor() {
    super();
    this.state = {
      color: "red",
      greeting: "Hello World"
    };
    console.log("App construct");
  }
  componentWillMount() {
    console.log("App componentWillMount");
  }
  componentWillUpdate() {
    console.log("App componentWillUpdate");
  }
  componentDidUpdate() {
    console.log("App componentDidUpdate");
  }
  componentWillUnmount() {
    console.log("App componentWillUnmount");
  }
  render() {
    console.log("App render");
    return createElement(
      "div",
      {
        onClick: () => {
          this.setState({
            color: this.state.color === "red" ? "yellow" : "red",
            greeting: this.state.greeting
              .split("")
              .reverse()
              .join("")
          });
        },
        style: "color: " + this.state.color + ";"
      },
      this.state.greeting,
      createElement(Test, {
        greeting: this.state.greeting
      })
    );
  }
  componentDidMount() {
    console.log("App componentDidMount");
  }
}

class Test extends Component {
  constructor() {
    super();
    console.log("Test construct");
    this.state = {
      text: "I'm Test Component"
    };
  }
  render() {
    console.log("Test render");
    return createElement(
      "div",
      {
        onClick: e => {
          e.stopPropagation();
          this.setState({
            text:
              this.state.text === "Test Component is me"
                ? "I'm Test Component"
                : "Test Component is me"
          });
        }
      },
      this.state.text + " " + this.props.greeting
    );
  }
  componentWillMount() {
    console.log("Test componentWillMount");
  }
  componentDidMount() {
    console.log("Test componentDidMount");
  }
  componentWillUpdate() {
    console.log("Test componentWillUpdate");
  }
  componentDidUpdate() {
    console.log("Test componentDidUpdate");
  }
  componentWillUnmount() {
    console.log("Test componentWillUnmount");
  }
}

const app = (window.app = render(
  createElement(App),
  document.querySelector("#app")
));

},{"./lib/bereact":2}],2:[function(require,module,exports){
const createElement = require("./createElement");
const Component = require("./component");
const render = require("./render");

exports.createElement = createElement;
exports.Component = Component;
exports.render = render;

},{"./component":4,"./createElement":7,"./render":12}],3:[function(require,module,exports){
function CallbackQueue() {
  let q = [];
  return {
    reset() {
      q.length = 0;
    },
    enqueue(fn) {
      return q.push(fn);
    },
    flush() {
      const _q = q.slice();
      let err;
      try {
        err = true;
        while (q.length) {
          const fn = q.pop();
          fn.call(undefined);
        }
        err = false;
      } finally {
        if (err) {
          this.flush();
        } else {
          this.reset();
        }
      }
    },
    flushseq(i) {
      const _q = q.slice();
      let err;
      try {
        err = true;
        for (i = i === undefined ? 0 : i; i < _q.length; i++) {
          const fn = _q[i];
          fn.call(undefined);
        }
        err = false;
      } finally {
        if (err) {
          this.flushseq(i + 1);
        } else {
          this.reset();
        }
      }
    }
  };
}

module.exports = CallbackQueue;

},{}],4:[function(require,module,exports){
const consts = require("./consts");
const Reconciler = require("./reconciler");

function Component(props) {
  this.props = props;
}

Object.assign(Component.prototype, {
  bereactor: consts.bereactor,
  setState(o) {
    const s =
      (this._nextState !== this.state && this._nextState) ||
      (this._nextState = Object.assign({}, this.state));
    if (typeof o !== "function" || (o = o(s, this.props))) {
      Object.assign(s, o);
    }
    Reconciler.receiveComponent(this.__internal_instance__);
  }
});

module.exports = Component;

},{"./consts":6,"./reconciler":11}],5:[function(require,module,exports){
const consts = require("./consts");
const hooks = require("./hooks");

function CompositeComponent(element) {
  this.name = "CompositeComponent";
  this.currentElement = element;
  this.renderedComponent = null;
  this.publicInstance = null;
  this._dom = null;
}

Object.assign(CompositeComponent.prototype, {
  mountComponent(domparent) {
    this._dom = domparent;
    const element = this.currentElement;
    const type = element.type;
    const props = element.props;
    let publicInstance;
    let renderedElement;

    if (type.prototype && type.prototype.bereactor === consts.bereactor) {
      publicInstance = new type(props);
      publicInstance.props = props;
      publicInstance.__internal_instance__ = this;
      if (publicInstance.componentWillMount) {
        publicInstance.componentWillMount();
      }

      if (publicInstance.componentDidMount) {
        hooks.ComponentDidMount.enqueue(
          publicInstance.componentDidMount.bind(publicInstance)
        );
      }

      renderedElement = publicInstance.render();
    } else {
      publicInstance = null;
      renderedElement = type(props);
    }

    this.publicInstance = publicInstance;

    const renderedComponent = this.instantiateComponent(renderedElement);
    this.renderedComponent = renderedComponent;

    return renderedComponent.mountComponent(domparent);
  },
  receiveComponent(nextElement) {
    const ins = this.publicInstance;
    const prevProps = this.currentElement.props;
    const prevState = ins.state;
    const prevRenderedComponent = this.renderedComponent;
    const prevRenderedElement = prevRenderedComponent.currentElement;

    ins.state = ins._nextState || ins.state || {};
    this.currentElement = nextElement;

    delete ins._nextState;

    const type =
      nextElement !== null && typeof nextElement === "object"
        ? nextElement.type
        : nextElement;
    const nextProps =
      nextElement !== null && typeof nextElement === "object"
        ? nextElement.props
        : {};

    let nextRenderedElement;
    if (
      typeof type === "function" &&
      type.prototype.bereactor === consts.bereactor
    ) {
      if (ins.componentWillUpdate) {
        ins.componentWillUpdate(nextProps, ins.state);
      }
      if (ins.componentDidUpdate) {
        hooks.UpdateQueue.enqueue(ins.componentDidUpdate.bind(this));
      }
      ins.props = nextProps;
      nextRenderedElement = ins.render();
    } else if (typeof type === "function") {
      nextRenderedElement = type(nextProps);
    }

    if (
      nextRenderedElement !== null &&
      typeof nextRenderedElement === "object" &&
      nextRenderedElement.type === prevRenderedElement.type
    ) {
      prevRenderedComponent.receiveComponent(nextRenderedElement);
      return;
    }
    const prevNode = this.getDomNode();
    prevRenderedComponent.unmountComponent();

    const nextRenderedComponent = this.instantiateComponent(
      nextRenderedElement
    );

    const nextNode = nextRenderedComponent.mountComponent(this._dom);

    this.renderedComponent = nextRenderedComponent;

    prevNode.parentNode.replaceChild(nextNode, prevNode);
  },
  getDomNode() {
    return this.renderedComponent.getDomNode();
  },
  unmountComponent() {
    const ins = this.publicInstance;
    if (ins && ins.componentWillUnmount) {
      ins.componentWillUnmount();
    }
    const renderedComponent = this.renderedComponent;
    renderedComponent.unmountComponent();
  }
});

module.exports = CompositeComponent;

},{"./consts":6,"./hooks":9}],6:[function(require,module,exports){
exports.bereactor = {};

},{}],7:[function(require,module,exports){
function createElement(type, conf) {
  const props = Object.assign({}, conf);
  if (arguments.length > 2) {
    const children = [].slice.call(arguments, 2);
    props.children = children;
  }

  return {
    type,
    props,
    $$typeof: "bereactor"
  };
}

exports = module.exports = createElement;

},{}],8:[function(require,module,exports){
function DomComponent(element) {
  this.name = "DomComponent";
  this.currentElement = element;
  this.renderedChildren = null;
  this.node = null;
  this._dom = null;
}

Object.assign(DomComponent.prototype, {
  mountComponent(domparent) {
    this._dom = domparent;
    const element = this.currentElement;
    const type = element.type;
    const props = element.props;
    const children = props.children;

    const node = (this.node = document.createElement(type));

    Object.keys(props).forEach(propName => {
      const m = propName.match(/on(\w+)/i);
      if (m) {
        const eventName = m[1].toLowerCase();
        node.addEventListener(eventName, props[propName].bind(this));
        return;
      }
      if (propName !== "children") {
        node.setAttribute(propName, props[propName]);
      }
    });

    if (children && children.length) {
      for (let i = 0, l = children.length; i < l; i++) {
        const child = children[i];
        if (!this.renderedChildren) {
          this.renderedChildren = [];
        }
        this.renderedChildren[i] = this.instantiateComponent(child);
      }
      const childrenDom = this.renderedChildren.map(child =>
        child.mountComponent(node)
      );
      childrenDom.forEach(cdom => {
        node.appendChild(cdom);
      });
    }

    return node;
  },
  receiveComponent(nextElement) {
    const node = this.node;
    const prevElement = this.currentElement;
    const prevProps = prevElement.props;
    const nextProps = nextElement.props;

    this.currentElement = nextElement;

    Object.keys(prevProps).forEach(propName => {
      if (propName !== "children" && !nextProps.hasOwnProperty(propName)) {
        node.removeAttribute(propName);
      }
    });
    Object.keys(nextProps).forEach(propName => {
      if (propName !== "children") {
        node.setAttribute(propName, nextProps[propName]);
      }
    });

    const prevChildren = prevProps.children || [];
    if (!Array.isArray(prevChildren)) {
      prevChildren = [prevChildren];
    }
    const nextChildren = nextProps.children || [];
    if (!Array.isArray(nextChildren)) {
      nextChildren = [nextChildren];
    }

    const prevRenderedChildren = this.renderedChildren;
    const nextRenderedChildren = [];

    for (let i = 0; i < nextChildren.length; i++) {
      const prevChild = prevRenderedChildren[i];

      if (!prevChild) {
        const nextChild = this.instantiateComponent(nextChildren[i]);
        const childNode = nextChild.mountComponent(node);
        nextRenderedChildren.push(nextChild);

        node.appendChild(childNode);
        continue;
      }
      const canUpdate = (() => {
        if (prevChildren[i] === null && nextChildren[i] === null) {
          return true;
        } else if (
          typeof prevChildren[i] === "string" &&
          typeof nextChildren[i] === "string"
        ) {
          return prevChildren[i] === nextChildren[i];
        } else if (
          typeof prevChildren[i] === "object" &&
          typeof nextChildren[i] === "object"
        ) {
          return prevChildren[i].type === nextChildren[i].type;
        } else {
          return false;
        }
      })();

      if (!canUpdate) {
        const prevNode = prevChild.getDomNode();
        prevChild.unmountComponent();
        const nextChild = this.instantiateComponent(nextChildren[i]);
        const nextNode = nextChild.mountComponent(node);
        nextRenderedChildren.push(nextChild);
        node.replaceChild(nextNode, prevNode);
        continue;
      }

      prevChild.receiveComponent(nextChildren[i]);
      nextRenderedChildren.push(prevChild);
    }

    for (
      let j = nextRenderedChildren.length;
      j < prevRenderedChildren.length;
      j++
    ) {
      const prevChild = prevRenderedChildren[j];
      const prevNode = prevChild.getDomNode();
      prevChild.unmountComponent();
      node.removeChild(prevNode);
    }

    this.renderedChildren = nextRenderedChildren;
  },
  unmountComponent() {
    const renderedChildren = this.renderedChildren;
    renderedChildren.forEach(child => {
      child.unmountComponent();
    });
  },
  getDomNode() {
    return this.node;
  }
});

module.exports = DomComponent;

},{}],9:[function(require,module,exports){
const CallbackQueue = require("./cbq");

module.exports = {
  ComponentDidMount: CallbackQueue(),
  UpdateQueue: CallbackQueue()
};

},{"./cbq":3}],10:[function(require,module,exports){
const DomComponent = require("./domcomponent");
const CompositionComponent = require("./compositecomponent");

function TextComponent(element) {
  this.name = "TextComponent";
  this.currentElement = element;
  this.node = null;
  this._dom = null;
}

Object.assign(TextComponent.prototype, {
  mountComponent(domparent) {
    this._dom = domparent;
    const element = this.currentElement;
    const node = (this.node = document.createTextNode(element));

    return node;
  },
  receiveComponent() {},
  unmountComponent() {},
  getDomNode() {
    return this.node;
  },
  instantiateComponent: instantiateComponent
});

function EmptyComponent(element) {
  this.name = "EmptyComponent";
  this.currentElement = null;
  this.node = null;
  this._dom = null;
}

Object.assign(EmptyComponent.prototype, {
  mountComponent(domparent) {
    this._dom = domparent;
    const node = (this.node = document.createComment("empty-component"));
    return node;
  },
  receiveComponent() {},
  unmountComponent() {},
  getDomNode() {
    return this.node;
  },
  instantiateComponent: instantiateComponent
});

function instantiateComponent(element) {
  let ins;
  if (element === null || element === false) {
    ins = new EmptyComponent(element);
  } else if (typeof element === "object") {
    const type = element.type;
    if (typeof type === "string") {
      ins = new DomComponent(element);
    } else if (typeof type === "function") {
      ins = new CompositionComponent(element);
    }
  } else if (typeof element === "string") {
    ins = new TextComponent(element);
  }
  return ins;
}

Object.assign(DomComponent.prototype, {
  instantiateComponent: instantiateComponent
});

Object.assign(CompositionComponent.prototype, {
  instantiateComponent: instantiateComponent
});

module.exports = instantiateComponent;

},{"./compositecomponent":5,"./domcomponent":8}],11:[function(require,module,exports){
const hooks = require("./hooks");
const instantiateComponent = require("./instantiatecomponent");
const Reconciler = {
  mountRootComponentIntoContainer(element, container) {
    if (container.__bereactor__) {
      container.__bereactor__.unmountComponent();
      delete container.__bereactor__;
    }
    if (container.innerHTML) {
      container.innerHTML = "";
    }
    hooks.ComponentDidMount.reset();
    const ins = instantiateComponent(element);
    const node = ins.mountComponent(container);
    container.appendChild(node);
    container.__bereactor__ = ins;
    hooks.ComponentDidMount.flush();
    return ins.publicInstance;
  },
  receiveComponent(ins) {
    hooks.UpdateQueue.reset();
    ins.receiveComponent(ins.currentElement);
    hooks.UpdateQueue.flush();
  }
};

module.exports = Reconciler;

},{"./hooks":9,"./instantiatecomponent":10}],12:[function(require,module,exports){
const Reconciler = require("./reconciler");

function render(element, container) {
  return Reconciler.mountRootComponentIntoContainer(element, container);
}

module.exports = render;

},{"./reconciler":11}]},{},[1]);
