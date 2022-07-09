import { Server } from 'socket.io';
import { Users } from '../services/users';
import * as config from './config';

const users = new Users();

export default (io: Server) => {
	io.on('connection', socket => {
		const username = socket.handshake.query.username;
		
		if (users.getOne({name: username})) {
			socket.emit('USER_EXIST', `Username ${username} already used`);
		}
		else {
			users.create({name: username});
		}
	});
};
