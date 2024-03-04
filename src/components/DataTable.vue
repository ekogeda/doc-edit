<template>
	<div class="px-custom">
		<div class="table-container">
			<div class="d-flex justify-content-between align-items-center mb-1">
				<div class="d-flex align-items-center">
					Show
					<select
						v-model="ListGroup"
						@change="handleListGroup"
						class="form-select form-select-sm"
						style="width: 5rem; margin: 0 0.5rem"
					>
						<option value="15">15</option>
						<option value="25">25</option>
						<option value="50">50</option>
						<option value="All">All</option>
					</select>
					entries
				</div>
				<div class="d-flex align-items-center">
					Search:
					<input
						type="search"
						class="form-control form-control-sm w-auto"
						v-model="searchQuery"
						@input="search"
						style="margin-left: 0.75rem"
					/>
				</div>
			</div>

			<table class="table table-borderless table-hover text-darker">
				<thead>
					<tr role="row">
						<th v-show="dashboard.status != 'locked'" style="width: 0px" aria-label="">
							<input type="checkbox" class="form-check-input" v-model="selectAll" @change="selectAllRows" />
						</th>
						<template v-if="dashboard.status == 'received'">
							<th aria-label="Sender">Sent by</th>
						</template>
						<th style="width: 258px" aria-label="Name">Document Name</th>
						<th style="width: 348px" aria-label="Session">Session Type</th>
						<th style="width: 348px" aria-label="Record">Record</th>
						<th
							class="sorting"
							tabindex="0"
							style="width: 227px"
							aria-label="Created Date: activate to sort column ascending"
						>
							Last updated
						</th>
						<template v-if="dashboard.status == 'completed'">
							<th aria-label="Lock">Save to Locker</th>
						</template>
						<th aria-label="Actions">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="filteredData?.length == 0">
						<td colspan="6" class="text-center">
							{{
								'No document(s) found in ' +
								(dashboard.status == 'received'
									? 'need to sign'
									: dashboard.status == 'deleted'
									? 'trash'
									: dashboard.status == 'new'
									? 'draft'
									: dashboard.status) +
								' folder'
							}}
						</td>
					</tr>
					<template v-else>
						<tr v-for="doc in filteredData" :key="doc.id">
							<td v-show="dashboard.status != 'locked'">
								<input
									type="checkbox"
									class="form-check-input"
									v-model="selectedRows"
									:value="doc"
									@change="selectRow(index)"
								/>
							</td>
							<template v-if="dashboard.status == 'received'">
								<td>
									<tippy :content="'Owned by: ' + doc.document_owner">
										<span class="text-capitalize"> {{ doc.document_owner }}</span>
									</tippy>
								</td>
							</template>
							<td>
								<template v-if="dashboard.status == 'deleted'">
									<img src="@/assets/doc.png" class="me-1" alt="file-icon" height="15" />
									<span class="ml-1">{{ doc.title }}</span>
								</template>
								<template v-else>
									<tippy :content="'Title: ' + doc.title">
										<a
											role="button"
											@click="
												getDocument({
													id: doc.parent_id == null ? doc.id : doc.parent_id,
													entry_point: doc.entry_point,
													status: dashboard.status,
													isView: true,
												})
											"
										>
											<img src="@/assets/doc.png" class="me-1" alt="file-icon" height="15" />
											<span class="ml-1">{{ doc.title }}</span>
										</a>
									</tippy>
								</template>
							</td>
							<td>
								<tippy :content="'Type: ' + doc.entry_point">
									{{
										doc.entry_point == 'Docs' ? 'E-sign' : doc.entry_point == 'Video' ? 'Video sign' : doc.entry_point
									}}
								</tippy>
							</td>
							<td>
								<tippy :content="'Participant: ' + doc.participants_count">
									<span class="badge rounded-pill badge-light-primary">
										{{ doc.participants_count }} Participant(s)
									</span>
								</tippy>
							</td>
							<td>
								<tippy :content="'Last modified: ' + dateTime(doc.updated_at)">
									{{ dateTime(doc.updated_at) }}
								</tippy>
							</td>

							<template v-if="dashboard.status == 'completed'">
								<td class="text-center">
									<button
										type="button"
										@click="addToLocker(doc.id)"
										title="Save to digital locker"
										class="btn btn-sm btn-outline-primary rounded-pill"
									>
										<Icon icon="material-symbols:lock-outline" style="font-size: 1rem" />
										Lock
									</button>
								</td>
							</template>

							<td>
								<div class="dropdown">
									<button
										type="button"
										class="btn btn-sm dropdown-toggle hide-arrow py-0 waves-effect waves-float waves-light"
										data-bs-toggle="dropdown"
										aria-expanded="false"
									>
										<VerticalEllipsis />
									</button>
									<div class="dropdown-menu dropdown-menu-end">
										<template v-if="dashboard.status != 'deleted'">
											<a
												v-if="dashboard.status == 'completed'"
												class="dropdown-item"
												href="#"
												@click="openShareModal(doc.id)"
											>
												<Icon icon="ic:baseline-share" />&nbsp;
												<span>Share</span>
											</a>

											<a
												v-if="dashboard.status == 'completed'"
												class="dropdown-item"
												role="button"
												@click="
													getDocument({
														id: doc.id,
														entry_point: doc.entry_point,
														status: dashboard.status,
														isView: true,
													})
												"
											>
												<ViewIcon />&nbsp;
												<span>View</span>
											</a>

											<template v-if="doc.entry_point == 'Docs' && dashboard.status != 'completed'">
												<a
													class="dropdown-item"
													role="button"
													@click="
														getDocument({
															id: doc.id,
															entry_point: doc.entry_point,
															status: dashboard.status,
															isEdit: true,
														})
													"
												>
													<EditIcon />&nbsp;
													<span>Edit</span>
												</a>
											</template>
										</template>
										<template v-else>
											<a
												class="dropdown-item"
												href="#"
												@click="$emit('deleteRestore', { action: 'restore', id: doc.id })"
											>
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
					</template>
				</tbody>
			</table>

			<nav class="d-flex justify-content-between my-1">
				<span class="text-muted"
					>Showing {{ pages?.from ?? 0 }} to {{ pages?.to ?? 0 }} of {{ pages?.total ?? 0 }} entries</span
				>
				<ul class="pagination align-items-center">
					<li
						v-for="page in pages?.links"
						:key="page"
						class="page-item"
						:class="{ active: page.active, disabled: page.url === null }"
					>
						<a class="page-link" @click="$emit('paginate', page.url)" href="#"><span v-html="page.label" /></a>
						<!-- <a class="page-link" @click="paginate(page.url)" href="#"><span v-html="page.label" /></a> -->
					</li>
				</ul>
			</nav>
		</div>
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
import { Icon } from '@iconify/vue';
import TrashIcon from '@/icons/TrashIcon.vue';
import EditIcon from '@/icons/EditIcon.vue';
import ViewIcon from '@/icons/ViewIcon.vue';
import RestoreIcon from '@/icons/RestoreIcon.vue';
import VerticalEllipsis from '@/icons/VerticalEllipsis.vue';
import ModalComp from '@/components/ModalComp.vue';
import ShareDocument from '@/components/Document/Edit/ShareDocument.vue';

import { capitalizeFirstLetter } from '@/utils';
import { dashboard } from '@/store/dashboard';
import { ref, toRefs, computed, defineProps, defineEmits } from 'vue';
import { useActions } from 'vuex-composition-helpers/dist';
import { useRouter } from 'vue-router';
import { Tippy } from 'vue-tippy';
import moment from 'moment';

const ListGroup = ref(15);
const searchQuery = ref('');
const selectedRows = ref([]);
const selectAll = ref(false);

const { getUserDocument, getLockerDoc, shareDoc } = useActions({
	getUserDocument: 'document/getUserDocument',
	shareDoc: 'document/shareDoc',
	getLockerDoc: 'document/getLockerDoc',
});

// const props = defineProps({ data: Array, isLoading: { type: Boolean, default: false } });

const props = defineProps({
	data: Array,
});

const { data } = toRefs(props);

const route = useRouter();

const dateTime = (value) => moment(value).format('Do MMM YYYY, hh:mm A');

const emit = defineEmits(['checker', 'listPerPage']);

const handleChecker = (params) => emit('checker', params);

const handlePerPage = (params) => emit('listPerPage', params);

const handleListGroup = () => {
	let urlPerPage = `https://dev-api.gettonote.com/api/v1/documents?status=${capitalizeFirstLetter(
		dashboard.value.status
	)}&sort_by_desc=updated_at&per_page=${ListGroup.value != 'All' ? ListGroup.value : pages.value.total}&page=1`;
	handlePerPage(urlPerPage);
};

const filteredData = computed(() => {
	return data.value.data?.filter((item) => {
		if (searchQuery.value != '') return item.title.toLowerCase().includes(searchQuery.value.toLowerCase());
		else return data.value.data;
	});
});

const pages = computed(() => data.value.meta);

const selectRow = (index) => {
	let docIds = [];

	if (selectedRows.value.includes(filteredData.value[index])) {
		selectedRows.value = selectedRows.value.filter((item) => item !== filteredData.value[index]);
	}
	// else {
	// selectedRows.value.push(filteredData.value[index]);
	for (const key in selectedRows.value) docIds.push(selectedRows.value[key].id);
	handleChecker(docIds);
	// }
};

const selectAllRows = () => {
	if (selectAll.value) {
		let docIds = [];
		selectedRows.value = [...filteredData.value];

		for (const key in selectedRows.value) docIds.push(selectedRows.value[key].id);
		handleChecker(docIds);
	} else {
		selectedRows.value = [];
		handleChecker(selectedRows.value);
	}
};

const getDocument = (params) => {
	if (params.isView && (params.status == 'completed' || params.status == 'declined')) {
		route.push({ name: 'document.audit', params: { document_id: params.id } });
	} else {
		if (params.entry_point == 'Docs') {
			route.push({ name: 'document.edit', params: { document_id: params.id } });
		} else {
			getUserDocument(params.id);
			emit('hidden', { id: params.id, hide: true });
		}
	}

	if (params.isEdit === true) {
		return route.push({ name: 'document.edit', params: { document_id: params.id } });
	}
};

const lockerId = ref('');
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
const documentId = ref('');
const openShareModal = (params) => {
	isShare.value = true;
	documentId.value = params;
};

const handleShare = (params) => {
	isShare.value = false;
	let dataObj = { id: documentId.value, payload: { documents: params } };
	shareDoc(dataObj);
};
</script>

<style scoped>
@media screen and (max-width: 765px) {
	.px-custom {
		padding: 0 !important;
	}
}
</style>
