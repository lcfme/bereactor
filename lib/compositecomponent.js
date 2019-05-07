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
