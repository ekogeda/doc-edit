<template>
  <div class="grid" v-if="!hasAccount">
    <PreLoader />
  </div>

  <div v-else class="auth-wrapper auth-basic px-1">
    <div v-if="!loader">
      <div class="card">
        <div class="card-body">
          <div class="brand-logo">
            <img
              src="https://skoutwatch.com/static/media/logo.1af99f8777344173aa7f.png"
              alt="skoutwatch Brand"
              height="26"
            />
          </div>

          <h2 class="card-title fw-bolder mb-1">Enter your password 💬</h2>
          <p class="card-text mb-75">
            Please, enter your password to view this document.
          </p>

          <form class="mt-2" @submit.prevent="verifyAccess">
            <div class="d-flex justify-content-between align-items-center">
              <label for="security" class="form-label">Password</label>
              <label class="form-label">
                <a :href="forgotPassword">Forgot Password?</a>
              </label>
            </div>

            <div class="form-group">
              <div class="input-group input-group-merge mb-1">
                <input
                  type="password"
                  v-model="otpPassword"
                  ref="pass"
                  class="form-control form-control-merge"
                  id="security"
                  placeholder="Enter your password"
                />
                <span class="input-group-text cursor-pointer" @click="togglePassword">
                  <Icon icon="bi:eye" style="font-size: 1.5rem" v-show="!show" />
                  <Icon icon="bi:eye-slash" style="font-size: 1.5rem" v-show="show" />
                </span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary w-100" tabindex="4">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import PreLoader from "@/components/PreLoader.vue";

import Api from "@/api/Api";
import { ref, onMounted } from "vue";
import { useActions, useGetters } from "vuex-composition-helpers/dist";
import { useRouter } from "vue-router";

const route = useRouter();
const { loader } = useGetters({
  loader: "auth/loader",
});

const { userVerifyOTP, clearStore, isGuest } = useActions({
  userVerifyOTP: "auth/userVerifyOTP",
  clearStore: "auth/clearStore",
  isGuest: "document/isGuest",
});

const uri = ref("");
const email = ref("");
const documentId = ref("");
const accessCode = ref(uri.value.access_code);
const otpPassword = ref("");
const forgotPassword = ref("");
const pass = ref("");
const show = ref(false);
const hasAccount = ref(false);

const togglePassword = () => {
  show.value = !show.value;
  pass.value.type = show.value ? "text" : "password";
};

const loading = ref(false);
const isChecked = ref(false);

const verifyAccess = () => {
  const verificationObj = {
    document_id: documentId.value,
    email: email.value,
    password: otpPassword.value,
  };
  userVerifyOTP({
    document_otp: accessCode.value,
    payload: verificationObj,
  });
};

onMounted(() => {
  clearStore();
  uri.value = route.currentRoute.value.query;
  email.value = uri.value.e;
  documentId.value = uri.value.document_id;
  accessCode.value = uri.value.access_code;

  const BASE_URL = process.env.VUE_APP_API_LIVE;

  const AUTH_FORGOT_PASSWORD = process.env.VUE_APP_URL_AUTH_FORGOT_PASSWORD_LIVE;

  Api.get(BASE_URL + "document-user-check/" + email.value).then((response) => {
    hasAccount.value = response.data.data.message.user_exist;
    // hasAccount.value = accessCode.value != '' ? true : false;

    if (!hasAccount.value && accessCode.value != "") {
      isGuest({ openGuestModal: !hasAccount.value });
      loading.value = isChecked.value = true;
      otpPassword.value = accessCode.value;

      setTimeout(() => {
        loading.value = false;
        verifyAccess();
      }, 2000);
    } else {
      clearStore();
    }
  });

  forgotPassword.value = AUTH_FORGOT_PASSWORD;
});
</script>

<style scoped>
.grid {
  display: grid;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
}

.auth-wrapper {
  min-height: 80vh;
}
</style>

<style>
@media screen and (max-width: 800px) {
  html [data-col="1-column"].horizontal-layout .app-content {
    padding: calc(2rem + 0.45rem + 1.3rem) 1rem 0 !important;
  }
}
</style>
