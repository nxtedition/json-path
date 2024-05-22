const jsonPath = require("./");
const assert = require("node:assert");
const { test } = require("node:test");

test("undefined set", () => {
  const val1 = { locks: undefined, replicas: ["dev"] };
  const val2 = jsonPath.set(
    val1,
    undefined,
    { locks: undefined, replicas: ["dev"], error: undefined },
    false,
  );
  assert.deepStrictEqual(val2, { replicas: ["dev"] });
});

test("undefined set2", () => {
  const val1 = {};
  const val2 = jsonPath.set(
    val1,
    undefined,
    { locks: undefined, replicas: ["dev"], error: undefined },
    false,
  );
  assert.deepStrictEqual(val2, { replicas: ["dev"] });
});

test("undefined set3", () => {
  const val1 = { replicas: ["dev1"] };
  const val2 = jsonPath.set(
    val1,
    null,
    { replicas: ["dev1"], locks: undefined },
    false,
  );
  assert.equal(val1, val2);
});

test("undefined set4", () => {
  const val1 = { replicas: ["dev1"] };
  const val2 = jsonPath.set(
    val1,
    null,
    { locks: undefined, replicas: ["dev1"], error: undefined },
    false,
  );
  assert.equal(val1, val2);
});
