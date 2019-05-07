const CallbackQueue = require("./cbq");

module.exports = {
  ComponentDidMount: CallbackQueue(),
  UpdateQueue: CallbackQueue()
};
