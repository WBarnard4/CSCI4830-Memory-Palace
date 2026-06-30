import { useState, useRef } from "react";
import { Idea } from "./Idea.jsx";

export default function RoomScreen({ activeRoom, onGoHome }) {
  // state which stores ideas
  const [ideas, setIdeas] = useState([]);
  const [popupPosition, setPopupPosition] = useState(null);
  const imageInputRef = useRef(null);

  // CORE CHANGE: Reference to calculate boundaries
  const roomRef = useRef(null);

  function openImagePicker() {
    imageInputRef.current.click();
  }

  function handleImageSelected(a) {

    // TODO: Change to persistent storage (IndexDB)
    const file = a.target.files[0];
    const url = URL.createObjectURL(file);

    // File is not found or popup is not active
    if (!file || !popupPosition) {
      return;
    }

    // Image is a new idea
    const newIdea = {
      id: Date.now(),
      type: "image",
      x: popupPosition.x,
      y: popupPosition.y,
      // text: url,
      imageSrc: url,
    };

    setIdeas([...ideas, newIdea]);
    setPopupPosition(null);

    a.target.value = "";

  }


  function closePopup() {
    setPopupPosition(null);
  }

  function addTextIdea() {
    if (!popupPosition) {
      return;
    }

    const newIdea = {
      id: Date.now(),
      type: "text",
      x: popupPosition.x,
      y: popupPosition.y,
      text: "New Idea",
    };

    setIdeas([...ideas, newIdea]);
    setPopupPosition(null);
  }



  // Helper to map the activeRoom string to the correct image asset
  const getBackgroundImage = () => {
    switch (activeRoom) {
      case "Bedroom":
        return 'url("src/assets/generic_bedroom.jpg")';
      case "Kitchen":
        return 'url("src/assets/generic_kitchen.png")';
      case "Living Room":
        return 'url("src/assets/generic_living_room.jpg")';
      case "Bathroom":
        return 'url("src/assets/generic_bathroom.jpg")';
      default:
        return "none";
    }
  };

  // CORE CHANGE: The math for placing the idea
  const handleDoubleClick = (e) => {
    // Prevent placing ideas if we clicked directly on the "Home" button
    if (e.target.tagName.toLowerCase() === "button") return;

    if (!roomRef.current) return;

    // If the popup is already visible, do not move it
    if (popupPosition != null) {
      return;
    }

    // Set the popup to the cursor position
    const rect = roomRef.current.getBoundingClientRect();
    const x = (e.clientX / rect.width) * 100;
    const y = (e.clientY / rect.height) * 100;

    setPopupPosition({ x, y });
  };

  return (
    <div
      ref={roomRef}
      className="room"
      onDoubleClick={handleDoubleClick}
      onClick={closePopup}
      style={{
        backgroundImage: getBackgroundImage(),
        backgroundSize: "cover",
        position: "relative", // Keeps absolute-positioned ideas inside this div
        overflow: "hidden",
      }}
    >
      {/* UI Layer: Kept on top with zIndex */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <h1>You are in the {activeRoom}</h1>
        <button
          className="room-button"
          onClick={onGoHome}
          style={{ height: "auto", padding: "1rem" }}
        >
          Home
        </button>
      </div>

      {/* File Explorer Popup for Image inputs */}
      <input
        onClick={(e) => e.stopPropagation()}
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageSelected}
      />

      {/* Popup on double click */}
      {popupPosition && (
        <div
          style={{
            position: "absolute",
            left: `${popupPosition.x}%`,
            top: `${popupPosition.y}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            border: "2px solid black",
            borderRadius: "8px",
            padding: "1rem",
            zIndex: 9,
            color: "black",
            boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
          }}
          onDoubleClick={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={closePopup}>X</button>

          <div
            style={{ marginTop: "1rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={addTextIdea}>Text</button>
            <button onClick={openImagePicker}>Image</button>
          </div>
        </div>
      )}


      {/* CORE CHANGE: Drawing the ideas from our memory onto the screen */}
      {ideas.map((idea) => (
        <Idea 
          id={idea.id}
          type={idea.type}
          x={idea.x}
          y={idea.y}
          text={idea.text}
          imageSrc={idea.imageSrc}></Idea>
      ))}
    </div>
  );
}
