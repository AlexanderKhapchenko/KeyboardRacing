import {showMessageModal} from "../views/modal.mjs"

export const users = (url) => {
	const username = sessionStorage.getItem('username');
	const socket = io(url, { query: { username } });

	if (!username) {
		window.location.replace('/login');
	}

	socket.on('USER_EXIST', (message) => {
		showMessageModal({message, onClose: () => {window.location.replace('/login')}});
		sessionStorage.removeItem('username');
	});
}

