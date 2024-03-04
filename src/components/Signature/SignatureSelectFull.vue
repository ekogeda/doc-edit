<template>
	<div class="row">
		<div class="col-12">
			<p class="text-darker mt-2">Enter your full name in the box below</p>
			<div class="mb-1">
				<label class="col-form-label" for="fullName">Full Name</label>
				<input type="text" class="form-control" name="fullName" v-model="fullName" placeholder="Full name" />
			</div>
		</div>
		<div class="d-flex flex-column justify-content-between">
			<div class="grid" :class="{ 'grid-sm': type != 'lg' }">
				<div class="hover bg-light rounded w-100 p-2 border" :class="{ 'border-active': selected === font }"
					v-for="(font, index) in fonts" :key="index">
					<div class="form-check">
						<div v-show="wait">
							<PuSkeleton v-if="type === 'xs'" width="25px" height="25px" style="margin-right: 10px;" />
							<PuSkeleton v-if="type === 'xs'" width="200px" height="25px" />

							<PuSkeleton v-if="type === 'md'" width="25px" height="25px" style="margin-right: 10px;" />
							<PuSkeleton v-if="type === 'md'" width="350px" height="25px" />

							<PuSkeleton v-if="type === 'lg'" :width="props.initial ? '25px' : '25px'" height="25px"
								style="margin-right: 10px;" />
							<PuSkeleton v-if="type === 'lg'" :width="props.initial ? '120px' : '200px'" height="25px" />
						</div>

						<div v-show="!wait && font !== ''">
							<input type="radio" @change="onCapture($event)" :name="font" v-model="selected" :value="font"
								class="border-1 hidden-radio rounded" :id="font" :checked="selected == font" :disabled="loading" />
							<label :for="font" class="d-flex align-items-center form-check-label">
								<div class="me-1">
									<div class="custom-checkbox">
										<span class="checkbox-icon">
											<Icon icon="ph:check" style="font-size: 1.5rem" />
										</span>
									</div>
								</div>
								<div class="fullName" :class="font" :style="{ fontSize: '1.5rem', marginTop: '4px', fontFamily: font }">
									{{ fullName }}
								</div>
							</label>
						</div>
					</div>
				</div>
			</div>
			<div class="">
				<div class="d-flex flex-wrap justify-content-between mt-2 mb-3">
					<h1 ctr class="fw-normal p-0 my-0">
						<span class="d-block text-darker h6">Selected signature</span>
						<div v-show="selectedFont">
							<div class="capture custom-fs-sm" data-type="Signature" :style="styleObject">
								{{ fullName }}
							</div>
						</div>
						<div v-show="!selectedFont">
							<template v-for="print in prints.Signature" :key="print.id">
								<template v-if="print.category == 'Type'">
									<div style="width: 200px">
										<img :src="print.file" class="w-100" :alt="print.type" />
									</div>
								</template>
							</template>
						</div>
					</h1>
					<h1 ctr class="d-inline-block fw-normal p-0 my-0">
						<span class="d-block text-darker text-center h6">Initial</span>
						<div v-show="selectedFont">
							<div class="capture custom-fs-sm" data-type="Initial" :style="styleObject">
								{{ getFirstLetters(fullName) }}
							</div>
						</div>
						<div v-show="!selectedFont">
							<template v-for="print in prints.Initial" :key="print.id">
								<template v-if="print.category == 'Type'">
									<div style="width: 100px">
										<img :src="print.file" class="w-100" :alt="print.type" />
									</div>
								</template>
							</template>
						</div>
					</h1>
				</div>
			</div>

			<!-- data: {{ imgUrl.length }}
			<p v-for="(img, indx) in imgUrl" :key="indx">
				<img :src="img.file" class="img-fluid border border-danger" alt="type" />
				<br />
				Type: {{ img.type }}
			</p> -->

			<p>
				By clicking create, I agree that all signatures, marks or initials created here are as valid as my hand written
				signature to the extent allowed by law.
			</p>
			<hr />
			<div class="col-md-12">
				<button type="button" class="btn btn-primary d-block ms-auto" :disabled="capturing" @click="createTypedSignature">
					<span v-show="loading" class="spinner-border spinner-border-sm"></span>
					<span>Create</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import html2canvas from 'html2canvas';

import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';
import { useGetters, useActions } from 'vuex-composition-helpers/dist';
import { getFirstLetters, capitalizeEachWord } from '@/utils';
import { useBreakpointsComposable } from '@/composables/useBreakpoints';
const { type } = useBreakpointsComposable();

const { profile, prints } = useGetters({
	profile: 'auth/profile',
	prints: 'print/prints',
});

const { savePrint } = useActions({ savePrint: 'print/savePrint' });

const props = defineProps({ initial: { type: Boolean, default: false } });

const selected = ref('');
const loading = ref(false);
const capturing = ref(true);
const selectedFont = ref('');
const fullName = ref('');
const fonts = ['Great Vibes', 'Arizonia'];
const styleObject = ref({});
const imgUrl = ref([]);

const wait = ref(true);
onMounted(() => {
	// After the component is mounted, wait for a few seconds and then turn off wait

	if (document.getElementsByClassName('fullName').length > 0) {
		setTimeout(() => {
			console.log(document.getElementsByClassName('fullName').length)
			wait.value = false;
		}, 3000);
	}
});

fullName.value = capitalizeEachWord(profile.value.first_name + ' ' + profile.value.last_name);

watch(
	() => fullName.value,
	(newValue) => {
		fullName.value = capitalizeEachWord(newValue);
		selected.value = '';
		capturing.value = false;
	}
);

const captureAndSave = async (element) => {
	try {
		let type = element.dataset.type;
		const canvas = await html2canvas(element, {
			backgroundColor: 'transparent',
			scale: 3,
		});

		const imageData = canvas.toDataURL('image/png');

		let fullNameOrInitial = type == 'Signature' ? fullName.value : getFirstLetters(fullName.value);

		imgUrl.value.push({
			file: imageData,
			type: type,
			value: capitalizeEachWord(fullNameOrInitial),
			category: 'Type',
		});

		capturing.value = loading.value = false;
	} catch (error) {
		capturing.value = false;
		console.error('Error capturing and saving the image:', error);
	}
};

const onCapture = async (e) => {
	capturing.value = loading.value = true;
	selectedFont.value = e.target.value;
	if (e.target.value != '') {
		imgUrl.value = [];

		styleObject.value = {
			fontFamily: e.target.value,
			color: '#000',
		};

		let capturedArr = Array.from(document.querySelectorAll('.capture'));
		setTimeout(() => {
			capturedArr.forEach((element) => captureAndSave(element));
		}, 100);
	}
};

const emit = defineEmits(['close']);
const createTypedSignature = () => {
	capturing.value = loading.value = true;

	imgUrl.value.forEach((formData) => savePrint(formData));

	setTimeout(() => {
		emit('close', true);
		capturing.value = loading.value = false;
	}, 1000);
};
</script>

<style scoped>
@import '@/assets/css/signature-font-face.css';

.grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	place-items: center;
	gap: 10px;
}

.grid-sm {
	grid-template-columns: 1fr !important;
}

.border-active {
	outline: 1px solid #003bb3 !important;
}

.hover:hover {
	outline: 1px solid #003bb3 !important;
}

.custom-fs-sm {
	color: #000;
	font-size: clamp(1rem, 4vw, 2rem);
	padding: 0 8px;
}

.custom-checkbox {
	width: 24px;
	height: 24px;
	background-color: #fff;
	border: 1px solid #ccc;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: background-color 0.2s;
}

.checkbox-icon {
	color: #003bb3;
	font-size: 14px;
	line-height: 1;
	display: none;
}

.hidden-radio {
	position: absolute;
	left: -9999px;
}

/* Style the custom checkbox when checked */
.hidden-radio:checked+.form-check-label .custom-checkbox .checkbox-icon {
	display: block;
}
</style>
