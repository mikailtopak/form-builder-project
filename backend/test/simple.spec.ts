// test/simple.test.ts
describe('Simple Tests', () => {
  test('1 + 1 = 2', () => {
    expect(1 + 1).toBe(2);
  });

  test('string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });
});