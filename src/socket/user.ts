import { Users } from "../repositories/users";
import { Socket } from 'socket.io';

export default (socket: Socket) => {
	const username = socket.handshake.query.username;

	if (Users.getOne({name: username as string})) {
		socket.emit('USER_EXIST', `Username ${username} already used`);
	}
	else {
		Users.create({name: username as string, id: socket.id, ready: false, progress: 0});
	}

	socket.on("disconnect", () => {
		const user = Users.getOne({id: socket.id});
		Users.remove(user!.name);
	});
}
