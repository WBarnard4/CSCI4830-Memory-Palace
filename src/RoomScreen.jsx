import { useState, useRef } from "react";
import { Menu } from "./Menu.jsx"
import { Idea } from "./Idea.jsx";

export default function RoomScreen({ activeRoom, onGoHome }) {
  // state which stores ideas
  const [ideas, setIdeas] = useState([]);
  const [popupPosition, setPopupPosition] = useState(null);
  const imageInputRef = useRef(null);
  const imageInputTypeRef = useRef("idea");
  const [backgroundUrl, setBackgroundUrl] = useState(() => {
    switch (activeRoom) {
      case "Bedroom":
        return 'src/assets/generic_bedroom.jpg';
      case "Kitchen":
        return 'src/assets/generic_kitchen.png';
      case "Living Room":
        return 'src/assets/generic_living_room.jpg';
      case "Bathroom":
        return 'src/assets/generic_bathroom.jpg';
      default:
        return 'none';
    }
  })

  // CORE CHANGE: Reference to calculate boundaries
  const roomRef = useRef(null);

  function openImagePicker(type) {
    imageInputTypeRef.current = type;
    imageInputRef.current.click();
  }

  function handleImageSelected(a) {

    // TODO: Change to persistent storage (IndexDB)
    const file = a.target.files[0];

    // File is not found
    if (!file) {
      return;

    }
    const url = URL.createObjectURL(file);

    console.log(url);
    // File is not found or popup is not active
    if (!file || !popupPosition) {
      return;
    }

    // Image is a new idea
    if (imageInputTypeRef.current === "idea" && popupPosition) {
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
    } else if (imageInputTypeRef.current === "background") {
      setBackgroundUrl(url);
    }


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

  function updateIdea(newInfo) {
    let current = [...ideas];
    let index = current.findIndex(info => info.id === newInfo.id);
    current[index] = newInfo;
    setIdeas(current);
  }

  function deleteIdea(id) {
    let current = [...ideas];
    let index = current.findIndex(info => info.id === id);
    if (index != -1) {
      current.splice(index, 1);
      setIdeas(current);
    }
  }

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

    console.log(ideas);
    setPopupPosition({ x, y });
  };

  return (
    <div
      ref={roomRef}
      className="room"
      onDoubleClick={handleDoubleClick}
      onClick={closePopup}
      style={{
        backgroundImage: backgroundUrl === "none" ? "none" : `url("${backgroundUrl}")`,
        backgroundSize: "cover",
        position: "relative", // Keeps absolute-positioned ideas inside this div
        overflow: "hidden",
      }}
    >
      {/* Menu Icon that implements most room switching and saving features */}
      {/* TODO: Add saving, loading, creating, and change reporting. */}
      <div style={{ position: "relative", zIndex: 100 }}>
        <Menu
          saveRoom={() => null}
          loadRoom={() => null}
          newRoom={() => null}
          setBackgroundImage={() => openImagePicker("background")}
          undo={() => null}
          redo={() => null}
          goHome={onGoHome}
          areChanges={() => true}
        />
      </div>
      {/* UI Layer: Kept on top with zIndex */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <h1>You are in the {activeRoom}</h1>
      </div>

      {/* File Explorer Popup for Image inputs */}
      <input
        onClick={(e) => e.stopPropagation()}
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(a) => handleImageSelected(a, "idea")}
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
            <button onClick={() => openImagePicker("idea")}>Image</button>
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
          imageSrc={idea.imageSrc}
          updateIdea={updateIdea}
          deleteIdea={deleteIdea}
          imageInputRef={imageInputRef}
          openImagePicker={openImagePicker}
          key={idea.id}>
        </Idea>
      ))}
    </div>
  );
}
