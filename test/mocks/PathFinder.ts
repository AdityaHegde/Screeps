let PathFinder = function () {
};
PathFinder["CostMatrix"] = function () {
  this.matrix = {};
};
PathFinder["CostMatrix"].prototype.set = function (x, y, value) {
  this.matrix[x + "__" + y] = value;
};
PathFinder["CostMatrix"].prototype.get = function (x, y) {
  return this.matrix[x + "__" + y];
};

export default function (sandbox) {
  global["PathFinder"] = PathFinder;
  global["PathFinder"].CostMatrix.prototype.serialize = sandbox.stub().returnsArg(0);
  global["PathFinder"].CostMatrix.deserialize = sandbox.stub().returnsArg(0);
}
