# Memory Palace

Memory Palace is a web application that translates the memory palace mnemonic technique into a web experience. Users can create a "room" with a provided look or upload a background image of their own. In these rooms, users can place "ideas" by double clicking to input text or images at locations of their choice. Now, users can use the location of ideas in the room to help memorize concepts by associating the content of the ideas in the space of the room. Users can also organize their ideas into a sequential order and have the room highlight them using the "path" feature for added visual clarity and memorization help.

# How to use

## Required Installs

- Node.js: https://nodejs.org

## How to Download the Repo

in a terminal, run:

$ <code>git clone https://github.com/WBarnard4/CSCI4830-Memory-Palace</code>

## How to Install Dependencies and Run the Application

In a terminal, navigate to the repository directory and run:

$ <code>npm install</code>

and then:

$ <code>npm run dev</code>

This will open a server at a localhost address.

In a web browser, navigate to that address to access the website.



# Release Notes
## 6/18/26

- Memory Palace currently implements a Home Screen that gives users the option to load or create new rooms. The load feature is unimplemented, but users can create a new room with the four provided templates.
- In the room, users can create new ideas by double clicking to open a popup and choose between text or image. Selecting text creates a text idea with placeholder text while selecting image opens the file explorer to create an image idea with the selected image.
- A home button is also present that takes the user back to the Home Screen.

## 7/02/2026
- Properties of ideas can be edited by clicking on them to open a menu. Position, text, image source, and the newly implemented highlight can all be edited.
- A menu at the top left allows users to return to the main menu or change the background image. Placeholder buttons are present for saving and loading functionality to be implemented in the future.
- The path menu at the top right shows users the order their ideas are in and gives them the ability to highlight ideas in said order, one at a time. They can traverse forwards or backwards in the order. The ability to reorder ideas will be implemented in the future.
- Elements on the screen will dynamically resize themselves when the size of the window is changed, keeping their size and position relative to each other

## 7/17/2026
- App has been refactored to separate HomeScreen, LoadRoomScreen, and NewRoomScreen into individual classes that can pass a roomData object between them.
- IndexedDB database has been implemented to save Room data (Room name, Idea data, etc.) via the Room Menu. This can be loaded in the LoadRoomScreen through the roomData object.
- Ideas can be reordered via the Idea Menu which changes their position in the Path system.
- A tests folder and test files have been created to implement unit tests on certain functions.

## 7/31/2026
- CSS has been overhauled to use new "Glass" styling for most elements such as buttons and textareas. Positioning of elements like Memory Palace title and subtitle has been adjusted.
- Welcome Popup has been added to HomeScreen
- Back buttons have been added to LoadRoomScreen and NewRoomScreen to return to HomeScreen
- LoadRoomScreen displays Room background images on Room Cards. Added Search and Delete buttons to filter or remove Rooms from database.
- Added functionality to Room's Menu to swap to adjacent Room screens.
- Added description field to Idea's edit menu for both Text and Image Ideas. Added functionality to adjust Idea and its edit menu's positions relative to the edge of the screen.
- Added functionality to adjust Idea position by clicking and dragging and to adjust Idea size/rotation by clicking on provided bubbles.
- Added/updated test files for all main classes, includes database functionality.
- Added functionality to deploy to GitHub Pages and Vercel.
