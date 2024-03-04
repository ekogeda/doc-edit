<template>
  <div class="p-1">
    <div ref="swiperInfo" class="swiper-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide bg-white" v-for="(content, index) in swiperContent" :key="index">
          <div class="d-flex justify-content-center align-items-center">
            <div style="width:250px;height:250px">
              <img class="img-fluid" :src="content.imgSrc" alt="Auth Img" />
            </div>
          </div>

          <div class="bg-white rounded shadow-sm p-1 my-1">
            <p>{{ content.content }}</p>
          </div>
        </div>
      </div>
      <a class="text-primary" href="#">
        Learn More
        <Icon icon="ph:arrow-right-light" />
      </a>
    </div>

    <div class="m-auto d-flex align-items-center justify-content-center mt-2 gap-3">
      <SwiperPrevIcon />
      <div class="swiper-pagination swiper-login-pagination"></div>
      <SwiperNextIcon />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import SwiperPrevIcon from '@/icons/SwiperPrevIcon'
import SwiperNextIcon from '@/icons/SwiperNextIcon'

import { ref, onBeforeUnmount, onMounted } from "vue";
import { initSwiper, destroySwiper } from "@/plugins/SwiperInstance.js";

const swiperInfo = ref("");
const swiperContent = ref([
  { imgSrc: require('@/assets/auth-image1.png'), content: "We aim to streamline the process of reaching agreements and cultivate trust" },
  { imgSrc: require('@/assets/auth-image2.png'), content: "Say goodbye to the traditional hassles of finding a Notary." },
  { imgSrc: require('@/assets/auth-image3.png'), content: "We promote a sense of confidence and security in all your dealings." },
  { imgSrc: require('@/assets/auth-image4.png'), content: "We save valuable time and ensures the highest level of accuracy in legal documentation." },
]);

onBeforeUnmount(() => {
  destroySwiper();
});

onMounted(() => {
  initSwiper(swiperInfo.value, {
    spaceBetween: 50,
    loop: true,
    // speed:500,
    effect: "fade",
    pagination: {
      el: ".swiper-login-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
  });
});
</script>

<style lang="scss" scoped>
.swiper-slide img {
  width: 100%;
  height: auto;
}

.swiper-slide {
  opacity: 0 !important;
}

.swiper-slide-active {
  opacity: 1 !important;
}

.swiper-pagination {
  position: relative;
}

.swiper-pagination .swiper-pagination-bullet {
  margin: 0 6px;
}

.swiper-pagination-bullets.swiper-pagination-horizontal {
  top: 0;
  width: auto;
}

.swiper-button-prev {
  display: block;
  margin-top: 0;
  position: relative;
  left: auto;
  z-index: 2;

  &:focus {
    outline: none;
  }
}

.swiper-button-next {
  position: relative;
  display: block;
  margin-top: 0;
  right: auto;
  z-index: 2;

  &:focus {
    outline: none;
  }
}
</style>