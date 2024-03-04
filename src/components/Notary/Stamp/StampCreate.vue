<template>
  <div class="row">
    <div class="form-group col-6 mb-1">
      <label class="form-label">Company Name:</label>
      <input type="text" class="input form-control" placeholder="Company Name" v-model="name" />
    </div>
    <div class="form-group col-6 mb-1">
      <label class="form-label">Company Address:</label>
      <input type="text" class="input form-control" placeholder="Your place, State" v-model="address" />
    </div>
    <div class="form-group col-6 mb-1">
      <label class="form-label">Email:</label>
      <input type="text" class="input form-control" placeholder="Company Email" v-model="email" />
    </div>
    <div class="form-group col-6 mb-1">
      <label class="form-label">Phone Number:</label>
      <input type="tel" class="input form-control" placeholder="Your place, State" v-model="phone" />
    </div>

    <hr />

    <div class="position-relative">
      <div ref="capture">
        <div class="mx-auto my-1 bordered">
          <div>
            <h4 class="text-center mb-2 text-darker fw-bolder">{{ name }}</h4>
            <h5 class="text-center mb-1 text-darker fw-bolder custom-fs-sm">{{ address }}</h5>
            <h5 class="text-center mb-0 text-darker fw-bolder custom-fs-sm">
              {{ email }} | {{ phone }}
            </h5>
          </div>
        </div>
      </div>
    </div>
  </div>

  <button type="button" class="btn btn-primary d-block ms-auto mt-2" :disabled="loading" @click="captureStamp">
    <span v-show="loading" class="spinner-border spinner-border-sm"></span>
    <span>Save</span>
  </button>
</template>

<script setup>
import html2canvas from "html2canvas";
import { ref, defineEmits, onMounted } from "vue";

import { useGetters, useActions } from "vuex-composition-helpers/dist";

const { token, companies } = useGetters({
  token: "auth/token",
  companies: "company/companies",
});

const { savePrint, getCompanies } = useActions({
  savePrint: "print/savePrint",
  getCompanies: "company/getCompanies",
});

const loading = ref(false);
const capture = ref("");
const name = ref(companies.value.company_name);
const address = ref(companies.value.address);
const email = ref(companies.value.email);
const phone = ref(companies.value.phone);
const data = ref("");

const emit = defineEmits(["close"]);
const captureStamp = async () => {
  loading.value = true;

  try {
    const canvas = await html2canvas(capture.value, {
      backgroundColor: "transparent",
      scale: 2,
    });

    const imageData = canvas.toDataURL("image/png");

    data.value = { file: imageData, type: "CompanyStamp", category: "Upload" };
    savePrint(data.value);

    loading.value = false;
    emit("close", true);
  } catch (error) {
    loading.value = false;
    console.error("Error capturing and saving the image:", error);
  }
};

onMounted(() => {
  getCompanies(token.value);
});
</script>

<style scoped>
.bordered {
  display: grid;
  align-items: center;
  border: 2px dashed #000;
  border-radius: 10px;
  min-height: 130px;
}

.preview {
  position: absolute;
  top: 150px;
  right: 30px;
  width: 200px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  place-items: center;
  gap: 20px;
}

@media screen and (max-width: 991.5px) {
  .custom-fs-sm {
    font-size: 1rem;
  }
}
</style>
