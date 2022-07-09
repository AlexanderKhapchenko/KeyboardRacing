import {showInputModal, showMessageModal} from "./views/modal.mjs"

const username = sessionStorage.getItem('username');

if (!username) {
	window.location.replace('/login');
}

const socket = io('', { query: { username } });

socket.on('USER_EXIST', (message) => {
	showMessageModal({message, onClose: () => {window.location.replace('/login')}});
	sessionStorage.removeItem('username');
});
