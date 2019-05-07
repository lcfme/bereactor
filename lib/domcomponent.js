const Reconciler = require("./reconciler");

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
    }
    const childrenDom = this.renderedChildren.map(child =>
      child.mountComponent(node)
    );
    childrenDom.forEach(cdom => {
      node.appendChild(cdom);
    });
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
