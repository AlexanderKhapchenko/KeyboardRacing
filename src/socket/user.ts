import { Users } from "../services/users";
import { Socket } from 'socket.io';
import {CarProxy} from "../component/commentator/utils/car-proxy";
import {Events} from "../constants/enums/events";

export default (socket: Socket) => {
	const username = socket.handshake.query.username;
	const carProxy = new CarProxy();

	if (Users.getOne({name: username as string})) {
		socket.emit(Events.USER_EXIST, `Username ${username} already used`);
	}
	else {
		Users.create({name: username as string, id: socket.id, ready: false, progress: 0, totalRace: 0, car: carProxy});
	}

	socket.on(Events.DISCONNECT, () => {
		const user = Users.getOne({id: socket.id});
		if(user && user.name) {
			Users.remove(user!.name);
		}
	});
}
