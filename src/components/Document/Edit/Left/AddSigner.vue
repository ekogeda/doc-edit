<template>
  <form @submit.prevent="onAddParticipant">
    <div id="addSignerErrorMsg" class="text-center text-danger"></div>
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
    </div>

    <div class="col-12">
      <draggable tag="ul" :component-data="{ tag: 'ul', name: 'flip-list', type: 'transition' }" :list="rows"
        class="list-group" handle=".handle" item-key="order" :disabled="!enabled" ghost-class="ghost" :move="checkMove"
        @start="dragging = true" @end="dragging = false">
        <template #item="{ element, index }">
          <li class="list-group-item d-flex align-items-center p-0 border-0">
            <template v-if="isOrdered">
              <Icon icon="clarity:drag-handle-line" class="handle text-secondary" style="margin-bottom: 5px" />

              <button type="button" class="btn btn-sm" style="margin-right: 5px; margin-bottom: 5px"
                :class="{ 'not-draggable': !enabled }"
                :style="{ color: element.color, border: '2px solid' + element.color }">
                {{ ++index }}
              </button>
            </template>

            <div class="row gx-1">
              <div class="col-md-3 col-12">
                <div class="">
                  <label class="form-label" for="first-name">First Name</label>
                  <input type="text" v-model="element.first_name" id="first-name" class="form-control form-control-sm"
                    required placeholder="First Name" name="first_name" />
                </div>
              </div>
              <div class="col-md-3 col-12">
                <div class="">
                  <label class="form-label" for="last-name-column">Last Name</label>
                  <input type="text" v-model="element.last_name" id="last-name-column"
                    class="form-control form-control-sm" required placeholder="Last Name" name="lname-column" />
                </div>
              </div>
              <div class="col-md-3 col-12">
                <div class="">
                  <label class="form-label" for="email-id-column">Email</label>
                  <input type="email" v-model="element.email" id="email-id-column" class="form-control form-control-sm"
                    name="email-id-column" required placeholder="Email" />
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
    </div>

    <div class="col-12">
      <button type="button" @click="addRow" class="btn text-primary">
        <Icon icon="ic:baseline-plus" />
        Add more
      </button>
    </div>

    <div class="modal-footer border-0 pb-0 pe-0">
      <button type="submit" class="btn btn-primary">Save</button>
    </div>
  </form>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";
import { ref, defineEmits, computed } from "vue";
import { generateRandomHexColor } from "@/utils";
import { useGetters, useActions } from 'vuex-composition-helpers/dist';

const emit = defineEmits(["close"]);

const { userDocument } = useGetters({
  userDocument: 'document/userDocument',
});

const { addParticipant } = useActions({
  addParticipant: 'document/addParticipant',
});

const hasSequenceOrder = computed(() => userDocument.value.has_sequence_order);

const isRemove = ref(false);
const randomColor = ref("#2803fc");
const isOrdered = ref(hasSequenceOrder.value);
const sequenceOrder = ref(1);
const enabled = ref(true);
const dragging = ref(false);

const siningOrder = (e) => (isOrdered.value = e.target.checked);

const rows = ref([
  {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    sequence_order:
      userDocument.value.participants_count == 0
        ? sequenceOrder.value++
        : (userDocument.value.participants_count += sequenceOrder.value++),
    action: "+",
    color: randomColor.value,
  },
]);

const addRow = () => {
  randomColor.value = generateRandomHexColor();

  rows.value.push({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    sequence_order:
      userDocument.value.participants_count == 0
        ? sequenceOrder.value++
        : (userDocument.value.participants_count += sequenceOrder.value++),
    action: "-",
    color: randomColor.value,
  });
};

const removeRow = (index) => {
  isRemove.value = true;
  rows.value.splice(index, 1);
};

let formObj = [];
const onAddParticipant = () => {
  rows.value.forEach((obj, index) => {
    formObj.push({
      document_id: userDocument.value.id,
      first_name: obj.first_name,
      last_name: obj.last_name,
      email: obj.email,
      phone: obj.phone,
      role: obj.role,
      sequence_order: (userDocument.value.participants_count += ++index),
    });
  });

  addParticipant({ has_sequence_order: isOrdered.value, payload: formObj });
  emit("close", true);
  formObj = [];
  rows.value = [
    {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
      sequence_order: "",
      action: "+",
      color: randomColor.value,
    },
  ];
};
</script>

<style scoped>
.hover:hover {
  cursor: pointer;
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
</style>
