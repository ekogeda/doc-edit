<template>
  <div class="main-menu menu-fixed menu-light menu-accordion menu-shadow">
    <div class="navbar-header">
      <ul class="nav navbar-nav flex-row">
        <li class="nav-item me-auto">
          <router-link class="navbar-brand" :to="{ name: 'Dashboard' }">
            <span class="brand-logo">
              <img
                src="https://skoutwatch.com/static/media/logo.1af99f8777344173aa7f.png"
                width="150"
              />
            </span>
          </router-link>
        </li>
        <li @click="dashboard.setIsOpened(false)" class="nav-item nav-toggle">
          <a class="nav-link modern-nav-toggle pe-0" data-bs-toggle="collapse">
            <i
              class="d-block d-xl-none text-primary toggle-icon font-medium-4"
              data-feather="x"
            ></i>
          </a>
        </li>
      </ul>
    </div>

    <div class="main-menu-content">
      <ul
        class="navigation navigation-main"
        id="main-menu-navigation"
        data-menu="menu-navigation"
      >
        <li class="nav-item mt-2">
          <a
            class="d-flex align-items-center"
            :href="redirectToUserDashboard + '/redirecting?qt=' + token"
          >
            <HomeIcon />
            <span class="menu-title text-truncate">Dashboard </span>
          </a>
        </li>

        <li
          class="nav-item has-sub sidebar-group-active"
          :class="{ open: !isDropdownOpen }"
        >
          <a class="d-flex align-items-center" role="button" @click="openDropdown">
            <LayerIcon />
            <span class="menu-title text-truncate">My Documents</span>
          </a>
          <ul class="menu-content ms-3 mt-1 border-start">
            <li
              class="d-none"
              :class="{ active: isPage == 'Files', disabled: dashboard.isLoadTable }"
            >
              <a class="d-flex align-items-center" role="button" @click="page('Files')">
                <i data-feather="folder-plus"></i>
                <span class="menu-item text-truncate">My Files</span>
              </a>
            </li>
            <li
              :class="{ active: isPage == 'Completed', disabled: dashboard.isLoadTable }"
            >
              <a
                class="d-flex align-items-center disabled"
                role="button"
                @click="page('Completed')"
              >
                <span class="menu-item text-truncate">Completed</span>
                <template
                  v-if="
                    isEmptyArray(completedDocuments.data) || totalCompletedDocuments >= 0
                  "
                >
                  <span class="badge badge-light-dark rounded-pill ms-auto me-0">
                    {{
                      isEmptyArray(completedDocuments.data) ? 0 : totalCompletedDocuments
                    }}
                  </span>
                </template>
                <!-- <template v-if="count?.signed_notes >= 0">
                  <span class="badge badge-light-dark rounded-pill ms-auto me-0">
                    {{ count?.signed_notes }}
                  </span>
                </template> -->
                <template v-else>
                  <span class="ms-auto">
                    <PuSkeleton circle width="20px" height="20px" />
                  </span>
                </template>
              </a>
            </li>

            <!-- <li class="d-none" :class="{ active: isPage == 'Locked',disabled: dashboard.isLoadTable }">
              <a class="d-flex align-items-center" role="button" @click="page('Locked')">
                <DigitalLock />
                <span class="menu-item text-truncate">Digital Locker</span>
                <span class="badge badge-light-dark rounded-pill ms-auto me-0">
                  {{ lockerCounter }}
                </span>
              </a>
            </li> -->

            <li
              :class="{ active: isPage == 'Received', disabled: dashboard.isLoadTable }"
            >
              <a
                class="d-flex align-items-center"
                role="button"
                @click="page('Received')"
              >
                <span class="menu-item text-truncate">Need to sign</span>
                <template
                  v-if="
                    isEmptyArray(receivedDocuments.data) || totalReceivedDocuments >= 0
                  "
                >
                  <span class="badge badge-light-dark rounded-pill ms-auto me-0">
                    {{
                      isEmptyArray(receivedDocuments.data) ? 0 : totalReceivedDocuments
                    }}
                  </span>
                </template>
                <template v-else>
                  <span class="ms-auto">
                    <PuSkeleton circle width="20px" height="20px" />
                  </span>
                </template>
              </a>
            </li>

            <li :class="{ active: isPage == 'Sent', disabled: dashboard.isLoadTable }">
              <a class="d-flex align-items-center" role="button" @click="page('Sent')">
                <span class="menu-item text-truncate">Sent</span>
                <template v-if="count?.sent >= 0">
                  <span class="badge badge-light-dark rounded-pill ms-auto me-0">
                    {{ count?.sent }}
                  </span>
                </template>
                <template v-else>
                  <span class="ms-auto">
                    <PuSkeleton circle width="20px" height="20px" />
                  </span>
                </template>
              </a>
            </li>

            <li :class="{ active: isPage == 'New', disabled: dashboard.isLoadTable }">
              <a class="d-flex align-items-center" role="button" @click="page('New')">
                <span class="menu-item text-truncate">Draft</span>
                <template v-if="count?.draft >= 0">
                  <span class="badge badge-light-dark rounded-pill ms-auto me-0">
                    {{ count?.draft }}
                  </span>
                </template>
                <template v-else>
                  <span class="ms-auto">
                    <PuSkeleton circle width="20px" height="20px" />
                  </span>
                </template>
              </a>
            </li>

            <li
              :class="{ active: isPage == 'Declined', disabled: dashboard.isLoadTable }"
            >
              <a
                class="d-flex align-items-center"
                role="button"
                @click="page('Declined')"
              >
                <span class="menu-item text-truncate">Declined</span>
                <template
                  v-if="
                    isEmptyArray(declinedDocuments.data) || totalDeclinedDocuments >= 0
                  "
                >
                  <span class="badge badge-light-dark rounded-pill ms-auto me-0">
                    {{
                      isEmptyArray(declinedDocuments.data) ? 0 : totalDeclinedDocuments
                    }}
                  </span>
                </template>
                <template v-else>
                  <span class="ms-auto">
                    {{ isEmptyArray(declinedDocuments.data) }}
                    <PuSkeleton circle width="20px" height="20px" />
                  </span>
                </template>
              </a>
            </li>

            <li :class="{ active: isPage == 'Deleted', disabled: dashboard.isLoadTable }">
              <a class="d-flex align-items-center" role="button" @click="page('Deleted')">
                <span class="menu-item text-truncate">Deleted Files</span>
                <template v-if="count?.deleted >= 0">
                  <span class="badge badge-light-dark rounded-pill ms-auto me-0">
                    {{ count?.deleted }}
                  </span>
                </template>
                <template v-else>
                  <span class="ms-auto">
                    <PuSkeleton circle width="20px" height="20px" />
                  </span>
                </template>
              </a>
            </li>

            <li>
              <!-- <a class="d-flex align-items-center" :href="redirectToSignLink + '?status=sign&qt=' + token"> -->
              <a class="d-flex align-items-center" role="button">
                <span class="menu-item">Sign link</span>
                <span
                  title="Coming Soon"
                  class="badge badge-light-warning coming-soon border border-warning ms-auto"
                  >Coming Soon</span
                >
              </a>
            </li>
          </ul>
        </li>
      </ul>

      <hr />

      <div class="help-box help-box-light text-center">
        <a href="javascript: void(0);" class="float-end close-btn text-body"
          ><i class="mdi mdi-close"></i
        ></a>
        <div class="text-center">
          <img src="@/assets/help-icon.svg" height="90" alt="Helper Icon Image" />
        </div>
        <h5 class="mt-3" style="font-size: 0.9rem">
          Your current plan is
          <span class="text-primary fw-bolder">
            {{ dashboard.plan != "" ? dashboard.plan : "Basic" }}
          </span>
        </h5>
        <hr />

        <div v-if="envelopLeft" style="font-size: 0.9rem">
          Sends remaining: {{ envelopLeft }}
        </div>

        <template v-if="dashboard.plan == 'Basic' || dashboard.plan == ''">
          <div style="font-size: 0.9rem">
            <p class="mb-2">
              Upgrade to <span class="text-primary fw-bolder">Pro</span> to share more
              documents.
            </p>
            <div class="text-center">
              <a :href="upgradeUserAccount" class="btn btn-primary btn-sm">Upgrade</a>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import HomeIcon from "@/icons/HomeIcon.vue";
import LayerIcon from "@/icons/LayerIcon.vue";
// import DigitalLock from '@/icons/DigitalLock.vue';

import { ref, defineProps, onMounted, computed } from "vue";
import { dashboard } from "@/store/dashboard";
import { isEmptyArray, capitalizeFirstLetter } from "@/utils";

import { useGetters, useActions } from "vuex-composition-helpers/dist";
import { useRouter } from "vue-router";
const route = useRouter();

const {
  token,
  teams,
  statistics,
  receivedDocuments,
  declinedDocuments,
  completedDocuments,
} = useGetters({
  token: "auth/token",
  teams: "team/teams",
  statistics: "document/statistics",
  receivedDocuments: "document/receivedDocuments",
  declinedDocuments: "document/declinedDocuments",
  completedDocuments: "document/completedDocuments",
});

const { getTeams, getStatistics, storeStatus } = useActions({
  getTeams: "team/getTeams",
  getStatistics: "document/getStatistics",
  storeStatus: "document/storeStatus",
});

defineProps({ open: Boolean });

const redirectToUserDashboard = ref("");
const redirectToSignLink = ref("");
const isPage = ref("");
const upgradeUserAccount = ref("");
const status = ref("");

const count = computed(() => statistics.value);
const totalCompletedDocuments = computed(() => completedDocuments.value?.meta?.total);
const totalReceivedDocuments = computed(() => receivedDocuments.value?.meta?.total);
const totalDeclinedDocuments = computed(() => declinedDocuments.value?.meta?.total);

const isDropdownOpen = ref(false);
const openDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value);

const page = (params) => {
  dashboard.value.setIsOpened(false);

  isPage.value = params != "" ? params : "New";
  dashboard.value.setStatus(isPage.value.toLowerCase());
  storeStatus(isPage.value.toLowerCase());
  route.push({ name: "Dashboard", query: { status: isPage.value.toLowerCase() } });
};

const numberOfEnvelopLeft = ref("");
const envelopLeft = computed(() => {
  teams.value.map((team) => {
    if (team.active === true && team.subscription != null) {
      let hasPlan = team.subscription.plan;
      numberOfEnvelopLeft.value = remainingEnvelops(
        "number of envelops",
        hasPlan.features
      );
    }
  });

  return numberOfEnvelopLeft.value;
});

const remainingEnvelops = (str, arr) => {
  let featuredArray = arr.find((feat) => feat?.name.toLowerCase()?.includes(str));

  const number =
    featuredArray?.limit_number == "Unlimited"
      ? featuredArray?.limit_number
      : featuredArray?.limit_number - featuredArray?.executed;

  return number;
};

onMounted(() => {
  const SIGN_LINK = process.env.VUE_APP_URL_SIGN_LINK_LIVE;

  const AUTH_URL = process.env.VUE_APP_URL_AUTH_LIVE;

  const USER_UPGRADE = process.env.VUE_APP_URL_USER_UPGRADE_LIVE;

  redirectToSignLink.value = SIGN_LINK;
  redirectToUserDashboard.value = AUTH_URL;
  status.value = capitalizeFirstLetter(route.currentRoute.value.query.status);
  page(status.value);

  getTeams(token.value);
  getStatistics(token.value);

  upgradeUserAccount.value = USER_UPGRADE;
});
</script>

<style scoped>
.coming-soon {
  font-size: 10px;
  font-weight: normal;
}

.coming-soon.active {
  background: #fff !important;
}

.active .badge.badge-light-dark {
  background: #fff !important;
}

.badge.badge-light-dark {
  font-weight: normal !important;
}

.main-menu {
  width: 280px !important;
}

.main-menu .navbar-header .navbar-brand .brand-logo img {
  max-width: 100%;
  width: auto;
}

.main-menu .navbar-header .navbar-brand {
  margin-top: 1rem;
}

.main-menu-content {
  overflow-y: scroll;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #999 #eee;
}

*::-webkit-scrollbar {
  width: 10px;
}

*::-webkit-scrollbar-track {
  background: #eee;
}

*::-webkit-scrollbar-thumb {
  background-color: #999;
  border-radius: 20px;
  border: 3px solid #eee;
}
</style>
