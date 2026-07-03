import "./PathNav.css";

// small floating prev/next thing, only shows up once you hit start
export function PathNav({ pathIndex, total, onPrev, onNext }) {
  return (
    <div
      className="path-nav"
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <button onClick={onPrev}>←</button>
      <span className="path-nav-label">{pathIndex + 1} / {total}</span>
      <button onClick={onNext}>→</button>
    </div>
  );
}