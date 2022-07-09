import { rooms } from "./socket/rooms.mjs"
import { users } from "./socket/users.mjs"

const baseUrl = "http://localhost:3002"

users(`${baseUrl}/users`);
rooms(`${baseUrl}/rooms`);
