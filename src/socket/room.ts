import { Server, Socket} from 'socket.io';
import * as config from "./config";
import { Users } from '../repositories/users';
import { IUser } from '../interfaces/user';
import { texts } from '../data';
import user from './user';

export default (io: Server, socket: Socket) => {
	const arr = Array.from(io.sockets.adapter.rooms);
	const filtered = arr.filter(room => !room[1].has(room[0]))
	const roomNames = filtered.map(i => i[0]);

	const res = roomNames.map(roomName => {
		return {
			name: roomName,
			numberOfUsers: io.sockets.adapter.rooms.get(roomName)!.size,
		}
	}).filter(room => room.numberOfUsers < 5);

	socket.emit("GET_EXISTS_ROOM", {rooms: res});

	socket.on("CREATE_ROOM", ({roomName}) => {
		if(io.sockets.adapter.rooms.get(roomName)) {
			socket.emit('ROOM_EXISTS', `Room name ${roomName} already used`);
		}
		else {
			socket.join(roomName);
			socket.emit("UPDATE_ROOMS", {numberOfUsers: 1, roomName});
			const numberOfUsers = io.sockets.adapter.rooms.get(roomName)!.size;
			socket.broadcast.emit("UPDATE_ROOMS", {numberOfUsers, roomName});
		}
	});

	socket.on("TRY_JOIN_ROOM", ({roomName, username}) => {
		socket.join(roomName);
		
		const existUsers = Users.getAll().filter(user => user.activeRoom == roomName);
		const newUser = Users.update({name: username, updateFields: {activeRoom: roomName}});
		
		socket.broadcast.emit("UPDATE_ROOM_LIST", {roomName, numberOfUsers: io.sockets.adapter.rooms.get(roomName)!.size});
		socket.emit("JOIN_ROOM_DONE", {roomName, existUsers, newUser});
		socket.in(roomName).emit("JOIN_ROOM_DONE", {roomName, newUser})
	});

	socket.on("UPDATE_USER", (updateFields: Partial<IUser>) => {
		const user = Users.getOne({id: socket.id});
		if(user) {
			const {name, activeRoom} = user;
			const newUser = Users.update({name, updateFields});
			if (activeRoom) {
			 socket.to(activeRoom).emit("UPDATE_USER_IN_ROOM", {user: newUser});
			 socket.emit("UPDATE_USER_IN_ROOM", {user: newUser});
			}

			if('progress' in updateFields && activeRoom) {
				updateFields.progress === 100 && endGame({activeRoom});
			}

			if('ready' in updateFields && activeRoom) {
				const usersInCurrentRoom = Users.getAll().filter(user => user.activeRoom == activeRoom);

				if (usersInCurrentRoom.every(user => user.ready === true)) {
					let sec = 3;
					const interval = () => {
						socket.to(activeRoom).emit("READY_TO_GAME", {sec});
						socket.emit("READY_TO_GAME", {sec});
						sec--;
					}
					interval();
					const intervalId = setInterval(interval, 1000);

					setTimeout(() => {
						clearInterval(intervalId);
						startGame({activeRoom});
						
					}, 4000);
				}
			}
		}
	});

	const startGame = ({activeRoom}) => {
		let sec = config.SECONDS_FOR_GAME;
		const randomText = texts[Math.floor(Math.random() * texts.length)];

		socket.to(activeRoom).emit("START_GAME", {text: randomText});
		socket.emit("START_GAME", {text: randomText});

		const usersInCurrentRoom = Users.getAll().filter(user => user.activeRoom == activeRoom);

		const interval = () => {
			socket.to(activeRoom).emit("UPDATE_GAME_TIMER", {sec});
			socket.emit("UPDATE_GAME_TIMER", {sec});
			
			if(usersInCurrentRoom.some(user => user.progress === 100)){
					endGame({activeRoom});
			}

			sec--;
		}
		interval();
		const intervalId = setInterval(interval, 1000);
		setTimeout(() => {
			clearInterval(intervalId);
			endGame({activeRoom});
		}, config.SECONDS_FOR_GAME * 1000);
	}

	const endGame = ({activeRoom}) => {
		const usersInCurrentRoom = Users.getAll().filter(user => user.activeRoom == activeRoom);
		const sortedUser = usersInCurrentRoom.sort((a, b) => a.progress < b.progress ? 1 : -1);

		let gameResults: string[] = [];

		sortedUser.forEach(user => {
			gameResults.push(user.name);
		})

		socket.to(activeRoom).emit("SHOW_RESULTS", {gameResults});
		socket.emit("SHOW_RESULTS", {gameResults});
	}


	const exitRoom = ({username}) => {
		const roomName = Users.getOne({name: username})!.activeRoom as string;

		Users.update({name: username, updateFields: {
			ready: false,
			activeRoom: undefined
		}});

		socket.to(roomName).emit("REMOVE_USER_ELEMENT", {username});

		socket.broadcast.emit("UPDATE_ROOM_LIST", {roomName, numberOfUsers: io.sockets.adapter.rooms.get(roomName)!.size - 1});
		socket.emit("UPDATE_ROOM_LIST", {roomName, numberOfUsers: io.sockets.adapter.rooms.get(roomName)!.size - 1});

		socket.leave(roomName);

		if(!io.sockets.adapter.rooms.get(roomName)) {
			socket.emit("DELETE_ROOM", {roomName});
			socket.broadcast.emit("DELETE_ROOM", {roomName});
		}
	}


	socket.on("EXIT_ROOM", exitRoom);

	socket.on("disconnect", () => {
		const user = Users.getOne({id: socket.id});
		if(user && 'activeRoom' in user) {
			exitRoom({username: user.name});
		}
	});
}
