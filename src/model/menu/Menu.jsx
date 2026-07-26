import { useState, useEffect, useRef } from "react";
import { isValidRoomName } from "@/utils/RoomValidation";
import "./Menu.css";

export function Menu({ menuName, updateMenuName, saveRoom, loadRoom, newRoom, setBackgroundImage, undo, redo, goHome, areChanges }) {
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

	function suppressHoverRipple(event) {
		event.currentTarget.classList.add("menu-ripple-clicked");
	}

	function restoreHoverRipple(event) {
		event.currentTarget.classList.remove("menu-ripple-clicked");
	}

	const rippleHandlers = {
		onPointerDown: suppressHoverRipple,
		onPointerLeave: restoreHoverRipple,
		onPointerCancel: restoreHoverRipple,
	};


	return (
		<div
			ref={menuRef}
			className="menu"
		>
			{opened ? (
				<div
					className={`menu-panel${closing ? " menu-closing" : ""}`}
					onAnimationEnd={finishMenuAnimation}
				>
					<div className="menu-opened">
						<div
							className="menu-input-ripple"
							{...rippleHandlers}
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
							className="menu-action"
							onClick={setBackgroundImage}
							{...rippleHandlers}
						>
							Choose Background
						</button>

						<div className="menu-save-row">
							<button
								className="menu-action"
								onClick={saveWithFeedback}
								{...rippleHandlers}
							>
								Save Room
							</button>

							{showSavedPopup && (
								<div className="menu-saved-popup">
									Room saved
								</div>
							)}
						</div>

						<div className="menu-room-actions">
							<button
								className="menu-action"
								onClick={() => verifyWithPopup(loadRoom)}
								{...rippleHandlers}
							>
								Load Room
							</button>

							<button
								className="menu-action"
								onClick={() => verifyWithPopup(newRoom)}
								{...rippleHandlers}
							>
								New Room
							</button>
						</div>

						<div className="menu-arrows">
							<button
								className="menu-action menu-arrow-left"
								aria-label="Undo"
								onClick={undoComingSoon}
								{...rippleHandlers}
							/>

							<button
								className="menu-action menu-arrow-right"
								aria-label="Redo"
								onClick={redoComingSoon}
								{...rippleHandlers}
							/>

							{comingSoon && (
								<div className="menu-coming-soon">
									Coming soon!
								</div>
							)}
						</div>

						<button
							className="menu-action"
							onClick={() => verifyWithPopup(goHome)}
							{...rippleHandlers}
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
						<div className="menu-sure">
							<h2>Are You Sure?</h2>
							<h3>Data May Be Lost</h3>

							<div className="menu-sure-actions">
								<button
									className="menu-action"
									onClick={areYouSureYes}
									{...rippleHandlers}
								>
									Yes
								</button>

								<button
									className="menu-action"
									onClick={areYouSureNo}
									{...rippleHandlers}
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
					className="menu-closed"
					aria-label="Open menu"
					onClick={openMenu}
					{...rippleHandlers}
				/>
			)}
		</div>
	);
}
