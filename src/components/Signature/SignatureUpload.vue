<template>
  <div>
    <template v-if="!isUpload">
      <p class="text-darker mt-2">Upload signature from your device
        <br />
        MAX FILE SIZE: 2MB
      </p>
      <p class="text-danger">{{ fileValidated }}</p>
      <DropZone @drop.prevent="drop" @change="selectedFile">
        <template #format> PNG, JPEG OR JPG </template>
        <template #input>
          <input type="file" id="dropzoneFile" class="dropzoneFile" accept="image/png, image/jpg, image/jpeg" />
        </template>
      </DropZone>
    </template>
    <template v-else>
      <div class="d-flex flex-column justify-content-between mt-2 position-relative" style="min-height: 400px">
        <CropperComp :data="imgUrl" :size="580" btnText="Create" @uploaded="uploadSignature" />

        <div class="position-absolute top-0 start-100" style="transform: translate(-150%, -60%) !important">
          <button class="btn-close bg-danger rounded-circle" v-show="isUpload" @click="isUpload = !isUpload"
            style="padding: 10px"></button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, defineEmits } from "vue";
import DropZone from "@/components/DropZone.vue";
import CropperComp from "@/components/CropperComp.vue";
import { createNamespacedHelpers } from "vuex-composition-helpers/dist";
const { useActions } = createNamespacedHelpers(["print"]);
// const { prints } = useGetters(["prints"]);
const { savePrint } = useActions(["savePrint"]);

const isSelected = ref(false);
const isUpload = ref(false);
const dropzoneFile = ref("");
const fileValidated = ref("");
const imgUrl = ref("");

function preparedFile(file) {
  let reader = new FileReader();
  reader.onloadend = () => {
    imgUrl.value = reader.result;
  };

  reader.readAsDataURL(file);
  isSelected.value = true;
}

const drop = (e) => {
  isUpload.value = true;
  let dropFiles = (dropzoneFile.value = e.dataTransfer.files[0]);
  const fileSize = dropFiles.size;
  const fileMb = fileSize / 1024 ** 2;
  if (fileMb >= 2) {
    isUpload.value = false;
    fileValidated.value = "Please upload a signature less than 2MB.";
    setTimeout(() => {
      isSelected.value = false;
    }, 100);
  }
  preparedFile(dropFiles);
};

const selectedFile = () => {
  isUpload.value = true;
  let dropFiles = (dropzoneFile.value = document.querySelector(".dropzoneFile").files[0]);
  const fileSize = dropFiles.size;
  const fileMb = fileSize / 1024 ** 2;
  if (fileMb >= 2) {
    isUpload.value = false;
    fileValidated.value = "Please upload a signature less than 2MB.";
    setTimeout(() => {
      isSelected.value = false;
    }, 100);
  }
  preparedFile(dropFiles);
};

const emit = defineEmits(["close"]);

const uploadSignature = (params) => {
  isUpload.value = false;
  const signatureObj = {
    file: params,
    type: "Signature",
    category: "Upload",
  };
  savePrint(signatureObj);
  emit("close", true);
};
</script>

<style scoped>
.grid {
  display: grid;
  place-items: center;
  gap: 10px;
}

.grid__2 {
  grid-template-columns: 1fr 1fr;
}

@media screen and (max-width: 991.5px) {
  .grid__2 {
    grid-template-columns: 1fr;
  }
}
</style>
