<template>
	<div v-if="showNextToolButton">
		<button class="btn btn-sm btn-outline-primary waves-effect waves-float waves-light position-relative w-100"
			@click="goToNextTool">
			Go to next tool
			<span class="custom-badge rounded-circle bg-danger" :style="[type !== 'lg' ? styledSm : '']">
				{{ toolLeftToSign }}
			</span>
		</button>
	</div>
</template>

<script setup>
import { computed, defineEmits, ref } from 'vue';
import { useGetters } from 'vuex-composition-helpers/dist';
import Swal from 'sweetalert2';
import { useBreakpointsComposable } from '@/composables/useBreakpoints';

const { type } = useBreakpointsComposable();
const emit = defineEmits([]);

const { profile, workingTools, userDocument } = useGetters({
	profile: 'auth/profile',
	workingTools: 'document/workingTools',
	userDocument: 'document/userDocument',
});

const isOwner = ref(userDocument.value.is_the_owner_of_document);

const showNextToolButton = computed(() => Object.values(workingTools.value).length > 0);

const toolLeftToSign = computed(() => {
	let counted = 0;
	const unSigned = workingTools.value.filter(
		(item) => item.user_id == profile.value.id && !item.signed && !['Fullname', 'Date'].includes(item.tool_name)
	);
	counted = unSigned.length;
	return counted;
});

const currentToolIndex = ref(-1);
const goToNextTool = () => {
	let copyArray = [];
	workingTools.value.map((mapItem) => {
		userDocument.value.documentUploads.map((docItem) => {
			if (mapItem.document_upload_id === docItem.id && docItem.status == 'Processing') {
				copyArray.push(mapItem);
			}
		});
	});

	const annotationToolsArray = copyArray.sort((a, b) => copyArray.indexOf(b) - copyArray.indexOf(a));

	let nextToolIndex = currentToolIndex.value;
	let userFound = false;

	do {
		nextToolIndex = (nextToolIndex + 1) % annotationToolsArray.length;
		const nextTool = annotationToolsArray[nextToolIndex];
		userFound = isOwner.value || nextTool.user_id === profile.value.id;
	} while (!userFound && nextToolIndex !== currentToolIndex.value);

	if (userFound) {
		currentToolIndex.value = nextToolIndex;
		const currentTool = annotationToolsArray[currentToolIndex.value];

		if (currentTool && currentTool.id) {
			emit('goToNextTool', currentTool.id);
		}
	} else {
		Swal.fire({
			icon: 'info',
			title: 'No tools found',
			text: 'All tools are either signed or filled.',
			focusConfirm: false,
			confirmButtonText: 'OK',
		});
	}
};

const styledSm = {
	width: '20px',
	height: '20px',
	fontSize: '0.8rem',
};
</script>

<style>
.swal2-confirm {
	width: 100% !important;
}

.custom-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	padding: 10px;
	font-size: 1rem;
	color: #fff;
}
</style>
