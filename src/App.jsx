import "./App.css";
function App() {
  const rooms = ["Room 1", "Room 2", "Room 3", "Room 4"];
  function handleRoomClick(room) {
    console.log(`${room} clicked — no room screen yet`);
  }

return (
    <div className="home">
      <h1>Memory Palace</h1>
      <p> Pick a Background Room </p>
      <div className="room-grid">
        {rooms.map((room) => (
          <button
            key={room}
            className="room-button"
            onClick={() => handleRoomClick(room)}
          >
            {room}
          </button>
        ))}
      </div>
    </div>
  );
}


export default App;