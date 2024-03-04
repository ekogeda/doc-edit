<template>
  <div class="sidebar-left">
    <div class="sidebar">
      <div class="sidebar-content email-app-sidebar">
        <div class="email-app-menu">
          <div class="sidebar-menu-list ps ps--active-y">
            <div class="list-group list-group-messages">
              <template v-if="!userDocument.is_the_owner_of_document && role != ''">
                <div class="list-group-item border-bottom">
                  <label class="form-label">Current participant</label>
                  <p class="mb-0">
                    {{ profile.first_name }} {{ profile.last_name }}
                    <span class="badge bg-warning">{{ role }}</span>
                  </p>
                </div>
              </template>

              <template v-else>
                <div v-show="!hasRole" class="text-center mt-5 mt-custom">
                  <span class="spinner-border spinner-border-sm"></span>
                  Loading...
                </div>
                <div v-show="hasRole">
                  <ToolKitsMobile :tool="userToolKit" @bindTool="addMouseMoveListener" />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalComp :show="addParticipantModal" :footer="false" @close="closeParticipantModal">
    <template #header>
      <h4 class="modal-title text-darker text-darker">Add participants</h4>
    </template>

    <template #body>
      <AddSigner @close="closeParticipantModal" />
    </template>
  </ModalComp>
</template>

<script setup>
import ModalComp from "@/components/ModalComp.vue";
import AddSigner from "@/components/Document/Edit/Left/AddSigner.vue";
import ToolKitsMobile from "@/components/Document/Edit/Mobile/ToolKitsMobile.vue";

import moment from "moment";
import { ref, onMounted, defineProps, defineEmits, watch, onUpdated, computed } from "vue";
import { useGetters, useActions } from "vuex-composition-helpers/dist";

import "jquery/dist/jquery.min";
import $ from "jquery";

import { useRouter } from "vue-router";

const route = useRouter();

const { profile, userDocument } = useGetters({
  profile: "auth/profile",
  userDocument: "document/userDocument",
});

const { resourceTools } = useActions({ resourceTools: "document/resourceTools" });

/* ------- // *** Props from views\documents\DocumentEdit.vue (PARENT) ------ */
const props = defineProps({ toolValue: Object, chunkFileId: String, isOpen: Boolean });
const emit = defineEmits(["close"]);
const watchFileId = ref("");
const uri = ref("");

watch(
  () => [userDocument.value, props.chunkFileId, props.isOpen],
  ([newUserDoc, newChunkF, newOpen]) => {
    if (newChunkF) {
      watchFileId.value = newChunkF;
    }

    if (newUserDoc) {
      filteredParticipant.value = newUserDoc.participants?.filter(
        (r) => r.role != "Viewer"
      );
    }

    if (newOpen) {
      addParticipantModal.value = newOpen;
    }
  },
  { deep: true }
);

const addParticipantModal = ref(false);
const filteredParticipant = ref("");
const hasRole = ref(false);
const role = ref("");
// const signerEmail = ref("");
// const participantId = ref("");

const tempStorage = ref(null);
const tool_class = ref("");
const tool_id = ref("");
// const toolKit = ref({});
const tempData = ref(false);

const closeParticipantModal = () => {
  addParticipantModal.value = false;
  emit("close", true);
};

const userToolKit = computed(() => {
  return props.toolValue
})


const addMouseMoveListener = (params) => {
  tempData.value = true;

  let count = 1;
  tempStorage.value = params;

  $(document).bind("click", function (e) {
    count = count + 1;
    tool_id.value = count;

    $("." + params.toolId).attr("id", count);
    $("." + params.toolId).css({
      left: e.pageX,
      top: e.pageY,
    });
  });
};

$(document).on("click", "#mainWrapper", function (e) {
  if (tempStorage.value == null) return;
  $("#" + tool_id.value).css("display", "none");
  removeMouseMoveListener();

  let posX = $(this).offset().left;

  let x = e.pageX - posX + 2;
  let y = e.offsetY - 5;

  // let offset = $(this).offset();

  // let x = e.pageX - offset.left - 50;
  // let y = e.pageY - offset.top - 30

  const toolName = tempStorage.value.tool_name;

  if (["Textarea", "Fullname", "Date", "Photograph"].includes(toolName)) {
    tool_class.value = "main-element";
  } else {
    tool_class.value = "tool-box main-element";
  }

  let saveTools = {
    category: ["Textarea", "Fullname", "Date"].includes(toolName) ? "Type" : "Upload",
    document_upload_id: watchFileId.value,
    document_id: uri.value,
    tool_class: tool_class.value,
    tool_height: ["Textarea", "Fullname", "Date"].includes(toolName)
      ? "18"
      : toolName == "Photograph"
        ? "100"
        : "30",
    tool_name: toolName,
    tool_pos_left: x.toString(),
    tool_pos_top: y.toString(),
    tool_width: ["Textarea", "Date"].includes(toolName)
      ? "110"
      : toolName == "Fullname"
        ? "210"
        : "100",
    type:
      toolName == "Textarea"
        ? "Text"
        : toolName == "Seal"
          ? "CompanySeal"
          : toolName == "Stamp"
            ? "CompanyStamp"
            : toolName,
    user_id: tempStorage.value.userId == "" ? profile.value.id : tempStorage.value.userId,
    value:
      toolName == "Fullname"
        ? fullName.value
        : toolName == "Date"
          ? moment().format("DD-MM-YYYY")
          : "",
  };

  if (tempData.value === true) {
    resourceTools(saveTools);
    tempData.value = false;
  }
});

function removeMouseMoveListener() {
  $(document).unbind("mousemove");
}

const fullName = ref(null);
onUpdated(() => {
  uri.value = route.currentRoute.value.params.document_id;

  if (userDocument.value?.participants_count > 0) {
    userDocument.value?.participants?.map((participant) => {
      if (participant?.user?.id == props.toolValue?.userId) {
        role.value = participant.role;
        fullName.value =
          participant?.user?.first_name + " " + participant?.user?.last_name;
      }
    });
  }
});

onMounted(() => {
  setTimeout(() => {
    hasRole.value = true;
    // toolKit.value = {
    //   participants_count: userDocument.value.participants_count,
    //   userEmail: profile.value.email,
    //   userId: profile.value.id,
    //   role: role.value,
    // };
  }, 1000);
});
</script>

<style scoped>
.btn.custom {
  padding: 0.786rem 0.5rem !important;
}

.sidebar-nav.sticky {
  top: 160px;
}

@media screen and (max-width: 991.5px) {
  .mt-custom {
    margin: 1rem 0 !important;
  }
}
</style>
