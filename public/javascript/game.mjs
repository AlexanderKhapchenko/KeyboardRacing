import { rooms } from "./socket/rooms.mjs"

const url = "http://localhost:3002"
const username = sessionStorage.getItem('username');

if (!username) {
	window.location.replace('/login');
}

const socket = io(url, { query: { username } });

rooms(socket);
