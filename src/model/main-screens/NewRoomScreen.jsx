/**
 * @file Handles creating new Rooms for the database.
 *
 * Renders template Rooms as selectable cards and provides
 * functionality to update their details to make custom Rooms.
 */

import "@/App.css";
import HOME_STATES from "./States.jsx"
import { useState } from "react";
import { isValidRoomName } from "@/utils/RoomValidation.js"
const STATES = HOME_STATES;

import bedroomUrl from "@/assets/generic_bedroom.jpg";
import kitchenUrl from "@/assets/generic_kitchen.png";
import livingRoomUrl from "@/assets/generic_living_room.jpg";
import bathroomUrl from "@/assets/generic_bathroom.jpg";

const DEFAULT_NAME = "New Room Name"

/**
 * Room creation screen.
 * 
 * Renders when isOpen is set to NEW, otherwise returns null.
 * 
 * @param {object} props
 * @param {number} props.isOpen - Passed from App to enable or disable component.
 * @param {() => void} props.onClose - Callback to pass new Room data to be rendered in App.
 * @param {() => void} props.onGoHome - Callback to enable HomseScreen compoment.
 * @param {() => void} props.openImagePicker - Callback to open image picker from App.
 
 * @returns {JSX.Element} The template Room cards and creation buttons.
 */
export default function NewRoomScreen({ isOpen, onClose, onGoHome, openImagePicker }) {
    // If state is incorrect, do not render component
    const [roomCreation, setRoomCreation] = useState({
        imgSrc: null,
        imageId: null,
        name: DEFAULT_NAME
    });

    if (isOpen != HOME_STATES.NEW) return null;

    /**
     * Updates Room editor to use data from template cards.
     * 
     * Runs when template cards are clicked.
     * @param {*} name -  Name of the Room.
     * @param {*} imgSrc - Source of image file.
     */
    function setupRoomCreation(name, imgSrc) {
        // Preset backgrounds have no stored image, so clear any
        // previously picked imageId instead of silently dropping it.
        setRoomCreation({ ...roomCreation, imgSrc: imgSrc, imageId: null, name: name })
    }

    /**
     * Calls onClose with new Room data.
     * 
     * Runs when Create Room button is clicked.
     */
    function createRoom() {
        onClose(roomCreation.name, roomCreation.imageId, roomCreation.imgSrc);
    }

    /**
     * Calls openImagePicker for background image selection.
     * 
     * Runs when Choose Background button is cicked
     */
    function pickBackground() {
        openImagePicker(({ imageId, imageSrc }) => {
            setRoomCreation({
                ...roomCreation,
                imgSrc: imageSrc,
                imageId: imageId,
                backgroundImageId: imageId,
            });
        });
    }

    /**
     * Updates new Room name based on the name entry field.
     * 
     * Runs when field is submitted or loses focus.
     * @param {*} event - The name to be updated to.
     */
    function newNameEntered(event) {
        // Commit on Enter OR when the field loses focus, so clicking
        // "Create Room" directly still saves the typed name.
        if (event.key !== "Enter" && event.type !== "blur") {
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
        }

        const newName = event.target.value.trim();

        if (!isValidRoomName(newName)) {
            event.target.value = roomCreation.name;
            event.target.blur();
            return;
        }

        setRoomCreation({ ...roomCreation, name: newName })
        event.target.blur();
    }


    return (
        <div>
            <button
                className="back-button glass-surface glass-glow glass-button"
                onClick={onGoHome}
                aria-label="Back to home"
            >
                &#8592;
            </button>
            <div className="room-grid menu-transition-content menu-transition-panel" style={{ "--menu-content-open-delay": "0ms" }}>
                {/* Preset background cards; the chosen one glows */}
                {[
                    { name: "Bedroom", url: bedroomUrl },
                    { name: "Living Room", url: livingRoomUrl },
                    { name: "Kitchen", url: kitchenUrl },
                    { name: "Bathroom", url: bathroomUrl },
                ].map((preset) => (
                    <button
                        key={preset.name}
                        className={
                            "room-card glass-surface glass-ripple glass-button" +
                            (roomCreation.imgSrc === preset.url ? " chosen" : "")
                        }
                        onClick={() => setupRoomCreation(preset.name, preset.url)}
                    >
                        <span
                            className="room-card-thumb"
                            style={{ backgroundImage: `url("${preset.url}")` }}
                        />
                        <span className="room-card-name">{preset.name}</span>
                    </button>
                ))}

                <div
                    className="room-creator glass-surface"
                    style={{
                        backgroundImage: roomCreation.imgSrc
                            ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url("${roomCreation.imgSrc}")`
                            : "none",
                    }}
                >
                    <div
                        className="glass-surface glass-glow glass-ripple"
                    >
                        <textarea
                            key={roomCreation.name}
                            className="glass-textarea"
                            defaultValue={roomCreation.name}
                            rows="2"
                            wrap="soft"
                            onKeyDown={newNameEntered}
                            onBlur={newNameEntered}
                        />
                    </div>
                    <button
                        className="room-button glass-surface glass-glow glass-ripple glass-button"
                        onClick={pickBackground}
                    >
                        Choose Background
                    </button>
                    <button
                        className="room-button glass-surface glass-glow glass-button"
                        onClick={createRoom}
                    >
                        Create Room
                    </button>
                </div>
            </div>
        </div>
    );
}
