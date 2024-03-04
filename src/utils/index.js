export const randomId = (length) => {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

export const generateRandomHexColor = () => {
	const randomColor = Math.floor(Math.random() * 0xffffff + 1)
		.toString(16)
		.padStart(6, '0');
	return `#${randomColor}`;
};

export const capitalizeFirstLetter = (string = '') => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

export const capitalizeEachWord = (inputString) => {
	const words = inputString.split(' ');
	const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
	const resultString = capitalizedWords.join(' ');
	return resultString;
};

export const mmToPx = (mm) => {
	// Assuming 1 inch = 96 pixels
	// 1 inch = 25.4 mm
	const inches = mm / 25.4;
	const px = inches * 96;
	return px;
};

export const getFirstLetters = (str) => {
	const firstLetters = str
		.split(' ')
		.map((word) => word[0])
		.join('');

	return firstLetters;
};

export const isEmptyArray = (arr) => Array.isArray(arr) && arr.length === 0;

export const envFunction = () => {
	const domainName = window.location.hostname;
	return domainName.includes('dev') ||
		domainName.includes('staging') ||
		domainName.includes('demo') ||
		process.env.NODE_ENV === 'development'
		? true
		: false;
};
