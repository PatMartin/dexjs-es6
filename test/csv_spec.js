describe("dex.Csv", function () {
  var emptyCtor = new dex.Csv();
  var headerCtor = new dex.Csv(["A", "B"]);

  it("Empty Constructor", function () {
    expect(emptyCtor.header).toEqual([]);
    expect(emptyCtor.data).toEqual([]);
  });

  it("Header Only", function () {
    expect(headerCtor.header).toEqual(["A", "B"]);
    expect(headerCtor.data).toEqual([]);
  });
})