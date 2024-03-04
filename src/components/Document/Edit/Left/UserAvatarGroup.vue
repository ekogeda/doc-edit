<template>
	<div class="avatar-group flex-wrap" style="margin-left: 0.3rem">
		<div
			v-for="(init, index) in userDocument.participants"
			data-bs-toggle="tooltip"
			data-bs-placement="bottom"
			:title="init.user.first_name + ' ' + init.user.last_name"
			class="avatar pull-up"
			:class="{ 'avatar-sm': type == 'xs' }"
			:data-id="init.id"
			:key="index"
		>
			<div
				class="avatar-content text-uppercase"
				:style="{
					border: init.ownerDocument ? '1px solid #28C76F!important' : '1px solid ' + colorCode[index] + '!important',
					color: init.ownerDocument ? '#28C76F!important' : colorCode[index] + '!important',
				}"
			>
				{{ getFirstLetters(init.user.first_name + ' ' + init.user.last_name) }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useGetters } from 'vuex-composition-helpers/dist';
import { useBreakpointsComposable } from '@/composables/useBreakpoints';
const { type } = useBreakpointsComposable();

const { userDocument } = useGetters({
	userDocument: 'document/userDocument',
});

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

const getFirstLetters = (str) => {
	const firstLetters = str
		.split(' ')
		.map((word) => word[0])
		.join('');

	return firstLetters;
};
</script>

<style scoped>
.avatar-group .avatar {
	margin-left: -0.55rem !important;
}

.avatar-group .avatar .avatar-content {
	background-color: #fff !important;
}

.custom-avatar {
	width: 32px;
	height: 32px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.isHover {
	background-image: linear-gradient(to right, #003bb3, #003bb3 50%, #000 50%);
	background-size: 200% 100%;
	background-position: -100%;
	display: inline-block;
	padding: 5px 0;
	position: relative;
	background-clip: 'text';
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	transition: all 0.3s ease-in-out;
}

.isHover:before {
	content: '';
	position: absolute;
	width: 100%;
	height: 2px;
	border-radius: 4px;
	background-color: #003bb3;
	bottom: 0;
	left: 0;
	transform-origin: right;
	transform: scaleX(0);
	transition: transform 0.3s ease-in-out;
}

.isHover:hover {
	background-position: 0;
}

.isHover:hover::before {
	transform-origin: left;
	transform: scaleX(1);
}

::-webkit-scrollbar {
	width: 3px;
}

::-webkit-scrollbar-track {
	background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
	background: #888;
}

::-webkit-scrollbar-thumb:hover {
	background: #555;
}
</style>
