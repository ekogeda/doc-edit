import { createApp } from 'vue';
import store from '@/store';
import App from './App.vue';
import router from '@/router/router';
import '../node_modules/nprogress/nprogress.css';
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import $ from 'jquery';
import 'aos/dist/aos.css';

import Vue3DraggableResizable from 'vue3-draggable-resizable';
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css';

import VueCropper from 'vue-cropper';
import 'vue-cropper/dist/index.css';

import Skeleton from 'vue-loading-skeleton';
import 'vue-loading-skeleton/dist/style.css';

import VueMixpanel from 'vue-mixpanel';
const mixpanelConfig = {
	token: process.env.VUE_APP_MIXPANEL_TOKEN ?? '',
	config: {
		debug: false,
	},
};

import VueTippy from 'vue-tippy';
import 'tippy.js/dist/tippy.css';
const tippyOption = {
	directive: 'tippy', // => v-tippy
	component: 'tippy', // => <tippy/>
	componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
	theme: 'translucent',
	defaultProps: {
		placement: 'auto-start',
		allowHTML: true,
	},
};

createApp(App)
	.use(router)
	.use(store)
	.use($)
	.use(VueToast)
	.use(Vue3DraggableResizable)
	.use(Skeleton)
	.use(VueCropper)
	.use(VueMixpanel, mixpanelConfig)
	.use(VueTippy, tippyOption)
	.mount('#app');

