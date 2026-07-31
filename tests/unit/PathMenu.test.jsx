// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi, } from "vitest";

import { render, screen, cleanup, fireEvent, } from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

import { PathMenu } from "@/model/room/path/PathMenu.jsx";

let pathMenuProps;

beforeEach(() => {
	// Create starting values
	pathMenuProps = {
		ideas: [
			{ id: 1, title: "First Idea", },
			{ id: 2, title: "Second Idea", },
			{ id: 3, title: "", },
		],
		pathActive: false,
		pathIndex: 0,
		onStart: vi.fn(),
		onNext: vi.fn(),
		onPrev: vi.fn(),
		onStop: vi.fn(),
	};
});

afterEach(() => {
	// Reset the PathMenu
	cleanup();
	vi.clearAllMocks();
});

describe("PathMenu Unit Tests", () => {
	// Menu elements only displayed while open
	it("PathMenu elements are displayed when opened and not when closed", () => {
		const { container } = render(<PathMenu {...pathMenuProps} />);

		// Menu contents are not shown before opening
		expect(screen.queryByText("Path Order")).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Close path menu" })).not.toBeInTheDocument();

		// Open the PathMenu
		fireEvent.click(screen.getByRole("button", { name: "Open path menu" }));

		// Menu contents are now displayed
		expect(screen.getByText("Path Order")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Close path menu" })).toBeInTheDocument();

		// Close starts the closing animation
		fireEvent.click(screen.getByRole("button", { name: "Close path menu" }));

		// Ensure the closing animation is actually starting.
		expect(container.querySelector(".menu-panel")).toHaveClass("menu-transition-closing");
	});

	// Ensure ideas are displayed in the menu
	it("Displays the ideas in the menu", () => {
		render(<PathMenu {...pathMenuProps} />);

		fireEvent.click(screen.getByRole("button", { name: "Open path menu" }));

		// Ensure ideas are shown
		expect(screen.getByText("Idea 1:")).toBeInTheDocument();
		expect(screen.getByText("First Idea")).toBeInTheDocument();
		expect(screen.getByText("Idea 2:")).toBeInTheDocument();
		expect(screen.getByText("Second Idea")).toBeInTheDocument();
		expect(screen.getByText("Idea 3:")).toBeInTheDocument();
		expect(screen.getByText("Untitled")).toBeInTheDocument();

		expect(screen.getAllByRole("listitem")).toHaveLength(3);
	});

	// Ensure Start calls onStart with the path not active
	it("Start button calls onStart", () => {
		const { container } = render(<PathMenu {...pathMenuProps} />);

		// Open menu and click start
		fireEvent.click(screen.getByRole("button", { name: "Open path menu" }));
		fireEvent.click(screen.getByRole("button", { name: "Start" }));

		expect(pathMenuProps.onStart).toHaveBeenCalledTimes(1);

		// Starting the path starts the closing animation
		expect(container.querySelector(".menu-panel")).toHaveClass("menu-transition-closing");
	});

	// Ensure the path information and callbacks are called properly
	it("Controlling the path works and callbacks are called properly", () => {
		render(
			<PathMenu
				{...pathMenuProps}
				pathActive={true}
				pathIndex={1}
			/>
		);

		fireEvent.click(screen.getByRole("button", { name: "Open path menu" }));

		// Current index is displayed
		expect(screen.getByText("2 / 3")).toBeInTheDocument();

		// The current idea has the path-current class
		const currentIdea = screen.getByText("Idea 2:").closest("li");

		expect(currentIdea).toHaveClass("path-current");

		// Active controls only call their callbacks
		expect(pathMenuProps.onPrev).toHaveBeenCalledTimes(0);
		fireEvent.click(screen.getByRole("button", { name: "Prev" }));
		expect(pathMenuProps.onPrev).toHaveBeenCalledTimes(1);
		expect(pathMenuProps.onNext).toHaveBeenCalledTimes(0);
		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		expect(pathMenuProps.onNext).toHaveBeenCalledTimes(1);
		expect(pathMenuProps.onStop).toHaveBeenCalledTimes(0);
		fireEvent.click(screen.getByRole("button", { name: "Stop" }));

		expect(pathMenuProps.onPrev).toHaveBeenCalledTimes(1);
		expect(pathMenuProps.onNext).toHaveBeenCalledTimes(1);
		expect(pathMenuProps.onStop).toHaveBeenCalledTimes(1);

		// Start should not appear while the path is active
		expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
	});

	// Ensure an empty path cannot be started
	it("Displays the empty message and disables Start when there are no ideas", () => {
		render(
			<PathMenu
				{...pathMenuProps}
				ideas={[]}
			/>
		);

		// No ideas gives No ideas yet in the menu and the start button disabled
		fireEvent.click(screen.getByRole("button", { name: "Open path menu" }));
		expect(screen.getByText("No ideas yet")).toBeInTheDocument();
		const startButton = screen.getByRole("button", { name: "Start" });
		expect(startButton).toBeDisabled();

		// Clicking the start button does not call onStart
		fireEvent.click(startButton);
		expect(pathMenuProps.onStart).not.toHaveBeenCalled();
	});
});
