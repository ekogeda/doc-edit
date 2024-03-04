<template>
	<div v-show="!prints.Initial">
		<p class="text-center"><i>Kindly create your initial signature</i></p>
		<button type="button" @click="initialModal = true" class="btn btn-sm btn-primary d-block ms-auto mt-2">
			<span>Create</span>
		</button>
	</div>

	<div v-show="prints.Initial">
		<div class="d-flex align-items-center justify-content-between mt-5">
			<p class="text-darker mb-0">Pick an initial signature to append</p>

			<button @click="initialModal = true" class="btn btn-sm btn-outline-secondary">
				<EditIcon />
				Edit
			</button>
		</div>

		<div class="grid my-2">
			<label v-for="(print, index) in prints.Initial" :key="index" class="form-check-label border rounded-3 w-available"
				:for="print.id">
				<PuSkeleton width="100" height="60px" v-show="loader" />
				<div v-show="!loader" @click="
					getImgUrl({
						category: print.category,
						type: print.type,
						print_id: print.id,
						file: print.file,
					})
					" style="width: auto; height: 60px">
					<template v-if="print.user_id">
						<input type="radio" :name="print.id" v-model="selected" class="form-check-input" :id="print.id"
							:value="print.id" />
						<img :src="print.file" class="w-100 h-100 img-custom" :alt="print.id" />
					</template>
				</div>
			</label>
		</div>

		<div class="modal-footer align-items-center px-0 pt-2 flex-wrapped">
			<div class="form-check d-inline-block form-check-primary form-switch">
				<label class="form-check-label">
					<input type="checkbox" @change="handleAutoFill" v-model="isAutoFill" :checked="isAutoFill"
						class="form-check-input" />
					<strong>Auto fill</strong>&nbsp;
					<small>(Your signature will automatically be added to all the area specified)</small>
				</label>
			</div>

			<button type="button" class="btn btn-primary" :disabled="!isDisabled" @click="uploadSignature">
				<span v-show="loading" class="spinner-border spinner-border-sm"></span>
				<span>Append</span>
			</button>
		</div>
	</div>

	<ModalComp :show="initialModal" :header="false" :footer="false" :size="'modal-md'" @close="initialModal = false">
		<template #body>
			<h3 class="modal-title text-darker my-2">
				<template v-if="!prints.Initial">Create your initial signature</template>
				<template v-else>Update your initial signature</template>
			</h3>

			<div class="row">
				<div class="col-md-12">
					<SignatureSelectFull :initial="true" @close="initialModal = false" />
				</div>
			</div>
		</template>
	</ModalComp>
</template>

<script setup>
import ModalComp from '@/components/ModalComp.vue';
import SignatureSelectFull from '@/components/Signature/SignatureSelectFull.vue';
import EditIcon from '@/icons/EditIcon.vue';

import { ref, defineEmits, watch } from 'vue';
import { createNamespacedHelpers } from 'vuex-composition-helpers/dist';
const { useGetters } = createNamespacedHelpers('print');

const { prints } = useGetters(['prints']);

const initialModal = ref(false);
const loading = ref(false);
const isDisabled = ref(false);
const selected = ref('');
const printId = ref('');

const loader = ref(true);
setTimeout(() => (loader.value = false), 1000);

watch(
	() => prints.value,
	(newValue) => {
		prints.value = newValue;
	}
);

const toolClass = ref('');
const category = ref('');
const type = ref('');
const signImg = ref('');
const getImgUrl = (params) => {
	category.value = params.category;
	type.value = params.type;
	printId.value = params.print_id;
	signImg.value = params.file;
	toolClass.value = 'tool-box main-element';
	isDisabled.value = true;
};

const isAutoFill = ref(false);
const handleAutoFill = (e) => (isAutoFill.value = e.target.checked);

const emit = defineEmits(['selectedSignature']);

const initWidth = ref('');
const initHeight = ref('');
const uploadSignature = () => {
	const img = new Image();

	img.onload = function () {
		let { width, height } = img;
		const maxWidth = 120;
		const maxHeight = 30;

		initWidth.value = width;
		initHeight.value = height;

		if (initWidth.value > maxWidth) {
			initWidth.value = maxWidth;
			initHeight.value = (height * maxWidth) / width;
		}

		if (initHeight.value > maxHeight) {
			initHeight.value = maxHeight;
			initWidth.value = (width * maxHeight) / height;
		}

		const uploadFile = {
			append_print_id: printId.value,
			tool_class: toolClass.value,
			category: category.value,
			type: type.value,
			file: signImg.value,
			tool_name: 'Initial',
			tool_width: initWidth.value.toString(),
			tool_height: initHeight.value.toString(),
			is_auto_fill: isAutoFill.value,
		};

		emit('selectedSignature', uploadFile);
		emit('closeModal', true);
	};
	img.src = signImg.value;

	loading.value = true;
	isDisabled.value = false;
	setTimeout(() => (loading.value = false), 500);
};
</script>

<style scoped>
.grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	place-items: center;
	gap: 20px;
}

.w-available {
	width: -webkit-fill-available;
}

.flex-wrapped {
	flex-wrap: nowrap;
}

[type='radio'] {
	position: absolute;
	top: 54%;
	margin: 0 5px;
	opacity: 1;
}

[type='radio']+img {
	cursor: pointer;
}

[type='radio']+img:hover {
	outline: 0.5px solid #003bb3;
	border-radius: 0.6rem !important;
}

[type='radio']:checked+img {
	outline: 2px solid #003bb3;
	border-radius: 0.6rem !important;
}

.img-custom {
	object-fit: scale-down;
	padding: 0 5px 0 25px;
}

@media screen and (max-width: 991.5px) {
	[type='radio'] {
		opacity: 0;
	}

	.img-custom {
		padding: 0;
	}

	.flex-wrapped {
		flex-wrap: wrap;
	}
}
</style>
