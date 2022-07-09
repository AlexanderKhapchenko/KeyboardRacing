import {showInputModal, showMessageModal} from "../views/modal.mjs"
import { appendRoomElement, updateNumberOfUsersInRoom } from "../views/room.mjs";

export const rooms = (url) => {
	const socket = io(url);

	const username = sessionStorage.getItem('username');

	const addRoomBtn = document.getElementById('add-room-btn');
	const roomsPage = document.getElementById('rooms-page');
	const gamePage = document.getElementById('game-page');

	addRoomBtn.onclick = () => {
		let roomName = '';
		
		showInputModal({
			title: 'Enter room name', 
			onSubmit: () => {
				socket.emit("CREATE_ROOM", roomName, username);
			},
			onChange: (input) => {
				if(input.trim().length) {
					roomName = input;
				}
			}
		})
	}
	
	const joinToRoom = () => {
		roomsPage.classList.add('display-none');
		gamePage.classList.remove('display-none');
	}

	socket.on('ROOM_EXISTS', (message) => {
		showMessageModal({message});
		sessionStorage.removeItem('username');
	});

	socket.on('CREATE_ROOM', ({roomName, numberOfUsers}) => {
		appendRoomElement({name: roomName, numberOfUsers, onJoin: (e) => {
			joinToRoom();
		}});

		roomsPage.classList.add('display-none');
		gamePage.classList.remove('display-none');
	});

	socket.on("JOIN_ROOM_DONE", joinToRoom);

	socket.on("UPDATE_ROOM_USERS_NUMBER", (roomName, numberOfUsers) => {
		updateNumberOfUsersInRoom({name: roomName, numberOfUsers});
	});
}

