import { IBase } from "../interfaces/base";

export class Base<T extends IBase> {
  list: T[] = [];

  getOne(fields: Partial<T>): T | null {
		const item = this.list.find(item => {
			const fieldsKeys = Object.keys(fields);
			return fieldsKeys.every((field) => item[field] === fields[field]);
		});

		return item  || null;
  }

  create(item: T) {
		this.list.push(item);
  }

	update({name, updateFields}) {
		const index = this.list.findIndex(item => item.name === name);
		this.list[index] = {
			...this.list[index],
			...updateFields
		}
	}

	getAll() {
		return this.list;
	}

	remove(name: string) {
		const index = this.list.findIndex(item => item.name === name);
		this.list.splice(index, 1);
	}
};

