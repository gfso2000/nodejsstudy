// #!javascript
// # spec/myModule2.spec.js
var myModule2 = require("../myModule2");

describe("myModule2", function () {
  it("should return from sayhello", function () {
    var result = myModule2.sayHello();
    expect(result).toBe("Hello myModule2");
  });

  it("should return from sayhello2", function () {
    var result = myModule2.sayHello();
    expect(result).toBe("Hello myModule2 xxxxxx");
  });
});    