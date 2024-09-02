if (localStorage.theme) {
  document.querySelector("html").attributes.theme.value = localStorage.theme;
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.querySelector("html").attributes.theme.value = "Dark";
} else {
  document.querySelector("html").attributes.theme.value = "Light";
  localStorage.theme = "Light";
}