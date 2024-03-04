<template>
	<div class="pane rounded d-flex">
		<template v-if="location != 'asideRight'">
			<div class="pane rounded-start" style="position: absolute;left: -25px;bottom: -2px;">
				<!-- <div v-if="docOwner" title="Drag" class="wrap move text-white">
				<MoveIcon />
			</div> -->
				<div title="Edit" class="wrap pointer text-white" @click="$emit('editUserTool', true)">
					<EditPencilIcon />
				</div>
				<!-- <div class="vr h-75 my-auto text-secondary" style="margin: 0 6px"></div> -->
			</div>
			<div class="pane rounded-end" style="position: absolute;right: -25px;bottom: -2px;}">
				<div v-if="docOwner" title="Remove" class="wrap pointer text-white" @click="$emit('deleteTool')">
					<DeleteIcon />
				</div>
			</div>
		</template>

		<template v-else>
			<!-- DROPDOWN FOR SWAPPING USER -->
			<div class="text-white">
				<div class="m-drop-down d-flex align-items-center">
					<span class="m-drop-btn d-block text-capitalize text-truncate" style="margin-right: 6px;"
						@mouseover="toggleUser" @mouseleave="toggleUser">
						<DotIcon style="margin: 0 6px" :style="{
							color: theColorCode,
						}" />
						{{ theNewName }}
					</span>

					<!-- <ChevronIcon v-if="docOwner" style="margin-right: 5px" /> -->

					<div v-if="docOwner" class="m-dropdown-content shadow" @mouseover="mouseOverUser" @mouseout="mouseOutUser"
						:class="[showUser ? 'd-block' : 'd-none']">
						<a href="#" class="d-flex align-items-center btn rounded-0" :class="{ disabled: signer.role === 'Viewer' }"
							style="padding: 0.8rem" @click.prevent="selectSigner(signer)"
							v-for="(signer, index) in userDocument.participants" :key="index" role="button"
							:aria-disabled="signer.role === 'Viewer'">
							<div class="d-flex justify-content-center align-items-center rounded-circle text-uppercase m-size me-1"
								:style="{
									color: signer.ownerDocument ? '#28C76F' : colorCode[index],
									border: `1px solid ${signer.ownerDocument ? '#28C76F' : colorCode[index]}`,
								}">
								{{ getFirstLetters(signer.user.first_name + ' ' + signer.user.last_name) }}
							</div>
							<p class="mb-0 text-capitalize text-start">{{ signer?.user?.first_name }} {{ signer?.user?.last_name }}</p>
						</a>

						<hr class="my-0" />

						<a href="#" class="d-flex justify-content-center align-items-center text-primary" style="padding: 0.8rem"
							@click="addParticipantModal = true">
							<PlusIcon class="me-1" /> Add participant
						</a>
					</div>
				</div>
			</div>

			<!-- DROPDOWN FOR SWAPPING TOOL -->
			<div class="pointer rounded" style="position: absolute;right: 14px;" :style="{ backgroundColor: theColorCode }">
				<div class="m-drop-down">
					<div class="m-drop-btn text-white text-center" @mouseover="toggleTool" @mouseleave="toggleTool">
						<div>
							Aa
							<!-- <TextIcon style="margin: 0 5px" />
							<ChevronIcon v-if="docOwner" /> -->
						</div>
					</div>
					<div v-if="docOwner" class="m-dropdown-content shadow" :class="[showTools ? 'd-block' : 'd-none']"
						@mouseover="mouseOverTool" @mouseout="mouseOutTool">
						<ToolKits :tool="toolKit" :isAnnotation="true" @bindTool="swapBindTool" />
					</div>
				</div>
			</div>
		</template>
	</div>

	<Teleport to="body">
		<ModalComp :show="addParticipantModal" :header="false" :footer="false" @close="addParticipantModal = false">
			<template #body>
				<h3 class="modal-title text-darker my-2">Add participants</h3>
				<AddSigner @close="addParticipantModal = false" />
			</template>
		</ModalComp>
	</Teleport>
</template>

<script setup>
// import MoveIcon from '@/icons/MoveIcon.vue';
import EditPencilIcon from '@/icons/EditPencilIcon.vue';
import DeleteIcon from '@/icons/DeleteIcon.vue';
// import TextIcon from '@/icons/TextIcon.vue';
import DotIcon from '@/icons/DotIcon.vue';
import PlusIcon from '@/icons/PlusIcon.vue';
// import ChevronIcon from '@/icons/ChevronIcon.vue';
import ToolKits from '@/components/Document/Edit/Tools/ToolKits.vue';
import ModalComp from '@/components/ModalComp.vue';
import AddSigner from '@/components/Document/Edit/Left/AddSigner.vue';

import moment from 'moment';
import { ref, watch, defineProps, onMounted } from 'vue';
import { useGetters, useActions } from 'vuex-composition-helpers/dist';
import { getFirstLetters } from '@/utils';
import { useRouter } from 'vue-router';

const route = useRouter();

const { profile, userDocument, toolData } = useGetters({
	profile: 'auth/profile',
	userDocument: 'document/userDocument',
	toolData: 'document/toolData',
});

const { editTools, activatedTool } = useActions({
	editTools: 'document/editTools',
	activatedTool: 'document/activatedTool',
});


const props = defineProps({
	isAnnotation: Boolean,
	tool: Object,
	user: Object,
	appendPrintId: String,
	location: String,
});

const addParticipantModal = ref(false);
const docOwner = ref(false);
const selectedSigner = ref('');
const toolKit = ref({});
const participantId = ref('');
const uri = ref('');
const activated = ref(false);
const code = ref(null);
const colorCode = ref([
	'#e6194b',
	'#3f51b5',
	'#ffe119',
	'#4363d8',
	'#f58231',
	'#911eb4',
	'#46f0f0',
	'#f032e6',
	'#bcf60c',
	'#fabebe',
	'#008080',
	'#e6beff',
	'#9a6324',
	'#fffac8',
	'#800000',
	'#aaffc3',
	'#808000',
	'#ffd8b1',
	'#000075',
	'#808080',
	'#ffc107',
	'#ff5722',
]);

const showUser = ref(false)
const toggleUser = () => showUser.value = !showUser.value
const mouseOverUser = () => showUser.value = true;
const mouseOutUser = () => showUser.value = false;

const showTools = ref(false)
const toggleTool = () => showTools.value = !showTools.value
const mouseOverTool = () => showTools.value = true;
const mouseOutTool = () => showTools.value = false;

const theUser = ref('')
const theNewName = ref('')
const theColorCode = ref('')
// Use destructuring for cleaner code
watch(
	() => [props.user, props.tool, selectedSigner.value],
	([newUser, newTool, newSigner], [oldUser, oldTool, oldSigner]) => {
		// Check if either user or signer has changed
		if (newUser !== oldUser || newTool !== oldTool || newSigner !== oldSigner) {
			// Update the user value
			theUser.value = newUser;

			// Set theNewName.value based on full_name or newSigner
			theNewName.value = newUser.full_name || newSigner;

			// Set theColorCode.value based on conditions
			// If the user id matches the profile id, use '#28C76F', else use newName.code
			theColorCode.value = profile.value.id === newUser.userId ? '#28C76F' : newUser?.code;

			// Activate the tool with the updated user information
			if (toolData.value != null) {
				activatedTool({ tool: newTool, user: theUser.value });
			}
		}
	}
);

const isOwner = ref(false);
const fullName = ref(null);

const selectSigner = (params) => {
	// Extract relevant information from params
	const selectedUser = params.user;
	const selectedUserName = `${selectedUser.first_name} ${selectedUser.last_name}`;
	// Update selectedSigner and isOwner values
	selectedSigner.value = selectedUserName;
	isOwner.value = params.ownerDocument;

	// Find the participant that matches the selected user's email
	const matchingParticipant = userDocument.value?.participants.find((item) => item.user.email === params.user.email);

	if (matchingParticipant) {
		// Update participant-related values if a matching participant is found
		participantId.value = matchingParticipant.user.id;
		fullName.value = `${matchingParticipant.user.first_name} ${matchingParticipant.user.last_name}`;
		code.value = {
			owner: matchingParticipant.ownerDocument,
			name: matchingParticipant.user.first_name,
			// Use colorCode based on the index or fallback to a default value
			code: colorCode.value[userDocument.value.participants.indexOf(matchingParticipant)] || '#003BB3',
		};
	}

	// Update toolKit with relevant information
	toolKit.value = {
		active: activated.value,
		userEmail: params.user.email,
		userId: participantId.value,
		userFullName: selectedSigner.value,
		// Use code.value or fallback to a default colorCode
		color: code.value || { code: theColorCode.value },
	};

	// Prepare and editTools with a swapUserObj
	const swapUserObj = {
		category: '',
		document_upload_id: props.tool.document_upload_id,
		document_id: uri.value,
		tool_class: props.tool.tool_class,
		tool_height: props.tool.tool_height,
		tool_name: props.tool.tool_name,
		tool_pos_left: props.tool.tool_pos_left,
		tool_pos_top: props.tool.tool_pos_top,
		tool_width: props.tool.tool_width,
		type: '',
		user_id: participantId.value,
		// Use selectedSigner.value if the tool_name is 'Fullname', otherwise, an empty string
		value: props.tool.tool_name === 'Fullname' ? selectedSigner.value : '',
	};

	// Call editTools with the swapUserObj payload
	editTools({ id: props.tool.id, payload: swapUserObj });
	// activatedTool(null)
};


const swapBindTool = (params) => {
	// Determine if the tool is a text tool
	const isTextTool = ['Textarea', 'Fullname', 'Date'].includes(params.tool_name);

	// Calculate toolHeight based on the tool_name
	const toolHeight = isTextTool ? '25' : params.tool_name === 'Photograph' ? '100' : '30';

	// Calculate toolWidth based on the tool_name
	const toolWidth =
		isTextTool
			? params.tool_name === 'Fullname'
				? '210'
				: ['Textarea', 'Date'].includes(params.tool_name)
					? '110'
					: '120'
			: params.tool_name === 'Photograph'
				? '100'
				: '120';

	// Determine the type based on the tool_name
	const type =
		params.tool_name === 'Textarea'
			? 'Text'
			: ['Seal', 'Stamp'].includes(params.tool_name)
				? `Company${params.tool_name}`
				: params.tool_name;

	// Determine the value based on the tool_name
	const value =
		params.tool_name === 'Fullname'
			? selectedSigner.value
			: params.tool_name === 'Date'
				? moment(new Date()).format('YYYY-MM-DD')
				: '';

	// Build the swapToolObj with calculated values
	const swapToolObj = {
		append_print_id: props.appendPrintId || null,
		category: isTextTool ? 'Type' : 'Upload',
		document_upload_id: props.tool.document_upload_id,
		document_id: uri.value,
		tool_class: isTextTool ? 'main-element' : props.tool.tool_class,
		tool_height: toolHeight,
		tool_name: params.tool_name,
		tool_pos_left: props.tool.tool_pos_left,
		tool_pos_top: props.tool.tool_pos_top,
		tool_width: toolWidth,
		type: type,
		user_id: props.tool.user_id,
		value: value,
	};

	// Call editTools with the created swapToolObj
	editTools({ id: props.tool.id, payload: swapToolObj });
};


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
onMounted(async () => {
	uri.value = route.currentRoute.value.params.document_id;
	selectedSigner.value = props.user?.full_name;

	await delay(2000);

	docOwner.value = userDocument.value.is_the_owner_of_document;

	toolKit.value = {
		active: docOwner.value ? activated.value : !activated.value,
		userEmail: docOwner.value ? '' : profile.value.email,
		userId: profile.value.id,
		userFullName: selectedSigner.value,
		color: {
			code: userDocument.value.is_the_owner_of_document ? '#28C76F' : theColorCode.value,
		},
	};
});
</script>

<style scoped>
.pane {
	width: max-content;
	background-color: #000;
}

.wrap {
	padding: 5.5px;
}

.move {
	cursor: move;
}

.pointer {
	cursor: pointer;
}

.m-size {
	width: 25px;
	height: 25px;
	padding: 10px;
}

.m-drop-btn {
	cursor: pointer;
	border: none;
	font-size: 14px;
	width: 100%;
	min-width: 50px;
	max-width: 160px;
}

.m-drop-down {
	position: relative;
	line-height: 2.5;
}

.m-dropdown-content {
	display: none;
	position: absolute;
	right: -10%;
	top: 34px;
	background-color: #fff;
	min-width: 180px;
	z-index: 1001 !important;
}

.m-dropdown-content a {
	color: black;
	padding: 6px 8px;
	text-decoration: none;
	display: flex;
	font-size: 12px;
}

.m-dropdown-content a:hover {
	background-color: #ddd;
}

/* .m-drop-down:hover .m-dropdown-content {
  display: block;
} */
</style>
