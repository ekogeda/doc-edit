import { ref, onMounted, onUnmounted, computed } from "vue";

export const useBreakpointsComposable = () => {
  let windowWidth = ref(window.innerWidth);
  let windowHeight = ref(window.innerHeight);

  const onWidthChange = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  };
  onMounted(() => {
    window.addEventListener("resize", onWidthChange)
    setTimeout(() => {
      if (window.Tawk_API) window.Tawk_API.hideWidget();
    }, 500);
  });
  onUnmounted(() => window.removeEventListener("resize", onWidthChange));

  const type = computed(() => {
    if (windowWidth.value < 550) return "xs";
    if (windowWidth.value >= 550 && windowWidth.value < 1200) return "md";
    if (windowWidth.value >= 1200) return "lg";
    return null;
  });

  const width = computed(() => windowWidth.value);
  const height = computed(() => windowHeight.value);

  return { width, height, type };
}