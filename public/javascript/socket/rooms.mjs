import {showInputModal, showMessageModal} from "../views/modal.mjs"
import { appendRoomElement, updateNumberOfUsersInRoom } from "../views/room.mjs";
import { appendUserElement } from "../views/user.mjs";

export const rooms = (socket) => {
	const username = sessionStorage.getItem('username');

	const addRoomBtn = document.getElementById('add-room-btn');
	const roomsPage = document.getElementById('rooms-page');
	const gamePage = document.getElementById('game-page');

	socket.on('USER_EXIST', (message) => {
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
	


}

