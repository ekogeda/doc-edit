<template>
	<select
		class="border-0"
		:class="[
			isAnnotation ? 'custom-annotation' : 'form-select custom-select',
			signerEmail !== '' ? 'custom-select-active' : '',
		]"
		:style="{
			width: isAnnotation ? '100px' : '100%',
			outline: getOutlineStyle(),
		}"
		@change="selectSigner"
		v-model="signerEmail"
	>
		<option value="">Select signer</option>
		<option
			v-for="(signer, index) in filteredParticipants"
			:key="index"
			:data-email="signer?.user?.email"
			:value="signer?.user?.email"
		>
			{{ signer?.user?.first_name }} {{ signer?.user?.last_name }}
		</option>
	</select>
</template>

<script setup>
import { ref, defineEmits, defineProps, computed, watch, onMounted } from 'vue';
import { useGetters } from 'vuex-composition-helpers/dist';

const { profile, userDocument } = useGetters({
	profile: 'auth/profile',
	userDocument: 'document/userDocument',
});

const filteredParticipants = computed(() =>
	userDocument.value?.participants?.filter((participant) => participant.role !== 'Viewer')
);

const initCode = ref(null);
const docOwner = ref(false);
const toolKit = ref({});
const participantId = ref('');
const participantFirstName = ref('');
const signerEmail = ref('');
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

const emit = defineEmits(['toolKitData']);
const props = defineProps({ isAnnotation: Boolean, userEmail: String });

const selectSigner = (e) => {
	activated.value = e.target.value !== '';
	userDocument.value?.participants.forEach((params, index) => {
		if (params.user.email === signerEmail.value) {
			participantId.value = params.user.id;
			participantFirstName.value = params.user.first_name;
			code.value = {
				owner: params.ownerDocument,
				name: params.user.first_name,
				code: colorCode.value[index] || '#003BB3',
			};
		}
	});

	toolKit.value = {
		active: activated.value,
		userEmail: signerEmail.value,
		userId: participantId.value,
		color: code.value || { code: '#003BB3' },
	};

	emit('toolKitData', toolKit.value);
};

watch(
	() => [userDocument.value],
	([newUserDoc]) => {
		if (newUserDoc) {
			newUserDoc.participants?.forEach((params, index) => {
				initCode.value = params.user.email === profile.value.email ? colorCode.value[index] : null;
			});

			toolKit.value = {
				active: userDocument.value.is_the_owner_of_document ? activated.value : !activated.value,
				userEmail: profile.value.email,
				userId: profile.value.id,
				color: userDocument.value.is_the_owner_of_document ? code.value : { code: initCode.value },
			};
		}
	},
	{ deep: true }
);

onMounted(() => {
	signerEmail.value = props.isAnnotation ? props.userEmail : '';

	setTimeout(() => {
		docOwner.value = userDocument.value.is_the_owner_of_document;
		toolKit.value = {
			active: docOwner.value ? activated.value : !activated.value,
			userEmail: docOwner.value ? '' : profile.value.email,
			userId: profile.value.id,
			color: code.value || {
				code: userDocument.value.is_the_owner_of_document ? '#28C76F' : initCode.value,
			},
		};
	}, 2000);
});

const getOutlineStyle = () => {
	const color =
		toolKit.value.color?.owner && toolKit.value.userEmail !== ''
			? '#28C76F !important'
			: toolKit.value.userEmail !== ''
			? toolKit.value.color?.code + '!important'
			: '#333 !important';

	return `2px solid ${color}`;
};
</script>

<style scoped>
.custom-select {
	color: #6e6b7b;
	font-weight: 500;
	border: 1px solid #333;
}

.custom-select-active {
	border: 1px solid #003bb3;
	outline: 2px solid #003bb3;
}

.custom-annotation {
	width: 200px;
	height: 30px;
}
</style>
