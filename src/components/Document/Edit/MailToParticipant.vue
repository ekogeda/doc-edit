<template>
  <form @submit.prevent="inviteParticipant">
    <!-- <div class="modal-body"> -->
    <div class="row">
      <div class="col-12">
        <div class="form-check form-check-primary form-switch mb-2">
          <label class="form-check-label fw-bold">
            <input type="checkbox" @change="siningOrder($event)" :checked="hasSequenceOrder" class="form-check-input" />
            Sign in order
          </label>
          <p class="text-secondary">
            By enabling this, participants added will have to sign in order
          </p>
        </div>
      </div>

      <div class="col-12">
        <draggable tag="ul" :component-data="{ tag: 'ul', name: 'flip-list', type: 'transition' }" :list="editableSigners"
          class="list-group" handle=".handle" item-key="order" :disabled="!enabled" ghost-class="ghost" :move="checkMove"
          @start="dragging = true" @end="dragging = false">
          <template #item="{ element, index }">
            <li class="list-group-item d-flex align-items-center p-0 border-0">
              <template v-if="isOrdered">
                <Icon icon="clarity:drag-handle-line" class="handle text-secondary" />

                <button type="button" class="btn btn-sm btn-outline-secondary" style="margin-right: 5px"
                  :class="{ 'not-draggable': !enabled }">
                  {{ ++index }}
                </button>
              </template>

              <div class="row gx-1">
                <div class="col-md-3 col-12">
                  <div class="">
                    <label class="form-label" for="first-name">First Name</label>
                    <input type="text" v-model="element.first_name" id="first-name" class="form-control form-control-sm"
                      readonly placeholder="First Name" name="first_name" />
                  </div>
                </div>
                <div class="col-md-3 col-12">
                  <div class="">
                    <label class="form-label" for="last-name-column">Last Name</label>
                    <input type="text" v-model="element.last_name" id="last-name-column"
                      class="form-control form-control-sm" readonly placeholder="Last Name" name="lname-column" />
                  </div>
                </div>
                <div class="col-md-3 col-12">
                  <div class="">
                    <label class="form-label" for="email-id-column">Email</label>
                    <input type="email" v-model="element.email" id="email-id-column" class="form-control form-control-sm"
                      name="email-id-column" readonly placeholder="Email" />
                  </div>
                </div>
                <div class="col-md-3 col-12">
                  <div class="">
                    <label class="form-label" for="role-column">Role</label>
                    <input type="text" v-model="element.role" id="role-column" class="form-control form-control-sm"
                      readonly placeholder="Role" name="role-column" />
                  </div>
                </div>

                <hr style="margin-top: 12px" />
              </div>
            </li>
          </template>
        </draggable>
      </div>
    </div>

    <template v-if="addMore === true">
      <draggable tag="ul" :component-data="{ tag: 'ul', name: 'flip-list', type: 'transition' }" :list="rows"
        class="list-group" handle=".handle" item-key="order" :disabled="!enabled" ghost-class="ghost" :move="checkMove"
        @start="dragging = true" @end="dragging = false">
        <template #item="{ element, index }">
          <li class="list-group-item d-flex align-items-center p-0 border-0">
            <template v-if="isOrdered">
              <Icon icon="clarity:drag-handle-line" class="handle text-secondary" style="margin-bottom: 5px" />

              <button type="button" class="btn btn-sm btn-outline-secondary" style="margin-right: 5px; margin-bottom: 5px"
                :class="{ 'not-draggable': !enabled }">
                {{ ++index }}
              </button>
            </template>

            <div class="row gx-1">
              <div class="col-md-3 col-12">
                <div class="">
                  <label class="form-label" for="first-name">First Name</label>
                  <input type="text" v-model="element.first_name" id="first-name" class="form-control form-control-sm"
                    placeholder="First Name" name="first_name" />
                </div>
              </div>
              <div class="col-md-3 col-12">
                <div class="">
                  <label class="form-label" for="last-name-column">Last Name</label>
                  <input type="text" v-model="element.last_name" id="last-name-column"
                    class="form-control form-control-sm" placeholder="Last Name" name="lname-column" />
                </div>
              </div>
              <div class="col-md-3 col-12">
                <div class="">
                  <label class="form-label" for="email-id-column">Email</label>
                  <input type="email" v-model="element.email" id="email-id-column" class="form-control form-control-sm"
                    name="email-id-column" placeholder="Email" />
                </div>
              </div>
              <div class="col-md-3 col-12">
                <div class="form-group mb-1">
                  <label class="form-label" for="role-column">Role</label>
                  <div class="d-flex">
                    <select name="role" id="role" v-model="element.role" class="form-select form-control-sm" required>
                      <option value="" selected>select role</option>
                      <option>Signer</option>
                      <option>Viewer</option>
                      <option>Approver</option>
                    </select>
                    <template v-if="element.action != '+'">
                      <button type="button" class="btn btn-sm alert-danger py-0 d-none d-md-block"
                        :class="['text-danger', isRemove]" @click="removeRow(isOrdered ? --index : index)"
                        style="margin-left: 5px">
                        <Icon icon="ic:baseline-minus" />
                      </button>
                    </template>
                  </div>
                </div>
              </div>
              <template v-if="element.action != '+'">
                <div class="col-md-12 d-none d-xs-block">
                  <small class="hover" :class="['text-danger', isRemove]" @click="removeRow(isOrdered ? --index : index)">
                    Remove
                  </small>
                </div>
              </template>

              <hr style="margin-bottom: 12px" />
            </div>
          </li>
        </template>
      </draggable>
    </template>

    <div class="row">
      <div class="col-12">
        <button type="button" @click="addRow" class="btn text-primary">
          <Icon icon="ic:baseline-plus" />
          Add more
        </button>
      </div>
      <div class="col-12 d-none">
        <div class="">
          <label class="form-label" for="subject-column">Subject</label>
          <input type="text" v-model="subject" id="subject-column" class="form-control" placeholder="Subject"
            name="lname-column" disabled />
        </div>
      </div>
      <div class="col-12">
        <div class="my-2">
          <label class="form-label fw-bold me-1" style="color: #000" for="message-column">Message</label>
          <textarea name="message" v-model="message" class="form-control" id="message-column" rows="4"
            placeholder="Enter a message..."></textarea>
        </div>
      </div>
    </div>

    <div class="modal-footer pe-0">
      <button type="button" class="btn border ms-auto" @click="$emit('close')">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary ms-1" :disabled="isLoading">
        <span v-show="isLoading" class="spinner-border spinner-border-sm"></span>
        Send
      </button>
    </div>
    <!-- </div> -->
  </form>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";
import { ref, defineEmits, defineProps, computed, onMounted } from "vue";
import { createNamespacedHelpers } from "vuex-composition-helpers/dist";

defineProps({ isLoading: Boolean });

const emit = defineEmits(["close"]);

const { useActions, useGetters } = createNamespacedHelpers(["document"]);

const { userDocument } = useGetters(["userDocument"]);
const { invitationMail } = useActions(["invitationMail"]);

const hasSequenceOrder = computed(() => userDocument.value.has_sequence_order);

const addMore = ref(false);
const isRemove = ref(false);
const subject = ref(userDocument.value.title);
const message = ref("");
const isOrdered = ref(hasSequenceOrder.value);
const sequenceOrder = ref(1);
const enabled = ref(true);
const dragging = ref(false);
const participants = ref(null);
const editableSigners = ref([]);

const siningOrder = (e) => (isOrdered.value = e.target.checked);

const rows = ref([]);
const addRow = () => {
  addMore.value = true;
  rows.value.push({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    sequence_order: sequenceOrder.value++,
    action: "-",
  });
};

const removeRow = (index) => {
  isRemove.value = true;
  rows.value.splice(index, 1);
};

const inviteParticipant = () => {
  let formObj = [];
  editableSigners.value.map((obj) => {
    formObj.push({
      document_id: userDocument.value.id,
      first_name: obj.first_name,
      last_name: obj.last_name,
      email: obj.email.toLowerCase(),
      phone: obj.phone,
      role: obj.role,
      sequence_order: sequenceOrder.value++,
    });
  });

  if (addMore.value === true) {
    rows.value.forEach((obj) => {
      formObj.push({
        document_id: userDocument.value.id,
        first_name: obj.first_name,
        last_name: obj.last_name,
        email: obj.email,
        phone: obj.phone,
        role: obj.role,
        sequence_order: sequenceOrder.value++,
      });
    });
  }

  formObj.subject = subject.value;
  formObj.message = message.value;
  invitationMail({ has_sequence_order: isOrdered.value, payload: formObj });
  emit("close", true);
};

onMounted(() => {
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
});
</script>

<style scoped>
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
</style>
