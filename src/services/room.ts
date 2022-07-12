import * as config from "../socket/config";
import { Server } from 'socket.io';

export class Room {

	io: Server;
	static roomsInGame: string[] = [];
	intervalId?: NodeJS.Timer;
	timerId?: NodeJS.Timer;

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
		Room.roomsInGame.push(roomName);
	}

	gameOver(roomName: string) {
		const index = Room.roomsInGame.indexOf(roomName);
		Room.roomsInGame.splice(index, 1);
		this.intervalId && clearInterval(this.intervalId);
		this.timerId && clearTimeout(this.timerId);
	}

	isRoomInGame(roomName: string):boolean {
		return Room.roomsInGame.includes(roomName)
	}

	isRoomFull(roomName: string, isDisconnect = false):boolean {
		if(isDisconnect) {
			return this.getNumberOfUsers(roomName) >= config.MAXIMUM_USERS_FOR_ONE_ROOM
		}
		return this.getNumberOfUsers(roomName) >= config.MAXIMUM_USERS_FOR_ONE_ROOM;
	}

	stopIntervalOnGameOver(intervalId: NodeJS.Timer) {
		this.intervalId = intervalId;
	}

	stopTimerOnGameOver(timerId: NodeJS.Timer) {
		this.timerId = timerId;
	}
}