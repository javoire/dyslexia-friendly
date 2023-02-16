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

module.exports = {
  removeClassStartsWith,
  arrayToConfigMap
};
