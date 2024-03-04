<template>
  <img v-if="b64" :src="b64" alt="my_signature" width="120" class="me-1" />
</template>

<script setup>
import { defineProps, onMounted, ref, watch } from "vue";
import { useConvertToBase64Composable } from "@/composables/useDataURL";

const { toBase64 } = useConvertToBase64Composable();

const b64 = ref(null);
const props = defineProps(["img"]);

watch(
  () => props.img,
  (newTool, oldTool) => {
    if (newTool != oldTool) {
      toBase64(newTool, (dataUrl) => {
        if (dataUrl != "") b64.value = dataUrl
      });
    }
  }
);

onMounted(() => {
  if (props.img) {
    toBase64(props.img, (dataUrl) => {
      if (dataUrl != "") b64.value = dataUrl
    });
  }
});
</script>