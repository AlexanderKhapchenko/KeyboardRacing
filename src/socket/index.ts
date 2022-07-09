import { Server } from 'socket.io';
import users from './user';
import rooms from './room';

export default (io: Server) => {
	users(io.of('/users'));
	rooms(io.of('/rooms'));
};
