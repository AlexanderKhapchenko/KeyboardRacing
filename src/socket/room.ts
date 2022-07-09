import { Rooms } from "../repositories/rooms";
import { Namespace } from 'socket.io';
import * as config from "./config";

const rooms = new Rooms();

export default (io: Namespace) => {
	io.on("connection", socket => {
		socket.on("CREATE_ROOM", (roomName: string) => {
			if (rooms.getOne({name: roomName})) {
				socket.emit('ROOM_EXISTS', `Room name ${roomName} already used`);
			}
			else {
				rooms.create({name: roomName as string, users: [socket.id]});
				socket.emit("CREATE_ROOM", {roomName});
				socket.broadcast.emit("CREATE_ROOM", {numberOfUsers: 1, roomName});
				socket.emit("JOIN_ROOM_DONE", roomName);
			}
		});

		socket.on("JOIN_ROOM", (roomName: string) => {
			const room = rooms.getOne({name: roomName});
			if(room && room.users.length <= config.MAXIMUM_USERS_FOR_ONE_ROOM) {
				rooms.addUser(room.name, socket.id);

				socket.emit("JOIN_ROOM_DONE", roomName);
				socket.emit("UPDATE_ROOM_USERS_NUMBER", roomName, room.users.length + 1);
				socket.broadcast.emit("UPDATE_ROOM_USERS_NUMBER", roomName, room.users.length + 1);
			}
		});

		socket.on("disconnect", () => {
			const room = rooms.findRoomWithUser(socket.id);
			if (room && room.name) {
				rooms.removeUser(room.name, socket.id);
			}
		});
	});
}