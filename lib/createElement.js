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
