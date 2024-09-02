const fs = require("node:fs");
const chokidar = require("chokidar");
const child_process = require("child_process");

let initDir = async () => {
  for (let path of [
    "../dist/document/css",
    "../dist/document/js",
    "../dist/modules",
    "../dist/media",
    "../dist/media/docs",
    "../dist/scripts",
  ]) {
    await child_process.execSync(
      [
        "powershell",
        "New-Item",
        "-Path",
        path,
        "-ItemType",
        "Directory",
        "-Force",
      ].join(" "));
  }
  await child_process.execSync(
    [
      "powershell",
      "Copy-Item",
      "-Path",
      "../src/modules",
      "-Destination",
      "../dist",
      "-Recurse",
      "-Force",
    ].join(" "));
}

(async () => {

  await initDir();

  chokidar.watch("../docs").on("all", (event, path) => {
    console.log(event, path);
    child_process.exec(
      [
        "powershell",
        "Copy-Item",
        "-Path",
        "../docs",
        "-Destination",
        "../dist/media",
        "-Recurse",
        "-Force",
      ].join(" "), (err, stdout, stderr) => {
      });
  });
  chokidar.watch("../src/document").on("all", (event, path) => {
    console.log(event, path);
    child_process.exec(
      [
        "powershell",
        "gate",
        "--index",
        "../src/document/index.html",
        "--out",
        "../dist/document/index.html",
        "--minify",
        "true",
      ].join(" "), (err, stdout, stderr) => {
      });

  });
  chokidar.watch("../src/document/css").on("all", (event, path) => {
    console.log(event, path);
    child_process.exec(
      [
        "powershell",
        "Copy-Item",
        "-Path",
        "../src/document/css",
        "-Destination",
        "../dist/document",
        "-Recurse",
        "-Force",
      ].join(" "), (err, stdout, stderr) => {
      });
  });
  chokidar.watch("../src/document/js").on("all", (event, path) => {
    console.log(event, path);
    child_process.exec(
      [
        "powershell",
        "Copy-Item",
        "-Path",
        "../src/document/js",
        "-Destination",
        "../dist/document",
        "-Recurse",
        "-Force",
      ].join(" "), (err, stdout, stderr) => {
      });
  });
  chokidar.watch("../src/media").on("all", (event, path) => {
    console.log(event, path);
    child_process.exec(
      [
        "powershell",
        "Copy-Item",
        "-Path",
        "../src/media",
        "-Destination",
        "../dist",
        "-Recurse",
        "-Force",
      ].join(" "), (err, stdout, stderr) => {
      });
  });
  chokidar.watch("../src/modules/BlueFox").on("all", (event, path) => {
    console.log(event, path);
    child_process.exec(
      [
        "powershell",
        "Copy-Item",
        "-Path",
        "../src/modules",
        "-Destination",
        "../dist",
        "-Recurse",
        "-Force",
      ].join(" "), (err, stdout, stderr) => {
      });
  });
  chokidar.watch("../src/scripts").on("all", (event, path) => {
    console.log(event, path);
    child_process.exec(
      [
        "powershell",
        "Copy-Item",
        "-Path",
        "../src/scripts",
        "-Destination",
        "../dist",
        "-Recurse",
        "-Force",
      ].join(" "), (err, stdout, stderr) => {
      });
  });
  chokidar.watch("../src/manifest.json").on("all", (event, path) => {
    console.log(event, path);
    child_process.exec(
      [
        "powershell",
        "Copy-Item",
        "-Path",
        "../src/manifest.json",
        "-Destination",
        "../dist",
        "-Recurse",
        "-Force",
      ].join(" "), (err, stdout, stderr) => {
      });
  });
})();
