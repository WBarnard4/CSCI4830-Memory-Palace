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
        name: DEFAULT_NAME
    });

    if (isOpen != HOME_STATES.NEW) return null;

    function setupRoomCreation(name, imgSrc) {
        setRoomCreation({ imgSrc: imgSrc, name: name })
    }

    function createRoom() {
        onClose(roomCreation.name, roomCreation.imgSrc);
    }

    function pickBackground() {
        openImagePicker(({ imageId, imageSrc }) => {
            setRoomCreation({
                ...roomCreation,
                imgSrc: imageSrc,
                backgroundImageId: imageId,
            });
        });
    }

    function newNameEntered(event) {
        if (event.key != "Enter") {
            return;
        }

        if (!isValidRoomName(event.target.value)) {
            event.target.value = DEFAULT_NAME;
            return;
        }

        setRoomCreation({ ...roomCreation, name: event.target.value })
        event.target.blur();
    }


    return (
        <div>
            <button className="room-button" onClick={onGoHome}>
                Home
            </button>
            <div className="room-grid">
                {/* set activeRoom to Bedroom, rendering it in App.jsx */}
                <button
                    className="room-button bedroom-button"
                    onClick={() => setupRoomCreation("Bedroom", bedroomUrl)}
                >
                    Bedroom
                </button>

                {/* set activeRoom to Living Room, rendering it in App.jsx */}
                <button
                    className="room-button living-room-button"
                    onClick={() => setupRoomCreation("Living Room", livingRoomUrl)}
                >
                    Living Room
                </button>

                {/* set activeRoom to Kitchen, rendering it in App.jsx */}
                <button
                    className="room-button kitchen-button"
                    onClick={() => setupRoomCreation("Kitchen", kitchenUrl)}
                >
                    Kitchen
                </button>

                {/* set activeRoom to Bathroom, rendering it in App.jsx */}
                <button
                    className="room-button bathroom-button"
                    onClick={() => setupRoomCreation("Bathroom", bathroomUrl)}
                >
                    Bathroom
                </button>

                <div
                    className="room-creator"
                    style={{
                        backgroundImage: roomCreation.imgSrc
                            ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url("${roomCreation.imgSrc}")`
                            : "none",
                    }}
                >
                    <input
                        key={roomCreation.name}
                        className="menu-name-input"
                        type="text"
                        defaultValue={roomCreation.name}
                        onKeyDown={newNameEntered}
                    />
                    <button
                        className="room-button"
                        onClick={pickBackground}
                    >
                        Choose Background
                    </button>
                    <button
                        className="room-button"
                        onClick={createRoom}
                    >
                        Create Room
                    </button>
                </div>
            </div>
        </div>
    );
}
