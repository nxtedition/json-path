const jsonPath = require("../");

describe("equality", () => {
  it("deep equal", () => {
    const obj = { asd: 123 };
    const res = jsonPath.set(
      {
        obj,
        foo: "true",
      },
      null,
      {
        obj,
      }
    );

    expect(res.obj).toBe(obj);
    expect(res).toEqual({ obj });
  });

  it("returns old value", () => {
    const obj = {
      asd: true,
    };
    const res = jsonPath.set(obj, undefined, {
      asd: true,
    });

    expect(res).toBe(obj);
  });
});

describe("json clone", () => {
  it("types", () => {
    expect(jsonPath.jsonClone("ASD")).toEqual("ASD");
    expect(jsonPath.jsonClone(null)).toEqual(null);
    expect(jsonPath.jsonClone(undefined)).toEqual(undefined);
    expect(jsonPath.jsonClone(1)).toEqual(1);
    expect(jsonPath.jsonClone(NaN)).toEqual(null);
    expect(jsonPath.jsonClone(1.1)).toEqual(1.1);

    const date = new Date();
    expect(jsonPath.jsonClone(date)).toEqual(date.toISOString());
  });
});

describe("set", () => {
  it("set through null", () => {
    const res = jsonPath.set(
      {
        asd: null,
      },
      "asd.foo.bar",
      true
    );
    expect(res).toEqual({
      asd: { foo: { bar: true } },
    });
  });

  it("set empty", () => {
    const obj = {
      asd: null,
    };
    const res = jsonPath.set(obj, null, {});
    expect(res).toEqual({});
  });

  it("set on null", () => {
    const res = jsonPath.set(null, null, { sad: true });
    expect(res).toEqual({ sad: true });
  });

  it("set string", () => {
    const res = jsonPath.set({ foo: "ASD" }, null, { sad: "ASD" });
    expect(res).toEqual({ sad: "ASD" });
  });

  it("set array on object", () => {
    const res = jsonPath.set({}, null, []);
    expect(res).toEqual([]);
  });

  it("set array on object plainJSON", () => {
    const res = jsonPath.set({}, null, [], true);
    expect(res).toEqual([]);
  });
});

describe("order", () => {
  it("updates order", () => {
    const obj = {
      foo: 1,
      bar: 1,
    };
    const res = jsonPath.set(obj, undefined, {
      bar: 1,
      foo: 2,
    });

    expect(res).not.toBe(obj);
    expect(res).toEqual({ bar: 1, foo: 2 });
  });

  it("keeps order", () => {
    const obj = {
      foo: 1,
      bar: 1,
    };
    const res = jsonPath.set(obj, undefined, {
      foo: 1,
      bar: 1,
    });

    expect(res).toBe(obj);
  });
});

describe("paths are tokenized and retrieved correctly", () => {
  const testRecord = {
    _$data: {
      firstname: "Wolfram",
      lastname: "Hempel",
      address: {
        street: "currentStreet",
      },
      pastAddresses: [
        { street: "firststreet", postCode: 1001 },
        { street: "secondstreet", postCode: 2002 },
      ],
      1234: "integer index",
    },
  };

  it("retrieves simple paths", () => {
    expect(jsonPath.get(testRecord._$data, "firstname")).toBe("Wolfram");
  });

  it("retrieves nested paths", () => {
    expect(jsonPath.get(testRecord._$data, "address.street")).toBe(
      "currentStreet"
    );
  });

  it("retrieves array entries", () => {
    expect(jsonPath.get(testRecord._$data, "pastAddresses[1]")).toEqual({
      street: "secondstreet",
      postCode: 2002,
    });
  });

  it("retrieves other array entries", () => {
    expect(jsonPath.get(testRecord._$data, "pastAddresses[0]")).toEqual({
      street: "firststreet",
      postCode: 1001,
    });
  });

  it("retrieves values from objects within arrays", () => {
    expect(jsonPath.get(testRecord._$data, "pastAddresses[0].postCode")).toBe(
      1001
    );
  });

  it("handles whitespace", () => {
    expect(
      jsonPath.get(testRecord._$data, " pastAddresses[ 1 ].postCode ")
    ).toBe(2002);
  });

  it("handles integers", () => {
    expect(jsonPath.get(testRecord._$data, 1234)).toBe("integer index");
  });

  it("returns undefined for non existing keys", () => {
    expect(jsonPath.get(testRecord._$data, "doesNotExist")).toBe(undefined);
  });

  it("returns undefined for non existing nested keys", () => {
    expect(jsonPath.get(testRecord._$data, "address.number")).toBe(undefined);
  });

  it("returns undefined for existing array indices", () => {
    expect(jsonPath.get(testRecord._$data, "pastAddresses[3]")).toBe(undefined);
  });

  it("returns undefined for negative array indices", () => {
    expect(jsonPath.get(testRecord._$data, "pastAddresses[-1]")).toBe(
      undefined
    );
  });

  it("detects changes", () => {
    expect(jsonPath.get(testRecord._$data, "firstname")).toBe("Wolfram");
    testRecord._$data.firstname = "Egon";
    expect(jsonPath.get(testRecord._$data, "firstname")).toBe("Egon");
  });

  it("detects changes to arrays", () => {
    expect(jsonPath.get(testRecord._$data, "pastAddresses[1].street")).toBe(
      "secondstreet"
    );
    testRecord._$data.pastAddresses.pop();
    expect(jsonPath.get(testRecord._$data, "pastAddresses[1].street")).toBe(
      undefined
    );
  });
});

describe("objects are created from paths and their value is set correctly", () => {
  it("sets simple values", () => {
    const record = { _$data: {} };
    record._$data = jsonPath.set(record._$data, "firstname", "Wolfram");
    expect(jsonPath.get(record._$data, "firstname")).toBe("Wolfram");
    expect(record._$data).toEqual({ firstname: "Wolfram" });
  });

  it("sets values for nested objects", () => {
    const record = { _$data: {} };
    record._$data = jsonPath.set(record._$data, "adress.street", "someStreet");
    expect(jsonPath.get(record._$data, "adress.street")).toBe("someStreet");
    expect(record._$data).toEqual({
      adress: {
        street: "someStreet",
      },
    });
  });

  it("sets values for arrays", () => {
    const record = { _$data: {} };
    record._$data = jsonPath.set(
      record._$data,
      "pastAddresses[1].street",
      "someStreet"
    );
    expect(jsonPath.get(record._$data, "pastAddresses[1].street")).toBe(
      "someStreet"
    );
    expect(record._$data).toEqual({
      pastAddresses: [
        undefined,
        {
          street: "someStreet",
        },
      ],
    });
  });

  it("sets values for null values", () => {
    const record = {
      _$data: {
        job: null,
        joinedAt: 1480020987915,
      },
    };
    const jobId = { id: 88 };
    record._$data = jsonPath.set(record._$data, "job", jobId, true);
    expect(jsonPath.get(record._$data, "job.id")).toBe(88);
    expect(record._$data).toEqual({
      job: { id: 88 },
      joinedAt: 1480020987915,
    });
  });

  it("extends existing objects", () => {
    const record = { _$data: { firstname: "Wolfram" } };
    record._$data = jsonPath.set(record._$data, "lastname", "Hempel");
    expect(jsonPath.get(record._$data, "lastname")).toBe("Hempel");
    expect(record._$data).toEqual({
      firstname: "Wolfram",
      lastname: "Hempel",
    });
  });

  it("even when the path is not NaNish and could be interpreted as a base 16 number", () => {
    let record = {};
    const pathName = "0x02335";
    record = jsonPath.set(record, pathName, "value");
    expect(record[0]).toBe(undefined);
    expect(record[pathName]).toBe("value");
    expect(jsonPath.get(record, pathName)).toBe("value");
    expect(record[pathName]).toBe("value");
  });

  it("extends existing arrays", () => {
    const record = {
      _$data: {
        firstname: "Wolfram",
        animals: ["Bear", "Cow", "Ostrich"],
      },
    };
    record._$data = jsonPath.set(record._$data, "animals[ 1 ]", "Emu");
    expect(jsonPath.get(record._$data, "animals[ 1 ]")).toBe("Emu");
    expect(record._$data).toEqual({
      firstname: "Wolfram",
      animals: ["Bear", "Emu", "Ostrich"],
    });
  });
});

describe("plain JSON", () => {
  it("converts into plain JSON", () => {
    const time = new Date();
    const x = {
      a: time,
      b: undefined,
      c: [undefined],
      d: NaN,
      e: Infinity,
      g: {
        a: time,
      },
    };
    const res = jsonPath.set({ a: 1 }, null, x);
    expect(res).toEqual({
      a: time.toISOString(),
      c: [null],
      d: null,
      e: null,
      g: {
        a: time.toISOString(),
      },
    });
    expect(res.hasOwnProperty("b")).toEqual(false);
  });

  it("undefined is removed from src", () => {
    const y = jsonPath.EMPTY;
    const res = jsonPath.set(y, null, {
      b: undefined,
    });
    expect(Object.keys(res).length).toEqual(0);
    expect(res).toBe(y);
  });

  it("empty is EMPTY", () => {
    const y = {
      b: 1,
    };
    const res = jsonPath.set(y, null, {
      b: undefined,
    });
    expect(Object.keys(res).length).toEqual(0);
    expect(res).toBe(jsonPath.EMPTY);
    expect(res).toEqual({});
  });

  it("stringify date", () => {
    const y = {
      time: {},
    };
    const date = new Date();
    const res = jsonPath.set(
      y,
      null,
      {
        date,
      },
      false
    );
    expect(res.date).toEqual(date.toISOString());
  });

  it("remove property on undefined", () => {
    const y = {
      time: {},
    };
    const res = jsonPath.set(y, "time", undefined);
    expect(Object.keys(res)).toEqual([]);
  });
});
