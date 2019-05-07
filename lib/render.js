const Reconciler = require("./reconciler");

function render(element, container) {
  return Reconciler.mountRootComponentIntoContainer(element, container);
}

module.exports = render;
