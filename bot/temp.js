let arr = ["asd", "qwe", "zxc", "123", "fgh"];
let i = arr.findIndex(s => {
  console.log(s);
  return s == "asd";
});
console.log(i);
console.log("asd");