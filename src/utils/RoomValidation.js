/**
 * Checks whether a room name is acceptable to save.
 *
 * Allows letters, digits, spaces, underscores, ampersands and asterisks,
 * and requires at least one character - so an empty or whitespace-only
 * name is rejected along with anything containing other punctuation.
 *
 * @param {string} value - Candidate room name.
 * @returns {boolean} True if the name may be saved.
 */
export function isValidRoomName(value) {
	return /^[A-Za-z0-9 _&*]+$/.test(value);
}
