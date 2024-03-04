<template>
  <div class="list-group-item list-group-item-action p-2" v-if="tool.role == 'Viewer'">
    <h5>You are to bear witness to this document.</h5>
    <p>Thank you!</p>
  </div>
  <div v-else class="position-relative" style="transition: 0.25s linear"
    :style="{ height: isHeight ? 160 + 'px' : initHeight + 'px' }">
    <template v-if="planned == 'Business' && type == 'xs'">
      <div class="position-absolute" style="
          top: -50px;
          left:13px;
          padding: 10px;
          z-index: -1;
          background: #fff;
          box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px;
        " @click="setInitHeight">
        <Icon icon="uiw:up" v-if="!isHeight" style="font-size: 2rem" />
        <Icon icon="uiw:down" v-else style="font-size: 2rem" />
      </div>
    </template>

    <div class="tool-mobile p-1 d-flex justify-content-center align-items-center text-center gap-1 flex-wrap shadow">
      <li :data-user="tool.userId" :data-email="tool.userEmail" data-value="Textarea" @click="
        isSignerSelected({
          toolId: 'textTool',
          tool_name: 'Textarea',
          active: tool.active,
          userEmail: tool.userEmail,
          userId: tool.userId,
          color: tool.color,
          count: tool.participants_count,
        })
        ">
        <div class="btn c-tool-size rounded-circle d-flex justify-content-center align-items-center" :style="{
          border:
            '1px solid ' +
            (tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important'),
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">
          <TextIcon />
        </div>
        <small class="text-center text-primary" :style="{
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">Text</small>
      </li>

      <li :data-user="tool.userId" :data-email="tool.userEmail" data-value="Text" @click="
        isSignerSelected({
          toolId: 'nameTool',
          tool_name: 'Fullname',
          active: tool.active,
          userEmail: tool.userEmail,
          userId: tool.userId,
          color: tool.color,
          count: tool.participants_count,
        })
        ">
        <div class="btn c-tool-size rounded-circle d-flex justify-content-center align-items-center" :style="{
          border:
            '1px solid ' +
            (tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important'),
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">
          <TextIcon />
        </div>
        <!-- <p class="mb-0 text-primary text-center" style="width:70px">Full name</p> -->
        <small class="text-center text-primary" :style="{
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">Full name</small>
      </li>

      <li :data-user="tool.userId" :data-email="tool.userEmail" data-value="Sign" @click="
        isSignerSelected({
          toolId: 'signTool',
          tool_name: 'Signature',
          active: tool.active,
          userEmail: tool.userEmail,
          userId: tool.userId,
          color: tool.color,
          count: tool.participants_count,
        })
        ">
        <div class="btn c-tool-size rounded-circle d-flex justify-content-center align-items-center" :style="{
          border:
            '1px solid ' +
            (tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important'),
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">
          <Icon icon="mdi:file-sign" style="font-size: 1.5rem" />
        </div>
        <small class="text-center text-primary" :style="{
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">Signature</small>
      </li>

      <li :data-user="tool.userId" :data-email="tool.userEmail" data-value="Initial" @click="
        isSignerSelected({
          toolId: 'initialTool',
          tool_name: 'Initial',
          active: tool.active,
          userEmail: tool.userEmail,
          userId: tool.userId,
          color: tool.color,
          count: tool.participants_count,
        })
        ">
        <div class="btn c-tool-size rounded-circle d-flex justify-content-center align-items-center" :style="{
          border:
            '1px solid ' +
            (tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important'),
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">
          <InitialIcon />
        </div>
        <small class="text-center text-primary" :style="{
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">Initial</small>
      </li>

      <li :data-user="tool.userId" :data-email="tool.userEmail" data-value="Image" @click="
        isSignerSelected({
          toolId: 'photoTool',
          tool_name: 'Photograph',
          active: tool.active,
          userEmail: tool.userEmail,
          userId: tool.userId,
          color: tool.color,
          count: tool.participants_count,
        })
        ">
        <div class="btn c-tool-size rounded-circle d-flex justify-content-center align-items-center" :style="{
          border:
            '1px solid ' +
            (tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important'),
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">
          <ImageIcon />
        </div>
        <small class="text-center text-primary" :style="{
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">Image</small>
      </li>

      <li :data-user="tool.userId" :data-email="tool.userEmail" data-value="Date" @click="
        isSignerSelected({
          toolId: 'dateTool',
          tool_name: 'Date',
          active: tool.active,
          userEmail: tool.userEmail,
          userId: tool.userId,
          color: tool.color,
          count: tool.participants_count,
        })
        ">
        <div class="btn c-tool-size rounded-circle d-flex justify-content-center align-items-center" :style="{
          border:
            '1px solid ' +
            (tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important'),
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">
          <DateIcon />
        </div>
        <small class="text-center text-primary" :style="{
          color:
            tool.color?.owner && tool.userEmail != ''
              ? '#28C76F !important'
              : tool.color?.code + '!important',
        }">Date</small>
      </li>

      <template v-if="planned == 'Business'">
        <li :data-user="tool.userId" :data-email="tool.userEmail" data-value="Seal" @click="
          isSignerSelected({
            toolId: 'sealTool',
            tool_name: 'Seal',
            userId: tool.userId,
            userEmail: tool.userEmail,
            count: tool.participants_count,
          })
          ">
          <div class="btn c-tool-size rounded-circle d-flex justify-content-center align-items-center" :style="{
            border:
              '1px solid ' +
              (tool.color?.owner && tool.userEmail != ''
                ? '#28C76F !important'
                : tool.color?.code + '!important'),
            color:
              tool.color?.owner && tool.userEmail != ''
                ? '#28C76F !important'
                : tool.color?.code + '!important',
          }">
            <SealIcon />
          </div>
          <small class="text-center text-primary" :style="{
            color:
              tool.color?.owner && tool.userEmail != ''
                ? '#28C76F !important'
                : tool.color?.code + '!important',
          }">Seal</small>
        </li>

        <li :data-user="tool.userId" :data-email="tool.userEmail" data-value="Stamp" @click="
          isSignerSelected({
            toolId: 'stampTool',
            tool_name: 'Stamp',
            userId: tool.userId,
            userEmail: tool.userEmail,
            count: tool.participants_count,
          })
          ">
          <div class="btn c-tool-size rounded-circle d-flex justify-content-center align-items-center" :style="{
            border:
              '1px solid ' +
              (tool.color?.owner && tool.userEmail != ''
                ? '#28C76F !important'
                : tool.color?.code + '!important'),
            color:
              tool.color?.owner && tool.userEmail != ''
                ? '#28C76F !important'
                : tool.color?.code + '!important',
          }">
            <StampIcon />
          </div>
          <small class="text-center text-primary" :style="{
            color:
              tool.color?.owner && tool.userEmail != ''
                ? '#28C76F !important'
                : tool.color?.code + '!important',
          }">Stamp</small>
        </li>
      </template>
    </div>
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
import { useBreakpointsComposable } from "@/composables/useBreakpoints";
const { type } = useBreakpointsComposable();
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
planned;
const props = defineProps({ tool: Object });
const emit = defineEmits(["bindTools"]);

const initHeight = ref(75);
const isHeight = ref(false);
const setInitHeight = () => {
  isHeight.value = !isHeight.value;
};

const tool = ref({});
watch(
  () => props.tool,
  (toolObj) => (tool.value = toolObj)
);

const isSignerSelected = (params) => {
  if (params.userEmail == "" || params.userEmail == undefined || params.count == 0)
    return toast.error("Kindly select a signer!", {
      timeout: 5000,
      position: "top-right",
    });

  emit("bindTool", params);
};

onMounted(() => {
  tool.value = props.tool;
});
</script>

<style scoped>
.tool {
  padding: 0.58rem 1.5rem !important;
}
</style>
