<template>
  <form @submit.prevent="onShareEmail">
    <div id="addSignerErrorMsg" class="text-center text-danger"></div>
    <div class="row gx-1" v-for="(row, index) in rows" :key="index">
      <div class="col-12">
        <label class="form-label" for="email-id-column">Email</label>
        <div class="input-group mb-1">
          <span class="input-group-text p-0" :style="{ border: '1px solid' + row.color, color: row.color }">
            <Icon icon="ic:round-email" style="font-size:2rem" />
          </span>
          <input type="email" v-model="row.email" id="email-id-column" class="form-control form-control-sm"
            name="email-id-column" :style="{ border: '1px solid' + row.color }" placeholder="Email" required />
        </div>
      </div>

      <template v-if="row.action != '+'">
        <div class="col-md-12">
          <small class="hover" :class="['text-danger', isRemove]" @click="removeRow(index)">
            Remove
          </small>
        </div>
      </template>
      <hr />
    </div>

    <div class="d-flex justify-content-between align-items-center">
      <button type="button" @click="addRow" class="btn btn-sm btn-warning waves-effect waves-float waves-light">
        Add more
      </button>

      <button type="submit" class="btn btn-sm btn-primary waves-effect waves-float waves-light">
        Send
      </button>
    </div>
  </form>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { ref, defineEmits, defineProps } from "vue";
import { generateRandomHexColor } from '@/utils'

const emit = defineEmits(["close"]);
const props = defineProps({ docId: String });

const isRemove = ref(false);
const randomColor = ref("#ff0000")

const rows = ref([{ email: "", action: "+", color: '' }]);
const addRow = () => {
  randomColor.value = generateRandomHexColor();
  rows.value.push({ email: "", action: "-", color: randomColor.value });
};

const removeRow = (index) => {
  isRemove.value = true;
  rows.value.splice(index, 1);
};

let formObj = [];
const onShareEmail = () => {
  rows.value.forEach((obj) => {
    formObj.push({ document_id: props.docId, email: obj.email });
  });

  emit('shareEmail', formObj);
  emit("close", true);
  formObj = [];
  rows.value = [{ email: "", action: "+", color: '' }];
};
</script>

<style scoped>
.hover:hover {
  cursor: pointer;
}
</style>
