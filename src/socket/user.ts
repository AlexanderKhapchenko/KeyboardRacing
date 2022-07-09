import { Users } from "../repositories/users";
import { Namespace } from 'socket.io';

const users = new Users();

export default (io: Namespace) => {
	io.on("connection", socket => {
		const username = socket.handshake.query.username;

		if (users.getOne({name: username as string})) {
			socket.emit('USER_EXIST', `Username ${username} already used`);
		}
		else {
			users.create({name: username as string, id: socket.id});
		}

		socket.on("disconnect", () => {
			const user = users.getOne({id: socket.id});
			users.remove(user!.name);
		});
	});
}
