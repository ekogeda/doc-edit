<template>
	<div v-if="allLoaded">
		<div class="loader">
			<PreLoader />
		</div>
	</div>
	<div v-else id="pdfvuer">
		<slot name="document-tools"></slot>
		<template v-if="comp !== 'audit'">
			<pdf :src="file.file" v-for="i in numPages" :key="i" :id="i" :page="i" :text="false" :resize="true">
				<template #loading>
					<div class="loader">
						<PreLoader />
					</div>
				</template>
			</pdf>
			<p v-if="!allLoaded" class="text-start" style="margin: 2px 0">
				Page {{ `${file.page_number} of ${pageNumberCounter.length}` }}
			</p>
		</template>
		<template v-else>
			<pdf :src="file.file" v-for="i in numPages" :key="i" :id="i" :page="i" :text="false" :resize="true" class="mb-1">
				<template #loading>
					<div class="loader">
						<PreLoader />
					</div>
				</template>
			</pdf>
		</template>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGetters } from 'vuex-composition-helpers/dist';

const { userDocument, isDocLoading } = useGetters({
	userDocument: 'document/userDocument',
	isDocLoading: 'document/isDocLoading',
});

const pageNumberCounter = ref([]);
userDocument.value.documentUploads.filter((item) => {
	if (item.status === 'Processing') pageNumberCounter.value.push(item);
});

const allLoaded = computed(() => isDocLoading.value);
</script>

<script>
import pdfvuer from 'pdfvuer';
// import "pdfjs-dist/build/pdf.worker.entry";
import PreLoader from '@/components/PreLoader.vue';

export default {
	components: {
		pdf: pdfvuer,
		PreLoader,
	},

	props: ['file', 'comp', 'oldDoc'],

	data() {
		return {
			page: 1,
			numPages: 1,
			pdfData: undefined,
			scale: 1,
			documentHeight: 0,
		};
	},

	computed: {
		formattedZoom() {
			return Number.parseInt(this.scale * 100);
		},
	},

	mounted() {
		setTimeout(() => {
			this.getPdf();
		}, 1000);
	},

	updated() {
		this.documentHeight = Number(this.numPages) * 1159;
		this.$emit('documentHeight', this.documentHeight);
	},

	watch: {
		show(s) {
			if (s) {
				this.getPdf();
			}
		},
		page(p) {
			if (
				window.pageYOffset <= this.findPos(document.getElementById(p)) ||
				(document.getElementById(p + 1) && window.pageYOffset >= this.findPos(document.getElementById(p + 1)))
			) {
				document.getElementById(p).scrollIntoView();
			}
		},
	},

	methods: {
		handlePdfLink(params) {
			let page = document.getElementById(String(params.pageNumber));
			page.scrollIntoView();
		},
		getPdf() {
			let self = this;
			self.pdfData = pdfvuer.createLoadingTask(this.file.file);
			self.pdfData.then((pdf) => {
				self.numPages = pdf.numPages;
				window.onscroll = function () {
					changePage();
					stickyNav();
				};

				let sticky = document.getElementById('buttons')?.offsetTop;
				function stickyNav() {
					if (window.pageYOffset >= sticky) {
						document.getElementById('buttons')?.classList.remove('hidden');
					} else {
						document.getElementById('buttons')?.classList.add('hidden');
					}
				}

				function changePage() {
					let i = 1,
						count = Number(pdf.numPages);
					do {
						if (
							window.pageYOffset >= self.findPos(document.getElementById(i)) &&
							window.pageYOffset <= self.findPos(document.getElementById(i + 1))
						) {
							self.page = i;
						}
						i++;
					} while (i < count);
					if (window.pageYOffset >= self.findPos(document.getElementById(i))) {
						self.page = i;
					}
				}
			});
		},
		findPos(obj) {
			return obj?.offsetTop;
		},
	},
};
</script>

<style lang="css" scoped>
#buttons {
	margin-left: 0 !important;
	margin-right: 0 !important;
}

.loader {
	display: grid;
	place-items: center;
	position: relative;
	height: 80vh;
	width: 100%;
}

@media screen and (max-width: 640px) {
	.loader {
		width: 100%;
	}
}

@media screen and (max-width: 991.5px) {
	.loader {
		height: 60vh;
	}
}
</style>
