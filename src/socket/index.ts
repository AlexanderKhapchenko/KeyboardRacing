import { Server } from 'socket.io';
import users from './user';
import rooms from './room';
import {Commentator} from "../component/commentator/commentator";

export default (io: Server) => {
	io.on("connection", socket => {
		const commentator = new Commentator();
		rooms(io, socket, commentator);
		users(socket);
	});
};
