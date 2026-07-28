// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi, } from "vitest";

import { render, screen, cleanup, fireEvent, } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { Menu } from "@/model/menu/Menu.jsx";

let menuProps;

beforeEach(() => {
  // Add Creating a default Menu functional component

  // Menu Arguments
  menuProps = {
    menuName: "Test Name",
    updateMenuName: vi.fn(),
    saveRoom: vi.fn(),
    loadRoom: vi.fn(),
    newRoom: vi.fn(),
    setBackgroundImage: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    goHome: vi.fn(),
    areChanges: vi.fn(() => true),
  };
});

afterEach(() => {
  // Reset the Menu Component before running new tests
  cleanup();
  vi.clearAllMocks();
});

describe("Menu Unit Tests", () => {
  // Ensure Elements are only displayed when the menu is opened
  // (the menu opens on click, and closes after its close animation)
  it("Menu Elements Are Displayed Only When Opened", () => {
    // Add Menu creation stuff
    const { container } = render(<Menu {...menuProps} />);

    // All Buttons and Elements are not shown yet
    expect(screen.queryByDisplayValue("Test Name")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save Room" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load Room" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New Room" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Choose Background", })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Home" })).not.toBeInTheDocument();

    // Click the hamburger button to open the menu
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    // All Buttons and Elements are now shown
    expect(screen.getByDisplayValue("Test Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Room" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Load Room" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Room" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose Background", })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();

    // Close the menu. The panel only unmounts when its CSS close
    // animation finishes, and jsdom neither runs CSS animations nor
    // delivers animationend events through React — so assert the
    // observable part: clicking Close puts the panel into its
    // closing state. (Playwright system tests cover the real close.)
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(container.querySelector(".menu-panel")).toHaveClass("menu-transition-closing");
  });

  // Ensure callback arguments are performed at the proper time with prompts for "Are You Sure?"
  it("Argument Callbacks are Called When Options are Clicked and You Sure Yes is Pressed", async () => {
    const user = userEvent.setup();
    const { container } = render(<Menu {...menuProps} />);

    // Open the Menu to display the options
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    // Save should immediately call saveRoom
    fireEvent.click(screen.getByRole("button", { name: "Save Room" }));
    expect(menuProps.saveRoom).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Room saved")).toBeInTheDocument();

    // Choose Background should immediately call setBackgroundImage
    fireEvent.click(screen.getByRole("button", { name: "Choose Background" }));
    expect(menuProps.setBackgroundImage).toHaveBeenCalledTimes(1);

    // Entering a valid room name and pressing Enter should update the name
    const menuNameInput = screen.getByDisplayValue("Test Name");

    fireEvent.change(menuNameInput, {
      target: {
        value: "Updated Name",
      },
    });

    fireEvent.keyDown(menuNameInput, {
      key: "Enter",
      code: "Enter",
    });

    expect(menuProps.updateMenuName).toHaveBeenCalledWith("Updated Name");

    // Load Room should not be called until Yes is pressed
    fireEvent.click(screen.getByRole("button", { name: "Load Room" }));
    expect(menuProps.loadRoom).not.toHaveBeenCalled();
    expect(screen.getByText("Are You Sure?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(menuProps.loadRoom).toHaveBeenCalledTimes(1);

    // New Room should not be called until Yes is pressed
    fireEvent.click(screen.getByRole("button", { name: "New Room" }));
    expect(menuProps.newRoom).not.toHaveBeenCalled();
    expect(screen.getByText("Are You Sure?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(menuProps.newRoom).toHaveBeenCalledTimes(1);

    // Home should not be called until Yes is pressed
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(menuProps.goHome).not.toHaveBeenCalled();
    expect(screen.getByText("Are You Sure?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(menuProps.goHome).toHaveBeenCalledTimes(1);

    // areChanges should only be checked for Load, New Room, and Home
    expect(menuProps.areChanges).toHaveBeenCalledTimes(3);
  });
});
