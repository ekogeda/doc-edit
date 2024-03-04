// src/swiperInstance.js
import Swiper from 'swiper/bundle'
// import Swiper from 'swiper/swiper-bundle.js';
import 'swiper/swiper-bundle.css';

let swiperInstance = null;

export function initSwiper(el, options) {
  if (!swiperInstance) {
    swiperInstance = new Swiper(el, options);
  }
}

export function destroySwiper() {
  if (swiperInstance) {
    swiperInstance.destroy();
    swiperInstance = null;
  }
}