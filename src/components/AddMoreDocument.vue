<template>
	<div class="grid">
		<div>
			<slot name="prefix" />
		</div>

		<div class="ms-auto">
			<Form @submit="onProceed" :validation-schema="schema">
				<template v-if="!isSelected">
					<label
						for="choose"
						class="btn btn-primary"
						:class="[type == 'xs' ? 'btn-sm' : 'btn-md']"
						:style="[type == 'xs' ? 'font-size:12px' : '1rem']"
					>
						<input
							type="file"
							id="choose"
							@change="selectedFile($event)"
							multiple
							accept="image/*, .doc, .docx, .pdf"
						/>
						<Icon icon="ic:baseline-plus" style="font-size: 1.5rem" /> Add a document
					</label>
				</template>
				<template v-else>
					<button type="submit" class="btn btn-primary d-block ms-auto" :class="{ disabled: !isSelected }">
						Proceed
					</button>
				</template>
			</Form>
		</div>
	</div>

	<div class="mt-2">
		<div
			class="d-flex align-items-center mb-2"
			v-for="(prev, index) in previewFile"
			:key="index"
			:style="[type != 'lg' ? 'width:15rem' : 'width:auto']"
		>
			<Icon icon="bxs:file-pdf" class="text-danger" style="font-size: 2rem" />
			<div class="mx-1 text-truncate" style="padding: 0.5rem">
				{{ prev.file.name }}
			</div>
			<!-- <span class="text-center d-none d-md-block">{{ prev.size }}</span> -->
			<button
				class="btn btn-outline-danger border-0 ms-auto"
				:class="[type == 'xs' ? 'btn-sm' : 'btn-md']"
				@click="removeItem(index, false)"
			>
				Remove
			</button>
		</div>
	</div>

	<ModalComp :show="openDeleteDoc" :size="'modal-sm'" :header="false" :footer="false" @close="openDeleteDoc = false">
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
import { Icon } from '@iconify/vue';
import ModalComp from '@/components/ModalComp.vue';
import { Form } from 'vee-validate';

import { ref, toRaw, defineProps, defineEmits } from 'vue';

import { useActions, useGetters } from 'vuex-composition-helpers/dist';
import { useBreakpointsComposable } from '@/composables/useBreakpoints';

const { type } = useBreakpointsComposable();
const { userDocument, isLoading } = useGetters({
	userDocument: 'document/userDocument',
	isLoading: 'document/isLoading',
});

const { moreFileUploads } = useActions({
	moreFileUploads: 'document/moreFileUploads',
});

const props = defineProps({ parentId: String });

const emit = defineEmits(['close']);

const isSubmitted = ref(false);
const isSelected = ref(false);
const dropzoneFile = ref('');
const previewFile = ref([]);
const dataFile = ref([]);
const title = ref('');

function formatBytes(bytes, decimals = 2) {
	if (!+bytes) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

dataFile.value = [];
previewFile.value = [];
const preparedFile = (files) => {
	for (let i = 0; i < files.length; i++) {
		let reader = new FileReader();
		const params = files[i];
		const fileSize = formatBytes(params.size);
		const fileName = params.name.split('.').slice(0, -1).join('.');

		reader.onloadend = () => {
			dataFile.value.push({
				parent_id: userDocument.value.id,
				file: reader.result,
				title: fileName,
				entry_point: userDocument.value.entry_point,
			});
			previewFile.value.push({ file: params, name: fileName, size: fileSize });
		};
		reader.readAsDataURL(params);
	}

	isSelected.value = true;
};

const selectedFile = (e) => {
	let dropFiles = (dropzoneFile.value = e.target.files);
	title.value = dropFiles[0].name.split('.').slice(0, -1).join('.');
	preparedFile(dropFiles);
	isSelected.value = true;
};

const openDeleteDoc = ref(false);
const itemIndex = ref('');
const removeItem = (index, remove) => {
	itemIndex.value = index;
	if (!remove) {
		return (openDeleteDoc.value = true);
	}
	previewFile.value.splice(itemIndex.value, 1);
	dataFile.value.splice(itemIndex.value, 1);
	if (previewFile.value.length == 0) {
		title.value = '';
		isSelected.value = false;
	}
	openDeleteDoc.value = false;
};

const hasReminder = ref(false);
const hasApprover = ref(false);
const hasSigningSequence = ref(false);
const reminderFrequency = ref('1');

const onProceed = () => {
	const uploadFile = {
		title: title.value,
		entry_point: userDocument.value.entry_point,
		files: toRaw(dataFile.value),
		parent_id: props.parentId,
		has_reminder: hasReminder.value,
		reminder_frequency: reminderFrequency.value,
		has_approval_sequence: hasApprover.value,
		has_signing_sequence: hasSigningSequence.value,
		has_sequence_order: false,
	};

	moreFileUploads(uploadFile);
	title.value = '';
	dataFile.value = [];
	previewFile.value = [];
	isSubmitted.value = isLoading.value;
	isSelected.value = false;
	emit('close', true);
};
</script>

<style scoped>
.grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
}

@media screen and (max-width: 767.98px) {
	.p-custom {
		padding: 1rem !important;
	}
}
</style>
