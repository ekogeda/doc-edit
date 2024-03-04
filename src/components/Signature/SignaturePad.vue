<template>
	<div class="d-flex align-items-center justify-content-between my-2">
		<div class="text-darker">Draw your signature in the tool box</div>
		<button class="btn border text-darker" @click="clear">Clear</button>
	</div>

	<div class="grid">
		<div class="px-0">
			<div @touchmove.prevent class="text-center">
				<canvas
					:id="state.uid"
					class="canvas border shadow-sm"
					:width="type == 'lg' ? '500' : type == 'xs' ? '320' : '410'"
					:height="type == 'xs' ? '150' : '170'"
					:data-uid="state.uid"
					:disabled="state?.disabled"
				></canvas>
			</div>
		</div>

		<div class="ms-auto">
			<div
				class="mx-auto d-flex align-items-center rounded-3 border"
				style="padding: 0 5px"
				:style="{ width: type == 'lg' ? '230px' : '120px', height: type == 'lg' ? '174px' : '80px' }"
			>
				<template v-if="imgBase64 != ''">
					<img :src="imgBase64" class="img-fluid" alt="preview" />
				</template>
				<template v-else>
					<template v-if="drawnSignature != ''">
						<img :src="drawnSignature" class="img-fluid" alt="preview" />
					</template>
					<template v-else>
						<img src="@/assets/empty.png" class="img-fluid" width="100" alt="Preview" />
					</template>
				</template>
			</div>
		</div>
	</div>

	<p class="my-2">
		By clicking create, I agree that all signatures, marks or initials created here are as valid as my hand written
		signature to the extent allowed by law.
	</p>

	<hr />

	<button class="btn btn-primary d-block ms-auto" ref="create" @click="createDrawSignature">Create</button>
</template>

<script setup>
import SignaturePad from 'signature_pad';
import { v4 as uuidv4 } from 'uuid';
import { defineProps, onMounted, reactive, watch, defineExpose, ref, defineEmits } from 'vue';

import { createNamespacedHelpers } from 'vuex-composition-helpers/dist';
import { useBreakpointsComposable } from '@/composables/useBreakpoints';
import { useConvertToBase64Composable } from '@/composables/useDataURL';

const { makeBackgroundTransparent, transparentImageUrl } = useConvertToBase64Composable();
const { type } = useBreakpointsComposable();

const { useGetters, useActions } = createNamespacedHelpers(['print']);
const { prints } = useGetters(['prints']);
const { savePrint } = useActions(['savePrint']);

const emit = defineEmits(['close']);

const drawnSignature = ref('');
if (prints.value.Signature != undefined) {
	prints.value.Signature.find((cat) => (drawnSignature.value = cat.category == 'Draw' ? cat.file : ''));
}

const create = ref(false);

const props = defineProps({
	sigOption: {
		type: Object,
		default: () => {
			return {
				backgroundColor: 'rgb(255, 255, 255)',
				penColor: 'rgb(0, 0, 0)',
			};
		},
	},
	w: {
		type: String,
		default: '100%',
	},
	h: {
		type: String,
		default: '100%',
	},
	clearOnResize: {
		type: Boolean,
		default: false,
	},
	waterMark: {
		type: Object,
		default: () => {
			return {};
		},
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	defaultUrl: {
		type: String,
		default: '',
	},
});

let state = reactive({
	sig: () => {},
	option: {
		minWidth: 1.5,
		maxWidth: 1.5,
		backgroundColor: 'rgb(255, 255, 255)',
		penColor: 'rgb(0, 0, 0)',
	},
	uid: '',
});

let sigOptions = Object.keys(props.sigOption);
for (let item of sigOptions) {
	// eslint-disable-next-line vue/no-setup-props-destructure
	state.option[item] = props.sigOption[item];
}

watch(
	() => props?.disabled,
	(val) => {
		if (val) {
			state.sig.off();
		} else {
			state.sig.on();
		}
	}
);

const draw = () => {
	let canvas = document.getElementById(state?.uid);
	state.sig = new SignaturePad(canvas, state.option);

	state.sig.addEventListener('endStroke', () => save());

	SignaturePad.prototype.removeBlanks = function () {
		let tempCanvas = document.createElement('canvas').getContext('2d');
		const imgWidth = this._ctx.canvas.width;
		const imgHeight = this._ctx.canvas.height;
		const imageData = this._ctx.getImageData(0, 0, imgWidth, imgHeight);
		const data = imageData.data,
			getAlpha = function (x, y) {
				return {
					red: data[(imgWidth * y + x) * 4],
					green: data[(imgWidth * y + x) * 4 + 1],
					blue: data[(imgWidth * y + x) * 4 + 2],
				};
			},
			isWhite = function (rgb) {
				return rgb.red == 255 && rgb.green == 255 && rgb.blue == 255;
			},
			scanY = function (fromTop) {
				const offset = fromTop ? 1 : -1;

				for (let y = fromTop ? 0 : imgHeight - 1; fromTop ? y < imgHeight : y > -1; y += offset) {
					for (let x = 0; x < imgWidth; x++) {
						if (!isWhite(getAlpha(x, y))) return y;
					}
				}
				return null;
			},
			scanX = function (fromLeft) {
				const offset = fromLeft ? 1 : -1;

				for (let x = fromLeft ? 0 : imgWidth - 1; fromLeft ? x < imgWidth : x > -1; x += offset) {
					for (let y = 0; y < imgHeight; y++) {
						if (!isWhite(getAlpha(x, y))) return x;
					}
				}
				return null;
			};

		const cropTop = scanY(true),
			cropBottom = scanY(false),
			cropLeft = scanX(true),
			cropRight = scanX(false);

		const relevantData = this._ctx.getImageData(cropLeft, cropTop, cropRight - cropLeft, cropBottom - cropTop);

		tempCanvas.canvas.width = cropRight - cropLeft;
		tempCanvas.canvas.height = cropBottom - cropTop;
		tempCanvas.putImageData(relevantData, 0, 0);

		const dataURL = tempCanvas.canvas.toDataURL();
		imgBase64.value = dataURL;
		makeBackgroundTransparent(imgBase64.value);
	};

	function resizeCanvas(c) {
		let url;
		if (!isEmpty()) url = save();

		c.width = 410;
		c.height = 170;
		if (type.value == 'lg') {
			c.width = 500;
			c.height = 170;
		}
		if (type.value == 'xs') {
			c.width = 320;
			c.height = 150;
		}

		c.getContext('2d').scale(1, 1);
		clear();

		!props.clearOnResize && url !== undefined && fromDataURL(url);
	}

	window.addEventListener('resize', resizeCanvas(canvas));
	resizeCanvas(canvas);

	if (props.defaultUrl !== '') fromDataURL(props.defaultUrl);

	props.disabled ? state.sig.off() : state.sig.on();
};

const save = () => {
	state.sig.removeBlanks();
	create.value.disabled = false;
};

const imgBase64 = ref('');
const clear = () => {
	state.sig.clear();
	create.value.disabled = true;
	imgBase64.value = '';
};

const fromDataURL = (url) => {
	state.sig.fromDataURL(url);
};

const isEmpty = () => {
	return state.sig.isEmpty();
};

const undo = () => {
	let data = state.sig.toData();
	if (data) {
		data.pop();
		state.sig.fromData(data);
	}
};

onMounted(() => {
	create.value.disabled = true;
	state.uid = uuidv4();
	if (state.uid != '') {
		setTimeout(() => {
			draw();
		}, 1000);
	}
});

defineExpose({
	save,
	clear,
	isEmpty,
	undo,
	fromDataURL,
});

const createDrawSignature = () => {
	if (transparentImageUrl.value != null) {
		const signatureObj = {
			file: transparentImageUrl.value,
			type: 'Signature',
			category: 'Draw',
		};

		savePrint(signatureObj);
		imgBase64.value = '';
		emit('close', true);
	}
};
</script>

<style scoped>
canvas {
	/* width: 410px;
  height: 170px; */
	background-color: #f5f5f5;
}

.grid {
	display: grid;
	grid-template-columns: 2fr 1fr;
}

@media screen and (max-width: 991.5px) {
	/* canvas {
    width: 320px;
    height: 150px;
  } */

	.grid {
		grid-template-columns: 1fr;
	}
}
</style>
