import { useState, useRef } from "react";

export default function RoomScreen({ activeRoom, onGoHome }) {
  // state which stores ideas
  const [ideas, setIdeas] = useState([]);

  // CORE CHANGE: Reference to calculate boundaries
  const roomRef = useRef(null);

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

    const rect = roomRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newIdea = {
      id: Date.now(),
      x: x,
      y: y,
      text: "New Idea",
    };

    setIdeas([...ideas, newIdea]);
  };

  return (
    <div
      ref={roomRef}
      className="room"
      onDoubleClick={handleDoubleClick}
      style={{
        backgroundImage: getBackgroundImage(),
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

      {/* CORE CHANGE: Drawing the ideas from our memory onto the screen */}
      {ideas.map((idea) => (
        <div
          key={idea.id}
          style={{
            position: "absolute",
            left: `${idea.x}px`,
            top: `${idea.y}px`,
            transform: "translate(-50%, -50%)", // Centers the box on the mouse click
            backgroundColor: "white",
            padding: "10px",
            border: "2px solid black",
            borderRadius: "8px",
            color: "black",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          }}
        >
          {idea.text}
        </div>
      ))}
    </div>
  );
}
