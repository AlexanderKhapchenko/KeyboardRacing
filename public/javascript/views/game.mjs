import { removeUserElements } from "./user.mjs";

export const showGamePage = () => {
	const roomsPage = document.getElementById('rooms-page');
	const gamePage = document.getElementById('game-page');

	roomsPage.classList.add('display-none');
	gamePage.classList.remove('display-none');
}

export const showRoomPage = () => {
	const roomsPage = document.getElementById('rooms-page');
	const gamePage = document.getElementById('game-page');

	roomsPage.classList.remove('display-none');
	gamePage.classList.add('display-none');
}

export const resetGamePage = () => {
	const readyBtn = document.getElementById('ready-btn');
	const timer = document.getElementById('timer');
	const textContainer = document.getElementById('text-container');
	const gameTimer = document.getElementById('game-timer');

	gameTimer.classList.add('display-none');
	textContainer.classList.add('display-none');
	timer.classList.add('display-none');
	readyBtn.classList.remove('display-none');

	removeUserElements();
}

