const { arrayToConfigMap } = require('../util');

describe('util', () => {
  test('arrayToConfigMap() creates correct map', () => {
    const formArray = [
      { name: 'rulerEnabled', value: 'on' },
      { name: 'rulerSize', value: 30 },
      { name: 'fontChoice', value: 'opendyslexic' }
    ];
    const configMap = {
      rulerEnabled: true,
      rulerSize: 30,
      fontChoice: 'opendyslexic'
    };
    expect(arrayToConfigMap(formArray)).toEqual(configMap);
  });
});
