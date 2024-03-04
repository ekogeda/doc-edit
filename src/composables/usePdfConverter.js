import { ref } from 'vue';

export function usePdfConverterComposable() {
	const base64PdfStrings = ref([]);

	function formatBytes(bytes, decimals = 2) {
		if (!+bytes) return '0 Bytes';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}

	async function convertPdfToBase64(url) {
		try {
			const response = await fetch(url.file);
			const blob = await response.blob();

			const reader = new FileReader();
			reader.onloadend = () => {
				const sizeInBytes = response.headers.get('content-length');
				const sizeFormatted = formatBytes(sizeInBytes);
				base64PdfStrings.value.push({
					file: reader.result,
					title: url.title,
					entry_point: url.entry_point,
					size: sizeFormatted,
				});
			};

			reader.readAsDataURL(blob);
		} catch (error) {
			console.error('Error fetching or converting the PDF:', error);
		}
	}

	async function convertMultiplePdfToBase64(urls) {
		base64PdfStrings.value = [];

		for (const url of urls) {
			await convertPdfToBase64(url);
		}
	}

	return { base64PdfStrings, convertMultiplePdfToBase64 };
}
