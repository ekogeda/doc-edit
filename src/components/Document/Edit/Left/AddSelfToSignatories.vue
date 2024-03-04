<template>
	<div class="list-group-item list-group-item-action" :class="{ 'is-mobile': mobile }">
		<div class="form-check form-check-primary form-switch">
			<label class="form-label form-check-label mb-0">
				<input
					type="checkbox"
					@change="toggleSigningStatus"
					v-model="isDelete"
					:checked="isDelete"
					class="form-check-input"
				/>
				I want to sign
			</label>
		</div>
	</div>

	<Teleport to="body">
		<ModalComp :show="removeSelfModal" :size="'modal-sm'" :header="false" @close="removeSelfModal = false">
			<template #body>
				<div class="my-2">
					<h4 class="modal-title text-darker text-center">Are you sure you want to remove this signer?</h4>
					<p class="fw-normal text-center">This will remove all tools added in the signer's name.</p>
				</div>
			</template>
			<template #footer>
				<button class="btn border me-1" @click="cancelRemove">Cancel</button>
				<button class="btn btn-danger" @click="confirmRemove">Yes, Remove</button>
			</template>
		</ModalComp>
	</Teleport>
</template>

<script setup>
import ModalComp from '@/components/ModalComp.vue';
import { ref, onMounted, defineProps } from 'vue';
import { useGetters, useActions } from 'vuex-composition-helpers/dist';

const { profile, userDocument } = useGetters({
	profile: 'auth/profile',
	userDocument: 'document/userDocument',
});

const { removeParticipant, addSelf } = useActions({
	addSelf: 'document/addSelf',
	removeParticipant: 'document/removeParticipant',
});

defineProps({ mobile: { default: false } });

const isDelete = ref(false);
const removeSelfModal = ref(false);
const participantId = ref(null);

const toggleSigningStatus = () => {
	const participantArray = userDocument.value.participants;

	if (isDelete.value === true) {
		addSelf(userDocument.value.id);
	} else {
		participantArray.forEach((params) => {
			if (params.user.id === profile.value.id) {
				participantId.value = params.id;
				isDelete.value = params.iAddedMyselfToDocument;
			}
		});
		removeSelfModal.value = true;
	}
};

const confirmRemove = () => {
	removeParticipant(participantId.value);
	removeSelfModal.value = isDelete.value = false;
};

const cancelRemove = () => {
	removeSelfModal.value = false;
};

onMounted(() => {
	userDocument.value?.participants.forEach((params) => {
		if (params.user.id === profile.value.id) {
			isDelete.value = params.iAddedMyselfToDocument;
		}
	});
});
</script>

<style scoped>
.is-mobile {
	padding: 0;
	border: 0;
	border-bottom: 0 !important;
}

.form-switch .form-check-input {
	height: 1.4rem !important;
}
</style>
