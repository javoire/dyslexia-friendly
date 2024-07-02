import { env } from './consts.js';

export const removeClassStartsWith = (elem, classStartsWith) => {
  elem
    .attr('class')
    .split(' ')
    .forEach((classname) => {
      if (classname.startsWith(classStartsWith)) {
        elem.removeClass(classname);
      }
    });
};

export const formToConfig = (form) => {
  const serializedForm = form.serializeArray();
  const obj = {};
  serializedForm.forEach((item) => {
    // the serialized form has "on" as checkbox values, convert to boolean instead
    obj[item.name] = item.value === 'on' ? true : item.value;
  });
  return obj;
};

export const debug = (msg, ...args) => {
  if (env.logLevel.debug) {
    // eslint-disable-next-line no-console
    console.log(`%c[DyslexiaFriendly] ${msg}`, 'color: #0af', ...args);
  }
};

export const error = (msg, ...args) => {
  if (env.logLevel.error) {
    // eslint-disable-next-line no-console
    console.error(`%c[DyslexiaFriendly] ${msg}`, 'color: #fa0', ...args);
  }
};
