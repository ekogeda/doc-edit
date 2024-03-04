<template>
  <ImageComponent v-for="(url, index) in getSignatureFromTools" :key="url + index" :img="url.append_print.file" />
</template>

<script setup>
import { computed, defineProps } from "vue";
import { useGetters } from "vuex-composition-helpers/dist";
import ImageComponent from "@/components/Document/Edit/Tools/ImageComponent.vue";

const props = defineProps(["userId"]);

const { workingTools } = useGetters({
  workingTools: "document/workingTools",
});

const getSignatureFromTools = computed(() => {
  const tools = workingTools.value.filter((tool) => {
    return (
      tool.signed == true &&
      tool.tool_name == "Signature" &&
      tool.user_id == props.userId
    );
  });
  return [
    ...new Map(tools.map((item) => [item.append_print.value, item])).values(),
  ];
});
</script>

<style scoped></style>