<template>
  <a v-if="fromDocEdit && !showAvatar" class="dropdown-item" role="button" @click="editSignerModal = true">
    <Icon icon="ep:view" class="text-primary" />&nbsp; View all participants
  </a>

  <div v-if="showAvatar" :class="[
    isDocOwner ? 'd-flex flex-wrap align-items-center' : '',
    fromDocEdit ? 'my-0' : 'my-1',
    type != 'lg' ? 'justify-content-end' : 'justify-content-between',
  ]">
    <template v-if="!isDocOwner">
      <div v-if="type == 'lg'" class="mt-1" :style="[
        !isOwner && initialObj.length > 5 ? 'height:26vh;overflow-y:scroll' : '',
      ]">
        <div v-for="(user, index) in initialObj" :key="index">
          <div class="custom-avatar rounded-circle me-1 mb-1" :style="{
            border: isOwner
              ? '1px solid #28C76F!important'
              : '1px solid ' + colorCode[index] + '!important',
            color: isOwner ? '#28C76F!important' : colorCode[index] + '!important',
          }">
            {{ user.initials }}
          </div>
          {{ user.fullName }}
        </div>
      </div>
      <div v-else class="d-flex justify-content-end">
        <UserAvatarGroup />
      </div>
    </template>
    <div v-else class="d-flex justify-content-end">
      <UserAvatarGroup />
    </div>

    <div v-if="!fromDocEdit" role="button" @click="editSignerModal = true">
      <span class="isHover" style="margin-left: 10px">View all <span>&rightarrow;</span></span>
    </div>
  </div>

  <Teleport to="body">
    <ModalComp :show="editSignerModal" :header="false" :footer="false" @close="closeSignerModal">
      <template #body>
        <h3 class="modal-title text-darker my-2">
          {{ isDocOwner ? "Edit participants" : "Participants" }}
        </h3>

        <form @submit.prevent="onUpdateSigner">
          <div v-if="isOwner" class="row">
            <div class="col-12">
              <div class="form-check form-check-primary form-switch mb-2">
                <label class="form-check-label fw-bold">
                  <input type="checkbox" @change="siningOrder($event)" :checked="hasSequenceOrder"
                    class="form-check-input" />
                  Sign in order
                </label>
                <p class="text-secondary">
                  By enabling this, participants added will have to sign in order
                </p>
              </div>
            </div>
          </div>

          <div id="addSignerErrorMsg" class="text-center text-danger"></div>
          <draggable tag="ul" :component-data="{ tag: 'ul', name: 'flip-list', type: 'transition' }"
            :list="editableSigners" class="list-group" handle=".handle" item-key="order" :disabled="!enabled"
            ghost-class="ghost" :move="checkMove" @start="dragging = true" @end="dragging = false">
            <template #item="{ element, index }">
              <li class="list-group-item d-flex align-items-center p-0 border-0">
                <template v-if="isOrdered">
                  <Icon icon="clarity:drag-handle-line" class="handle text-secondary" style="margin-bottom: 5px" />

                  <button type="button" class="btn btn-sm" style="margin-right: 5px; margin-bottom: 5px"
                    :class="{ 'not-draggable': !enabled }" :style="{
                      color: element.owner ? '#28C76F' : colorCode[index],
                      border:
                        '2px solid' + (element.owner ? '#28C76F' : colorCode[index]),
                    }">
                    {{ ++index }}
                  </button>
                </template>

                <div class="row gx-1">
                  <div class="col-md-3 col-12">
                    <div class="form-group mb-1">
                      <label class="form-label" for="first-name">First Name</label>
                      <input :readonly="element.owner || !isDocOwner" type="text" v-model="element.first_name"
                        class="form-control form-control-sm" />
                    </div>
                  </div>
                  <div class="col-md-3 col-12">
                    <div class="form-group mb-1">
                      <label class="form-label" for="last-name-column">Last Name</label>
                      <input :readonly="element.owner || !isDocOwner" type="text" name="last_name"
                        v-model="element.last_name" class="form-control form-control-sm" />
                    </div>
                  </div>
                  <div class="col-md-3 col-12">
                    <div class="form-group mb-1">
                      <label class="form-label" for="email-id-column">Email</label>
                      <input :readonly="element.owner || !isDocOwner" type="email" name="email" v-model="element.email"
                        class="form-control form-control-sm" />
                    </div>
                  </div>
                  <div class="col-md-3 col-12">
                    <div class="form-group mb-1">
                      <label class="form-label" for="role-column">Role</label>
                      <div class="d-flex">
                        <select name="role" :disabled="!isDocOwner" v-model="element.role"
                          class="form-select form-control-sm" required>
                          <option value="">select role</option>
                          <option :selected="element.role == 'Signer' ? true : false">
                            Signer
                          </option>
                          <option :selected="element.role == 'Viewer' ? true : false">
                            Viewer
                          </option>
                          <option :selected="element.role == 'Approver' ? true : false">
                            Approver
                          </option>
                        </select>
                        <template v-if="element.action != '+'">
                          <button type="button" class="btn btn-sm alert-danger py-0 d-none d-md-block"
                            @click="remove(element.id)" style="margin-left: 5px" :disabled="!isDocOwner">
                            <Icon icon="ic:baseline-minus" />
                          </button>
                        </template>
                      </div>
                    </div>
                  </div>

                  <template v-if="isDocOwner">
                    <div class="col-md-12 d-none d-xs-block">
                      <small role="button" style="font-size: small" class="text-danger" @click="remove(element.id)">
                        Remove
                      </small>
                    </div>
                  </template>
                  <hr />
                </div>
              </li>
            </template>
          </draggable>

          <div class="modal-footer border-0 pe-0">
            <button v-if="isDocOwner" type="submit" class="btn btn-primary">
              Update
            </button>
          </div>
        </form>
      </template>
    </ModalComp>
  </Teleport>

  <Teleport to="body">
    <ModalComp :show="removeParticipantModal" :size="'modal-sm'" :header="false" @close="removeParticipantModal = false">
      <template #body>
        <div class="my-2">
          <h4 class="modal-title text-darker text-center">
            Are you sure you want to remove this signer?
          </h4>
          <p class="fw-normal text-center">
            This will remove all tools added in the signer's name
          </p>
        </div>
      </template>
      <template #footer>
        <button class="btn border me-1" @click="removeParticipantModal = false">
          Cancel
        </button>
        <button class="btn btn-danger" @click="deleteParticipant">Yes Remove</button>
      </template>
    </ModalComp>
  </Teleport>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";
import ModalComp from "@/components/ModalComp.vue";
import UserAvatarGroup from "@/components/Document/Edit/Left/UserAvatarGroup.vue";

import { computed, onMounted, ref, defineEmits, defineProps, watch } from "vue";
import { useGetters, useActions } from "vuex-composition-helpers/dist";
import { useBreakpointsComposable } from "@/composables/useBreakpoints";
const { type } = useBreakpointsComposable();

const { userDocument, profile, workingTools } = useGetters({
  profile: "auth/profile",
  userDocument: "document/userDocument",
  workingTools: "document/workingTools",
});

const { removeParticipant, editParticipant } = useActions({
  removeParticipant: "document/removeParticipant",
  editParticipant: "document/editParticipant",
});

workingTools.value = computed(() => workingTools.value);

const hasSequenceOrder = computed(() => userDocument.value.has_sequence_order);

const props = defineProps({ isOpen: Boolean, fromDocEdit: Boolean, showAvatar: Boolean });
const emit = defineEmits(["close"]);

const isOwner = ref(false);
const removeParticipantModal = ref(false);
const editSignerModal = ref(false);
const fullName = ref("");
const participantId = ref("");
const nameInitials = ref("");
const initialObj = ref([]);
const participants = ref([]);

const enabled = ref(true);
const dragging = ref(false);
const isOrdered = ref(false);

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

const editableSigners = ref([]);
watch(
  () => [
    userDocument.value?.participants,
    props.isOpen,
    userDocument.value.has_sequence_order,
  ],
  ([newUserDoc, newOpen, newOrder], [, , oldOrder]) => {
    if (newUserDoc) {
      editableSigners.value = [];

      newUserDoc.map((obj) => {
        editableSigners.value.push({
          id: obj.id,
          document_id: userDocument.value?.id,
          document_participant_id: obj.id,
          first_name: obj.user.first_name,
          last_name: obj.user.last_name,
          email: obj.user.email,
          phone: obj.user.phone,
          role: obj.role,
          sequence_order: obj.sequence_order,
          owner: obj.ownerDocument,
        });

        editableSigners.value.sort((a, b) =>
          a.sequence_order > b.sequence_order ? 1 : -1
        );
      });
    }
    if (newOpen) editSignerModal.value = newOpen;

    if (newOrder != oldOrder) isOrdered.value = newOrder;
  }
);

const closeSignerModal = () => {
  editSignerModal.value = false;
  isOrdered.value = userDocument.value.has_sequence_order;
  emit("close", true);
};

const siningOrder = (e) => (isOrdered.value = e.target.checked);

const getFirstLetters = (str) => {
  const firstLetters = str
    .split(" ")
    .map((word) => word[0])
    .join("");

  return firstLetters;
};

const onUpdateSigner = () => {
  let formObj = [];

  editableSigners.value.map((obj, index) => {
    formObj.push({
      document_id: userDocument.value?.id,
      document_participant_id: obj.id,
      first_name: obj.first_name,
      last_name: obj.last_name,
      email: obj.email,
      phone: obj.phone,
      role: obj.role,
      sequence_order: ++index,
    });
  });

  editParticipant({ has_sequence_order: isOrdered.value, payload: formObj });
  editSignerModal.value = false;
  emit("close", true);
};

const remove = (params) => {
  removeParticipantModal.value = true;
  participantId.value = params;
};

const deleteParticipant = () => {
  removeParticipant(participantId.value);
  removeParticipantModal.value = false;
};

const isDocOwner = ref(false);
onMounted(() => {
  isDocOwner.value = userDocument.value.is_the_owner_of_document;
  if (!isDocOwner.value) enabled.value = false;

  participants.value = userDocument.value?.participants;
  participants.value?.map((obj) => {
    editableSigners.value.push({
      id: obj.id,
      document_id: userDocument.value?.id,
      document_participant_id: obj.id,
      first_name: obj.user.first_name,
      last_name: obj.user.last_name,
      email: obj.user.email,
      phone: obj.user.phone,
      role: obj.role,
      sequence_order: obj.sequence_order,
      owner: obj.ownerDocument,
    });

    editableSigners.value.sort((a, b) => (a.sequence_order > b.sequence_order ? 1 : -1));
  });

  if (participants.value == undefined) return;

  initialObj.value = [];
  participants.value.map((params) => {
    fullName.value = params.user.first_name + " " + params.user.last_name;
    nameInitials.value = getFirstLetters(fullName.value);
    initialObj.value.push({
      id: params.id,
      initials: nameInitials.value,
      fullName: fullName.value,
    });
  });

  if (participants.value != undefined || userDocument.value?.participants_count > 0) {
    participants.value.map((participant) => {
      if (participant.user.id === profile.value.id)
        return (isOwner.value = participant.ownerDocument);
    });
  }
});
</script>

<style scoped>
.avatar-group .avatar {
  margin-left: -0.55rem !important;
}

.avatar-group .avatar .avatar-content {
  background-color: #fff !important;
}

.custom-avatar {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.isHover {
  background-image: linear-gradient(to right, #003bb3, #003bb3 50%, #000 50%);
  background-size: 200% 100%;
  background-position: -100%;
  display: inline-block;
  padding: 5px 0;
  position: relative;
  background-clip: "text";
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease-in-out;
}

.isHover:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  border-radius: 4px;
  background-color: #003bb3;
  bottom: 0;
  left: 0;
  transform-origin: right;
  transform: scaleX(0);
  transition: transform 0.3s ease-in-out;
}

.isHover:hover {
  background-position: 0;
}

.isHover:hover::before {
  transform-origin: left;
  transform: scaleX(1);
}

.handle {
  display: flex;
  font-size: 3rem;
  cursor: move;
  margin-right: -5px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

@media screen and (max-width: 765px) {
  .d-xs-block {
    display: block !important;
  }

  .handle {
    width: 40%;
  }
}

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
