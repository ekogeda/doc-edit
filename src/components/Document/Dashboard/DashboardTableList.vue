<template>
  <div class="px-custom">
    <table class="table table-borderless table-hover mb-5" role="grid" :id="dashboard.status">
      <thead>
        <tr role="row">
          <th v-show="dashboard.status != 'locked'" rowspan="1" colspan="1" style="width: 0px" aria-label="">
            <input type="checkbox" @click="checkAll" v-model="isCheckAll" class="form-check-input" id="selectAllCheck" />
          </th>
          <template v-if="dashboard.status == 'received'">
            <th rowspan="1" colspan="1" aria-label="Sender">Sent by</th>
          </template>
          <th rowspan="1" colspan="1" style="width: 258px" aria-label="Name">
            Document Name
          </th>
          <th rowspan="1" colspan="1" style="width: 348px" aria-label="Session">
            Session Type
          </th>
          <th rowspan="1" colspan="1" style="width: 348px" aria-label="Record">Record</th>
          <th class="sorting" tabindex="0" rowspan="1" colspan="1" style="width: 227px"
            aria-label="Created Date: activate to sort column ascending">
            Last updated
          </th>
          <template v-if="dashboard.status == 'completed'">
            <th rowspan="1" colspan="1" aria-label="Lock">Save to Locker</th>
          </template>
          <th rowspan="1" colspan="1" aria-label="Actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr class="even" v-for="(doc, index) in data" :key="index">
          <td v-show="dashboard.status != 'locked'" class="control" tabindex="0">
            <input type="checkbox" v-model="docIds" @change="updateCheckAll" :value="doc.id" class="form-check-input" />
          </td>
          <template v-if="dashboard.status == 'received'">
            <td>
              <span class="text-capitalize" :title="'Owned by: ' + doc.document_owner">
                {{ doc.document_owner }}</span>
            </td>
          </template>
          <td>
            <template v-if="dashboard.status == 'deleted'">
              <img src="@/assets/doc.png" class="me-1" alt="file-icon" height="15" />
              <span class="ml-1">{{ doc.title }}</span>
            </template>
            <template v-else>
              <a role="button" @click="
                getDocument({
                  id: doc.id,
                  entry_point: doc.entry_point,
                  status: dashboard.status,
                  isView: true,
                })
                " data-bs-toggle="tooltip" data-bs-placement="bottom" :title="'Title: ' + doc.title">
                <img src="@/assets/doc.png" class="me-1" alt="file-icon" height="15" />
                <span class="ml-1">{{ doc.title }}
                  <!-- -- <span class="text-danger">{{ doc.status }}</span> -->
                </span>
              </a>
            </template>
          </td>
          <td data-bs-placement="bottom" :title="'Type: ' + doc.entry_point">
            {{
              doc.entry_point == "Docs"
              ? "E-sign"
              : doc.entry_point == "Video"
                ? "Video sign"
                : doc.entry_point
            }}
          </td>
          <td>
            <span class="badge rounded-pill badge-light-primary" data-bs-placement="bottom"
              :title="'Participant: ' + doc.participants_count">
              {{ doc.participants_count }} Participant(s)
            </span>
          </td>

          <td data-bs-placement="bottom" :title="'Last modified: ' + dateTime(doc.updated_at)">
            {{ dateTime(doc.updated_at) }}
          </td>

          <template v-if="dashboard.status == 'completed'">
            <td class="text-center">
              <button type="button" @click="addToLocker(doc.id)" title="Save to digital locker"
                class="btn btn-sm btn-outline-primary rounded-pill">
                <Icon icon="material-symbols:lock-outline" style="font-size: 1rem" /> Lock
              </button>
            </td>
          </template>

          <td>
            <div class="dropdown">
              <button type="button"
                class="btn btn-sm dropdown-toggle hide-arrow py-0 waves-effect waves-float waves-light"
                data-bs-toggle="dropdown" aria-expanded="false">
                <VerticalEllipsis />
              </button>
              <div class="dropdown-menu dropdown-menu-end">
                <template v-if="dashboard.status != 'deleted'">
                  <a v-if="dashboard.status == 'completed'" class="dropdown-item" href="#"
                    @click="openShareModal(doc.id)">
                    <Icon icon="ic:baseline-share" />&nbsp;
                    <span>Share</span>
                  </a>

                  <a v-if="dashboard.status == 'completed'" class="dropdown-item" role="button" @click="
                    getDocument({
                      id: doc.id,
                      entry_point: doc.entry_point,
                      status: dashboard.status,
                      isView: true,
                    })
                    ">
                    <ViewIcon />&nbsp;
                    <span>View</span>
                  </a>

                  <template v-if="doc.entry_point == 'Docs' && dashboard.status != 'completed'">
                    <a class="dropdown-item" role="button" @click="
                      getDocument({
                        id: doc.id,
                        entry_point: doc.entry_point,
                        status: dashboard.status,
                        isEdit: true,
                      })
                      ">
                      <EditIcon />&nbsp;
                      <span>Edit</span>
                    </a>
                  </template>
                </template>
                <template v-else>
                  <a class="dropdown-item" href="#" @click="$emit('deleteRestore', { action: 'restore', id: doc.id })">
                    <RestoreIcon />&nbsp;
                    <span>Restore</span>
                  </a>
                </template>
                <a class="dropdown-item" href="#" @click="$emit('deleteRestore', { action: 'delete', id: doc.id })">
                  <TrashIcon />&nbsp; Delete
                  <span v-if="dashboard.status == 'deleted'">Permanently</span>
                </a>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <ModalComp :show="lockModal" :size="'modal-sm'" @close="lockModal = false">
    <template #header>
      <h4 class="modal-title text-danger">Alert</h4>
    </template>

    <template #body>
      <p class="text-center text-wrap">Are you sure you want to lock this document?</p>
    </template>

    <template #footer>
      <button type="button" class="btn btn-sm btn-secondary" :class="{ disabled: loading }" @click="lockModal = false">
        No
      </button>
      <button type="button" class="btn btn-sm btn-primary" :class="{ disabled: loading }" @click="handleLock">
        Yes
      </button>
    </template>
  </ModalComp>

  <ModalComp :show="isShare" :footer="false" :size="'modal-sm'" @close="isShare = false">
    <template #header>
      <h4 class="modal-title text-darker">Share Document</h4>
    </template>

    <template #body>
      <ShareDocument @shareEmail="handleShare" :docId="documentId" />
    </template>
  </ModalComp>
</template>

<script setup>
import moment from "moment";
import ModalComp from "@/components/ModalComp.vue";
import ShareDocument from "@/components/Document/Edit/ShareDocument.vue";
import { Icon } from "@iconify/vue";
import TrashIcon from "@/icons/TrashIcon.vue";
import EditIcon from "@/icons/EditIcon.vue";
import ViewIcon from "@/icons/ViewIcon.vue";
import RestoreIcon from "@/icons/RestoreIcon.vue";
import VerticalEllipsis from "@/icons/VerticalEllipsis.vue";
import { dashboard } from "@/store/dashboard";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useActions } from "vuex-composition-helpers/dist";

import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-bs5";
import $ from "jquery";

const props = defineProps({ data: { type: Object } });
const emit = defineEmits(["checker"]);

const { getUserDocument, getLockerDoc, shareDoc } = useActions({
  getUserDocument: "document/getUserDocument",
  shareDoc: "document/shareDoc",
  getLockerDoc: "document/getLockerDoc",
});

const route = useRouter();
const dateTime = (value) => {
  // return moment(value).format("DD-MM-YYYY hh:mm A");
  return moment(value).format("Do MMM YYYY, hh:mm A");
};

const hasMultipleSelection = ref(false);
const isCheckAll = ref(false);
const docIds = ref([]);

const getDocument = (params) => {
  if (params.isView && params.status == "completed") {
    route.push({ name: "document.audit", params: { document_id: params.id } });
  } else {
    if (params.entry_point == "Docs") {
      route.push({ name: "document.edit", params: { document_id: params.id } });
    } else {
      getUserDocument(params.id);
      emit("hidden", { id: params.id, hide: true });
    }
  }

  if (params.isEdit === true) {
    return route.push({ name: "document.edit", params: { document_id: params.id } });
  }
};

const lockerId = ref("");
const handleLock = () => {
  lockModal.value = false;
  getLockerDoc(lockerId.value);
};

const lockModal = ref(false);
const addToLocker = (docId) => {
  lockModal.value = true;
  lockerId.value = docId;
};

const isShare = ref(false);
const documentId = ref("");
const openShareModal = (params) => {
  isShare.value = true;
  documentId.value = params;
};

const handleShare = (params) => {
  isShare.value = false;
  let dataObj = { id: documentId.value, payload: { documents: params } };
  shareDoc(dataObj);
};

const handleChecker = (params) => emit("checker", params);

const checkAll = () => {
  isCheckAll.value = !isCheckAll.value;
  docIds.value = [];
  if (isCheckAll.value) {
    for (const key in props.data) {
      docIds.value.push(props.data[key].id);
    }
  }

  hasMultipleSelection.value = docIds.value.length > 0 ? true : false;
  handleChecker(docIds.value);
};

const updateCheckAll = () => {
  hasMultipleSelection.value = docIds.value.length - 1 >= 0 ? true : false;
  isCheckAll.value = docIds.value.length == props.data.length ? true : false;
  handleChecker(docIds.value);
};

onMounted(() => {
  if ($.fn.dataTable.isDataTable("#" + dashboard.value.status)) {
    $("#" + dashboard.value.status).DataTable();
  } else {
    $("#" + dashboard.value.status).DataTable({
      oLanguage: {
        sEmptyTable:
          "No document(s) found in " +
          (dashboard.value.status == "received"
            ? "need to sign"
            : dashboard.value.status == "deleted"
              ? "trash"
              : dashboard.value.status == "new"
                ? "draft"
                : dashboard.value.status) +
          " folder",
      },
      columnDefs: [
        { orderable: false, targets: [0, 4, 5] },
        { searchable: false, targets: [0] },
      ],
      aaSorting: [],
      lengthMenu: [
        [15, 25, 50, -1],
        [15, 25, 50, "All"],
      ],
      pageLength: 15,
    });
  }
});
</script>

<style scoped>
@media screen and (max-width: 765px) {
  .px-custom {
    padding: 0 !important;
  }
}
</style>
