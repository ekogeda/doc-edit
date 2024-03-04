<template>
	<div class="grid grid__2 mx-auto" :style="{ width: size + 'px' }">
		<div class="cut">
			<vue-cropper
				ref="cropper"
				:img="data"
				:output-size="option.size"
				:output-type="option.outputType"
				:info="true"
				:full="option.full"
				:fixed="fixed"
				:fixed-number="fixedNumber"
				:can-move="option.canMove"
				:can-move-box="option.canMoveBox"
				:fixed-box="option.fixedBox"
				:original="option.original"
				:auto-crop="option.autoCrop"
				:auto-crop-width="option.autoCropWidth"
				:auto-crop-height="option.autoCropHeight"
				:center-box="option.centerBox"
				@real-time="realTime"
				:high="option.high"
				@img-load="imgLoad"
				:max-img-size="option.max"
				@crop-moving="cropMoving"
				mode="contain"
			></vue-cropper>
		</div>
		<div
			class="show-preview shadow"
			:style="{
				width: previews.w + 'px',
				height: previews.h + 'px',
				overflow: 'hidden',
				margin: '10px auto',
			}"
		>
			<div :style="previews.div">
				<img :src="previews.url" :style="previews.img" />
			</div>
		</div>
	</div>

	<p class="my-2">
		By clicking create, I agree that all signatures, marks or initials created here are as valid as my hand written
		signature to the extent allowed by law.
	</p>

	<div class="modal-footer">
		<button @click="finish()" class="btn btn-primary d-block ms-auto mt-1">
			{{ btnText }}
		</button>
	</div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useConvertToBase64Composable } from '@/composables/useDataURL';
const { makeBackgroundTransparent, transparentImageUrl } = useConvertToBase64Composable();

defineProps({
	data: { type: String },
	size: { type: Number },
	btnText: { type: String },
});

const emit = defineEmits(['uploaded']);

const previews = ref({});
const cropper = ref('');
const option = ref({
	img: require('../assets/noimage.png'),
	size: 1,
	full: false,
	outputType: 'png',
	canMove: true,
	fixedBox: false,
	original: false,
	canMoveBox: true,
	autoCrop: true,
	// Width and height only take effect when automatic screenshot is turned on
	autoCropWidth: 750,
	autoCropHeight: 340,
	centerBox: true,
	high: true,
	max: 99999,
});

const fixed = ref(false);
const fixedNumber = ref([75, 34]);

const finish = () => {
	cropper.value.getCropData((data) => {
		makeBackgroundTransparent(data);
		if (transparentImageUrl.value != null) {
			// console.log('transparentImageUrl', transparentImageUrl.value);
			emit('uploaded', transparentImageUrl.value);
		}
	});
};

// Live preview function
const realTime = (data) => (previews.value = data);
</script>

<style>
.cropper-modal {
	background: rgba(0, 0, 0, 0.2) !important;
	box-shadow: rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px;
}
</style>

<style scoped>
.grid {
	display: grid;
	place-items: center;
	gap: 10px;
}

.grid__2 {
	grid-template-columns: repeat(2, 1fr);
}

.cut {
	width: 250px;
	height: 250px;
	margin: 10px auto;
}

@media screen and (max-width: 991.5px) {
	.grid {
		width: 300px !important;
	}

	.grid__2 {
		grid-template-columns: 1fr;
	}
}
</style>
