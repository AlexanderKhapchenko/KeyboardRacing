import { Server, Socket} from 'socket.io';
import * as config from "./config";
import { Users } from '../repositories/users';

export default (io: Server, socket: Socket) => {
		
		socket.on("CREATE_ROOM", ({roomName}) => {
			if(io.sockets.adapter.rooms.get(roomName)) {
				socket.emit('ROOM_EXISTS', `Room name ${roomName} already used`);
			}
			else {
				socket.join(roomName);
				socket.emit("UPDATE_ROOMS", {numberOfUsers: 0, roomName});
				const numberOfUsers = io.sockets.adapter.rooms.get(roomName)!.size;
				socket.broadcast.emit("UPDATE_ROOMS", {numberOfUsers, roomName});
			}
		});

		socket.on("TRY_JOIN_ROOM", ({roomName, username}) => {
			socket.join(roomName);
			console.log(Users.getAll())
			const existUsers = Users.getAll().filter(user => user.activeRoom == roomName);
			Users.update({name: username, updateFields: {activeRoom: roomName}});
			const newUser = Users.getOne({name: username });
			socket.emit("JOIN_ROOM_DONE", {roomName, existUsers, newUser});
			socket.in(roomName).emit("JOIN_ROOM_DONE", {roomName, newUser})
		});
}