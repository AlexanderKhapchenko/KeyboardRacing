import { showGamePage, showRoomPage, resetGamePage } from "../views/game.mjs";
import {showInputModal, showMessageModal, showResultsModal} from "../views/modal.mjs"
import { appendRoomElement, removeRoomElement, updateNumberOfUsersInRoom } from "../views/room.mjs";
import { appendUserElement, changeReadyStatus, removeUserElement, setProgress } from "../views/user.mjs";

export const rooms = (socket) => {
	const username = sessionStorage.getItem('username');
	let ready = false;
	const addRoomBtn = document.getElementById('add-room-btn');
	const readyBtn = document.getElementById('ready-btn');
	const quitRoomBtn = document.getElementById('quit-room-btn');
	const timer = document.getElementById('timer');
	const textContainer = document.getElementById('text-container');
	const gameTimer = document.getElementById('game-timer');
	const gameTimerSeconds = document.getElementById('game-timer-seconds');
	let globalKeydown;

	quitRoomBtn.onclick = () => {
		showRoomPage();
		resetGamePage();
		removeUserElement(username);
		socket.emit("EXIT_ROOM", ({
			username
		}));
	}

	readyBtn.onclick = () => {
		ready = !ready;
		changeReadyStatus({username, ready});
		socket.emit("UPDATE_USER", ({ready}));
	}

	socket.on('USER_EXIST', (message) => {
		const roomsPage = document.getElementById('rooms-page');
		roomsPage.classList.add("display-none");
		showMessageModal({message, onClose: () => {window.location.replace('/login')}});
		sessionStorage.removeItem('username');
	});

	socket.on("REMOVE_USER_ELEMENT", ({username}) => {
		removeUserElement(username);
	});

	addRoomBtn.onclick = () => {
		let roomName = '';
		
		showInputModal({
			title: 'Enter room name', 
			onSubmit: () => {
				socket.emit("CREATE_ROOM", {roomName});
				joinToRoom({roomName, username});
			},
			onChange: (input) => {
				if(input.trim().length) {
					roomName = input;
				}
			}
		})
	}

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

	socket.on("UPDATE_ROOM_LIST", ({roomName, numberOfUsers}) => {
		updateNumberOfUsersInRoom({name: roomName, numberOfUsers});
	});

	socket.on("JOIN_ROOM_DONE", ({roomName, existUsers, newUser}) => {
		showGamePage();

		if(existUsers) {
			existUsers.forEach(user => appendUserElement({
					username: user.name,
					ready: false,
					isCurrentUser: socket.id === user.id,
				}));
		}

		appendUserElement({
			username: newUser.name,
			ready: false,
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
	})

	socket.on("READY_TO_GAME", ({sec}) => {
		readyBtn.classList.add('display-none');
		timer.classList.remove('display-none');
		timer.innerText = sec;
	});

	socket.on("UPDATE_GAME_TIMER", ({sec}) => {
		timer.classList.add('display-none');
		textContainer.classList.remove('display-none');
		gameTimer.classList.remove('display-none');

		gameTimerSeconds.innerText = sec;
	});

	socket.on("START_GAME", ({text}) => {

		const characters = text.split("").map((char) => {
	    const span = document.createElement("span");
	    span.innerText = char;
	    return span;
	  });

		textContainer.innerText = '';
		textContainer.append(...characters);

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

	socket.on("SHOW_RESULTS", ({gameResults}) => {
		document.removeEventListener('keydown', globalKeydown);

		showResultsModal({usersSortedArray: gameResults, onClose: () => {
			resetGamePage();
			showRoomPage();

			removeUserElement(username);
			
			socket.emit("EXIT_ROOM", ({
				username
			}));
		}})
	});
}

