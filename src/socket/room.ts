import { Server, Socket} from 'socket.io';
import * as config from "./config";
import { Users } from '../services/users';
import { IUser } from '../interfaces/user';
import { texts } from '../data';
import { Room } from '../services/room';

export default (io: Server, socket: Socket) => {
	const room = new Room(io);

	const rooms = room.getAllRoom();

	socket.emit("GET_EXISTS_ROOM", {rooms: rooms});

	socket.on("CREATE_ROOM", ({roomName, username}) => {
		if(room.isRoomExist(roomName)) {
			socket.emit('ROOM_EXISTS', `Room name ${roomName} already used`);
		}
		else {
			socket.join(roomName);
			socket.emit("UPDATE_ROOMS", {numberOfUsers: 1, roomName});
			const numberOfUsers = room.getNumberOfUsers(roomName);
			socket.broadcast.emit("UPDATE_ROOMS", {numberOfUsers, roomName});
			tryJoinRoom({roomName, username});
		}
	});

	const tryJoinRoom = ({roomName, username}) => {
		socket.join(roomName);
		
		const existUsers = Users.getAll().filter(user => user.activeRoom == roomName);
		const newUser = Users.update({name: username, updateFields: {activeRoom: roomName}});
		
		const numberOfUsers = room.getNumberOfUsers(roomName);
		const isFullRoom = room.isRoomFull(roomName);

		if (!room.isRoomInGame(roomName)) {
			socket.broadcast.emit("UPDATE_ROOM_LIST", {roomName, numberOfUsers, isFullRoom});
			socket.emit("UPDATE_ROOM_LIST", {roomName, numberOfUsers, isFullRoom});
		}

		socket.emit("JOIN_ROOM_DONE", {roomName, existUsers, newUser});
		socket.in(roomName).emit("JOIN_ROOM_DONE", {roomName, newUser});
		
	}

	socket.on("TRY_JOIN_ROOM", tryJoinRoom);

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
				updateFields.progress == 100 && room.addResult(name, activeRoom);
				checkGameOver({activeRoom});
			}

			if('ready' in updateFields && activeRoom) {
				checkReadyToGame({activeRoom});
			}
		}
	});

	const checkGameOver = ({activeRoom}) => {
		if(room.isRoomInGame(activeRoom)) {
			Users
			.getAll()
			.filter(user => user.activeRoom === activeRoom)
			.every(user => user.progress === 100)
			&& endGame({activeRoom});
		}
	}

	const checkReadyToGame = ({activeRoom}) => {
		const usersInCurrentRoom = Users.getAll();

		if(usersInCurrentRoom.length > 0) {
			usersInCurrentRoom
			.filter(user => user.activeRoom == activeRoom)
			.every(user => user.ready === true) 
			&& readyToGame({activeRoom});
		}
	}

	const readyToGame = ({activeRoom}) => {
		room.gameInProgress(activeRoom);
		socket.broadcast.emit("DELETE_ROOM", {roomName: activeRoom});

		let sec = config.SECONDS_TIMER_BEFORE_START_GAME;
		const interval = () => {
			socket.to(activeRoom).emit("READY_TO_GAME", {sec});
			socket.emit("READY_TO_GAME", {sec});
			sec--;
		}
		interval();
		const intervalId = setInterval(interval, 1000);

		const timerId = setTimeout(() => {
			startGame({activeRoom});
			
		}, config.SECONDS_TIMER_BEFORE_START_GAME * 1000);

		room.stopIntervalOnGameStart(intervalId, activeRoom);
		room.stopTimerOnGameStart(timerId, activeRoom);
	}

	const startGame = ({activeRoom}) => {
		room.startGame(activeRoom);
		let sec = config.SECONDS_FOR_GAME;
		const randomText = texts[Math.floor(Math.random() * texts.length)];

		socket.to(activeRoom).emit("START_GAME", {text: randomText});
		socket.emit("START_GAME", {text: randomText});

		const usersInCurrentRoom = Users.getAll().filter(user => user.activeRoom == activeRoom);

		const interval = () => {
			socket.to(activeRoom).emit("UPDATE_GAME_TIMER", {sec});
			socket.emit("UPDATE_GAME_TIMER", {sec});
			
			if(usersInCurrentRoom.every(user => user.progress === 100)){
				endGame({activeRoom});
			}

			sec--;
		}
		interval();

		const intervalId = setInterval(interval, 1000);
		room.stopIntervalOnGameOver(intervalId, activeRoom);

		const timerId = setTimeout(() => {
			endGame({activeRoom});
		}, config.SECONDS_FOR_GAME * 1000);
		room.stopTimerOnGameOver(timerId, activeRoom)
	}

	const endGame = ({activeRoom}) => {
		const gameResults = room.getResult(activeRoom);
		room.gameOver(activeRoom);
		socket.to(activeRoom).emit("SHOW_RESULTS", {gameResults});
		socket.emit("SHOW_RESULTS", {gameResults});
	}

	const exitRoom = ({username}) => {
		const user = Users.getOne({name: username});
		const roomName = user && user.activeRoom;
		Users.reset({name: username});

		if (roomName) {
			Users.update({name: username, updateFields: {
				ready: false,
				activeRoom: undefined
			}});

			socket.to(roomName).emit("REMOVE_USER_ELEMENT", {username});
			socket.leave(roomName);

			const numberOfUsers = room.getNumberOfUsers(roomName);
			const isFullRoom = room.isRoomFull(roomName);

			if(numberOfUsers > 0 && !room.isRoomInGame(roomName)) {
				checkReadyToGame({activeRoom: roomName});
			}

			if(room.isRoomInGame(roomName)) {
				checkGameOver({activeRoom: roomName});
			}
				
		

			socket.broadcast.emit("UPDATE_ROOM_LIST", {roomName, numberOfUsers: numberOfUsers, isFullRoom});
			socket.emit("UPDATE_ROOM_LIST", {roomName, numberOfUsers: numberOfUsers, isFullRoom});

			socket.leave(roomName);

			if(!room.isRoomExist(roomName)) {
				socket.emit("DELETE_ROOM", {roomName});
				socket.broadcast.emit("DELETE_ROOM", {roomName});
				room.roomDelete(roomName);
			}
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
