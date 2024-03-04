<template>
  <div class="tool bg-white" :style="{ height: isAnnotation ? '100%' : '70vh' }">
    <li class="btn" title="Text" @click="
      isSignerSelected({
        active: tool.active,
        userEmail: tool.userEmail,
        userId: tool.userId,
        color: tool.color,
        toolId: 'textTool',
        tool_name: 'Textarea',
      })
      " :style="{
    border:
      '1px solid ' +
      (tool.color?.owner && tool.userEmail != ''
        ? '#28C76F !important'
        : isAnnotation
          ? tool.color?.code + '!important'
          : !tool.active
            ? '#333'
            : tool.color?.code + '!important'),
  }">
      Text
      <TextIcon />
    </li>
    <li class="btn" title="Full name" @click="
      isSignerSelected({
        active: tool.active,
        userEmail: tool.userEmail,
        userId: tool.userId,
        color: tool.color,
        toolId: 'nameTool',
        tool_name: 'Fullname',
      })
      " :style="{
    border:
      '1px solid ' +
      (tool.color?.owner && tool.userEmail != ''
        ? '#28C76F !important'
        : isAnnotation
          ? tool.color?.code + '!important'
          : !tool.active
            ? '#333'
            : tool.color?.code + '!important'),
  }">
      Full Name
      <TextIcon />
    </li>

    <li class="btn" title="Signature" @click="
      isSignerSelected({
        active: tool.active,
        userEmail: tool.userEmail,
        userId: tool.userId,
        color: tool.color,
        toolId: 'signTool',
        tool_name: 'Signature',
      })
      " :style="{
    border:
      '1px solid ' +
      (tool.color?.owner && tool.userEmail != ''
        ? '#28C76F !important'
        : isAnnotation
          ? tool.color?.code + '!important'
          : !tool.active
            ? '#333'
            : tool.color?.code + '!important'),
  }">
      Signature
      <Icon icon="mdi:file-sign" style="font-size: 1.5rem" />
    </li>

    <li class="btn" title="Initial" @click="
      isSignerSelected({
        active: tool.active,
        userEmail: tool.userEmail,
        userId: tool.userId,
        color: tool.color,
        toolId: 'initialTool',
        tool_name: 'Initial',
      })
      " :style="{
    border:
      '1px solid ' +
      (tool.color?.owner && tool.userEmail != ''
        ? '#28C76F !important'
        : isAnnotation
          ? tool.color?.code + '!important'
          : !tool.active
            ? '#333'
            : tool.color?.code + '!important'),
  }">
      Initial
      <InitialIcon />
    </li>

    <template v-if="planned == 'Business' || plan == 'Business'">
      <li class="btn" title="Seal" @click="
        isSignerSelected({
          active: tool.active,
          category: tool.category,
          type: tool.type,
          userEmail: tool.userEmail,
          userId: tool.userId,
          color: tool.color,
          toolId: 'sealTool',
          tool_name: 'Seal',
        })
        " :style="{
    border:
      '1px solid ' +
      (tool.color?.owner && tool.userEmail != ''
        ? '#28C76F !important'
        : isAnnotation
          ? tool.color?.code + '!important'
          : !tool.active
            ? '#333'
            : tool.color?.code + '!important'),
  }">
        Seal
        <SealIcon />
      </li>

      <li class="btn" title="Stamp" @click="
        isSignerSelected({
          active: tool.active,
          category: tool.category,
          type: tool.type,
          userEmail: tool.userEmail,
          userId: tool.userId,
          color: tool.color,
          toolId: 'stampTool',
          tool_name: 'Stamp',
        })
        " :style="{
    border:
      '1px solid ' +
      (tool.color?.owner && tool.userEmail != ''
        ? '#28C76F !important'
        : isAnnotation
          ? tool.color?.code + '!important'
          : !tool.active
            ? '#333'
            : tool.color?.code + '!important'),
  }">
        Stamp
        <StampIcon />
      </li>
    </template>

    <li class="btn" title="Passport picture" @click="
      isSignerSelected({
        active: tool.active,
        userEmail: tool.userEmail,
        userId: tool.userId,
        color: tool.color,
        toolId: 'photoTool',
        tool_name: 'Photograph',
      })
      " :style="{
    border:
      '1px solid ' +
      (tool.color?.owner && tool.userEmail != ''
        ? '#28C76F !important'
        : isAnnotation
          ? tool.color?.code + '!important'
          : !tool.active
            ? '#333'
            : tool.color?.code + '!important'),
  }">
      Images
      <ImageIcon />
    </li>

    <li class="btn" title="Date" @click="
      isSignerSelected({
        active: tool.active,
        userEmail: tool.userEmail,
        userId: tool.userId,
        color: tool.color,
        toolId: 'dateTool',
        tool_name: 'Date',
      })
      " :style="{
    border:
      '1px solid ' +
      (tool.color?.owner && tool.userEmail != ''
        ? '#28C76F !important'
        : isAnnotation
          ? tool.color?.code + '!important'
          : !tool.active
            ? '#333'
            : tool.color?.code + '!important'),
  }">
      Date
      <DateIcon />
    </li>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import TextIcon from "@/icons/TextIcon.vue";
import InitialIcon from "@/icons/InitialIcon.vue";
import DateIcon from "@/icons/DateIcon.vue";
import SealIcon from "@/icons/SealIcon.vue";
import StampIcon from "@/icons/StampIcon.vue";
import ImageIcon from "@/icons/ImageIcon.vue";

import { ref, defineProps, defineEmits, watch, computed, onMounted } from "vue";
import { useGetters } from "vuex-composition-helpers/dist";
import { useToast } from "vue-toast-notification";
const toast = useToast();

const { teams } = useGetters({ teams: "team/teams" });

const plan = ref("");

const planned = computed(() => {
  teams.value.map((team) => {
    if (team.active === true && team.subscription != null) {
      plan.value = team.subscription.plan.name;
    }
  });
  return plan.value;
});

const props = defineProps({ tool: Object, isAnnotation: Boolean, owner: Object });
const emit = defineEmits(["bindTool"]);

const tool = ref({});
watch(
  () => props.tool,
  (toolObj) => {
    if (toolObj) tool.value = toolObj;
  }
);

const isSignerSelected = (params) => {
  if (
    (params.userEmail == "" || params.color == null || !params.active) &&
    !props.isAnnotation
  )
    return toast.error("Kindly select a signer!", {
      timeout: 5000,
      position: "top-right",
    });

  emit("bindTool", params);
};

onMounted(() => {
  tool.value = props.tool
  teams.value.map((team) => {
    if (team.active === true && team.subscription != null) {
      plan.value = team.subscription.plan.name;
    }
  });
})
</script>

<style scoped>
.tool {
  padding: 0.58rem 1rem !important;
}
</style>
