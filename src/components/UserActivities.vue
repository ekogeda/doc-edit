<template>
  <div class="my-2">
    <div class="overflow-auto" style="height: 60vh">
      <span class="text-primary px-1 d-inline-block mb-1 border-3 border-bottom"
        style="border-color: #003bb3 !important">Activities</span>
      <div v-for="(participant, index) in signers" :key="index">
        <template v-if="participant.status != null">
          <template v-if="activeSigner(participant.user.id) || participant.status == 'Approved'">
            <div class="d-flex">
              <small class="d-block fw-normal">
                {{ timestamp(participant.updated_at) }}
              </small>
              <div class="vr" :style="{
                backgroundColor: participant.ownerDocument
                  ? '#28C76F!important'
                  : colorCode[index] + '!important',
              }" style="width: 3px; margin: 0 5px"></div>
              <div class="">
                <small class="d-block text-dark fw-bolder">
                  {{ participant.status }}
                </small>
                <small class="d-block fw-normal">
                  {{
                    participant.status == "Sent" && participant.iAddedMyselfToDocument
                    ? "By"
                    : participant.status != "Sent"
                      ? "By"
                      : "To"
                  }}
                  {{ `${participant.user.first_name} ${participant.user.last_name}` }}
                </small>
              </div>
            </div>
          </template>
          <hr v-if="activeSigner(participant.user.id) || participant.status == 'Approved'" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import moment from "moment";
import { ref, computed } from "vue";
import { useGetters } from "vuex-composition-helpers/dist";

const { userDocument, workingTools } = useGetters({
  userDocument: "document/userDocument",
  workingTools: "document/workingTools",
});

const colorCode = ref([
  "#e6194b",
  "#3f51b5",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#ffc107",
  "#ff5722",
]);

const timestamp = (params) => moment(params).fromNow();

const signers = computed(() => {
  let users = [];
  userDocument.value?.participants?.filter((item) => users.push(item));
  users.sort((a, b) => (a.updated_at > b.updated_at ? 1 : -1));
  return users;
});

const activeSigner = (userId) => {
  let activeTasks = null;
  workingTools.value.filter((tool) => {
    if (tool.user_id === userId) activeTasks = tool.signed;
  });
  return activeTasks;
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 3px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
