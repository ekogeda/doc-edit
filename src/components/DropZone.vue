<template>
  <div class="w-100">
    <div @dragenter.prevent="toggleActive" @dragleave.prevent="toggleActive" @dragover.prevent
      @drop.prevent="toggleActive" :class="{ 'active-dropzone': active }" class="dropzone rounded-3">
      <label for="dropzoneFile" class="custom-upload" role="button">
        <div class="text-center">
          <p class="d-flex align-items-center justify-content-center rounded-circle mx-auto"
            style="width:45px;height:45px;background: #ebe9f1;">
            <Icon icon="prime:upload" style="font-size: 1.5rem;" />
          </p>
          <p>Drag and drop or</p>
          <p class="btn btn-primary fw-normal mb-0">Click to upload</p>
          <div class="text-muted mt-1" style="font-size: 12px">
            <slot name="format">PDF, DOC, DOCX, PNG, JPG or JPEG only</slot>
          </div>
          <slot name="input">
            <input type="file" id="dropzoneFile" multiple class="dropzoneFile" />
          </slot>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { ref } from "vue";

const active = ref(false);

const toggleActive = () => (active.value = !active.value);
</script>

<style scoped>
.dropzone {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 16px;
  border: 1px dashed #ccc;
  background-color: #f8f8f8;
  transition: 0.3s ease all;
  /* border-radius: 3px; */
}

label {
  transition: 0.3s ease all;
}

.dropzone input {
  display: none;
}

.active-dropzone {
  color: #fff;
  border-color: #fff;
  background-color: #00cfe8;
}

.custom-upload {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

.dropzone:hover {
  border-color: #4169e1;
}

@media screen and (max-width: 767.98px) {
  p.btn {
    padding: 10px;
  }

}
</style>
