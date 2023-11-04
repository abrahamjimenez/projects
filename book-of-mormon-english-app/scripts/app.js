import {getData} from "./dataHandler.mjs";

getData()
	.then(() => {
		// Remove this console.log() for production
		// console.log('Data loaded successfully');
	})
	.catch(error => {
		console.log('Error loading data', error);
	});