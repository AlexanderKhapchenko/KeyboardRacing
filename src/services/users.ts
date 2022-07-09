import { IUser } from "../interfaces/user";

export class Users {
  users: IUser[] = [];

  getOne({name}): IUser | null {
		const user = this.users.find(user => user.name === name);

		return user  || null;
  }

  create({name}) {
		this.users.push({
			name
		});
  }

	getUsers() {
		return this.users;
	}
};

