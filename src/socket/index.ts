import { Server } from 'socket.io';
import users from './user';
import rooms from './room';

export default (io: Server) => {
	io.on("connection", socket => {
		rooms(io, socket);
		users(socket);
	});
};
