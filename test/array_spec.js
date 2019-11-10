describe("dex.array", function () {

  it("copy: Copying numbers", function () {
    var array1 = dex.array.copy([1, 2, 3]);
    expect(array1).toEqual([1, 2, 3]);
  });

  it("extent", function () {
    expect(dex.array.extent([4, 2, 5, -1, 100])).toEqual([-1, 100]);
  });
})