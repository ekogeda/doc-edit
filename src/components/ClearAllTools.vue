<template>
	<button
		v-if="!isDropDown"
		class="btn btn-outline-primary"
		:class="[type != 'lg' ? 'btn-sm' : '']"
		@click="handleClearAllTools"
	>
		Clear all tools
	</button>
	<span v-else @click="handleClearAllTools">Clear all tools</span>

	<Teleport to="body">
		<ModalComp :show="clearModal" :size="'modal-sm'" :header="false" @close="clearModal = false">
			<template #body>
				<h3 class="modal-title text-darker my-2">Clear all tools</h3>

				<div class="text-center my-2">
					<h4 class="text-darker">Are you sure?</h4>
					<p>All the tools on this document will be removed</p>
				</div>
			</template>

			<template #footer>
				<button type="button" class="btn border" @click="clearModal = false">Cancel</button>
				<button type="button" class="btn btn-danger" @click="proceedToClear">Clear</button>
			</template>
		</ModalComp>
	</Teleport>
</template>

<script setup>
import ModalComp from '@/components/ModalComp.vue';
import { ref, toRefs, defineProps } from 'vue';
import { useActions } from 'vuex-composition-helpers/dist';
import { useBreakpointsComposable } from '@/composables/useBreakpoints';
const { type } = useBreakpointsComposable();

const { clearTools } = useActions({
	clearTools: 'document/clearTools',
});

const props = defineProps({ isDropDown: { type: Boolean, default: false } });

const { isDropDown } = toRefs(props);

const clearModal = ref(false);

const handleClearAllTools = () => (clearModal.value = true);

const proceedToClear = () => {
	clearTools();
	clearModal.value = false;
};
</script>

<style scoped>
.btn-outline-primary:hover:not(.disabled):not(:disabled) {
	background-color: #003bb3;
	color: #fff;
}
</style>
