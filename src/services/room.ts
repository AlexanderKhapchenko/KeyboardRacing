import * as config from "../socket/config";
import { Server } from 'socket.io';
import { clearInterval, clearTimeout } from 'timers';

interface roomsInGameKey {
	intervalIdGame?: NodeJS.Timer;
	timerIdGame?: NodeJS.Timer;
	intervalIdReady?: NodeJS.Timer;
	timerIdReady?: NodeJS.Timer;
}

export class Room {

	io: Server;
	static roomsInGame: Map<string, roomsInGameKey> = new Map();
	static gameResults: Map<string, Array<string>> = new Map();

	constructor(io: Server) {
		this.io = io;
	}

	getNumberOfUsers(roomName: string): number {
		if (!this.isRoomExist(roomName)) {
			return 0;
		}
		else {
			return this.io.sockets.adapter.rooms.get(roomName)!.size;
		}
	}

	isRoomExist(roomName: string): boolean {
		return this.io.sockets.adapter.rooms.get(roomName) ? true : false;
	}

	getAllRoom() {
		const rooms = Array.from(this.io.sockets.adapter.rooms);
		const filtered = rooms.filter(room => !room[1].has(room[0]))
		const roomNames = filtered.map(i => i[0]);

		const res = roomNames.map(roomName => {
			return {
				name: roomName,
				numberOfUsers: this.getNumberOfUsers(roomName),
			}
		})
		.filter(room => room.numberOfUsers < config.MAXIMUM_USERS_FOR_ONE_ROOM)
		.filter(room => !this.isRoomInGame(room.name));

		return res;
	}

	gameInProgress(roomName: string) {
		Room.roomsInGame.set(roomName, {});
	}

	gameOver(roomName: string) {
		Room.roomsInGame.delete(roomName);
		const room = Room.roomsInGame.get(roomName);
		if (room) {
			room.intervalIdGame && clearInterval(room.intervalIdGame);
			room.timerIdGame && clearTimeout(room.timerIdGame);
		}
	}

	isRoomInGame(roomName: string):boolean {
		return Room.roomsInGame.has(roomName)
	}

	isRoomFull(roomName: string, isDisconnect = false):boolean {
		if(isDisconnect) {
			return this.getNumberOfUsers(roomName) >= config.MAXIMUM_USERS_FOR_ONE_ROOM
		}
		return this.getNumberOfUsers(roomName) >= config.MAXIMUM_USERS_FOR_ONE_ROOM;
	}

	startGame(roomName: string) {
		const room = Room.roomsInGame.get(roomName);
		if (room) {
			room.intervalIdReady && clearInterval(room.intervalIdReady);
			room.timerIdReady && clearTimeout(room.timerIdReady);
		}
	}

	stopIntervalOnGameOver(intervalIdGame: NodeJS.Timer, roomName: string) {
		const room = Room.roomsInGame.get(roomName);
		Room.roomsInGame.set(roomName, {...room, intervalIdGame});
	}

	stopTimerOnGameOver(timerIdGame: NodeJS.Timer, roomName: string) {
		const room = Room.roomsInGame.get(roomName);
		Room.roomsInGame.set(roomName, {...room, timerIdGame});
	}

	stopIntervalOnGameStart(intervalIdReady: NodeJS.Timer, roomName: string) {
		const room = Room.roomsInGame.get(roomName);
		Room.roomsInGame.set(roomName, {...room, intervalIdReady});
	}

	stopTimerOnGameStart(timerIdReady: NodeJS.Timer, roomName: string) {
		const room = Room.roomsInGame.get(roomName);
		Room.roomsInGame.set(roomName, {...room, timerIdReady});
	}

	roomDelete(roomName: string) {
		this.startGame(roomName);
		this.gameOver(roomName);
	}

	addResult(username: string, roomName: string) {
		let arr: string[];
		if (Room.gameResults.has(roomName)){
			arr = Room.gameResults.get(roomName) as string[];
			arr!.push(username);
		}
		else {
			arr = [username]
		}
		Room.gameResults.set(roomName, arr);
	}

	getResult(roomName: string) {
		return Room.gameResults.get(roomName);
	}
}