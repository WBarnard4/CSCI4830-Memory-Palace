import { useState, useRef } from "react";

export function Idea({ id, type, x, y, text, imageSrc, highlighted, pathHighlighted, zIndex, updateIdea, deleteIdea }) {
  const [active, setActive] = useState(false);
  const imageInputRef = useRef(null);
  const ideaInfo = {
    id: id,
    type: type,
    x: x,
    y: y,
    text: text,
    imageSrc: imageSrc,
    highlighted: highlighted,
  };

  // glow if manually highlighted OR the path is currently sitting on this one
  const isHighlighted = ideaInfo.highlighted || pathHighlighted;

  console.log("Created");

  function handleClick() {
    setActive(!active);
  }

  function toggleHighlight() {
    updateIdea({
      ...ideaInfo,
      highlighted: !ideaInfo.highlighted,
    });
  }

  function setInfo(e) {
    e.preventDefault();

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);
    let query = formData.get("posX");
    let query1 = formData.get("posY");
    let query2 = formData.get("text");
    let query3 = formData.get("img");

    if (!query) query = ideaInfo.x;
    if (!query1) query1 = ideaInfo.y;
    if (!query2) query2 = ideaInfo.text;
    if (!query3) query3 = ideaInfo.imageSrc;

    const newInfo = {
      id: ideaInfo.id,
      type: ideaInfo.type,
      x: Number(query),
      y: Number(query1),
      text: query2,
      imageSrc: query3,
      highlighted: ideaInfo.highlighted,
    }

    handleClick();
    updateIdea(newInfo);
  }

  function handleDelete() {
    deleteIdea(ideaInfo.id);
  }

  function openImagePicker() {
    imageInputRef.current.click();
  }

  function handleNewImageSelected(a) {

    const file = a.target.files[0];
    const url = URL.createObjectURL(file);
    console.log(url);

    // File is not found or popup is not active
    if (!file) {
      return;
    }

    const newInfo = {
      id: ideaInfo.id,
      type: ideaInfo.type,
      x: ideaInfo.x,
      y: ideaInfo.y,
      text: ideaInfo.text,
      imageSrc: url,
      highlighted: ideaInfo.highlighted,
    }
    updateIdea(newInfo);
    a.target.value = "";
  }

  return (
    <div>
      <div
        key={ideaInfo.id}
        onClick={handleClick}
        // onChangeCapture={}
        style={{
          position: "absolute",
          left: `${ideaInfo.x}%`,
          top: `${ideaInfo.y}%`,
          transform: "translate(-50%, -50%)", // Centers the box on the mouse click
          backgroundColor: "white",
          padding: "10px",
          border: isHighlighted
            ? "2px solid #ffd700"
            : "2px solid black",
          borderRadius: "8px",
          color: "black",
          cursor: "pointer",
          boxShadow: isHighlighted
            ? "0 0 0 4px rgba(255, 215, 0, 0.9), 0 0 24px 10px rgba(255, 215, 0, 0.55)"
            : "0 4px 6px rgba(0,0,0,0.3)",
          transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          // z-index now comes from RoomScreen (order position + highlight state)
          zIndex: zIndex ?? (isHighlighted ? 5 : 1),
        }}
      >
        {ideaInfo.text}

        {ideaInfo.type === "image" && (
          <img
            src={ideaInfo.imageSrc}
            alt="User idea"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "contain",
            }}
          />
        )}
      </div>
      <input
        onClick={(e) => e.stopPropagation()}
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleNewImageSelected}
      />
      {active && (
        <div
          style={{
            position: "absolute",
            left: `${ideaInfo.x + 10}%`,
            top: `${ideaInfo.y}%`,
            transform: "translate(-50%, -50%)", // Centers the box on the mouse click
            backgroundColor: "white",
            padding: "10px",
            border: "2px solid black",
            borderRadius: "8px",
            color: "black",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            zIndex: 8,
          }}>
          <label></label>
          <form onSubmit={setInfo}>
            <label name="posX">Set x%: Currently {Math.round(ideaInfo.x)}</label>
            <br />
            <input name="posX" type="number"></input>
            <br />

            <label name="posY">Set y%: Currently {Math.round(ideaInfo.y)}</label>
            <br />
            <input name="posY" type="number"></input>
            <br />

            <label name="text">Change Text</label>
            <br />
            <textarea name="text" defaultValue={ideaInfo.text}></textarea>
            <br />
            <label name="img">Change Image Source</label>
            <br />
            <button type="button" onClick={openImagePicker}>Select Image</button>
            <br />

            <button type="button" onClick={toggleHighlight}>
              {ideaInfo.highlighted ? "Remove Highlight" : "Highlight"}
            </button>
            <br />

            <button type="submit">Submit</button>
            <button type="button" onClick={handleDelete}>Delete Idea</button>
          </form>
        </div>
      )}
    </div>
  );
}