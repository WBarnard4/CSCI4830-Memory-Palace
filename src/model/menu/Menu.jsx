import { useState, useEffect, useRef } from "react";
import { isValidRoomName } from "@/utils/RoomValidation";
import "./Menu.css";

export function Menu({ menuName, updateMenuName, saveRoom, loadRoom, newRoom, setBackgroundImage, undo, redo, goHome, areChanges, changeRoom }) {	const [opened, setOpened] = useState(false);
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
	 * Removes the areYouSure popup and sets sureCallback to null.
	 */
	function areYouSureNo() {
		setAreYouSurePopup(false);
		setSureCallback(null);
	}

	/**
	 * Calls sureCallback and removes
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
	 * Verifies with the user they may overwrite
	 * data before calling the passed verifyCallback function.
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
	 * Feature coming soon TODO: Implement
	 */
	function undoComingSoon() {
		setComingSoon(true);
	}

	/**
	 * Placeholder until the redo argument is implemented.
	 *
	 * Feature coming soon TODO: Implement
	 */
	function redoComingSoon() {
		setComingSoon(true);
	}


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
	 */
	function changeRoomWithVerify(direction) {
		if (typeof changeRoom !== "function") {
		return;
		}
		verifyWithPopup(() => changeRoom(direction));
	}

	function openMenu() {
		setClosing(false);
		setOpened(true);
	}

	function closeMenu() {
		if (!opened || closing) {
			return;
		}

		setClosing(true);
	}

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
