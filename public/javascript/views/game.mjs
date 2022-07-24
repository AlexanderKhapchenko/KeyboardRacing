import { removeUserElements } from "./user.mjs";

export const readyBtnState = {
	READY: 'READY',
	NOT_READY: 'NOT READY' 
}

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

export const showQuitButton = () => {
	const quitRoomBtn = document.getElementById('quit-room-btn');
	quitRoomBtn.classList.remove('display-none');
}

export const resetGamePage = () => {
	const readyBtn = document.getElementById('ready-btn');
	const timer = document.getElementById('timer');
	const textContainer = document.getElementById('text-container');
	const gameTimer = document.getElementById('game-timer');
	const quitRoomBtn = document.getElementById('quit-room-btn');

	readyBtn.innerText = readyBtnState.READY;

	gameTimer.classList.add('display-none');
	textContainer.classList.add('display-none');
	timer.classList.add('display-none');
	readyBtn.classList.remove('display-none');
	quitRoomBtn.classList.remove('display-none');

	removeUserElements();
}

export const changeRoomName = (name) => {
	const roomName = document.getElementById('room-name');
	roomName.innerText = name;
}

export const readyToGame = ({sec}) => {
	const readyBtn = document.getElementById('ready-btn');
	const timer = document.getElementById('timer');
	const quitRoomBtn = document.getElementById('quit-room-btn');


	readyBtn.classList.add('display-none');
	timer.classList.remove('display-none');
	quitRoomBtn.classList.add('display-none');

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

export const createSpanElements = (text) => {
	return text.split("").map((char) => {
		const span = document.createElement("span");
		
		span.innerText = char;
		return span;
	});
}

export const changeTextContainer = (characters) => {
	const textContainer = document.getElementById('text-container');

	textContainer.innerText = '';
	textContainer.append(...characters);
}