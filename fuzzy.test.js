const jsonPath = require("./");
const assert = require("node:assert");
const fp = require("lodash/fp");
const set = require("lodash/set");
const cloneDeep = require("lodash/cloneDeep");
const { test } = require("node:test");

const possibleObjectKeys = fp.pipe(
  fp.range(0),
  fp.map(() => Math.random().toString(36).slice(4)),
  fp.uniq,
)(10);

const allTypes = [
  "null",
  "boolean",
  "number",
  "string",
  "object",
  "array",
  "undefined",
];

test("fuzzy", () => {
  for (let n = 0; n < 1000000; n++) {
    doTest();
  }
});

function doTest() {
  const [object, path, value] = generateTestArgs();
  const result = jsonPath.set(object, path, value);
  const lodashRef = getLodashRef(object, path, value);

  assert.deepStrictEqual(
    result,
    lodashRef,
    getAssertMessage(object, path, value),
  );
}

function getLodashRef(input, path, value) {
  if (path === undefined) {
    return JSON.parse(JSON.stringify(value));
  }

  const out = cloneDeep(input === null ? {} : input);
  set(out, path, value);

  return JSON.parse(JSON.stringify(out));
}

function generateTestArgs() {
  const object = generateValue(7, ["object", "array", "null"]);
  const path = generatePath();
  const value =
    path === undefined
      ? generateValue(7, ["object", "array", "null"])
      : generateValue(
          7,
          allTypes.filter((x) => x !== "undefined"),
        );
  return [object, path, value];
}

/**
 * @param {number} remainingDepth
 */
function generateValue(remainingDepth, allowedTypes = allTypes) {
  const typeIndex = fp.random(0, allowedTypes.length - 1);
  const type = allowedTypes[typeIndex];

  switch (type) {
    case "undefined":
      return undefined;
    case "null":
      return null;
    case "boolean":
      return generateBooleanValue();
    case "number":
      return generateNumberValue();
    case "string":
      return generateStringValue();
    case "object":
      return generateObjectValue(remainingDepth);
    case "array":
      return generateArrayValue(remainingDepth);
  }
}

function generateBooleanValue() {
  return Math.random() > 0.5;
}

function generateNumberValue() {
  return Math.random();
}

function generateStringValue() {
  return Math.random().toString(36).slice(2);
}

/**
 * @param {number} remainingDepth
 */
function generateObjectValue(remainingDepth) {
  const keys = fp.random(0, 7);
  const obj = {};
  for (let i = 0; i < keys; i++) {
    const nextDepth = remainingDepth - fp.random(1, 4);
    if (nextDepth > 0) {
      obj[generateKey()] = generateValue(nextDepth);
    }
  }
  return obj;
}

/**
 * @param {number} remainingDepth
 */
function generateArrayValue(remainingDepth) {
  const length = fp.random(0, 7);
  const arr = [];
  for (let i = 0; i < length; i++) {
    const nextDepth = remainingDepth - fp.random(1, 4);
    if (nextDepth > 0) {
      arr.push(generateValue(nextDepth));
    }
  }
  return arr;
}

function generateKey() {
  const keyIndex = fp.random(0, possibleObjectKeys.size - 1);
  return possibleObjectKeys[keyIndex];
}

function generatePath() {
  const depth = fp.random(0, 10);
  if (depth === 0) {
    return undefined;
  }
  const path = [];
  for (let i = 0; i < depth; i++) {
    const isObject = Math.random() > 0.5;
    path.push(isObject ? generateKey() : fp.random(0, 10));
  }
  return path
    .map((x, i, all) =>
      typeof x === "number"
        ? `[${x}]`
        : `${x}${i < all.length && typeof all[i + 1] === "string" ? "." : ""}`,
    )
    .join("");
}

function getAssertMessage(object, path, value) {
  return `
== object ==
${JSON.stringify(object, null, 2)}

== path ==
${path}

== value ==
${JSON.stringify(value, null, 2)}
`;
}
