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
