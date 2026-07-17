export function isValidRoomName(value) {
	return /^[A-Za-z0-9 _&*]+$/.test(value);
}
