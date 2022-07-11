import {showInputModal, showMessageModal} from "../views/modal.mjs"
import { appendRoomElement, removeRoomElement, updateNumberOfUsersInRoom } from "../views/room.mjs";
import { appendUserElement, changeReadyStatus } from "../views/user.mjs";

export const rooms = (socket) => {
	const username = sessionStorage.getItem('username');
	let ready = false;
	const addRoomBtn = document.getElementById('add-room-btn');
	const roomsPage = document.getElementById('rooms-page');
	const gamePage = document.getElementById('game-page');
	const readyBtn = document.getElementById('ready-btn');
	const quitRoomBtn = document.getElementById('quit-room-btn');

	quitRoomBtn.onclick = () => {
		roomsPage.classList.remove('display-none');
		gamePage.classList.add('display-none');
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
		roomsPage.classList.add("display-none");
		showMessageModal({message, onClose: () => {window.location.replace('/login')}});
		sessionStorage.removeItem('username');
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
		roomsPage.classList.remove('display-none');
		gamePage.classList.add('display-none');
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
		roomsPage.classList.add('display-none');
		gamePage.classList.remove('display-none');

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
}

