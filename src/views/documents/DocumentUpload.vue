<template>
  <div class="grid" v-if="loadingAuth ? loadingAuth : isLoading">
    <PreLoader />
  </div>

  <section class="row" :class="{ 'px-3': type == 'md' }" v-else>
    <div class="col-12 col-lg-8 mx-auto">
      <div
        class="email-header-left d-flex align-items-center fw-bold"
        style="font-size: 1rem"
      >
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a href="!#">
                <Icon icon="ri:home-6-line" style="font-size: 1.5rem" />
              </a>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              <router-link :to="{ name: 'document.upload' }" role="button">
                E-Sign
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Upload Document</li>
          </ol>
        </nav>
      </div>

      <div class="grid" v-show="isSubmitted">
        <PreLoader />
      </div>
      <div v-show="!isSubmitted">
        <h4 class="text-darker my-2">Sign Document</h4>

        <Form @submit="onProceed" :validation-schema="schema" v-slot="{ errors }">
          <div class="card mb-0 rounded-3 border-0">
            <div class="card-body px-4 p-custom">
              <h4 class="text-darker my-2">Upload Document</h4>
              <template v-if="!initialUpload">
                <DropZone @drop.prevent="drop" @change="selectedFile($event, true)">
                  <!-- <template #format>Upload PDF</template> -->
                  <template #input>
                    <input
                      type="file"
                      id="dropzoneFile"
                      multiple
                      class="dropzoneFile"
                      accept="image/*, .doc, .docx, .pdf"
                    />
                  </template>
                </DropZone>
              </template>
              <template v-else>
                <div class="custom-row">
                  <div class="text-center" v-for="(prev, index) in dataFile" :key="index">
                    <div
                      class="p-1 rounded-3 position-relative"
                      style="outline: 1px solid #003bb3; height: 200px"
                    >
                      <div
                        @click="removeItem(index, false)"
                        class="position-absolute top-0 end-0 text-danger"
                        style="margin: 0.5rem; cursor: pointer"
                      >
                        <Icon icon="material-symbols:close" style="font-size: 1.5rem" />
                      </div>
                      <img
                        src="@/assets/default.png"
                        class="mb-1 rounded"
                        :alt="prev.title"
                        style="width: 120px"
                      />
                      <div class="d-flex align-items-center justify-content-between">
                        <div class="">
                          <button
                            type="button"
                            class="btn-sm btn-outline-primary text-truncate truncated-width"
                            :style="{ width: type != lg ? '110px' : '200px' }"
                          >
                            {{ prev.title }}
                          </button>
                        </div>
                        <div class="">
                          <span>{{ prev.size }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="">
                    <DropZone @drop.prevent="drop" @change="selectedFile($event, true)">
                      <!-- <template #format>Upload PDF</template> -->
                      <template #input>
                        <input
                          type="file"
                          id="dropzoneFile"
                          multiple
                          class="dropzoneFile"
                          accept="image/*, .doc, .docx, .pdf"
                        />
                      </template>
                    </DropZone>
                  </div>
                </div>
              </template>

              <div class="my-2">
                <p class="text-darker">You can upload up to 20 files, Max 10MB each.</p>
              </div>

              <hr class="my-2" />

              <div class="d-flex align-items-center custom-d-flex">
                <div style="width: 90px">Group title</div>
                <div class="w-100">
                  <Field
                    name="title"
                    type="text"
                    id="gTitle"
                    class="form-control"
                    :class="{ 'is-invalid': errors.title }"
                    placeholder="Enter document title"
                    v-model="title"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.title }}</div>
                </div>
              </div>

              <div>
                <p class="text-darker fw-bold mt-4 mb-2">Settings</p>
                <div class="form-check d-inline-block form-check-primary form-switch">
                  <label class="form-check-label">
                    <input
                      type="checkbox"
                      @change="handleReminder"
                      v-model="hasReminder"
                      :checked="hasReminder"
                      class="form-check-input"
                    />
                    Reminder
                  </label>
                </div>

                <div class="vr mx-1 d-none d-md-inline-block text-secondary"></div>

                <span class="d-xs-block">
                  Send a reminder to all signers every
                  <input
                    type="text"
                    v-model="reminderFrequency"
                    class="form-control d-inline text-center rounded"
                    style="
                      width: 40px;
                      padding-top: 0 !important;
                      padding-bottom: 0 !important;
                    "
                  />
                  day/s</span
                >
              </div>

              <button
                type="submit"
                class="btn btn-primary mt-4 mb-3 d-block me-auto"
                :class="{ disabled: !isSelected }"
              >
                Proceed
              </button>
            </div>
          </div>

          <!-- <div class="mb-2 p-2">
            <button type="submit" class="btn btn-primary d-block me-auto" :class="{ disabled: !isSelected }">
              Proceed
            </button>
          </div> -->
        </Form>
      </div>
    </div>
  </section>

  <ModalComp
    :show="openDeleteDoc"
    :size="'modal-sm'"
    :header="false"
    :footer="false"
    @close="openDeleteDoc = false"
  >
    <template #body>
      <div class="my-2">
        <h4 class="text-darker">Delete document</h4>
        <p>Are you sure you want to proceed?</p>
      </div>

      <div class="mb-1">
        <button class="btn border me-1" @click="openDeleteDoc = false">Cancel</button>
        <button @click="removeItem(itemIndex, true)" class="btn btn-danger">Yes</button>
      </div>
    </template>
  </ModalComp>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import PreLoader from "@/components/PreLoader.vue";
import DropZone from "@/components/DropZone.vue";
import ModalComp from "@/components/ModalComp.vue";
import { Form, Field } from "vee-validate";
import { dashboard } from "@/store/dashboard";
import { useBreakpointsComposable } from "@/composables/useBreakpoints";
const { type } = useBreakpointsComposable();

import { ref, toRaw, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useActions, useGetters } from "vuex-composition-helpers/dist";

const { token, isLoading } = useGetters({
  token: "auth/token",
  isLoading: "document/isLoading",
});

const { fileUploads, getUserPrints, removeLoader } = useActions({
  fileUploads: "document/fileUploads",
  getUserPrints: "print/getUserPrints",
  removeLoader: "document/removeLoader",
});

const initialUpload = ref(false);
const isSubmitted = ref(false);
const isSelected = ref(false);
const dropzoneFile = ref("");
const dataFile = ref([]);
const title = ref("");

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

dataFile.value = [];
const preparedFile = (files) => {
  for (const params of files) {
    const reader = new FileReader();
    const fileSize = formatBytes(params.size);
    const fileName = params.name.split(".").slice(0, -1).join(".");

    reader.onloadend = () => {
      dataFile.value.push({
        file: reader.result,
        title: fileName,
        size: fileSize,
        entry_point: "Docs",
      });
    };

    reader.readAsDataURL(params);
  }

  isSelected.value = true;
};

const drop = (e) => {
  initialUpload.value = true;
  let dropFiles = (dropzoneFile.value = e.dataTransfer.files);
  title.value = dropzoneFile.value[0].name.split(".").slice(0, -1).join(".");
  preparedFile(dropFiles);
  isSelected.value = true;
};

const selectedFile = (e, init) => {
  initialUpload.value = init;
  let dropFiles = (dropzoneFile.value = e.target.files);
  title.value = dropFiles[0].name.split(".").slice(0, -1).join(".");
  preparedFile(dropFiles);
  isSelected.value = true;
};

const openDeleteDoc = ref(false);
const itemIndex = ref("");

const removeItem = (index, remove) => {
  itemIndex.value = index;
  if (!remove) {
    return (openDeleteDoc.value = true);
  }
  dataFile.value.splice(itemIndex.value, 1);
  if (dataFile.value.length == 0) {
    title.value = "";
    initialUpload.value = isSelected.value = false;
  }
  openDeleteDoc.value = false;
};

const hasReminder = ref(false);
const hasApprover = ref(false);
const hasSigningSequence = ref(false);
const reminderFrequency = ref("1");

const handleReminder = (e) => (hasReminder.value = e.target.checked);

const onProceed = (params) => {
  const uploadFile = {
    title: params.title,
    entry_point: "Docs",
    files: toRaw(dataFile.value),
    has_reminder: hasReminder.value,
    reminder_frequency: reminderFrequency.value,
    has_approval_sequence: hasApprover.value,
    has_signing_sequence: hasSigningSequence.value,
  };

  fileUploads(uploadFile);

  title.value = "";
  dataFile.value = [];
  isSubmitted.value = isLoading.value;
  initialUpload.value = false;
};

const route = useRouter();
const uri = ref("");
const loadingAuth = ref(true);
const hasToken = ref("");

onMounted(() => {
  removeLoader();
  uri.value = route.currentRoute.value.query;
  hasToken.value =
    uri.value.qt != undefined || uri.value.qt != null ? uri.value.qt : token.value;

  if (hasToken.value == undefined || hasToken.value == "" || hasToken.value == null) {
    return;
  }

  dashboard.value.setToken(hasToken.value);

  getUserPrints(hasToken.value);

  loadingAuth.value = false;
});
</script>

<style scoped>
.breadcrumb-item + .breadcrumb-item:before {
  content: "/" !important;
  background-image: none !important;
  /* color: #6E6B7B; */
  margin-right: 0 !important;
}

.grid {
  display: grid;
  place-items: center;
  height: 80vh;
}

.avatar-sm {
  height: 3rem;
  width: 3rem;
}

.custom-row {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);
}

.truncated-width {
  width: 200px;
}

.d-xs-block {
  display: inline-block;
}

@media screen and (max-width: 767.98px) {
  .p-custom {
    padding: 1rem !important;
  }

  /* .custom-row .row>* {
    width: auto !important;
  } */
  .custom-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .truncated-width {
    width: 60px !important;
  }

  .d-xs-block {
    display: block;
    margin: 10px 0;
  }

  .custom-btn-width {
    width: 200px !important;
  }

  .custom-img-width {
    width: 40% !important;
  }

  .custom-d-flex {
    display: block !important;
  }
}

@media screen and (max-width: 800px) {
  html [data-col="1-column"].horizontal-layout .app-content {
    padding: calc(2rem + 3.45rem + 1.3rem) 1rem 0 !important;
  }
}
</style>

<style>
@media screen and (max-width: 800px) {
  html [data-col="1-column"].horizontal-layout .app-content {
    padding: calc(2rem + 3.45rem + 1.3rem) 1rem 0 !important;
  }
}
</style>
