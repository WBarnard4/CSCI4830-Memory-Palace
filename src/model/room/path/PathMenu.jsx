import { useState } from "react";
import "./PathMenu.css";

// dropdown for the memory path - shows order (just insertion order for now,
// no drag/reorder yet) and lets you step through highlighting them
export function PathMenu({ ideas, pathActive, pathIndex, onStart, onNext, onPrev, onStop }) {
  const [opened, setOpened] = useState(false);

  function label(idea) {
    if (idea.type === "text") {
      return idea.text ? idea.text.slice(0, 20) : "Untitled";
    }
    return "Image";
  }

  return (
    <div
      className="path-menu"
      onMouseEnter={() => setOpened(true)}
      onClick={(event) => event.stopPropagation()}
    >
      {opened ? (
        <div onMouseLeave={() => setOpened(false)}>
          <h1>Path Order</h1>

          {ideas.length === 0 ? (
            <p className="path-empty">No ideas yet</p>
          ) : (
            <ul className="path-list">
              {ideas.map((idea, index) => (
                <li
                  key={idea.id}
                  className={pathActive && index === pathIndex ? "path-current" : ""}
                >
                  Idea {index + 1}: {label(idea)}
                </li>
              ))}
            </ul>
          )}

          {!pathActive ? (
            <button onClick={onStart} disabled={ideas.length === 0}>Start</button>
          ) : (
            <div>
              <p className="path-position">{pathIndex + 1} / {ideas.length}</p>
              <div className="path-controls">
                <button onClick={onPrev}>Prev</button>
                <button onClick={onNext}>Next</button>
              </div>
              <button onClick={onStop}>Stop</button>
            </div>
          )}
        </div>
      ) : (
        <div className="path-menu-closed"></div>
      )}
    </div>
  );
}