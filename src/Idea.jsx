import { useState, useRef } from "react";

export function Idea({ id, type, x, y, text, imageSrc, updateIdea, deleteIdea} ) {
  const [active, setActive] = useState(false);
  const ideaInfo = {
    id: id,
    type: type,
    x: x,
    y: y,
    text: text,
    imageSrc: imageSrc,
  };
  console.log("Created");

  function handleClick() {
    setActive(!active);
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
    
    // if (query) ideaInfo.x = query;
    // if (query1) ideaInfo.y = query1;
    // if (query2) ideaInfo.text = query2;
    // if (query3) ideaInfo.img = query3;

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
      
    }

    handleClick();
    updateIdea(newInfo);
  }

  function handleDelete() {
    deleteIdea(ideaInfo.id);
  }

  return (
    <div>
      <div
        key={ideaInfo.id}
        // onClick={handleClick()}
        onMouseUp={handleClick}
        style={{
          position: "absolute",
          left: `${ideaInfo.x}%`,
          top: `${ideaInfo.y}%`,
          transform: "translate(-50%, -50%)", // Centers the box on the mouse click
          backgroundColor: "white",
          padding: "10px",
          border: "2px solid black",
          borderRadius: "8px",
          color: "black",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
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
            <input name="img"></input>
            <br />

            <button type="submit">Submit</button>
            <button type="button" onClick={handleDelete}>Delete Idea</button>
          </form>
        </div>
      )}
    </div>
  );
}