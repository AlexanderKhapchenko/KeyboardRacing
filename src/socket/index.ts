import { Server } from 'socket.io';
import users from './user';
import rooms from './room';
import {CommentatorFactory} from "../component/commentator/commentator-factory";

export default (io: Server) => {
	io.on("connection", socket => {
		const commentator = new CommentatorFactory();
		rooms(io, socket, commentator);
		users(socket);
	});
};
