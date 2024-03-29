import {Server, Socket} from 'socket.io';
import * as config from "./config";
import {Users} from '../services/users';
import {IUser} from '../interfaces/user';
import {texts} from '../data';
import {Room} from '../services/room';
import {TCommentator} from "../component/commentator/commentator";
import {IResult} from "../interfaces/result";
import {Events} from "../constants/enums/events";

export default (io: Server, socket: Socket, commentator: TCommentator) => {
	const room = new Room(io);

	const rooms = room.getAllRoom();

	socket.emit(Events.GET_EXISTS_ROOM, {rooms: rooms});

	socket.on(Events.CREATE_ROOM, ({roomName, username}) => {
		if(room.isRoomExist(roomName)) {
			socket.emit(Events.ROOM_EXISTS, `Room name ${roomName} already used`);
		}
		else {
			socket.join(roomName);
			socket.emit(Events.UPDATE_ROOMS, {numberOfUsers: 1, roomName});
			const numberOfUsers = room.getNumberOfUsers(roomName);
			socket.broadcast.emit(Events.UPDATE_ROOMS, {numberOfUsers, roomName});
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
			socket.broadcast.emit(Events.UPDATE_ROOM_LIST, {roomName, numberOfUsers, isFullRoom});
			socket.emit(Events.UPDATE_ROOM_LIST, {roomName, numberOfUsers, isFullRoom});
			messageByCommentator(commentator.getHello(username), roomName);
		}

		socket.emit(Events.JOIN_ROOM_DONE, {roomName, existUsers, newUser});
		socket.in(roomName).emit(Events.JOIN_ROOM_DONE, {roomName, newUser});
	}

	socket.on(Events.TRY_JOIN_ROOM, tryJoinRoom);

	socket.on(Events.UPDATE_USER, (updateFields: Partial<IUser>) => {
		const user = Users.getOne({id: socket.id});
		if(user) {
			const {name, activeRoom} = user;
			const newUser = Users.update({name, updateFields});
			if (activeRoom) {
			 socket.to(activeRoom).emit(Events.UPDATE_USER_IN_ROOM, {user: newUser});
			 socket.emit(Events.UPDATE_USER_IN_ROOM, {user: newUser});
			}

			if('progress' in updateFields && activeRoom) {
				if(updateFields.progress == 100) {
					room.addResult(name, activeRoom);
					const secondsInGame = room.getSecondsInGame(activeRoom);
					Users.update({name: user.name, updateFields: {
						time: secondsInGame
					}});
					messageByCommentator(commentator.getResultForOne({name: user.name, time: secondsInGame as number}), activeRoom);
				}

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
			.every(user => user.ready)
			&& readyToGame({activeRoom});
		}
	}

	const readyToGame = ({activeRoom}) => {
		room.gameInProgress(activeRoom);
		socket.broadcast.emit(Events.DELETE_ROOM, {roomName: activeRoom});

		const usersInCurrentRoom = Users.getAll().filter(user => user.activeRoom == activeRoom);
		messageByCommentator(commentator.getHelloForAll(usersInCurrentRoom), activeRoom);

		let sec = config.SECONDS_TIMER_BEFORE_START_GAME;
		const interval = () => {
			socket.to(activeRoom).emit(Events.READY_TO_GAME, {sec});
			socket.emit(Events.READY_TO_GAME, {sec});
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
		let secForCommentator = 0;
		const randomText = texts[Math.floor(Math.random() * texts.length)];

		socket.to(activeRoom).emit(Events.START_GAME, {text: randomText});
		socket.emit(Events.START_GAME, {text: randomText});

		const usersInCurrentRoom = Users.getAll().filter(user => user.activeRoom == activeRoom);

		const interval = () => {
			socket.to(activeRoom).emit(Events.UPDATE_GAME_TIMER, {sec});
			socket.emit(Events.UPDATE_GAME_TIMER, {sec});
			room.setSecondInGame(activeRoom, secForCommentator);

			if(secForCommentator % config.COMMENTATOR_SAY_ANYTHING_EVERY_SECONDS == 0) {
				messageByCommentator(commentator.getAnyPhrases(), activeRoom);
			}

			if(secForCommentator % config.COMMENTATOR_SAY_EVERY_SECONDS == 0) {
				messageByCommentator(
					commentator.getTimeInfo({
						usersInRoom: usersInCurrentRoom,
						time: secForCommentator
					}),
					activeRoom
				);
			}

			if(usersInCurrentRoom.every(user => user.progress === 100)){
				endGame({activeRoom});
			}

			secForCommentator++;
			sec--;
		}
		interval();

		const intervalId = setInterval(interval, 1000);
		room.stopIntervalOnGameOver(intervalId, activeRoom);

		const timerId = setTimeout(() => {
			clearInterval(intervalId);
			endGame({activeRoom});
		}, config.SECONDS_FOR_GAME * 1000);

		room.stopTimerOnGameOver(timerId, activeRoom)
	}


	const endGame = ({activeRoom}) => {
		const resultsRaw = room.getResult(activeRoom);
		room.gameOver(activeRoom);

		const results: IResult[] = []

		if (resultsRaw) {
			resultsRaw.forEach(username => {
				const user = Users.getOne({name: username});

				if(user) {
					Users.update({name: username, updateFields: {
							ready: false,
							time: undefined,
							totalRace: user.totalRace + 1
						}});

					results.push({
						name: user.name,
						time: user.time || config.SECONDS_FOR_GAME,
					})
				}
			});

			messageByCommentator(commentator.getResultForAll(results), activeRoom);
			socket.to(activeRoom).emit(Events.GAME_OVER);
			socket.emit(Events.GAME_OVER);
		}
	}

	const exitRoom = ({username}) => {
		const user = Users.getOne({name: username});
		const roomName = user && user.activeRoom;
		Users.reset({name: username});

		if (roomName) {
			Users.update({name: username, updateFields: {
				ready: false,
				activeRoom: undefined,
				time: undefined
			}});

			socket.to(roomName).emit(Events.REMOVE_USER_ELEMENT, {username});
			socket.leave(roomName);

			const numberOfUsers = room.getNumberOfUsers(roomName);
			const isFullRoom = room.isRoomFull(roomName);

			if(numberOfUsers > 0 && !room.isRoomInGame(roomName)) {
				checkReadyToGame({activeRoom: roomName});
			}

			if(room.isRoomInGame(roomName)) {
				checkGameOver({activeRoom: roomName});
			}

			socket.broadcast.emit(Events.UPDATE_ROOM_LIST, {roomName, numberOfUsers: numberOfUsers, isFullRoom});
			socket.emit(Events.UPDATE_ROOM_LIST, {roomName, numberOfUsers: numberOfUsers, isFullRoom});

			if(!room.isRoomExist(roomName)) {
				socket.emit(Events.DELETE_ROOM, {roomName});
				socket.broadcast.emit(Events.DELETE_ROOM, {roomName});
				room.roomDelete(roomName);
			}
		}
	}

	socket.on(Events.EXIT_ROOM, exitRoom);

	socket.on(Events.DISCONNECT, () => {
		const user = Users.getOne({id: socket.id});

		if(user && 'activeRoom' in user) {
			exitRoom({username: user.name});
		}
	});

	socket.on(Events.COMMENTATOR_SYMBOL_INFO, () => {
		const user = Users.getOne({id: socket.id});
		if (user) {
			messageByCommentator(commentator.getSymbolInfo(user.name), user.activeRoom);
		}
	});

	const messageByCommentator = (message, roomId) => {
		io.to(roomId).emit(Events.COMMENTATOR_SAY, message);
	}
}
