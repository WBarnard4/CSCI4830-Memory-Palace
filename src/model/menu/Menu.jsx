import { useState, useEffect, useRef } from "react";
import { isValidRoomName } from "@/utils/RoomValidation";
import "./Menu.css";

/**
 * Dropdown menu for general room navigation and features. Triggers callbacks for saving, loading, creating rooms,
 * loading rooms, navigating between rooms, and going back home.
 *
 * NOTE: To enable unod/redo, the undo/redo coming soon functions must be replced with the undo and redo callbacks.
 *
 * @param {object} props
 * @param {string} props.menuName - Name of the menu to be displayed.
 * @param {(name: string) => void} props.updateMenuName - Callback for updating the menu name
 * @param {() => void} props.saveRoom - Callback to save the room information and ideas.
 * @param {() => void} props.loadRoom - Callback to trigger a load room.
 * @param {() => void} props.newRoom - Callback to trigger a new room.
 * @param {() => void} props.setBackgroundImage - Callback to trigger an image file picker to choose a background image.
 * @param {() => void} props.undo - Undo button callback function.
 * @param {() => void} props.redo - Redo button callback function.
 * @param {() => void} props.goHome - Travel Home from the room.
 * @param {boolean} props.areChanges - Whether or not changes exist in the room for a chagnes may be lost popup.
 * @param {(direction: number) => void} props.changeRoom - Callback to change room to the previous or next one.
 */
export function Menu({ menuName, updateMenuName, saveRoom, loadRoom, newRoom, setBackgroundImage, undo, redo, goHome, areChanges, changeRoom }) {
	const [opened, setOpened] = useState(false);
	const [closing, setClosing] = useState(false);
	const [areYouSurePopup, setAreYouSurePopup] = useState(false);
	const [sureCallback, setSureCallback] = useState(null);
	const [showSavedPopup, setShowSavedPopup] = useState(false);
	const [comingSoon, setComingSoon] = useState(false);

	const menuRef = useRef(null);

	useEffect(() => {
		function closeMenuOnOutsideClick(event) {
			if (
				opened &&
				!closing &&
				menuRef.current &&
				!menuRef.current.contains(event.target)
			) {
				closeMenu();
			}
		}

		document.addEventListener("mousedown", closeMenuOnOutsideClick);

		return () => {
			document.removeEventListener("mousedown", closeMenuOnOutsideClick);
		};
	}, [opened, closing]);



	/**
	 * Removes the areYouSure popup and resets the sure callback.
	 */
	function areYouSureNo() {
		setAreYouSurePopup(false);
		setSureCallback(null);
	}

	/**
	 * Calls the sureCallback and removes
	 * the areYouSure popup
	 */
	function areYouSureYes() {
		setAreYouSurePopup(false);
		const callback = sureCallback;
		setSureCallback(null);

		if (callback !== null) {
			callback();
		}
	}

	/**
	 * Verifies using a popup with the user they may overwrite
	 * data before calling the passed verifyCallback function.
	 *
	 * @param {() => void} verifyCallback - callback function for if a user presses Yes.
	 */
	function verifyWithPopup(verifyCallback) {
		if (areChanges()) {
			setAreYouSurePopup(true);
			setSureCallback(() => verifyCallback);
		} else {
			verifyCallback();
		}
	}

	/**
	 * Calls the saveRoom function and
	 * creates a temporary popup to show the user
	 * that data was saved.
	 */
	function saveWithFeedback() {
		saveRoom();
		setShowSavedPopup(true);
	}

	/**
	 * Check for when the Save button is pressed to display a
	 * saved popup for a short duration.
	 */
	useEffect(() => {
		if (showSavedPopup === false) {
			return;
		}

		const timer = setTimeout(() => {
			setShowSavedPopup(false);
		}, 5000);

		return () => {
			clearTimeout(timer);
		};
	}, [showSavedPopup]);

	/**
	 * Placeholder until the undo argument is implemented.
	 *
	 * Feature coming soon
	 *
	 * NOTE: Remove when undo callback is implemented.
	 */
	function undoComingSoon() {
		setComingSoon(true);
	}

	/**
	 * Placeholder until the redo argument is implemented.
	 *
	 * Feature coming soon
	 *
	 * NOTE: Remove when redo callback is implemented.
	 */
	function redoComingSoon() {
		setComingSoon(true);
	}

	/**
	 * Check for when the comingSoon state is set to display a
	 * coming soon popup for a short duration.
	 */
	useEffect(() => {
		if (comingSoon === false) {
			return;
		}

		const timer = setTimeout(() => {
			setComingSoon(false);
		}, 5000);

		return () => {
			clearTimeout(timer);
		};
	}, [comingSoon]);

	/**
	 * Callback for the Menu Name box updating.
	 *
	 * If the event key is Enter or the type is blur then the name in
	 * the box is checked to be valid and if so, the updateMenuName callback
	 * is called with the new name. If it is not, the box is set to the old value.
	 *
	 * @param {object} event - event, keypress, etc. that is calling the function.
	 */
	function newNameEntered(event) {
		if (event.key !== "Enter" && event.type !== "blur") {
			return;
		}

		if (event.key === "Enter") {
			event.preventDefault();
		}

		const newName = event.target.value.trim();

		if (!isValidRoomName(newName)) {
			event.target.value = menuName;
			event.target.blur();
			return;
		}

		updateMenuName(newName);
		event.target.blur();
	}

	/**
	 * Steps to the neighboring room (+1 next, -1 previous) via the
	 * room-index buttons, confirming first if there are unsaved
	 * changes (same guard used for Load/New/Home).
	 *
	 * @param {number} direction - Direction to change room in. 1 = left, -1 = right.
	 */
	function changeRoomWithVerify(direction) {
		if (typeof changeRoom !== "function") {
			return;
		}
		verifyWithPopup(() => changeRoom(direction));
	}

	/**
		* Starts the opening animation from a closed menu.
		*/
	function openMenu() {
		setClosing(false);
		setOpened(true);
	}

	/**
		* Starts the closing animation from an open menu.
		*/
	function closeMenu() {
		if (!opened || closing) {
			return;
		}

		setClosing(true);
	}

	/**
		* Callback for the end of a menu's animation. Resets closing and opened
		* states on a closing animation finishing.
		*
		* @param {object} event - Event finishing an animation.
		*/
	function finishMenuAnimation(event) {
		if (event.target !== event.currentTarget) {
			return;
		}

		if (event.animationName === "menu-panel-close") {
			setOpened(false);
			setClosing(false);
		}
	}

	return (
		<div
			ref={menuRef}
			className="menu"
		>
			{opened ? (
				<div
					className={
						`menu-panel ` +
						`menu-transition-panel ` +
						`menu-transition-from-left ` +
						`glass-surface` +
						(closing
							? " menu-transition-closing"
							: "")
					}
					onAnimationEnd={finishMenuAnimation}
				>
					<span
						className={
							"menu-transition-icon " +
							"menu-transition-hamburger"
						}
						aria-hidden="true"
					/>

					<div className="menu-opened menu-transition-content">
						<div
							className={
								"menu-input-ripple " +
								"glass-surface " +
								"glass-glow " +
								"glass-ripple"
							}
						>
							<textarea
								key={menuName}
								className="menu-name-input"
								defaultValue={menuName}
								aria-label="Room name"
								rows="2"
								wrap="soft"
								onKeyDown={newNameEntered}
								onBlur={newNameEntered}
							/>
						</div>

						<button
							className={
								"menu-action " +
								"glass-surface " +
								"glass-glow " +
								"glass-ripple " +
								"glass-button"
							}
							onClick={setBackgroundImage}
						>
							Choose Background
						</button>

						<div className="menu-room-actions">
							<button
								className={
									"menu-action " +
									"glass-surface " +
									"glass-glow " +
									"glass-ripple " +
									"glass-button"
								}
								style={{
									"--glass-surface-opacity": 0.2,
									"--glass-hover-opacity": 0.25,
								}}
								aria-label="Previous room"
								onClick={() => changeRoomWithVerify(-1)}
								disabled={typeof changeRoom !== "function"}
							>
								Prev Room
							</button>

							<button
								className={
									"menu-action " +
									"glass-surface " +
									"glass-glow " +
									"glass-ripple " +
									"glass-button"
								}
								style={{
									"--glass-surface-opacity": 0.2,
									"--glass-hover-opacity": 0.25,
								}}
								aria-label="Next room"
								onClick={() => changeRoomWithVerify(1)}
								disabled={typeof changeRoom !== "function"}
							>
								Next Room
							</button>
						</div>

						<div className="menu-save-row">
							<button
								className={
									"menu-action " +
									"glass-surface " +
									"glass-glow " +
									"glass-ripple " +
									"glass-button"
								}
								onClick={saveWithFeedback}
							>
								Save Room
							</button>

							{showSavedPopup && (
								<div
									className={
										"menu-saved-popup " +
										"glass-surface"
									}
								>
									Room saved
								</div>
							)}
						</div>

						<div className="menu-room-actions">
							<button
								className={
									"menu-action " +
									"glass-surface " +
									"glass-glow " +
									"glass-ripple " +
									"glass-button"
								}
								onClick={() =>
									verifyWithPopup(loadRoom)
								}
							>
								Load Room
							</button>

							<button
								className={
									"menu-action " +
									"glass-surface " +
									"glass-glow " +
									"glass-ripple " +
									"glass-button"
								}
								onClick={() =>
									verifyWithPopup(newRoom)
								}
							>
								New Room
							</button>
						</div>

						<div className="menu-arrows">
							<button
								className={
									"menu-action " +
									"menu-arrow-left " +
									"glass-surface " +
									"glass-glow " +
									"glass-ripple " +
									"glass-button"
								}
								aria-label="Undo"
								onClick={undoComingSoon}
							/>

							<button
								className={
									"menu-action " +
									"menu-arrow-right " +
									"glass-surface " +
									"glass-glow " +
									"glass-ripple " +
									"glass-button"
								}
								aria-label="Redo"
								onClick={redoComingSoon}
							/>

							{comingSoon && (
								<div
									className={
										"menu-coming-soon " +
										"glass-surface"
									}
								>
									Coming soon!
								</div>
							)}
						</div>

						<button
							className={
								"menu-action " +
								"glass-surface " +
								"glass-glow " +
								"glass-ripple " +
								"glass-button"
							}
							onClick={() =>
								verifyWithPopup(goHome)
							}
						>
							Home
						</button>

						<div className="menu-close-zone">
							<button
								className="menu-close-button"
								aria-label="Close menu"
								onClick={closeMenu}
							>
								<span />
							</button>
						</div>
					</div>

					{areYouSurePopup && (
						<div className="menu-sure glass-surface">
							<h2>Are You Sure?</h2>
							<h3>Data May Be Lost</h3>

							<div className="menu-sure-actions">
								<button
									className={
										"menu-action " +
										"glass-surface " +
										"glass-glow " +
										"glass-ripple " +
										"glass-button"
									}
									onClick={areYouSureYes}
								>
									Yes
								</button>

								<button
									className={
										"menu-action " +
										"glass-surface " +
										"glass-glow " +
										"glass-ripple " +
										"glass-button"
									}
									onClick={areYouSureNo}
								>
									No
								</button>
							</div>
						</div>
					)}
				</div>
			) : (
				<button
					type="button"
					className={
						"menu-closed " +
						"glass-surface " +
						"glass-glow " +
						"glass-ripple " +
						"glass-button"
					}
					aria-label="Open menu"
					onClick={openMenu}
				/>
			)}
		</div>
	);
}
