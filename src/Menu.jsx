import { useState, useEffect } from "react";
import "./Menu.css";

export function Menu({ saveRoom, loadRoom, newRoom, goHome, areChanges }) {
	const [opened, setOpened] = useState(false);
	const [areYouSurePopup, setAreYouSurePopup] = useState(false);
	const [sureCallback, setSureCallback] = useState(null);
	const [showSavedPopup, setShowSavedPopup] = useState(false);
	const [comingSoon, setComingSoon] = useState(false);

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
	 * Verifies no data is overwritten before calling the loadRoom
	 * function.
	 *
	 * Feature coming soon TODO: Implement
	 */
	function loadRoomComingSoon() {
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

	return (
		<div
			className="menu"
			onMouseEnter={() => setOpened(true)}
			onClick={(event) => event.stopPropagation()}
		>
			{opened ? (
				<div>
					{showSavedPopup && (
						<h1>Data has been saved!</h1>
					)}

					{comingSoon && (
						<h1>Coming soon!</h1>
					)}

					{areYouSurePopup ? (
						<div className="menu-sure"
							onBlur={() => areYouSureNo()}
						>
							<h2>Are you sure?</h2>
							<h3>Data may be lost</h3>
							<button onClick={areYouSureNo}>No</button>
							<button onClick={areYouSureYes}>Yes</button>
						</div>
					) : (
						<div className="menu-opened"
							onMouseLeave={() => setOpened(false)}
						>
							<button onClick={saveWithFeedback}>Save</button>
							<button onClick={loadRoomComingSoon}>Load</button>
							<button onClick={() => verifyWithPopup(newRoom)}>New Room</button>
							<button onClick={() => verifyWithPopup(goHome)}>Home</button>
						</div>
					)}
				</div>
			) : (
				<div className="menu-closed"></div>
			)}
		</div>
	);
}
