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
