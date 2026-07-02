import { useState, useRef, useEffect } from "react";
import { Menu } from "./Menu.jsx"
import { Idea } from "./Idea.jsx";

const BASE_VIEWPORT_WIDTH = 1920;
const BASE_VIEWPORT_HEIGHT = 1080;

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
  const [backgroundDimensions, setBackgroundDimensions] = useState({
    width: 1920,
    height: 1080,
  });

  const [baseRoomDimensions, setBaseRoomDimensions] = useState({
    width: 1920,
    height: 1080,
  });
  const [roomDimensions, setRoomDimensions] = useState({
    width: 1920,
    height: 1080,
  });
  const [roomScale, setRoomScale] = useState(1);

  // CORE CHANGE: Reference to calculate boundaries
  const roomRef = useRef(null);

  // Sets the background dimensions to match the background image whenever the background changes.
  useEffect(() => {
    if (backgroundUrl === "none") {
      return;
    }

    const image = new Image();

    // When the image loads, set the background dimensions to it.
    image.onload = () => {
      setBackgroundDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    // Load the image as the background image
    image.src = backgroundUrl;
  }, [backgroundUrl]);

  // Recalculate the room dimensions on background or window dimension changes.
  useEffect(() => {
    function getContainedDimensions(containerWidth, containerHeight) {
      // Find the min scale to keep the background on the screen
      const widthScale = containerWidth / backgroundDimensions.width;
      const heightScale = containerHeight / backgroundDimensions.height;
      const scale = widthScale < heightScale ? widthScale : heightScale;

      return {
        width: backgroundDimensions.width * scale,
        height: backgroundDimensions.height * scale,
      };
    }

    function updateRoomDimensions() {
      // Find the dimensions in the baseline viewport.
      const newBaseRoomDimensions = getContainedDimensions(
        BASE_VIEWPORT_WIDTH,
        BASE_VIEWPORT_HEIGHT
      );

      // Find the dimensions in the current viewport.
      const newRoomDimensions = getContainedDimensions(
        window.innerWidth,
        window.innerHeight
      );

      // Compare the current dimensions against the baseline dimensions.
      const newRoomScale = newRoomDimensions.width / newBaseRoomDimensions.width;

      setBaseRoomDimensions(newBaseRoomDimensions);
      setRoomDimensions(newRoomDimensions);
      setRoomScale(newRoomScale);
    }

    updateRoomDimensions();

    window.addEventListener("resize", updateRoomDimensions);

    return () => {
      window.removeEventListener("resize", updateRoomDimensions);
    };
  }, [backgroundDimensions]);



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

    // Image is a new idea
    if (imageInputTypeRef.current === "idea" && popupPosition) {
      const newIdea = {
        id: Date.now(),
        type: "image",
        x: popupPosition.x,
        y: popupPosition.y,
        // text: url,
        imageSrc: url,
        // HALO: new ideas start un-highlighted
        highlighted: false,
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
      // HALO: new ideas start un-highlighted
      highlighted: false,
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
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    console.log(ideas);
    setPopupPosition({ x, y });
  };

  return (
    <div className="room-viewport">
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
      {/* Wrapper div to make the browser layout treat a room as the correct size and allow popups to overflow*/}
      <div
        className="room-wrapper"
        style={{
          width: `${roomDimensions.width}px`,
          height: `${roomDimensions.height}px`,
          overflow: "visible",
        }}
      >
        <div
          ref={roomRef}
          className="room"
          onDoubleClick={handleDoubleClick}
          onClick={closePopup}
          style={{
            width: `${baseRoomDimensions.width}px`,
            height: `${baseRoomDimensions.height}px`,
            backgroundImage: backgroundUrl === "none" ? "none" : `url("${backgroundUrl}")`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
            overflow: "hidden",
            transform: `scale(${roomScale})`,
            transformOrigin: "top left",

          }}
        >
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
            onChange={(a) => handleImageSelected(a)}
          />

          {/* CORE CHANGE: Drawing the ideas from our memory onto the screen */}
          {ideas.map((idea) => (
            <Idea
              id={idea.id}
              type={idea.type}
              x={idea.x}
              y={idea.y}
              text={idea.text}
              imageSrc={idea.imageSrc}
              // HALO: pass the flag down so Idea can render the glow
              highlighted={idea.highlighted}
              updateIdea={updateIdea}
              deleteIdea={deleteIdea}
              imageInputRef={imageInputRef}
              openImagePicker={openImagePicker}
              key={idea.id}>
            </Idea>
          ))}
        </div>

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
      </div>
    </div>
  );
}
