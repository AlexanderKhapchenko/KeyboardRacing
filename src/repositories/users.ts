import { IUser } from "../interfaces/user";

export class Users {
	static list: IUser[] = [];

  static getOne(fields: Partial<IUser>): IUser | null {
		const item = this.list.find(item => {
			const fieldsKeys = Object.keys(fields);
			return fieldsKeys.every((field) => item[field] === fields[field]);
		});

		return item  || null;
  }

  static create(item: IUser) {
		this.list.push(item);
  }

	static update({name, updateFields}:{name: string, updateFields: Partial<IUser>}) {
		const index = this.list.findIndex(item => item.name === name);
		this.list[index] = {
			...this.list[index],
			...updateFields
		}
		return this.list[index];
	}

	static getAll() {
		return this.list;
	}

	static remove(name: string) {
		const index = this.list.findIndex(item => item.name === name);
		this.list.splice(index, 1);
	}
};
