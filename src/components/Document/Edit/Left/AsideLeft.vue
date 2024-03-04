<template>
	<div class="sidebar-left">
		<div class="sidebar">
			<div class="email-app-sidebar">
				<div class="email-app-menu">
					<div class="sidebar-menu-list sidebar-nav sticky" style="width: 260px">
						<div class="list-group list-group-messages">
							<div v-if="isDocLoading" class="list-group-item my-1">
								<div class="d-flex align-items-center justify-content-between">
									<PuSkeleton width="160px" height="20px" />
									<PuSkeleton width="40px" height="40px" :circle="true" />
								</div>
								<div class="mb-1" />
								<div class="d-flex align-items-center justify-content-between">
									<PuSkeleton width="50px" height="20px" />
									<PuSkeleton width="150px" height="20px" />
								</div>
								<div class="mb-1" />
								<PuSkeleton width="100" height="20px" />
								<div class="mb-1" />
								<div class="d-flex align-items-center justify-content-between">
									<div>
										<PuSkeleton width="40px" height="40px" :circle="true" />
										<PuSkeleton width="40px" height="40px" :circle="true" />
									</div>
									<PuSkeleton width="120px" height="20px" />
								</div>
								<div class="mb-1" />
								<PuSkeleton width="100" height="300px" />
							</div>
							<template v-else>
								<template v-if="userDocument.is_the_owner_of_document">
									<div class="list-group-item text-dark d-flex justify-content-between align-items-center"
										:class="[type == 'md' ? 'mt-5' : 'mt-1']">
										<span>Participants</span>
										<button data-bs-toggle="tooltip" data-bs-placement="top" title="Add participants"
											class="btn waves-effect waves-float waves-light rounded-circle ttw_button"
											@click="addParticipantModal = true">
											<PlusIcon />
										</button>
									</div>
									<AddSelfToSignatories />
									<div class="list-group-item">
										<label class="form-label">Select signer</label>
										<UserSelect @toolKitData="handleToolKitData" />
									</div>
								</template>
								<template v-else>
									<div class="list-group-item my-1">
										<NextButton @goToNextTool="scrollToNextTool" />
									</div>
									<div class="list-group-item pb-0">
										<p>Current participant</p>
										<p class="text-capitalize text-dark">
											{{ profile.first_name }} {{ profile.last_name }}
											<span class="badge text-warning bg-light">{{ role }}</span>
										</p>
										<p class="mt-3">All participants</p>
									</div>
								</template>
								<div v-show="!hasRole" class="text-center mt-5">
									<span class="spinner-border spinner-border-sm"></span>
									Loading...
								</div>
								<div v-if="hasRole">
									<div class="list-group-item py-0">
										<UserAvatar :showAvatar="true" />
									</div>
									<div v-if="userDocument.is_the_owner_of_document" class="rounded border mx-1 overflow-scroll"
										style="height: 60vh">
										<h5 class="ms-1 mt-1 mb-0">Fields</h5>
										<ToolKits :tool="toolKit" @bindTool="addMouseMoveListener" />
									</div>
								</div>
								<div v-else>
									<div v-show="hasRole" class="list-group-item">
										<h6>You are to bear witness to this document.</h6>
										<p>Thank you!</p>
									</div>
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Tool Boxes -->
	<div v-for="(tool, index) in ['text', 'name', 'sign', 'initial', 'stamp', 'seal', 'date', 'photo']" :key="index"
		:class="`tool-box tool-style ${tool}Tool`" :id="`${tool}Tool`">
		<div class="element text-capitalize">{{ tool == 'sign' ? 'sign here' : tool == 'photo' ? 'images' : tool }}</div>
	</div>

	<ModalComp :show="addParticipantModal" :header="false" :footer="false" @close="addParticipantModal = false">
		<template #body>
			<h3 class="modal-title text-darker my-2">Add participants</h3>

			<AddSigner @close="addParticipantModal = false" />
		</template>
	</ModalComp>
</template>

<script setup>
import PlusIcon from '@/icons/PlusIcon.vue';
import ModalComp from '@/components/ModalComp.vue';
import AddSigner from '@/components/Document/Edit/Left/AddSigner.vue';
import UserAvatar from '@/components/Document/Edit/Left/UserAvatar.vue';
import UserSelect from '@/components/Document/Edit/Left/UserSelect.vue';
import NextButton from '@/components/Document/Edit/Main/NextButton.vue';

import moment from 'moment';
import { ref, onMounted, defineProps, watch, computed, onUpdated } from 'vue';
import { useGetters, useActions } from 'vuex-composition-helpers/dist';
import { dashboard } from '@/store/dashboard';
import { useBreakpointsComposable } from '@/composables/useBreakpoints';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';

const route = useRouter();
const { type } = useBreakpointsComposable();

import 'jquery/dist/jquery.min';
import $ from 'jquery';

import ToolKits from '@/components/Document/Edit/Tools/ToolKits.vue';
import AddSelfToSignatories from './AddSelfToSignatories.vue';

const { profile, userDocument, isDocLoading } = useGetters({
	profile: 'auth/profile',
	userDocument: 'document/userDocument',
	isDocLoading: 'document/isDocLoading',
});

const { resourceTools } = useActions({
	resourceTools: 'document/resourceTools',
});

/* ------- // *** Props from views\documents\DocumentEdit.vue (PARENT) ------ */
const props = defineProps({ chunkFileId: String });
const watchFileId = ref('');

watch(
	() => [props.chunkFileId, dashboard.value.annotationData],
	([newChunkF, newAnnData]) => {
		if (newChunkF) watchFileId.value = newChunkF;

		if (newAnnData) addMouseMoveListener(newAnnData);
	},

	{ deep: true }
);

const scrollToNextTool = (toolId) => {
	const nextToolElement = document.getElementById(`userTools-${toolId}`);
	if (nextToolElement) {
		nextToolElement.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
			inline: 'nearest',
		});

		const spanElement = nextToolElement.querySelector('.tooltiptext');
		if (spanElement) spanElement.style.visibility = 'visible';
	}
};

const addParticipantModal = ref(false);
const hasRole = ref(false);
const role = ref('');
const tempStorage = ref(null);
const tool_class = ref('');
const tool_id = ref('');
const uri = ref('');
const toolKit = ref({});
const tempData = ref(false);

const handleToolKitData = (params) => (toolKit.value = params);

let isMouseMoveActive = false;

const addMouseMoveListener = (params) => {
	if (params.toolId == 'freeTool') {
		removeMouseMoveListener();
		isMouseMoveActive = tempData.value = false;
	} else {
		if (isMouseMoveActive) {
			removeMouseMoveListener(); // Unbind the existing "mousemove" event
			$('#' + tool_id.value).css('display', 'none');
		}

		tempData.value = true;
		let count = 1;
		tempStorage.value = params;
		$(document).bind('mousemove', function (e) {
			count = count + 1;
			tool_id.value = count;
			$('.' + params.toolId).attr('id', count);
			$('.' + params.toolId).css({
				display: 'block',
				left: e.pageX + 2,
				top: e.pageY - 1,
			});
		});

		isMouseMoveActive = true;
	}
};

$(document).on('click', '#mainWrapper', function (e) {
	if (tempStorage.value == null) return;
	let posX = $(this).offset().left;
	let posY = $(this).offset().top;
	let x = e.pageX - posX + 2;
	let y = !tempStorage.value.isOld ? e.offsetY - 5 : e.pageY - posY - 2;
	const toolName = tempStorage.value.tool_name;

	if (['Textarea', 'Fullname', 'Date', 'Photograph'].includes(toolName)) {
		tool_class.value = 'main-element';
	} else {
		tool_class.value = 'tool-box main-element';
	}

	let saveTools = {
		id: uuidv4(),
		category: ['Textarea', 'Fullname', 'Date'].includes(toolName) ? 'Type' : 'Upload',
		document_upload_id: watchFileId.value,
		document_id: uri.value,
		tool_class: tool_class.value,
		tool_height: ['Textarea', 'Fullname', 'Date'].includes(toolName) ? '18' : toolName == 'Photograph' ? '100' : '30',
		tool_name: toolName,
		tool_pos_left: x.toString(),
		tool_pos_top: y.toString(),
		tool_width: ['Textarea', 'Date'].includes(toolName)
			? '110'
			: toolName == 'Fullname'
				? '210'
				: toolName == 'Photograph'
					? '100'
					: '120',
		type:
			toolName == 'Textarea'
				? 'Text'
				: toolName == 'Seal'
					? 'CompanySeal'
					: toolName == 'Stamp'
						? 'CompanyStamp'
						: toolName,
		user_id: tempStorage.value.userId == '' ? profile.value.id : tempStorage.value.userId,
		value: toolName == 'Fullname' ? fullName.value : toolName == 'Date' ? moment().format('DD-MM-YYYY') : '',
	};

	if (tempData.value === true) {
		resourceTools(saveTools);
		removeMouseMoveListener();
		isMouseMoveActive = tempData.value = false;
	}
});

function removeMouseMoveListener() {
	$(document).unbind('mousemove');
	$('#' + tool_id.value).css('display', 'none');
}

document.addEventListener('keydown', function (event) {
	if (isMouseMoveActive && event.key === 'Escape') {
		removeMouseMoveListener();
		isMouseMoveActive = tempData.value = false;
	}
});

const fullName = computed(() => {
	let full_name = null;
	userDocument.value?.participants?.map((participant) => {
		if (participant?.user?.id == tempStorage.value.userId) {
			full_name = participant?.user?.first_name + ' ' + participant?.user?.last_name;
		}
	});
	return full_name;
});

onUpdated(() => {
	uri.value = route.currentRoute.value.params.document_id;

	if (userDocument.value?.participants_count > 0) {
		userDocument.value?.participants?.map((participant) => {
			if (participant?.user?.id == profile.value.id) role.value = participant.role;
		});
	}
});

onMounted(() => {
	setTimeout(() => {
		hasRole.value = true;
	}, 1000);
});
</script>

<style scoped>
.list-group-item:hover {
	color: #6e6b7b !important;
}

.custom-select {
	color: #6e6b7b;
	font-weight: 500;
	border: 1px solid #333;
	outline: 2px solid #333;
}

.custom-select-active {
	border: 1px solid #003bb3;
	outline: 2px solid #003bb3;
}

.ttw_button {
	width: 40px;
	height: 40px;
	padding: 0px !important;
	color: #fff;
	background: #003bb3;
	box-shadow: 0px 0px 0px 1px #003bb3;
	border: 2.5px solid white;
}

.email-app-sidebar {
	background: transparent !important;
}

.sidebar-nav.sticky {
	position: fixed !important;
	top: 165px;
	bottom: 0;
	background-color: #fff;
	height: 100vh;
}

/* .email-application .content-area-wrapper .sidebar .email-app-sidebar {
  width: 260px !important;
} */

.btn.custom {
	padding: 0.786rem 0.5rem !important;
}

::-webkit-scrollbar {
	width: 3px;
}

::-webkit-scrollbar-track {
	background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
	background: #888;
}

::-webkit-scrollbar-thumb:hover {
	background: #555;
}
</style>
