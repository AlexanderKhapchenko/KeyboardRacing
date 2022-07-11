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

export const changeRoomName = (name) => {
	const roomName = document.getElementById('room-name');
	roomName.innerText = name;
}

export const readyToGame = ({sec}) => {
	const readyBtn = document.getElementById('ready-btn');
	const timer = document.getElementById('timer');

	readyBtn.classList.add('display-none');
	timer.classList.remove('display-none');
	timer.innerText = sec;
}

export const updateGameTimer = ({sec}) => {
	const timer = document.getElementById('timer');
	const textContainer = document.getElementById('text-container');
	const gameTimer = document.getElementById('game-timer');
	const gameTimerSeconds = document.getElementById('game-timer-seconds');

	timer.classList.add('display-none');
	textContainer.classList.remove('display-none');
	gameTimer.classList.remove('display-none');

	gameTimerSeconds.innerText = sec;
}
