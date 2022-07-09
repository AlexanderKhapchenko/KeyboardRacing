import { IBase } from "./base";

export interface IRoom extends IBase {
	users: [string]
}