<template>
	<div class="content-right border-0">
		<div @click="$emit('open', (openSide = true))" class="d-none sidebar-toggle d-block d-lg-none ms-1 my-1">
			<MenuIcon />
		</div>

		<div class="content-body">
			<!-- <div class="body-content-overlay" :class="{ show: dashboard.isOpened }" @click="dashboard.setIsOpened(false)"></div> -->
			<div class="email-app-list">
				<div class="email-user-list">
					<div
						class="card shadow-none bg-light"
						:class="{ 'mt-5': type == 'md' }"
						:style="{
							width: type != 'lg' ? (Number(sortedFile[0]?.page_width) + 10) * SCALE_FACTOR + 'px' : 'inherit',
						}"
					>
						<div class="card-body shadow-none px-1">
							<div id="mainWrapper" class="mx-auto" :style="{ width: sortedFile[0]?.page_width * SCALE_FACTOR + 'px' }">
								<p>Title: {{ theDoc.title }}</p>
								<!-- <DraggableContainer :referenceLineColor="'#003bb3'"> -->
								<RenderPage
									comp="main"
									v-for="doc in sortedFile"
									:key="doc.id"
									:file="{ page_number: doc.number, file: doc.file_url }"
									@click="$emit('docId', doc.id)"
									@documentHeight="getHeight"
								>
									<template #document-tools>
										<template v-if="!isDocLoading && annotationTools?.length != 0 && height">
											<div
												v-for="tool in activeTaskFilter(annotationTools, doc.id)"
												:key="tool.id"
												class="parent"
												:style="{
													width: doc?.page_width * SCALE_FACTOR + 'px',
													height: doc?.page_height * SCALE_FACTOR + 'px',
												}"
											>
												<ToolAnnotation
													:tool="tool"
													:owner="{
														isOwner: theDoc.is_the_owner_of_document,
														name: theDoc.document_owner,
													}"
												/>
											</div>
										</template>
									</template>
								</RenderPage>
								<!-- </DraggableContainer> -->
								<template v-if="props.isDownload || props.doneModal">
									<div
										class="downloader mx-auto digi_cert mb-1"
										:data-page="sortedFile.length + 1"
										:style="{ height: sortedFile[0]?.page_height * SCALE_FACTOR + 'px' }"
									>
										<div class="p-2">
											<div class="text-center">
												<h1 class="fw-bolder">Digital Transaction Certificate</h1>
												<p>Document Ref: '{{ userDocument?.id }}'</p>
											</div>

											<div>
												<p class="fw-bold my-1">Document Name: {{ userDocument?.title }}</p>

												<p class="fw-bold my-1">
													Document Completed On:
													{{ moment(userDocument?.updated_at).format('dddd, MMMM Do YYYY, h:mm:ss a') }}
												</p>
											</div>

											<table class="table table-bordered border-dark">
												<tr v-for="(part, index) in userDocument.participants" :key="index">
													<td>
														<div class="row pb-0">
															<div class="col-3">
																{{ part.user.first_name + ' ' + part.user.last_name }}
															</div>
															<div class="col-9">
																{{
																	part.ownerDocument == true
																		? 'Document Owner'
																		: part.role == 'Signer'
																		? 'Signer'
																		: part.role
																}}
															</div>
														</div>
														<div class="row">
															<div class="col-3">Email</div>
															<div class="col-9" style="word-wrap: break-word">
																{{ part.user.email }}
															</div>
														</div>
														<div class="row">
															<div class="col-3">Device IP.</div>
															<div class="col-9">{{ part.user.ip_address }}</div>
														</div>
													</td>
													<td>
														<div class="col-12">Signature</div>
														<div class="col-12">
															<SignatureFromTools :userId="part.user.id" />
														</div>
													</td>
												</tr>
											</table>

											<!-- <div class="my-2">
												<h2>How to verify this document:</h2>
												<p>
													1. Visit wwww.gettonote.com/verify-document and type in the document id above in the search
													panel Or.
												</p>
												<p>2. Scan the QR Code at the tale end using your mobile device.</p>
											</div> -->
										</div>
									</div>
								</template>
							</div>
						</div>
					</div>
				</div>

				<div class="ps__rail-y" style="top: 0px; height: 100px; right: 0px">
					<div class="ps__thumb-y" tabindex="0" style="top: 0px; height: 100px"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import moment from 'moment';
import ToolAnnotation from '@/components/Document/Edit/Tools/ToolAnnotation.vue';
import SignatureFromTools from '@/components/Document/Edit/Tools/SignatureFromTools.vue';
import RenderPage from './RenderPage.vue';
import MenuIcon from '@/icons/MenuIcon.vue';
// import { DraggableContainer } from "vue3-draggable-resizable";
import { ref, onMounted, computed, watch, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { useGetters, useActions } from 'vuex-composition-helpers/dist';
import { useBreakpointsComposable } from '@/composables/useBreakpoints';

const { type } = useBreakpointsComposable();
const router = useRouter();

const { userDocument, isDocLoading, workingTools } = useGetters({
	userDocument: 'document/userDocument',
	isDocLoading: 'document/isDocLoading',
	workingTools: 'document/workingTools',
	isLoading: 'document/isLoading',
});

const { getUserDocument } = useActions({
	getUserDocument: 'document/getUserDocument',
});

const props = defineProps({ isDownload: Boolean, doneModal: Boolean });
const openSide = ref(false);
const theDoc = ref('');
const documentHeight = ref(0);

const activeTaskFilter = (tools, docUpId) => {
	return tools.filter((tool) => tool.document_upload_id === docUpId);
};

const annotationTools = computed(() => workingTools.value);
const height = ref(0);

watch(
	() => [userDocument.value, documentHeight.value],
	([newDoc, newH], [oldDoc]) => {
		if (oldDoc != newDoc) theDoc.value = newDoc;

		if (newH) setTimeout(() => (height.value = newH), 2000);
	},
	{ deep: true }
);

const getHeight = (event) => (documentHeight.value = event);

const SCALE_FACTOR = 3.7795275591;
const sortedFile = computed(() => {
	const files = [];
	const documentArray = userDocument.value?.documentUploads;

	documentArray?.forEach((item) => {
		if (item.status === 'Processing' && item.number_ordering != null) {
			files.push({
				id: item.id,
				file_url: item.file_url,
				number: item.number_ordering,
				page_height: item.page_height,
				page_width: item.page_width,
				page_type: item.page_type,
			});
		}
		// files.sort((a, b) => (a.number > b.number ? 1 : -1));
	});
	return files;
});

const uri = ref('');
onMounted(() => {
	uri.value = router.currentRoute.value.params.document_id;
	getUserDocument(uri.value);
});
</script>

<style scoped>
.digi_cert {
	background-image: url('../../../../assets/dtc.jpg');
	background-repeat: no-repeat;
	background-size: 100% 100%;
}

.parent {
	position: absolute;
	user-select: none;
}

.email-application .content-area-wrapper .email-user-list {
	height: auto;
}

.custom-box {
	width: 28px;
	height: 28px;
}
</style>
