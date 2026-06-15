import "./App.css";
import { useState } from "react";
//import "./RoomScreen.jsx";
//the above should un-commented.the file should be created and used by this app for page 2 room logic under the primary if-statement
function App() {
  const [activeRoom, SetActiveRoom] = useState(null);
  //useState is a React Hook that establishes states to other components
  //activeRoom is the getter and SetActiveRoom is the setter
  //null is the initial value here
   function handleRoomClick(room) {
    //console.log(`${room} clicked — no room screen yet`);
    //this part was created early to test if the button selection works)

    SetActiveRoom(room); 
    //here we set the active room to the one clicked
  }
if (activeRoom) {
  return <h1>You are in the {activeRoom}</h1>;
  //IMPORTANT!
  //here we check if the activeRoom has a real value
  //if so, it displays a new screen with a sentence containing the value - this is a placeholder for page 2
  //Here is where the core of our delegation will take place - we will need to call upon RoomScreen here and that's where the page 2 logic lies
}
return (
  <div className="home">
   <h1>Memory Palace</h1>
   <p>Pick a Background Room</p>
  <div className="room-grid">
    <button className="room-button" onClick={() => handleRoomClick("Bedroom")}>Bedroom</button>
    <button className="room-button" onClick={() => handleRoomClick("Living Room")}>Living Room</button>
    <button className="room-button" onClick={() => handleRoomClick("Kitchen")}>Kitchen</button>
    <button className="room-button" onClick={() => handleRoomClick("Restroom")}>Restroom</button>
  </div>
</div>
//in leu of classes and next-screen logic, the buttons above only pass a string consisting of the name of clicked room. this is implemented in the handleRoomClick function
    
  );
}


export default App;