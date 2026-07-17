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
  // Ensure Elements are only displayed when the menu is hovered
  it("Menu Elements Are Displayed Only When Hovered Over", () => {
    // Add Menu creation stuff
    const { container } = render(<Menu {...menuProps} />);

    // All Buttons and Elements are not shown yet
    expect(screen.queryByDisplayValue("Test Name")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New Room" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Change Background", })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Home" })).not.toBeInTheDocument();

    // Focus on Menu to bring up text
    const menu = container.querySelector(".menu");
    fireEvent.mouseEnter(menu);

    // All Buttons and Elements are now shown
    expect(screen.getByDisplayValue("Test Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Load" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Room" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change Background", })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();

    const openedMenu = container.querySelector(".menu-opened");
    fireEvent.mouseLeave(openedMenu);

    // Menu closes again when it is no longer hovered over
    expect(screen.queryByDisplayValue("Test Name")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  // Ensure callback arguments are performed at the proper time with prompts for "Are You Sure?"
  it("Argument Callbacks are Called When Options are Clicked and You Sure Yes is Pressed", async () => {
    const user = userEvent.setup();
    const { container } = render(<Menu {...menuProps} />);

    // Hover over Menu to display the options
    fireEvent.mouseEnter(container.querySelector(".menu"));

    // Save should immediately call saveRoom
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(menuProps.saveRoom).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Data has been saved!")).toBeInTheDocument();

    // Change Background should immediately call setBackgroundImage
    fireEvent.click(screen.getByRole("button", { name: "Change Background" }));
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

    expect(menuProps.updateMenuName).toHaveBeenCalledTimes(1);
    expect(menuProps.updateMenuName).toHaveBeenCalledWith("Updated Name");

    // Load should not be called until Yes is pressed
    fireEvent.click(screen.getByRole("button", { name: "Load" }));
    expect(menuProps.loadRoom).not.toHaveBeenCalled();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(menuProps.loadRoom).toHaveBeenCalledTimes(1);

    // New Room should not be called until Yes is pressed
    fireEvent.click(screen.getByRole("button", { name: "New Room" }));
    expect(menuProps.newRoom).not.toHaveBeenCalled();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(menuProps.newRoom).toHaveBeenCalledTimes(1);

    // Home should not be called until Yes is pressed
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(menuProps.goHome).not.toHaveBeenCalled();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(menuProps.goHome).toHaveBeenCalledTimes(1);

    // areChanges should only be checked for Load, New Room, and Home
    expect(menuProps.areChanges).toHaveBeenCalledTimes(3);
  });
});
