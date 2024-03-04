<template>
	<!-- Nav -->
	<nav class="navbar navbar-expand-lg navbar-white bg-white fixed-top">
		<!-- ... Your other navbar code ... -->
	</nav>

	<div class="fixed-sidebar aside-left bg-white border border-danger">
		<div style="padding: 15px; margin-top: 150px;">
			<button class="btn btn-sm mb-1" @click="addTool('text')">Add Text Tool</button>
			<button class="btn btn-sm mb-1" @click="addTool('signature')">Add Signature Tool</button>
			<button class="btn btn-sm mb-1" @click="addTool('date')">Add Date Tool</button>
			<button class="btn btn-sm mb-1" @click="generatePdf">Generate PDF</button>
		</div>
	</div>

	<div class="fixed-sidebar aside-right bg-white border border-danger">
		Right sidebar content
	</div>

	<div class="main-content bg-light">
		<div style="height: 1500px;">
			<div ref="pdfContainer" class="mx-auto"
				style="width: 794px; height: 1122px; border: 1px solid blue; position: relative;">
				<DraggableResizableVue v-for="(tool, index) in tools" :key="index" :parent="true" :x="tool.x" :y="tool.y"
					:w="tool.width" :h="tool.height" :min-width="minWidth" :min-height="minHeight" :max-width="maxWidth"
					:max-height="maxHeight"
					:style="{ border: tool.type === 'text' && tool.isTextareaFocused ? '1px solid #ccc' : 'none' }"
					@resizing="onResizing">
					<textarea v-if="tool.type === 'text'" v-model="tool.content" ref="textareaRef" @input="updateSize(index)"
						@keydown="handleKeyDown(index, $event)" @focus="handleFocus(index)" @blur="handleBlur(index)"
						placeholder="Type here"
						style="resize: none; width: 100%; height: 100%; box-sizing: border-box; white-space: pre-wrap; overflow-y: hidden; border: none; outline: none;"></textarea>

					<div v-else>
						<div v-if="tool.type === 'signature' && !tool.imageUrl" @click="handleWrapperClick(index)">
							{{ tool.type }}
						</div>
						<img v-else @click.stop="handleImageClick(index)" :src="tool.imageUrl" alt="Signature Tool"
							class="resizable-image">
					</div>
				</DraggableResizableVue>
			</div>
		</div>
	</div>

	<ModalComp :show="showSignatureModal" :size="'modal-sm'" :footer="false" @close="showSignatureModal = false">
			<template #header>
				<h4 class="modal-title text-darker">Create your signature</h4>
			</template>

			<template #body>
				<form @submit.prevent="uploadSignature">
					<!-- Input for choosing a signature image -->
					<div class="mb-3">
						<label for="signatureFile" class="form-label">Choose a signature image:</label>
						<input type="file" class="form-control" id="signatureFile" @change="handleSignatureFileChange" accept="image/*"
							required>
					</div>
					<!-- Image preview -->
					<div v-if="signaturePreview" class="mb-3">
						<label class="form-label">Signature preview:</label>
						<img :src="signaturePreview" alt="Signature Preview" style="max-width: 100%;">
					</div>
					<!-- Submit button -->
					<button type="submit" class="btn btn-primary">Upload Signature</button>
				</form>

				<div class="row">
					<div class="col-md-10 ms-auto mt-2">
						<p>
							By clicking create, I agree that all signatures, marks or initials created
							here are as valid as my hand written signature to the extent allowed by law.
						</p>
					</div>
				</div>
			</template>
		</ModalComp>
</template>

<script setup>
import ModalComp from "@/components/ModalComp.vue";
import { ref, nextTick } from "vue";
import DraggableResizableVue from 'vue-draggable-resizable'
import 'vue-draggable-resizable/style.css';

// const text = ref('');
// const width = ref(100);
// const height = ref(25);
const minWidth = ref(25);
const minHeight = ref(25);
const maxWidth = ref(500);
const maxHeight = ref(300);
// const isTextareaFocused = ref(false);
const textareaRef = ref(null);
const showSignatureModal = ref(false);
const tempIndex = ref('');

const tools = ref([]);

const addTool = (type) => {
	const newTool = {
		type,
		text: '', // Use a separate text property for each tool
		x: 0,
		y: 0,
		width: 100,
		height: 25,
		isTextareaFocused: false,
		// Add other properties specific to each tool type
	};
	tools.value.push(newTool);
};

const handleWrapperClick = (index) => {
	if (tools.value[index].type === 'signature') {
		// Show the Bootstrap modal
		showSignatureModal.value = true;
		tempIndex.value = index;
	}
};

const signaturePreview = ref('');
const handleSignatureFileChange = (event) => {
	const fileInput = event.target;
	const file = fileInput.files[0];

	if (file) {
		// Read the file and set the preview
		const reader = new FileReader();
		reader.onload = (e) => {
			signaturePreview.value = e.target.result;

			// Update the dimensions of the wrapper based on the image dimensions
			const img = new Image();
			img.src = e.target.result;

			img.onload = () => {
				const aspectRatio = img.width / img.height;

				// Set the width and height of the wrapper based on the image dimensions
				const originalWidth = Math.min(img.width, maxWidth.value);
				const originalHeight = Math.min(img.height, maxHeight.value / aspectRatio);

				// Scale down to half the original size
				const scaledWidth = originalWidth / 2;
				const scaledHeight = originalHeight / 2;

				// Update the tools array with the new dimensions
				tools.value[0].width = scaledWidth;
				tools.value[0].height = scaledHeight;

				// Center the wrapper
				tools.value[0].x = (maxWidth.value - scaledWidth) / 2;
				tools.value[0].y = (maxHeight.value - scaledHeight) / 2;
			};
		};

		reader.readAsDataURL(file);
	} else {
		signaturePreview.value = ''; // Clear the preview if no file selected
	}
};


const uploadSignature = () => {
	// Handle signature upload logic
	const fileInput = document.getElementById('signatureFile');
	const file = fileInput.files[0];

	if (file) {
		// Assuming you want to use FileReader to read the file content
		const reader = new FileReader();
		reader.onload = (e) => {
			const imageUrl = e.target.result;

			// Update the tools array with the new image URL
			tools.value[tempIndex.value].imageUrl = imageUrl;
		};

		reader.readAsDataURL(file);
	}

	showSignatureModal.value = false
}

const handleImageClick = (index) => {
	if (tools.value[index].type === 'signature') {
		// Handle click on the signature image inside the DraggableResizableVue wrapper
		console.log('Image clicked');
		showSignatureModal.value = false;
	}
};

const handleFocus = (index) => {
	tools.value.forEach((tool, i) => {
		tool.isTextareaFocused = i === index;
	});
};

const handleBlur = (index) => {
	tools.value[index].isTextareaFocused = false;
};

const onResizing = (event, direction, ref) => {
	// Handle resizing events if needed
	console.log({ event, direction, ref });
};

tools.value.forEach((tool) => {
	tool.content = '';
	tool.initialWidth = 100; // Set the initial width (you can adjust this value)
});

const updateSize = async (index) => {
	await nextTick(); // Use nextTick() directly
	const textarea = textareaRef.value[index];
	if (!textarea) return;

	// Set a maximum width to prevent excessive expansion
	const currentMaxWidth = maxWidth.value;

	// Calculate the width based on the content
	const contentWidth = textarea.scrollWidth;
	const newWidth = Math.min(contentWidth + 7.5, currentMaxWidth); // Add some padding

	// Check if the new width exceeds the maximum width
	if (newWidth > currentMaxWidth) {
		// If it exceeds, drop to the next line
		tools.value[index].width = minWidth.value;
		// Update the height based on the new line
		updateHeight(index);
	} else {
		// Update the width of the component
		tools.value[index].width = newWidth;

		// Check for overflow and update height
		updateHeight(index);
	}
};

const updateHeight = (index) => {
	const textarea = textareaRef.value[index];

	if (!textarea) return;

	const scrollHeight = textarea.scrollHeight;

	// Update the height of the component
	tools.value[index].height = Math.min(scrollHeight, maxHeight.value);
};


const handleKeyDown = (index, event) => {
	if (event.key === 'Backspace') {
		// Handle backspace key
		const textarea = textareaRef.value[index];

		if (!textarea) return;

		// Calculate the width based on the content
		const contentWidth = textarea.scrollWidth;

		// Reduce the width by a specific amount (you can adjust this value)
		const newWidth = Math.max(contentWidth - 10, minWidth.value);

		// Update the width of the component
		tools.value[index].width = newWidth;

		// Check for overflow and update height
		updateHeight(index);
	}
};

const generatePdf = () => {
	// Implement PDF generation logic here
};
</script>

<style scoped>
.fixed-sidebar {
	position: fixed;
	height: 100vh;
	overflow-y: auto;
	/* Adjust width as needed */
	width: 250px;
}

.aside-left {
	left: 0;
	top: 0;
}

.aside-right {
	right: 0;
	top: 0;
}

.main-content {
	margin-top: 120px;
	/* Adjust based on the height of your fixed top navbar */
	padding: 15px;
	margin-left: 250px;
	/* Adjust based on the width of left sidebar */
	margin-right: 250px;
	/* Adjust based on the width of right sidebar */
}

@media (max-width: 992px) {
	.fixed-sidebar {
		display: none;
	}

	.main-content {
		margin-left: 0;
		margin-right: 0;
	}
}

.pdf-container {
	position: relative;
	width: 800px;
	height: 600px;
	border: 1px solid #ccc;
	margin-bottom: 20px;
}

.tool-container {
	position: absolute;
	cursor: pointer;
}

.close-button {
	position: absolute;
	top: 0;
	right: 0;
	padding: 5px;
	cursor: pointer;
	background-color: #f1f1f1;
	border: 1px solid #ccc;
}

.resizable-image {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

::-webkit-scrollbar {
	width: 2px;
	height: 2px;
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

.custom-width {
	display: grid;
	place-items: center;
}

@media screen and (max-width: 991.5px) {
	/* .header-navbar {
    display: none !important;
  } */

	.custom-sm {
		display: block;
	}

	.content-area-wrapper {
		margin-top: 1em !important;
		margin-bottom: 1rem !important;
	}

	.dropdown-menu-right,
	.header-navbar .navbar-container .show~.dropdown-menu-right {
		left: -180% !important;
	}

	.header-navbar .navbar-container .show~.dropdown-menu-left {
		right: 210px !important;
		left: 12px !important;
		top: 30px !important;
		max-width: 12rem !important;
	}
}

/* @media screen and (max-width: 767.98px) {
  .header-navbar .navbar-container .show~.dropdown-menu-right {
    left: -180% !important;
  }
} */
</style>
