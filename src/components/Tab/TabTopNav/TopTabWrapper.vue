<template>
  <div :class="{ tabs_light: mode === 'light', tabs_dark: mode === 'dark' }">
    <ul class="tabs_header mt-1 mb-2">
      <li v-for="(title, index) in tabTitles" :key="index" @click="selectedTitle = title" class="tab"
        :class="{ tab__selected: title == selectedTitle }">
        {{ title }}
      </li>
    </ul>
  </div>

  <div class="bg-white">
    <slot />
  </div>
</template>

<script>
import { ref, provide } from "vue";

export default {
  props: {
    mode: {
      type: String,
      default: "light",
    },
  },
  setup(props, { slots }) {
    const tabTitles = ref(slots.default().map((tab) => tab.props.title));

    const selectedTitle = ref(tabTitles.value[0]);

    provide("selectedTitle", selectedTitle);
    return { selectedTitle, tabTitles };
  },
};
</script>

<style scoped>
ul.tabs_header {
  display: flex;
  /* justify-content: center; */
  align-items: center;
  list-style: none;
  margin: 0 auto;
  padding: 0;
  border-bottom: 1px solid #ccc;
}

ul.tabs_header>li {
  padding: 1px 20px;
  /* border-radius: 5px; */
  display: inline-block;
  margin-right: 10px;
  cursor: pointer;
  /* transition: 0.4s all ease-out; */
}

/* ul.tabs_header>li.tab__selected {
  font-weight: bold;
  border-radius: 5px;
} */

.tab {
  margin-bottom: 0;
}

.tabs_light .tab {
  background-color: #fff;
}

.tabs_light li {
  text-transform: capitalize;
  border-bottom: 3px solid #fff;
}

.tabs_light li.tab__selected {
  /* background-color: #003bb3;
  color: #fff; */
  border-bottom: 3px solid #003bb3;
}

.tabs_dark .tab {
  background-color: #555;
  color: #eee;
}

.tabs_dark li {
  background-color: #ddd;
  color: #aaa;
}

.tabs_dark li.tab__selected {
  background-color: #003bb3;
  color: #fff;
}

@media screen and (max-width: 767px) {
  ul.tabs_header>li {
    padding: 10px;
  }
}
</style>
