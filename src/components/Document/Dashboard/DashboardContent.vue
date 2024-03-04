<template>
  <div class="app-content content">
    <div class="content-wrapper container-xxl p-0">
      <div class="content-body">
        <div class="card">
          <div class="card-datatable table-responsive" v-if="!isHidden">
            <div class="d-flex justify-content-between align-items-center header-actions text-nowrap mx-1 row mt-75">
              <div class="col-sm-12 col-lg-12 px-custom">
                <div class="card-header d-flex justify-content-lg-between py-1 p-0">
                  <h4 class="card-title text-capitalize">
                    {{
                      dashboard.status == "received" ? "Need to Sign" : dashboard.status
                    }}
                    Document
                  </h4>

                  <div class="d-none">
                    <div class="btn-group">
                      <button type="button" class="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown"
                        aria-expanded="false">
                        Upload
                      </button>
                      <div class="dropdown-menu">
                        <a class="dropdown-item" href="#">File Upload</a>
                        <a class="dropdown-item" href="#">Folder Upload</a>
                      </div>
                    </div>
                    <button class="btn btn-primary ms-2" @click="folderModal = true">
                      New Folder
                    </button>
                  </div>
                  <router-link :to="{ name: 'document.upload' }" class="btn btn-primary"
                    v-show="dashboard.status != 'Deleted'">
                    Sign a Document
                  </router-link>
                </div>

                <hr class="mb-2" />

                <div class="my-1" v-show="hasMultipleSelection">
                  <div class="row">
                    <div class="col-lg-6 col-md-6 col-sm-12 my-auto custom-sm">
                      <template v-if="dashboard.status == 'deleted'">
                        <button type="button" class="btn btn-sm btn-primary waves-effect waves-float waves-light me-1"
                          @click="deleteDocument('restore', '')">
                          Restore
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" @click="deleteDocument('delete', '')">
                          Delete Permanently
                        </button>
                      </template>
                      <template v-else>
                        <button type="button" class="btn btn-sm btn-primary" @click="deleteDocument('delete', '')">
                          Delete
                        </button>
                      </template>
                    </div>

                    <div class="col-lg-6 col-md-12 col-12 mt-sm-2 mt-lg-0 d-none">
                      <div class="clearfix">
                        <div class="float-lg-end">
                          <div class="mb-1 row">
                            <label for="colFormLabelLg" class="col-sm-3 col-form-label-lg">Filter</label>
                            <div class="col-sm-9">
                              <select class="form-select form-select-lg" id="selectLarge">
                                <option selected="">All</option>
                                <option value="1">Files</option>
                                <option value="2">Folder</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="loadTable" class="text-center">
                <div class="my-2">
                  <div class="d-flex flex-wrap justify-content-between align-items-center flex-sm">
                    <div class="sort">
                      <PuSkeleton width="30px" height="20px" />
                      <PuSkeleton width="60px" height="20px" class="mx-1" />
                      <PuSkeleton width="60px" height="20px" />
                    </div>
                    <div class="search">
                      <PuSkeleton width="50px" height="20px" class="me-1" />
                      <PuSkeleton width="170px" height="20px" />
                    </div>
                  </div>

                  <table class="table table-borderless d-none d-md-block" role="grid">
                    <tbody>
                      <tr>
                        <th style="padding-left: 0 !important">
                          <PuSkeleton width="20px" height="20px" />
                        </th>
                        <template v-if="dashboard.status == 'Received'">
                          <th style="width: 120px">
                            <PuSkeleton height="20px" />
                          </th>
                        </template>
                        <th style="width: 400px">
                          <PuSkeleton height="20px" />
                        </th>
                        <th style="width: 220px">
                          <PuSkeleton height="20px" />
                        </th>
                        <th style="width: 220px">
                          <PuSkeleton height="20px" />
                        </th>
                        <th style="width: 300px">
                          <PuSkeleton height="20px" />
                        </th>
                        <th style="width: 120px; padding-right: 0 !important">
                          <PuSkeleton height="20px" />
                        </th>
                      </tr>
                    </tbody>
                  </table>

                  <div class="row mb-1">
                    <PuSkeleton height="250px" />
                  </div>

                  <div class="d-flex flex-wrap justify-content-between align-items-center flex-sm">
                    <div class="sort">
                      <PuSkeleton width="150px" height="20px" />
                    </div>
                    <div class="search">
                      <PuSkeleton width="250px" height="20px" />
                    </div>
                  </div>
                </div>
              </div>
              <template v-else>
                <DataTable :data="filtered" @listPerPage="handleListPerPage" @paginate="handlePagination"
                  @deleteRestore="getDeleteRestoreId" @checker="getIds" @hidden="getIsHidden" />

                <DashboardTableList v-if="false" :key="componentKey" :data="filtered" @checker="getIds"
                  @deleteRestore="getDeleteRestoreId" @hidden="getIsHidden" />
              </template>
            </div>
          </div>

          <div v-else>
            <div class="row my-2">
              <div class="col-12">
                <div class="d-flex justify-content-between px-2">
                  <button class="btn btn-sm btn-secondary me-1" @click="setHidden">
                    &larr; Back
                  </button>

                  <template v-if="userDocument.entry_point == 'Docs'">
                    <router-link :to="{ name: 'document.edit', params: { document_id: editId } }"
                      class="btn btn-sm btn-primary">Edit
                    </router-link>
                  </template>
                </div>

                <DashboardViewDocument :docs="theDoc" />
              </div>
            </div>
            <!-- </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalComp :show="isDeleteOrRestore" :size="'modal-sm'" :header="false" @close="isDeleteOrRestore = false">
    <template #body>
      <h3 class="modal-title text-darker my-2">{{ action != 'restore' ? 'Delete' : 'Restore' }} document</h3>

      <div class="text-center my-2">
        <h3>Are you sure?</h3>
        <template v-if="dashboard.status == 'deleted' && action != 'restore'">
          <p>You will no longer have access to this document</p>
        </template>
      </div>
    </template>

    <template #footer>
      <button type="button" class="btn btn-danger d-block ms-auto" :class="{ disabled: loading }"
        @click="proceedToDelete">
        <span v-show="loading" class="spinner-border spinner-border-sm"></span>
        <span>Proceed</span>
      </button>
    </template>
  </ModalComp>

  <ModalComp :show="folderModal" :size="'modal-sm'" @close="folderModal = false">
    <template #header>
      <h3 class="modal-title text-darker mb-0">New Folder</h3>
    </template>

    <template #body>
      <input type="text" class="form-control" placeholder="New folder" />
    </template>

    <template #footer>
      <button type="button" class="btn btn-primary me-1 waves-effect waves-float waves-light" data-bs-dismiss="modal">
        Create
      </button>
    </template>
  </ModalComp>
</template>

<script setup>
import ModalComp from "@/components/ModalComp.vue";
import DashboardViewDocument from "./DashboardViewDocument.vue";
import DataTable from "@/components/DataTable.vue";
import DashboardTableList from "./DashboardTableList.vue";

import { onMounted, ref, watch } from "vue";
import { useActions, useGetters } from "vuex-composition-helpers/dist";
import { useRouter } from "vue-router";
import { dashboard } from "@/store/dashboard";
import { capitalizeFirstLetter } from "@/utils";
import Api from "@/api/Api";

const componentKey = ref(0);
const forceRerender = () => (componentKey.value += 1);

const route = useRouter();

const hasMultipleSelection = ref(false);
const isHidden = ref(false);
const loading = ref(false);
const loadTable = ref(false);
const isDeleteOrRestore = ref(false);
const docIds = ref([]);
const docObj = ref([]);
const folderModal = ref(false);
const theDoc = ref("");
const filtered = ref({});

const {
  token,
  documentsByStatus,
  receivedDocuments,
  declinedDocuments,
  completedDocuments,
  userDocument,
} = useGetters({
  token: "auth/token",
  documentsByStatus: "document/documentsByStatus",
  receivedDocuments: "document/receivedDocuments",
  declinedDocuments: "document/declinedDocuments",
  completedDocuments: "document/completedDocuments",
  userDocument: "document/userDocument",
});

const {
  removeDocument,
  retrieveDocument,
  getUserDocumentByStatus,
  getCompletedDocuments,
  getReceivedDocuments,
  getDeclinedDocuments,
  getDeletedDocuments,
} = useActions({
  removeDocument: "document/removeDocument",
  retrieveDocument: "document/retrieveDocument",
  getUserDocumentByStatus: "document/getUserDocumentByStatus",
  getCompletedDocuments: "document/getCompletedDocuments",
  getReceivedDocuments: "document/getReceivedDocuments",
  getDeclinedDocuments: "document/getDeclinedDocuments",
  getDeletedDocuments: "document/getDeletedDocuments",
});

watch(
  () => [
    userDocument.value,
    documentsByStatus.value,
    dashboard.value.status,
    receivedDocuments.value,
    declinedDocuments.value,
    completedDocuments.value,
  ],
  (
    [newUserDoc, newDocByStatus, newStatus, newDocReceive, newDocDecline, newDocComplete],
    [oldUserDoc, oldDocByStatus, oldStatus, oldDocReceive, oldDocDecline, oldDocComplete]
  ) => {
    if (newUserDoc != oldUserDoc) theDoc.value = newUserDoc;

    loadTable.value = true;
    dashboard.value.setIsLoadTable(loadTable.value)

    if (newDocByStatus != oldDocByStatus) {
      filtered.value = newDocByStatus;


      loadTable.value = false;
      dashboard.value.setIsLoadTable(loadTable.value)
      forceRerender();
    }

    if (newDocReceive != oldDocReceive) {
      if (newStatus == "received") filtered.value = newDocReceive;
      loadTable.value = false;
      dashboard.value.setIsLoadTable(loadTable.value)
      forceRerender();
    }

    if (newDocDecline != oldDocDecline) {
      if (newStatus == "declined") filtered.value = newDocDecline;
      loadTable.value = false;
      dashboard.value.setIsLoadTable(loadTable.value)
      forceRerender();
    }

    if (newDocComplete != oldDocComplete) {
      if (newStatus == "completed") filtered.value = newDocComplete;
      loadTable.value = false;
      dashboard.value.setIsLoadTable(loadTable.value)
      forceRerender();
    }

    if (newStatus != oldStatus) {
      hasMultipleSelection.value = isHidden.value = false;
      let status = newStatus.toLowerCase();
      docIds.value = [];

      if (!["completed", "received", "declined", "deleted"].includes(status))
        return getUserDocumentByStatus(
          capitalizeFirstLetter(status) + "&sort_by_desc=updated_at"
        );

      if (status == "completed") return getCompletedDocuments(token.value + "&sort_by_desc=updated_at");

      if (status == "received") return getReceivedDocuments(token.value);

      if (status == "declined") return getDeclinedDocuments(token.value);

      if (status == "deleted") return getDeletedDocuments(token.value);
    }
  }
);

const handlePagination = async (param) => {
  const response = await Api.get(param);
  filtered.value = response.data;
}

const handleListPerPage = async (param) => {
  const response = await Api.get(param);
  filtered.value = response.data;
}

const action = ref("");
const getIds = (params) => {
  if (params.length > 0) {
    docIds.value = params;
    hasMultipleSelection.value = true;
  } else {
    hasMultipleSelection.value = false;
  }
};

const editId = ref("");
const getIsHidden = (params) => {
  isHidden.value = params.hide;
  editId.value = params.id;
};

const setHidden = () => {
  loadTable.value = isHidden.value = false;
  loadTable.value = true;
  setTimeout(() => (loadTable.value = false), 1000);
};

const getDeleteRestoreId = (params) => {
  docIds.value = [params.id];
  action.value = params.action;
  // hasMultipleSelection.value = true
  isDeleteOrRestore.value = true;
};

const deleteDocument = (params, id) => {
  if (id != "") {
    docIds.value = [id];
  }
  // if (docIds.value.length == 0) {
  //   return toast.error("Select a file to delete", {
  //     timeout: 5000,
  //     position: "top-right",
  //   });
  // }

  action.value = params;
  isDeleteOrRestore.value = true;
};

const proceedToDelete = () => {
  loading.value = true;
  docObj.value = [];
  const isPermanent = route.currentRoute.value.query.status == "deleted" ? true : false;
  for (const key in docIds.value) {
    docObj.value.push({ document_id: docIds.value[key], permanent_delete: isPermanent });
  }

  action.value == "delete"
    ? removeDocument({ documents: docObj.value })
    : retrieveDocument({ documents: docObj.value });

  docIds.value = [];

  hasMultipleSelection.value = false;
  isDeleteOrRestore.value = loading.value = false;
};

onMounted(() => {
  loadTable.value = true;
  let status = dashboard.value.status;
  if (!["completed", "received", "declined", "deleted"].includes(status)) {
    getUserDocumentByStatus(capitalizeFirstLetter(status) + "&sort_by_desc=updated_at");
  }

  getReceivedDocuments(token.value);
  getDeclinedDocuments(token.value);
  getCompletedDocuments(token.value);
});
</script>

<style scoped>
.loader {
  display: grid;
  place-items: center;
  height: 70vh;
  width: 100%;
}

.content-body {
  padding-bottom: 50px;
}

.table> :not(caption)>*>* {
  padding: 0.72rem 1rem !important;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #999 #eee;
}

/* Works on Chrome, Edge, and Safari */
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

@media screen and (max-width: 765px) {
  .flex-sm {
    display: block !important;
    margin: 0 auto 5px !important;
  }

  .flex-sm .sort {
    margin-bottom: 5px;
  }

  .card .card-title {
    font-size: 1rem !important;
  }

  .px-custom {
    padding: 0 !important;
  }
}

@media screen and (max-width: 991.5px) {
  .custom-sm {
    margin-bottom: 8px !important;
  }
}
</style>
