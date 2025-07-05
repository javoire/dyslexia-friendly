import { env } from './consts';

export interface ConfigItem {
  name: string;
  value: string;
}

export interface Config {
  [key: string]: string | boolean;
}

export const removeClassStartsWith = (elem: JQuery, classStartsWith: string): void => {
  const classAttr = elem.attr('class');
  if (classAttr) {
    classAttr.split(' ').forEach((classname) => {
      if (classname.startsWith(classStartsWith)) {
        elem.removeClass(classname);
      }
    });
  }
};

export const formToConfig = (form: JQuery): Config => {
  const serializedForm = form.serializeArray() as ConfigItem[];
  const obj: Config = {};
  serializedForm.forEach((item) => {
    // the serialized form has "on" as checkbox values, convert to boolean instead
    obj[item.name] = item.value === 'on' ? true : item.value;
  });
  return obj;
};

export const debug = (msg: string, ...args: any[]): void => {
  if (env.logLevel.debug) {
    // eslint-disable-next-line no-console
    console.log(`%c[DyslexiaFriendly] ${msg}`, 'color: #0af', ...args);
  }
};

export const error = (msg: string, ...args: any[]): void => {
  if (env.logLevel.error) {
    // eslint-disable-next-line no-console
    console.error(`%c[DyslexiaFriendly] ${msg}`, 'color: #fa0', ...args);
  }
};
