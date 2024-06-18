const removeClassStartsWith = (elem, classStartsWith) => {
  elem
    .attr('class')
    .split(' ')
    .forEach(classname => {
      if (classname.startsWith(classStartsWith)) {
        elem.removeClass(classname);
      }
    });
};

const arrayToConfigMap = array => {
  const obj = {};
  array.forEach(item => {
    // the serialized form has "on" as checkbox values, convert to boolean instead
    obj[item.name] = item.value === 'on' ? true : item.value;
  });
  return obj;
};

const debug = (msg, ...args) => {
  // TODO: only log in dev mode, how to control environment in a chrome extension?
  const isDev = false; // tmp set to true for local dev
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(`%c[DyslexiaFriendly] ${msg}`, 'color: #00f', ...args);
  }
};

module.exports = {
  removeClassStartsWith,
  arrayToConfigMap,
  debug
};
