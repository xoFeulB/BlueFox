// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

import anime from "/modules/anime/anime.es.js";

window.anime = (params) => {
  return new Promise((resolve, reject) => {
    params.complete = () => {
      resolve();
    };
    anime(params);
  });
};
