export interface IUser {
	id: string;
	name: string;
	activeRoom?: string;
	ready: boolean;
	progress: number;
	time?: number;
}
