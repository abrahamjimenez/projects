const url = 'https://raw.githubusercontent.com/abrahamjimenez/Portfolio/main/projects/book-of-mormon-english-' +
	'app/data/book-of-mormon.json';

// ---------------------------------------- FETCHES JSON DATA ---------------------------------------- //
let globalData;

async function getData() {
	const response = await fetch(url);
	const data = await response.json();

	globalData = data;
	displayData(data);
}

// ---------------------------------------- USES JSON DATA ---------------------------------------- //
let currentBook = 0;
let currentChapter = 0;

function displayData(data) {
	// -------------------- FUNCTION DECLARATIONS -------------------- //
	function startOfChapter() {
		if (currentBook === 0 && currentChapter === -1) {
			currentBook = 14;
			currentChapter = 9;
		}
	}

	function endOfChapter() {
		if (currentBook === 14 && currentChapter === 10) {
			currentBook = 0;
			currentChapter = 0;
		}
	}

	startOfChapter();
	endOfChapter();

	function accessChapter() {
		const allChapters = data.books[currentBook].chapters;

		return allChapters.map(chapter => {
			return chapter.chapter;
		});
	}

	const chapterList = accessChapter(); // 1, 2, 3

	// -------------------- PREVIOUS BOOK, LAST CHAPTER -------------------- //
	function displayPreviousChapter() {
		if (currentChapter === -1) {
			currentBook = currentBook - 1;
			currentChapter = data.books[currentBook].chapters.length - 1;
		}
	}

	displayPreviousChapter();

	// -------------------- NEXT BOOK, FIRST CHAPTER -------------------- //
	function displayNextChapter() {
		if (currentChapter === chapterList.length) {
			currentBook++;
			currentChapter = 0;
		}
	}

	displayNextChapter();

	function accessAllBooks() {
		const allBooks = data.books;
		return allBooks.map(book => {
			return book.book;
		});
	}

	function accessChapterReference() {
		const allChapters = data.books[currentBook].chapters;

		return allChapters.map(chapter => {
			return chapter.reference;
		});
	}

	function accessVerses() {
		const allVerses = data.books[currentBook].chapters[currentChapter].verses;
		return allVerses.map(verseData => {
			const text = verseData.text;
			const verseNumber = verseData.verse;

			return `${verseNumber} ${text}`;
		});
	}

	function accessVerseTextOnly() {
		const allVerses = data.books[currentBook].chapters[currentChapter].verses;
		return allVerses.map(verseData => {
			return verseData.text;
		});
	}

	const booksList = accessAllBooks(); // 1 Nephi, 2 Nephi, Jacob
	const referenceList = accessChapterReference(); // 1 Nephi 1, 1 Nephi 2, 1 Nephi 3
	const versesList = accessVerses(); // 1 I, Nephi, having been born of goodly parents
	const onlyTextList = accessVerseTextOnly(); // I, Nephi, having been born of goodly parents

	// -------------------- CREATE AND ADD TO HTML -------------------- //
	const main = document.querySelector('main'); // <main></main>
	const verseContainer = document.createElement('div'); // <div></div>
	const currentReferenceListed = document.createElement('h2'); // 1 Nephi 1, 1 Nephi 2, 1 Nephi 3

	// This is the title of the page. It is the current chapter being displayed
	currentReferenceListed.textContent = referenceList[currentChapter]; // 1 Nephi 1, 1 Nephi 2, 1 Nephi 3

	// Creates a paragraph for each verse and adds them to 'verseContainer'
	versesList.forEach(verse => {
		const verseContent = document.createElement('p'); // 1 I, Nephi, having been born of goodly parents
		verseContent.append(verse);
		verseContainer.append(verseContent);
	});

	// Adds verseContainer into the DOM
	main.append(currentReferenceListed);
	main.append(verseContainer);

	// -------------------- RUN TTS -------------------- //
	const joinedVerses = onlyTextList.join('');
	runTTS(joinedVerses);
}

// ---------------------------------------- MANIPULATE LEFT AND RIGHT BUTTONS ---------------------------------------- //
function changeChapters() {
	const main = document.querySelector('main');
	const leftButton = document.querySelector('.left--button');
	const rightButton = document.querySelector('.right--button');

	// -------------------- LEFT AND RIGHT BUTTON FUNCTIONALITY -------------------- //
	// Changes chapter, clears html, and replaces it with next chapter
	leftButton.addEventListener('click', () => {
		currentChapter--;
		main.innerHTML = '';
		displayData(globalData);
	});

	// Changes chapter, clears html, and replaces it with next chapter
	rightButton.addEventListener('click', () => {
		currentChapter++;
		main.innerHTML = '';
		displayData(globalData);
	});
}

// ---------------------------------------- TTS FUNCTIONALITY ---------------------------------------- //
function runTTS(text) {
	// Clear any ongoing speech synthesis
	speechSynthesis.cancel();

	const wordsArray = text.split(' ');
	const wordsPerPause = 4;
	let currentWordIndex = 0;

	// -------------------- BUTTONS FROM DOM -------------------- //
	const startButton = document.querySelector('.startTTS');
	const stopButton = document.querySelector('.stopTTS');
	const rate = document.querySelector('#rate');
	const rateValue = document.querySelector('.rate__value');
	const pause = document.querySelector('#pause');
	const pauseValue = document.querySelector('#pause__value');

	// -------------------- BUTTON EVENT LISTENERS -------------------- //
	rate.addEventListener('input', () => {
		rateValue.textContent = rate.value;
	});

	pause.addEventListener('input', () => {
		pauseValue.textContent = pause.value;
	});

	// -------------------- TTS SPEECH FUNCTION -------------------- //
	function speak() {
		let wordsToSpeak = wordsArray
			.slice(currentWordIndex, currentWordIndex + wordsPerPause)
			.join(' ');
		currentWordIndex += wordsPerPause;

		const utterance = new SpeechSynthesisUtterance(wordsToSpeak);
		utterance.rate = rate.value;
		speechSynthesis.speak(utterance);

		utterance.onend = () => {
			if (currentWordIndex < wordsArray.length) {
				setTimeout(() => {
					speak(); // Call speak() recursively to continue with the next words
				}, `${pause.value}000`);
			}
		};
	}

// -------------------- TTS BUTTONS FUNCTIONALITY -------------------- //
// TODO: stopButton only stops when speak() function is running, not when paused. Maybe find a way to kill the operation?

	startButton.addEventListener('click', () => {
		// Clear any ongoing speech synthesis
		speechSynthesis.cancel(); // Note: This caused bug with TTS
		// Reset the word index
		currentWordIndex = 0;
		// Start speaking
		speak();
	});

	stopButton.addEventListener('click', () => {
		speechSynthesis.cancel();
	});
}

changeChapters();

export {getData};