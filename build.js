import child_process from "child_process";

let cmd = [
  "rm ./dist",
  "mkdir ./dist",
  "copy ./src/* ./dist/*",

  // https://github.com/xoFeulB/gate.js
  "gate --index ./src/html/newtab.html --out ./src/html/newtab.html --root ./src",
];

cmd.forEach((_) => {
  child_process.spawn(_, [], { shell: true, stdio: "inherit" });
});