<template>
	<div class="dropdownMen">
		<span class="d-block form-label">Select signer</span>
		<button class="btn btn-sm" @click="toggleDropdownMen" :style="{
			outline:
				'1px solid ' +
				(toolKit.color?.owner && toolKit.userEmail != ''
					? '#28C76F !important'
					: toolKit.userEmail != ''
						? toolKit.color?.code + '!important'
						: '#333 !important'),
		}">
			<div class="d-flex align-items-center justify-content-between">
				<span class="d-inline-block text-truncate" style="line-height:1.2"
					:style="{ width: type != 'lg' ? '75px' : '7.5rem' }">
					{{ selectedSigner }}
				</span>
				<Icon icon="tabler:chevron-down" />
			</div>
		</button>

		<ul v-if="isOpen" class="dropdownMen-menu shadow"
			:style="{ width: type == 'lg' ? '15rem' : '', top: type == 'lg' ? '55px' : '' }">
			<!-- <li > -->
			<a href="#" class="d-flex align-items-center btn rounded-0" style="font-size: 10px;"
				:class="{ disabled: option.role === 'Viewer' }" role="button" :aria-disabled="option.role === 'Viewer'"
				v-for="(option, index) in filteredPart" :key="index" @click="selectSigner(option)">
				<div class="d-flex justify-content-center align-items-center rounded-circle text-uppercase m-size me-1" :style="{
					color: option.ownerDocument ? '#28C76F' : colorCode[index],
					border: `1px solid ${option.ownerDocument ? '#28C76F' : colorCode[index]}`,
				}">
					{{ getFirstLetters(option.user.first_name + ' ' + option.user.last_name) }}
				</div>
				<span class="d-block text-capitalize">
					{{ option?.user?.first_name }} {{ option?.user?.last_name }}
				</span>
			</a>
			<!-- </li> -->

			<hr class="my-0" />

			<li>
				<a href="#" class="d-flex justify-content-center align-items-center text-primary"
					@click="addParticipantModal = true">
					<PlusIcon class="me-1" /> Add participant
				</a>
			</li>
		</ul>
	</div>

	<Teleport to="body">
		<ModalComp :show="addParticipantModal" :footer="false" @close="addParticipantModal = false">
			<template #header>
				<h4 class="modal-title text-darker">Add participants</h4>
			</template>

			<template #body>
				<AddSigner @close="addParticipantModal = false" />
			</template>
		</ModalComp>
	</Teleport>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import PlusIcon from '@/icons/PlusIcon.vue';
import ModalComp from '@/components/ModalComp.vue';
import AddSigner from '@/components/Document/Edit/Left/AddSigner.vue';

import { ref, defineEmits, computed, onMounted, watch } from 'vue';
// import { ref, defineProps, computed, onMounted } from "vue";
import { useGetters } from 'vuex-composition-helpers/dist';
import { getFirstLetters } from '@/utils';

const { profile, userDocument } = useGetters({
	profile: 'auth/profile',
	userDocument: 'document/userDocument',
});

import { useBreakpointsComposable } from '@/composables/useBreakpoints';
const { type } = useBreakpointsComposable();

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

watch(
	() => [userDocument.value],
	([newUserDoc]) => {
		if (newUserDoc) {
			// filteredParticipant.value = newUserDoc.participants.filter(
			//   (r) => r.role != "Viewer"
			// );

			newUserDoc.participants?.map((params, index) => {
				initialColor.value = params.user.email == profile.value.email ? colorCode.value[index] : null;
			});

			toolKit.value = {
				active: userDocument.value.is_the_owner_of_document ? activated.value : !activated.value,
				userEmail: profile.value.email,
				userId: profile.value.id,
				color: userDocument.value.is_the_owner_of_document ? code.value : { code: initialColor.value },
			};
		}
	},

	{ deep: true }
);

const addParticipantModal = ref(false);
const isOpen = ref(false);
const selectedSigner = ref('Select signer');

const toggleDropdownMen = () => (isOpen.value = !isOpen.value);

const filteredPart = computed(() => {
	return userDocument.value?.participants;
});

// const defaultUserFullName = computed(() => {
//   return profile.value.first_name + " " + profile.value.last_name;
// });

const isOwner = ref(false);
const fullName = ref(null);
const toolKit = ref({});
const activated = ref(false);
const participantId = ref('');
const code = ref(null);

const emit = defineEmits(['emitToolKitData']);
const selectSigner = (params) => {
	isOpen.value = false;
	selectedSigner.value = params.user.first_name + ' ' + params.user.last_name;
	isOwner.value = params.ownerDocument;
	userDocument.value?.participants.filter((item, index) => {
		if (item.user.email == params.user.email) {
			initialColor.value = item.ownerDocument ? '#28C76F' : colorCode.value[index];
			participantId.value = item.user.id;
			fullName.value = item.user.first_name + ' ' + item.user.last_name;
			code.value = {
				owner: item.ownerDocument,
				name: item.user.first_name,
				code: colorCode.value[index] ?? '#003BB3',
			};
		}
	});

	toolKit.value = {
		active: activated.value,
		userEmail: params.user.email,
		userId: participantId.value,
		userFullName: selectedSigner.value,
		color: code.value ?? { code: '#003BB3' },
	};

	emit('emitToolKitData', toolKit.value);
};

const docOwner = ref(false);
const initialColor = ref(null);
onMounted(() => {
	// selectedSigner.value = defaultUserFullName.value;
	initialColor.value = '#003BB3';

	docOwner.value = userDocument.value.is_the_owner_of_document;
	toolKit.value = {
		active: docOwner.value ? activated.value : !activated.value,
		userEmail: docOwner.value ? '' : profile.value.email,
		userId: profile.value.id,
		color: {
			owner: userDocument.value.is_the_owner_of_document,
			name: profile.value.first_name,
			code: initialColor.value ?? '#003BB3',
		},
	};
});
</script>

<style scoped>
.dropdownMen {
	position: relative;
	/* display: inline-block; */
	width: 40%;
}

.m-size {
	width: 25px;
	height: 25px;
	padding: 10px;
}

ul.dropdownMen-menu {
	position: absolute;
	top: 48px;
	list-style: none;
	padding: 0;
	margin: 0;
	background-color: #fff;
	min-width: 14rem;
	z-index: 1;
	/* box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2); */
}

li {
	padding: 10px;
	cursor: pointer;
}

li:hover {
	background-color: #f0f0f0;
}
</style>
