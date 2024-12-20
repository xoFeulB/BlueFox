const chokidar = require("chokidar");
const child_process = require("child_process");

let gate_map = [
  {
    index: "../components/newtab/index.html",
    out: "../BlueFox/html/newtab.html",
  },
  {
    index: "../components/focus/index.html",
    out: "../BlueFox/html/focus.html",
  },
];

chokidar.watch("../components").on("all", async (event, path) => {
  console.log(event, path);
  gate_map.forEach((_) => {
    child_process.exec(
      [
        "powershell",
        "gate",
        "--index",
        _.index,
        "--out",
        _.out,
        "--root",
        "../",
        "--minify",
        "true",
      ].join(" "), (err, stdout, stderr) => {
      });
  });


});
