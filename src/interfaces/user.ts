import {ICar} from "../component/commentator/utils/car-interface";

export interface IUser {
	id: string;
	name: string;
	activeRoom?: string;
	ready: boolean;
	progress: number;
	time?: number;
	totalRace: number;
	car: ICar
}
