{
  let browser = chrome ? chrome : browser;
  browser.devtools.panels.create(
    "^.,.^ BlueFox",
    "/media/BlueFox_tp.png",
    "/panels/html/index.html",
    (panel) => {} // callback
  );
}
