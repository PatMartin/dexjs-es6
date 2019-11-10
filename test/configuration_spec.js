var config = new dex.Configuration({"option": "a"});

describe("dex.Configuration", function () {

  it("configuration: empty", function () {
    expect(new dex.Configuration()
      .config).toEqual({});
  })
  it("configuration: base", function () {
    expect(new dex.Configuration({"option": "a"})
      .get("option")).toEqual("a");
  })

  it("configuration: hierarchy", function() {
    expect(new dex.Configuration({"a.b": 1}).config).toEqual({a:{b:1}})
  })

  it("configuration: hierarchical set", function() {
    let config = new dex.Configuration();
    config.set("a.b.c", "d");
    expect(config.get("a.b.c")).toEqual("d");
  })
})