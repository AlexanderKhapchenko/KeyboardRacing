import { Server, Socket} from 'socket.io';
import * as config from "./config";
import { Users } from '../repositories/users';
import { IUser } from '../interfaces/user';

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
			
			socket.emit("JOIN_ROOM_DONE", {roomName, existUsers, newUser});
			socket.in(roomName).emit("JOIN_ROOM_DONE", {roomName, newUser})
		});

		socket.on("UPDATE_USER", (updateFields: Partial<IUser>) => {
			const user = Users.getOne({id: socket.id});
			if(user) {
				const {name, activeRoom} = user;
				const newUser = Users.update({name, updateFields});
				activeRoom && socket.to(activeRoom).emit("UPDATE_USER_IN_ROOM", {user: newUser});
			}
		});

		socket.on("EXIT_ROOM", ({username}) => {

			const roomName = Users.getOne({name: username})!.activeRoom as string;

			Users.update({name: username, updateFields: {
				ready: false,
				activeRoom: undefined
			}});

			socket.leave(roomName);

			if(!io.sockets.adapter.rooms.get(roomName)) {
				socket.emit("DELETE_ROOM", {roomName});
				socket.broadcast.emit("DELETE_ROOM", {roomName});
			}
		})


}