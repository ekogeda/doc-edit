<template>
  <div>
    <TopTabWrapper>
      <TopTabList title="Select">
        <div class="d-flex justify-content-between align-items-center flex-column" style="min-height: 21rem">
          <template v-if="sortedImg.length > 0">
            <div class="grid grid__3">
              <label v-for="(photo, index) in sortedImg" :key="index" class="form-check-label border" :for="photo.id">
                <PuSkeleton width="120px" height="120px" v-show="loader" />
                <div v-show="!loader"
                  @click="getPrintId({ type: photo.type, category: 'Upload', print_id: photo.id, file: photo.file })">
                  <template v-if="photo.user_id">
                    <div class="position-relative" style="width: 120px; height: 120px">
                      <input type="radio" name="photo" v-model="selected" class="form-check-input tool_name"
                        :id="photo.id" :value="photo.id" />

                      <template v-if="photo.type == 'Camera'">
                        <img :src="photo.file" class="w-100 h-100 transformed" :alt="photo.id" />
                      </template>
                      <template v-else>
                        <img :src="photo.file" class="w-100 h-100" style="object-fit: scale-down" :alt="photo.id" />
                      </template>

                      <a role="button" @click="deletePassport(photo.id)"
                        class="text-danger btn-close d-block text-end delete"></a>
                    </div>
                  </template>
                </div>
              </label>
            </div>
          </template>
          <div v-else>
            <p class="grid grid__1 text-center" style="height: 20vh">
              <i>kindly create a passport photograph!</i>
            </p>
          </div>

          <div class="modal-footer align-items-center justify-content-between px-0 pt-2 w-100 flex-wrapped">
            <div class="form-check d-inline-block form-check-primary form-switch">
              <label class="form-check-label">
                <input type="checkbox" @change="handleAutoFill" v-model="isAutoFill" :checked="isAutoFill"
                  class="form-check-input" />
                <strong>Auto fill</strong>&nbsp;
                <small>(Your passport will automatically be added to all the area specified)</small>
              </label>
            </div>

            <button type="button" class="btn btn-primary ms-auto" :disabled="!isSelected" @click="affixPassport">
              <span v-show="isLoading" class="spinner-border spinner-border-sm"></span>
              <span>Append</span>
            </button>
          </div>
        </div>
      </TopTabList>

      <TopTabList title="Upload">
        <template v-if="!isUpload">
          <p>MAX FILE SIZE: 2MB</p>
          <p class="text-danger">{{ fileValidated }}</p>
          <DropZone @drop.prevent="drop" @change="selectedFile">
            <template #format> PNG, JPEG OR JPG </template>
            <template #input>
              <input type="file" id="dropzoneFile" class="dropzoneFile" accept="image/png, image/jpg, image/jpeg" />
            </template>
          </DropZone>
        </template>
        <template v-else>
          <div class="d-flex flex-column justify-content-between position-relative">
            <CropperComp :data="imgUrl" :size="420" btnText="Upload" @uploaded="uploadPhotograph" />
            <div class="position-absolute top-0 start-100 translate-middle">
              <button class="btn-close bg-danger rounded-circle" v-show="isUpload" @click="isUpload = !isUpload"
                style="padding: 10px"></button>
            </div>
          </div>
        </template>
      </TopTabList>

      <TopTabList title="Take picture">
        <div class="app">
          <div class="text-center">
            <button type="button" class="btn btn-sm mb-2"
              :class="{ 'btn-primary': !isCameraOpen, 'btn-danger': isCameraOpen }" @click="toggleCamera">
              <span v-if="!isCameraOpen">Open Camera</span>
              <span v-else>Close Camera</span>
            </button>
          </div>

          <PassportCamera v-if="isCameraOpen" @close="closeSnap" @affix="affixPassport" />
        </div>
      </TopTabList>
    </TopTabWrapper>
  </div>

  <ModalComp :show="isDelete" :size="'modal-sm'" @close="isDelete = false">
    <template #header>
      <h4 class="modal-title text-danger">
        <Icon icon="eva:alert-triangle-outline" style="margin-bottom: 3px" />
        Alert
      </h4>
    </template>

    <template #body>
      <h5 class="text-center">Are you sure?</h5>
      <p class="fw-normal text-center"><i>You won't be able to revert this!</i></p>
    </template>

    <template #footer>
      <button type="button" class="btn btn-sm btn-primary d-block ms-auto" :class="{ disabled: loading }"
        @click="proceedToDelete">
        <span v-show="loading" class="spinner-border spinner-border-sm"></span>
        <span>Proceed</span>
      </button>
    </template>
  </ModalComp>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import CropperComp from '@/components/CropperComp.vue'
import DropZone from "@/components/DropZone.vue";

import { ref, defineEmits, computed } from "vue";

import PassportCamera from "@/components/Passport/PassportCamera.vue";

import TopTabList from "@/components/Tab/TabTopNav/TopTabList.vue";
import TopTabWrapper from "@/components/Tab/TabTopNav/TopTabWrapper.vue";
import ModalComp from "@/components/ModalComp.vue";

import { useActions, useGetters } from "vuex-composition-helpers/dist";

const { prints } = useGetters({
  prints: "print/prints",
  croppedWH: "document/croppedWH",
});

const { savePrint, removePrint } = useActions({
  savePrint: "print/savePrint",
  removePrint: "print/removePrint",
});

const dropzoneFile = ref("");
const imgUrl = ref(null);
const fileValidated = ref("");
const isSelected = ref(false);
const isUpload = ref(false);
const isLoading = ref(false);
const loading = ref(false);
const isDelete = ref(false);
const printId = ref("");
const selectedTitle = ref(false);
const isCameraOpen = ref(false);

const sortedImg = computed(() => {
  const files = [];
  prints.value?.Photograph?.filter((item) => {
    files.push({
      id: item.id,
      user_id: item.user_id,
      file: item.file,
      type: item.type,
      date: item.created_at,
    });
  });
  prints.value?.Camera?.filter((item) => {
    files.push({
      id: item.id,
      user_id: item.user_id,
      file: item.file,
      type: item.type,
      date: item.created_at,
    });
  });
  files.sort((a, b) => (a.date > b.date ? 1 : -1));
  return files;
});

const loader = ref(true);
setTimeout(() => (loader.value = false), 1000);

const preparedFile = (file) => {
  let reader = new FileReader();

  reader.onloadend = () => {
    imgUrl.value = reader.result;
  };

  reader.readAsDataURL(file);
  isSelected.value = true;
};

const drop = (e) => {
  isUpload.value = true;
  let dropFiles = (dropzoneFile.value = e.dataTransfer.files[0]);
  const fileSize = dropFiles.size;
  const fileMb = fileSize / 1024 ** 2;
  if (fileMb >= 2) {
    isUpload.value = false;
    fileValidated.value = "Please select a file less than 2MB.";
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
    fileValidated.value = "Please select a file less than 2MB.";
    setTimeout(() => {
      isSelected.value = false;
    }, 100);
  }

  preparedFile(dropFiles);
};

const isAutoFill = ref(false);
const handleAutoFill = (e) => (isAutoFill.value = e.target.checked);

const closeSnap = () => emit("close", true);

const emit = defineEmits(["close"]);
const uploadPhotograph = (params) => {
  isUpload.value = false;
  const uploadPassport = {
    file: params,
    type: "Photograph",
    category: "Upload",
  };

  savePrint(uploadPassport);
  selectedTitle.value = true;

  loading.value = true;
  isSelected.value = false;

  setTimeout(() => {
    loading.value = false;
    emit("closeInitialModal", true);
  }, 1000);
};

const printFile = ref('')
const printType = ref('')
const getPrintId = (params) => {
  isSelected.value = true;
  printId.value = params.print_id;
  printFile.value = params.file;
  printType.value = params.type;
};

const toggleCamera = () => (isCameraOpen.value = !isCameraOpen.value);

const initWidth = ref('')
const initHeight = ref('')
const affixPassport = (params) => {
  const img = new Image();
  img.onload = function () {
    let { width, height } = img;
    initWidth.value = width / 2
    initHeight.value = height / 2

    const uploadPassport = {
      append_print_id:
        params.append_print_id != undefined ? params.append_print_id : printId.value,
      category: "Upload",
      type: printType.value,
      file: params.file ?? printFile.value,
      tool_name: "Photograph",
      tool_class: "main-element photo-style",
      tool_width: initWidth.value.toString(),
      tool_height: initHeight.value.toString(),
      is_auto_fill: isAutoFill.value
    };
    emit("selectedPassport", uploadPassport);
    emit("close", true);
  }
  img.src = params.file != null ? params.file : printFile.value;

  isLoading.value = true;
  isSelected.value = false;
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
};

const deletePassport = (params) => {
  isSelected.value = false;
  isDelete.value = true;
  printId.value = params;
};

const proceedToDelete = () => {
  isLoading.value = false;
  loading.value = true;
  removePrint(printId.value);

  setTimeout(() => {
    isDelete.value = false;
    loading.value = false;
  }, 1000);
};
</script>

<style scoped>
.app {
  width: 100%;
  min-height: 33vh;
  display: grid;
  place-items: center;
}

.transformed {
  object-fit: scale-down;
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}

.grid {
  display: grid;
  place-items: center;
  gap: 20px;
}

.grid__3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid__1 {
  grid-template-columns: 1fr;
}

.grid__2 {
  grid-template-columns: 1fr 1fr;
}

.flex-wrapped {
  flex-wrap: nowrap;
}

[type="radio"] {
  position: absolute;
  opacity: 0;
}

[type="radio"]+img {
  cursor: pointer;
  margin-right: 0.5rem;
}

[type="radio"]+img:hover {
  outline: 0.5px solid #003bb3;
}

[type="radio"]:checked+img {
  outline: 3px solid #003bb3;
}

.delete {
  position: absolute;
  top: -14px;
  right: -14px;
  border-radius: 50%;
  border: 1px solid red;
  padding: 8px;
}

@media screen and (max-width: 991.5px) {
  .grid__3 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid__2 {
    grid-template-columns: 1fr;
  }

  .flex-wrapped {
    flex-wrap: wrap;
  }
}
</style>
