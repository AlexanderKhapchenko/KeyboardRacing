import { IRoom } from "../interfaces/room";
import { IUser } from "../interfaces/user";
import { Base } from "./base";

export class Rooms extends Base<IRoom> {
	addUser(roomName: string, userId: string) {
		const room = this.getOne({name: roomName});
		if(room) {
			const {users} = room;
			users.push(userId);
			this.update({name: roomName, updateFields: { users }})
		}
	}

	removeUser(roomName: string, userId: string) {
		const room = this.getOne({name: roomName});
		if(room) {
			const { users } = room;
			const index = users.findIndex(id => id === userId);
			users.splice(index, 1);

			this.update({name: roomName, updateFields: { users }})
		}
	}

	findRoomWithUser(userId: string) {
		return this.list.find(room => {
			return room.users.some(id => id === userId);
		});
	}
};

