<template>
	<div v-for="(participant, index) in userDocument.participants" :key="index">
		<template v-if="userId === participant.user.id">
			<span class="name-style fw-normal">{{ participant.user.first_name }}</span>
		</template>
	</div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';
import { createNamespacedHelpers } from 'vuex-composition-helpers/dist';

const { useGetters } = createNamespacedHelpers('document');
const { userDocument } = useGetters(['userDocument']);

const props = defineProps({ userId: String });
const emit = defineEmits(['code']);

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

const codeObj = ref(null);
watch(
	() => props.userId,
	(newUserId) => {
		if (newUserId) changeUserId();
	}
);

const changeUserId = () => {
	userDocument.value.participants.some((part, index) => {
		if (props.userId === part.user.id) {
			codeObj.value = {
				userId: part.user.id,
				name: part.user.first_name,
				email: part.user.email,
				full_name: `${part.user.first_name} ${part.user.last_name}`,
				code: part.ownerDocument ? '#28C76F' : colorCode.value[index],
			};
			return true; // exit loop
		}
		return false;
	});

	emit('code', codeObj.value);
};

changeUserId();
</script>

<style scoped></style>
