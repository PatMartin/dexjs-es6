describe("matrix", function () {
  var matrix1 = [[1,2,3],[4,5,6]];

  it("extent", function() {
    expect(dex.matrix.extent(matrix1)).toEqual([1, 6]);
  });

  it("flatten", function() {
    expect(dex.matrix.flatten(matrix1)).toEqual([1,2,3,4,5,6]);
    expect(matrix1).toEqual([[1,2,3],[4,5,6]]);
  });
})