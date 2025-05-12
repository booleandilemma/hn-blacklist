import Entry from "../src/entry.js";

// source: tests
test('source with exclusion marker valid', () => {

  const e = new Entry("source:!yahoo.com");

  expect(e.isValid).toBeTruthy();
  expect(e.text).toBe("!yahoo.com"); // TODO: is this a bug?
  expect(e.isExclusion).toBeTruthy();
  expect(e.starCount).toBe(0);
});

test('source with non-leading exclusion marker invalid', () => {

  const e = new Entry("source:yahoo.com!");

  expect(e.isValid).toBeFalsy();
});

test('more than one exclusion marker invalid', () => {

  const e = new Entry("source:!yahoo.com!");

  expect(e.isValid).toBeFalsy();
});

test('exclusion marker with glob invalid', () => {

  const e = new Entry("source:!yahoo*");

  expect(e.isValid).toBeFalsy();
});

test('source with start glob valid', () => {

  const e = new Entry("source:*google");

  expect(e.isValid).toBeTruthy();
  expect(e.text).toBe("*google"); // TODO: is this a bug?
  expect(e.isExclusion).toBeFalsy();
  expect(e.starCount).toBe(1);
});

test('source with end glob valid', () => {

  const e = new Entry("source:google*");

  expect(e.isValid).toBeTruthy();
  expect(e.text).toBe("google*"); // TODO: is this a bug?
  expect(e.isExclusion).toBeFalsy();
  expect(e.starCount).toBe(1);
});

test('source with start and end glob valid', () => {

  const e = new Entry("source:*google*");

  expect(e.isValid).toBeTruthy();
  expect(e.text).toBe("*google*"); // TODO: is this a bug?
  expect(e.isExclusion).toBeFalsy();
  expect(e.starCount).toBe(2);
});

test('source with more than two globs invalid', () => {

  const e = new Entry("source:*google**");

  expect(e.isValid).toBeFalsy();
});

test('title prefix set correctly', () => {

  const e = new Entry("source:yahoo.com");

  expect(e.prefix).toBe("source");
});

// title: tests
test('title with exclusion marker invalid', () => {
  const e = new Entry("title:!ChatGpt");

  expect(e.isValid).toBeFalsy();
});

test('user with exclusion marker invalid', () => {
  const e1 = new Entry("user:!some_user");

  expect(e1.isValid).toBeFalsy();
});

test('title with glob invalid', () => {

  const e = new Entry("title:AI*");

  expect(e.isValid).toBeFalsy();
});

test('title prefix set correctly', () => {

  const e = new Entry("title:america");

  expect(e.prefix).toBe("title");
});

// user: tests
test('user with glob invalid', () => {

  const e = new Entry("user:some_user*");

  expect(e.isValid).toBeFalsy();
});

test('user prefix set correctly', () => {

  const e = new Entry("user:some_user");

  expect(e.prefix).toBe("user");
});

// other tests
test('unrecognized entry type invalid', () => {

  const e = new Entry("what:some_user");

  expect(e.isValid).toBeFalsy();
  expect(e.prefix).toBeNull();
  expect(e.text).toBe("what:some_user");
});
