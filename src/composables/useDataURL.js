import { ref } from 'vue';
import { randomId } from '@/utils';
const query = randomId(10);
export const useConvertToBase64Composable = () => {
	function toBase64(url, callback) {
		const xhr = new XMLHttpRequest();
		xhr.onload = function () {
			const reader = new FileReader();
			reader.onloadend = function () {
				callback(reader.result);
			};
			reader.readAsDataURL(xhr.response);
		};
		xhr.open('GET', url + '?' + query);
		xhr.setRequestHeader('Access-Control-Allow-Headers', '*');
		xhr.responseType = 'blob';
		xhr.send();
	}

	const transparentImageUrl = ref(null);

	function makeBackgroundTransparent(imgSrc) {
		const img = new Image();

		img.crossOrigin = 'anonymous'; // Enable cross-origin resource sharing (CORS) if needed
		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			canvas.width = img.width;
			canvas.height = img.height;

			ctx.drawImage(img, 0, 0);

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			for (let i = 0; i < data.length; i += 4) {
				const red = data[i];
				const green = data[i + 1];
				const blue = data[i + 2];

				if (red >= 200 && green >= 200 && blue >= 200) data[i + 3] = 0;

				// var r = data[i];

				// if (r > 10) {
				// 	// overwrite gray pixel with white pixel
				// 	data[i] = data[i + 1] = data[i + 2] = 255;
				// 	// alpha channel
				// 	data[i + 3] = 0;
				// }
			}

			ctx.putImageData(imageData, 0, 0);

			transparentImageUrl.value = canvas.toDataURL('image/png');
		};

		img.src = imgSrc;
	}
	return { toBase64, makeBackgroundTransparent, transparentImageUrl };
};
