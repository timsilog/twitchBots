"use strict";

var arr = ["asd", "qwe", "zxc", "123", "fgh"];
var i = arr.findIndex(function (s) {
  console.log(s);
  return s == "asd";
});
console.log(i);
console.log("asd");