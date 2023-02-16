export const removeClassStartsWith = (elem, classStartsWith) => {
  elem
    .attr('class')
    .split(' ')
    .forEach(classname => {
      if (classname.startsWith(classStartsWith)) {
        elem.removeClass(classname);
      }
    });
};
