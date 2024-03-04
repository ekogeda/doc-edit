<template>
  <div v-if="isLoading" class="grid">
    <PreLoader />
  </div>
  <div v-else class="custom-mt">
    <div class="row">
      <div class="col-12 col-lg-10 col-md-12 col-sm-12 mx-auto">
        <div class="card p-2">
          <div class="d-flex justify-content-between align-items-center">
            <div class="m-0">
              <PuSkeleton v-if="isDocLoading" width="140px" height="30px" />
              <template v-else>
                <router-link
                  :to="{ name: 'document.upload' }"
                  class="btn btn-sm btn-secondary me-1"
                >
                  &larr; Go back
                  <span class="d-none d-lg-inline-block">to document upload</span>
                </router-link>
                <router-link
                  v-if="
                    userDocument.entry_point == 'Docs' &&
                    !['Completed', 'Declined'].includes(userDocument.status) &&
                    userDocument.allowed_seal_per_unit == null
                  "
                  :to="{ name: 'document.edit', params: { document_id: uri } }"
                  class="btn btn-sm btn-primary"
                >
                  Edit</router-link
                >
              </template>
            </div>
            <div class="d-action">
              <PuSkeleton v-if="isDocLoading" width="140px" height="30px" />
              <template v-else>
                <button
                  class="btn btn-sm btn-outline-primary waves-effect"
                  @click="useDownloadPDFFromServer(sortedFile, userDocument.title)"
                >
                  Download
                </button>

                <button
                  v-if="
                    theDoc.status != '' &&
                    !['Completed', 'Declined'].includes(theDoc.status)
                  "
                  class="btn btn-sm btn-primary ms-1"
                  @click="finishModal = true"
                >
                  Finish
                </button>
              </template>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-8">
            <!-- <div class="card" style="width: 860px; margin: 0 auto"> -->
            <div class="card">
              <div class="card-header email-detail-head">
                <div
                  class="user-details d-flex justify-content-between align-items-center flex-wrap"
                >
                  <div class="mail-items">
                    <h5 class="text-capitalize mb-0">
                      <template v-if="!theDoc">
                        <span>
                          <span class="spinner-border spinner-border-sm"></span>
                          Loading...
                        </span>
                      </template>
                      <template v-else>
                        {{ theDoc.title }}
                      </template>
                    </h5>

                    <div class="email-info-dropup dropdown">
                      <span role="button" class="font-small-3">
                        Participants:
                        <template v-if="!theDoc">
                          <span>
                            <span class="spinner-border spinner-border-sm"></span>
                            Loading...
                          </span>
                        </template>
                        <template v-else>
                          <span
                            v-for="(participant, index) in theDoc.participants"
                            :key="index"
                            style="color: #003bb3"
                          >
                            {{
                              participant.user.first_name +
                              (index < theDoc.participants.length - 1 ? ", " : "")
                            }}
                          </span>
                        </template>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="mail-meta-item d-flex align-items-center">
                  <template v-if="!theDoc">
                    <span>
                      <span class="spinner-border spinner-border-sm"></span>
                      Loading...
                    </span>
                  </template>
                  <template v-else>
                    <small class="mail-date-time text-dark fw-normal">
                      {{ createdAt(theDoc.created_at) }}</small
                    >
                  </template>
                </div>
              </div>

              <div class="divider bg-light pb-1 px-1 m-0"></div>

              <div
                v-if="!allLoaded"
                class="card-body bg-light mail-message-wrapper px-1 py-0"
              >
                <RenderPage :file="{ file: sortedFile }" comp="audit" />
              </div>
            </div>
          </div>

          <div v-if="userDocument.entry_point == 'Docs'" class="col-lg-4">
            <div class="card scrollable">
              <div class="card-header">
                <h4 class="card-title">Audit Trail</h4>
              </div>
              <div class="card-body">
                <template v-if="!theDoc">
                  <div class="text-center">
                    <span class="spinner-border spinner-border-sm"></span>
                    Loading...
                  </div>
                </template>
                <template v-else>
                  <ul class="timeline" v-if="audit">
                    <li
                      class="timeline-item"
                      v-for="(item, index) in audited"
                      :key="index"
                    >
                      <template v-if="theDoc.status == 'New'">
                        <span
                          class="timeline-point timeline-point-secondary timeline-point-indicator"
                        ></span>
                      </template>
                      <template v-else-if="theDoc.status == 'Sent'">
                        <span
                          class="timeline-point timeline-point-primary timeline-point-indicator"
                        ></span>
                      </template>
                      <template v-else>
                        <span
                          class="timeline-point timeline-point-success timeline-point-indicator"
                        ></span>
                      </template>
                      <div class="timeline-event">
                        <div class="mb-sm-0 mb-1">
                          <h6 class="text-dark text-capitalize">
                            {{ item.full_name }}
                          </h6>
                          <small class="timeline-event-time text-dark">
                            {{ item.signed_date }}</small
                          >
                        </div>
                        <p>{{ item.added_text }}</p>
                      </div>
                    </li>
                  </ul>
                </template>

                <div class="d-flex justify-content-end mt-4">
                  <img src="@/assets/logo-dark.png" height="15" alt="ToNote Brand" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalComp
    :show="finishModal"
    :size="'modal-sm'"
    :header="false"
    @close="finishModal = false"
  >
    <template #body>
      <h3 class="modal-title text-darker my-2">Complete document</h3>

      <p class="text-center">
        <i
          >Please confirm that all <br />
          participants are done editing.</i
        >
      </p>
    </template>

    <template #footer>
      <button class="btn btn-sm btn-primary" @click="confirmEdit" :disabled="loading">
        <span v-show="loading" class="spinner-border spinner-border-sm"></span>
        Confirm
      </button>
    </template>
  </ModalComp>
</template>

<script setup>
import PreLoader from "@/components/PreLoader.vue";
import ModalComp from "@/components/ModalComp.vue";
import { useDownloadPDFFromServer } from "@/composables/useDownloadPDF";

import { ref, onMounted, watch, computed } from "vue";
import moment from "moment";

import { useActions, useGetters } from "vuex-composition-helpers/dist";
import { useRouter } from "vue-router";
import RenderPage from "@/components/Document/Edit/Main/RenderPage.vue";

const route = useRouter();

const { userDocument, documentAuditTrail, isDocLoading } = useGetters({
  userDocument: "document/userDocument",
  documentAuditTrail: "document/documentAuditTrail",
  isDocLoading: "document/isDocLoading",
});

const { getUserDocument, getAuditTrail, finishAnnotation } = useActions({
  getUserDocument: "document/getUserDocument",
  getAuditTrail: "document/getAuditTrail",
  finishAnnotation: "document/finishAnnotation",
});

const allLoaded = ref("");
const finishModal = ref(false);
const loading = ref(false);
const isLoading = ref(true);
const uri = ref("");
const theDoc = ref("");

const audited = ref([]);
const audit = computed(() => {
  let audit = documentAuditTrail.value.filter((str) => {
    const longName = str.log_name.split(" ", 2);
    for (let i = 0; i < longName.length; i++) {
      longName[i] = longName[i].charAt(0).toUpperCase() + longName[i].slice(1);
      const participantName = longName.join(" ");

      const auditObj = {
        full_name: participantName,
        signed_date: createdAt(str.created_at),
        added_text: str.log_name,
      };
      return audited.value.push(auditObj);
    }
  });
  return audit;
});

const sortedFile = computed(() => {
  return userDocument.value.completed_file_request;
});

watch(
  () => [userDocument.value, isDocLoading.value],
  ([newUserDoc, newDocLoaded], [oldUserDoc, oldDocLoaded]) => {
    if (newUserDoc != oldUserDoc) theDoc.value = newUserDoc;

    if (newDocLoaded != oldDocLoaded) allLoaded.value = newDocLoaded;
  }
);

const confirmEdit = () => {
  loading.value = true;
  finishModal.value = false;

  finishAnnotation({ id: uri.value, payload: { status: "Signed" } });

  setTimeout(() => (loading.value = false), 1000);
};

const createdAt = (dateParams) => {
  return moment(dateParams).format("MMM. Do, YYYY [at] h:mm:ss a");
};

const env = ref(false);
onMounted(() => {
  env.value = process.env.NODE_ENV == "development" ? true : false;

  uri.value = route.currentRoute.value.params.document_id;
  getUserDocument(uri.value);
  getAuditTrail(uri.value);

  setTimeout(() => {
    isLoading.value = false;
  }, 1000);

  setTimeout(() => {
    if (window.Tawk_API) {
      window.Tawk_API.hideWidget();
    }
  }, 2000);
});
</script>

<style scoped>
.parent {
  width: 800px;
  position: absolute;
  user-select: none;
}

.grid {
  display: grid;
  place-items: center;
  height: 70vh;
  width: 100%;
}

.scrollable {
  height: 72vh;
  overflow-y: auto;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #999 #eee;
}

*::-webkit-scrollbar {
  width: 12px;
}

*::-webkit-scrollbar-track {
  background: #eee;
}

*::-webkit-scrollbar-thumb {
  background-color: #999;
  border-radius: 20px;
  border: 3px solid #eee;
}

.custom-mt {
  margin-top: -15px !important;
  min-width: 390px;
}

.btn-outline-primary:hover:not(.disabled):not(:disabled) {
  background-color: #003bb3;
  color: #fff;
}

@media screen and (max-width: 991.5px) {
  .custom-mt {
    margin-top: -40px !important;
  }
}
</style>
