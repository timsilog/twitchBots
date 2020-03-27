let toggle = 0;

setTimeout(() => {
  toggle = 1;
}, 5000);
const printDone = () => {
  if (!toggle) {
    console.log("waiting");
    setTimeout(() => {
      printDone();
    }, 1000);
    return;
  }
  console.log("done");
}
printDone();