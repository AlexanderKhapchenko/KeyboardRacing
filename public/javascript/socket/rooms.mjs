import {
	showGamePage,
	showRoomPage,
	resetGamePage,
	readyToGame,
	updateGameTimer,
	changeRoomName,
	createSpanElements,
	changeTextContainer,
	readyBtnState,
	showQuitButton
} from "../views/game.mjs";
import {showInputModal, showMessageModal, showResultsModal} from "../views/modal.mjs"
import { appendRoomElement, hideRoomElement, removeRoomElement, showRoomElement, updateNumberOfUsersInRoom } from "../views/room.mjs";
import { appendUserElement, changeReadyStatus, removeUserElement, setProgress } from "../views/user.mjs";
import {messageByCommentator} from "../views/commentator.mjs";

export const rooms = (socket) => {
	const username = sessionStorage.getItem('username');
	const addRoomBtn = document.getElementById('add-room-btn');
	const readyBtn = document.getElementById('ready-btn');
	const quitRoomBtn = document.getElementById('quit-room-btn');

	let globalKeydown;

	addRoomBtn && (addRoomBtn.onclick = () => {
		let roomName = '';
		
		showInputModal({
			title: 'Enter room name', 
			onSubmit: () => {
				socket.emit("CREATE_ROOM", {roomName, username});
			},
			onChange: (input) => {
				if(input.trim().length) {
					roomName = input;
				}
			}
		})
	})

	quitRoomBtn.onclick = () => {
		showRoomPage();
		resetGamePage();
		removeUserElement(username);
		socket.emit("EXIT_ROOM", ({
			username
		}));
	}

	readyBtn && (readyBtn.onclick = () => {
		let ready = readyBtn.innerText != readyBtnState.READY;
		ready = !ready;
		readyBtn.innerText = ready ? readyBtnState.NOT_READY : readyBtnState.READY;
		changeReadyStatus({username, ready});
		socket.emit("UPDATE_USER", ({ready}));
	});

	socket.on('USER_EXIST', (message) => {
		const roomsPage = document.getElementById('rooms-page');
		roomsPage.classList.add("display-none");
		showMessageModal({message, onClose: () => {window.location.replace('/login')}});
		sessionStorage.removeItem('username');
	});

	socket.on("REMOVE_USER_ELEMENT", ({username}) => {
		removeUserElement(username);
	});

	socket.on('ROOM_EXISTS', (message) => {
		showMessageModal({message});
		showRoomPage();
	});

	const joinToRoom = ({roomName, username}) => {
		socket.emit("TRY_JOIN_ROOM", {roomName, username});
	}

	socket.on('UPDATE_ROOMS', ({roomName, numberOfUsers}) => {
		appendRoomElement({name: roomName, numberOfUsers, onJoin: () => {
			joinToRoom({roomName, username});
		}});
	});

	socket.on("UPDATE_ROOM_LIST", ({roomName, numberOfUsers, isFullRoom}) => {
		updateNumberOfUsersInRoom({name: roomName, numberOfUsers});

		if (isFullRoom) {
			hideRoomElement(roomName);
		} else {
			showRoomElement(roomName);
		}
	});

	socket.on("JOIN_ROOM_DONE", ({roomName, existUsers, newUser, ready}) => {
		showGamePage();
		changeRoomName(roomName);

		if(existUsers) {
			existUsers.forEach(user => appendUserElement({
					username: user.name,
					ready: user.ready,
					isCurrentUser: socket.id === user.id,
				}));
		}

		appendUserElement({
			username: newUser.name,
			ready,
			isCurrentUser: socket.id === newUser.id,
		});
	});

	socket.on("UPDATE_USER_IN_ROOM", ({user}) => {
		changeReadyStatus({username: user.name, ready: user.ready});
		setProgress({username: user.name, progress: user.progress});
	});

	socket.on("DELETE_ROOM", ({roomName}) => {
		removeRoomElement(roomName);
	});
	

	socket.on("GET_EXISTS_ROOM", ({rooms}) => {
		rooms.forEach(room => {
			appendRoomElement({
				name: room.name,
				numberOfUsers: room.numberOfUsers,
				onJoin: () => {
					joinToRoom({roomName: room.name, username});
				}
			})
		})
	});

	socket.on("READY_TO_GAME", readyToGame);

	socket.on("UPDATE_GAME_TIMER", updateGameTimer);

	socket.on("START_GAME", ({text}) => {

		const characters = createSpanElements(text);
		changeTextContainer(characters);

		let cursorIndex = 0;
		let cursorCharacter = characters[cursorIndex];
		let userProgress = 0;

		const keydown = ({key}) => {
			if (key === cursorCharacter.innerText) {
				cursorCharacter.classList.remove("cursor");
				cursorCharacter.classList.add("done");
				cursorCharacter = characters[++cursorIndex];
				userProgress = cursorIndex / characters.length * 100;
				socket.emit("UPDATE_USER", {progress: userProgress});
			}

			cursorCharacter && cursorCharacter.classList.add("cursor");
	
			if (cursorIndex >= characters.length) {
				document.removeEventListener("keydown", keydown);
			}
		}

		document.addEventListener('keydown', keydown);
		globalKeydown = keydown;
	});

	socket.on("GAME_OVER", () => {
		document.removeEventListener('keydown', globalKeydown);
		showQuitButton();

		// showResultsModal({usersSortedArray: gameResults, onClose: () => {
		// 	resetGamePage();
		// 	showRoomPage();
		//
		// 	removeUserElement(username);
		//
		// 	socket.emit("EXIT_ROOM", ({
		// 		username
		// 	}));
		// }})
	});

	socket.on("COMMENTATOR_SAY", messageByCommentator);

}

