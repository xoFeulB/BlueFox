import { watch } from "chokidar";
import { BlueFoxDomGate } from "@xofeulb/bluefox-domgate";

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

watch("../components").on("all", async (event, path) => {
  console.log(event, path);
  gate_map.forEach((_) => {
    BlueFoxDomGate.connect(
      _.index,
      "../",
      _.out,
      undefined,
      undefined,
      true
    );
  });
});
