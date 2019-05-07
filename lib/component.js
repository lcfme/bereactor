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
