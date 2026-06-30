import { useState, useRef } from "react";

export function Idea({id, type, x, y, text, imageSrc}) {
    const ideaInfo = {
      id: id,
      type: type,
      x: x,
      y: y,
      text: text,
      imageSrc: imageSrc,
    };

    let active = false;

    function setActive() {
      console.log("Active was: " + active);
      active = !active;
      console.log("Active is now: " + active);
    }

    return (
        <div
          key={ideaInfo.id}
          onclick={setActive()}
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
    );
}