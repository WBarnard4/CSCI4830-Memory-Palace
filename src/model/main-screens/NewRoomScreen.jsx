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

export default function NewRoomScreen({ isOpen, onClose, onGoHome, openImagePicker }) {
    // If state is incorrect, do not render component
    const [roomCreation, setRoomCreation] = useState({
        imgSrc: null,
        imageId: null,
        name: DEFAULT_NAME
    });

    if (isOpen != HOME_STATES.NEW) return null;

    function setupRoomCreation(name, imgSrc) {
        // Preset backgrounds have no stored image, so clear any
        // previously picked imageId instead of silently dropping it.
        setRoomCreation({ ...roomCreation, imgSrc: imgSrc, imageId: null, name: name })
    }

    function createRoom() {
        onClose(roomCreation.name, roomCreation.imageId, roomCreation.imgSrc);
    }

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
                className="back-button glass-surface glass-glow glass-ripple glass-button"
                onClick={onGoHome}
                aria-label="Back to home"
            >
                &#8592;
            </button>
            <div className="room-grid">
                {/* set activeRoom to Bedroom, rendering it in App.jsx */}
                <button
                    className="room-button glass-surface glass-ripple glass-button bedroom-button"
                    onClick={() => setupRoomCreation("Bedroom", bedroomUrl)}
                >
                    Bedroom
                </button>

                {/* set activeRoom to Living Room, rendering it in App.jsx */}
                <button
                    className="room-button glass-surface glass-ripple glass-button living-room-button"
                    onClick={() => setupRoomCreation("Living Room", livingRoomUrl)}
                >
                    Living Room
                </button>

                {/* set activeRoom to Kitchen, rendering it in App.jsx */}
                <button
                    className="room-button glass-surface glass-ripple glass-button kitchen-button"
                    onClick={() => setupRoomCreation("Kitchen", kitchenUrl)}
                >
                    Kitchen
                </button>

                {/* set activeRoom to Bathroom, rendering it in App.jsx */}
                <button
                    className="room-button glass-surface glass-ripple glass-button bathroom-button"
                    onClick={() => setupRoomCreation("Bathroom", bathroomUrl)}
                >
                    Bathroom
                </button>

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
