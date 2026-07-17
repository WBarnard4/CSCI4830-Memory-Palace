// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi, } from "vitest";

import { render, screen, cleanup, fireEvent, } from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

import { Idea } from "@/model/room/idea/Idea.jsx";

let ideaProps;

const bathroomImage = "../../src/assets/generic_bathroom.jpg";

beforeEach(() => {
	// Idea Arguments
	ideaProps = {
		id: 1,
		type: "text",
		x: 25,
		y: 40,
		text: "Test Idea",
		imageId: null,
		imageSrc: null,
		highlighted: false,
		pathHighlighted: false,
		zIndex: 3,
		updateIdea: vi.fn(),
		deleteIdea: vi.fn(),
		openImagePicker: vi.fn(),
	};
});

afterEach(() => {
	// Reset the Idea Component before running new tests
	cleanup();
	vi.clearAllMocks();
});

describe("Idea Unit Tests", () => {
	// Ensure all information provided to the Idea is displayed correctly
	it("Idea Information is Displayed Correctly", () => {
		// Update the Idea to be an image with an ID from the DB
		ideaProps = {
			...ideaProps,
			type: "image",
			imageId: 10,
			imageSrc: bathroomImage,
		};

		render(<Idea {...ideaProps} />);

		const idea = screen.getByText("Test Idea");
		const image = screen.getByRole("img", { name: "User idea" });

		// Idea text and image are present
		expect(idea).toBeInTheDocument();
		expect(image).toBeInTheDocument();
		expect(image).toHaveAttribute("src", bathroomImage);

		// Idea position is correct
		expect(idea).toHaveStyle("left: 25%");
		expect(idea).toHaveStyle("top: 40%");
		expect(idea).toHaveStyle("z-index: 3");
	});

	// Text Idea callbacks work properly
	it("Text Idea Callback Arguments are Called Only On Correct Button Presses", () => {
		const { container } = render(<Idea {...ideaProps} />);

		// Callbacks have not been called yet
		expect(ideaProps.updateIdea).not.toHaveBeenCalled();
		expect(ideaProps.deleteIdea).not.toHaveBeenCalled();

		// Open Idea editing menu
		fireEvent.click(screen.getByText("Test Idea"));

		const posXInput = container.querySelector('input[name="posX"]');
		const posYInput = container.querySelector('input[name="posY"]');
		const textInput = container.querySelector('textarea[name="text"]');

		// Highlight calls the updateIdea callback with highlighted set to true
		fireEvent.click(screen.getByRole("button", { name: "Highlight" }));

		expect(ideaProps.updateIdea).toHaveBeenCalledWith({
			id: 1,
			type: "text",
			x: 25,
			y: 40,
			text: "Test Idea",
			imageId: null,
			imageSrc: null,
			highlighted: true,
		});

		// Remove the previous callback
		ideaProps.updateIdea.mockClear();

		// X value changed
		fireEvent.change(posXInput, { target: { value: "50", }, });

		// Y value changed
		fireEvent.change(posYInput, { target: { value: "60", }, });

		// Text value changed
		fireEvent.change(textInput, {
			target: {
				value: "Updated Test Idea",
			},
		});

		// Click submit
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));

		// updateIdea callback called with the proper updated values
		expect(ideaProps.updateIdea).toHaveBeenCalledTimes(1);
		expect(ideaProps.updateIdea).toHaveBeenCalledWith({
			id: 1,
			type: "text",
			x: 50,
			y: 60,
			text: "Updated Test Idea",
			imageId: null,
			imageSrc: null,
			highlighted: false,
		});

		// Open the Idea and delete the Idea with the button
		fireEvent.click(screen.getByText("Test Idea"));
		fireEvent.click(screen.getByRole("button", { name: "Delete Idea" }));

		// Ensure deleteIdea is called with the correct idea id.
		expect(ideaProps.deleteIdea).toHaveBeenCalledTimes(1);
		expect(ideaProps.deleteIdea).toHaveBeenCalledWith(1);
	});

	// Text Idea callbacks work properly
	it("Image Idea Callback Arguments are Called Only On Correct Button Presses", () => {
		// Idea is an image
		ideaProps = {
			...ideaProps,
			type: "image",
			imageId: 10,
			imageSrc: "/old-image.png",
			// callback for an image to give a new set image without needing the file picker window
			openImagePicker: vi.fn((imageCallback) => {
				imageCallback({
					imageId: 20,
					imageSrc: "/new-image.png",
				});
			}),
		};

		render(<Idea {...ideaProps} />);

		// Open Idea editing menu and click the Select Image button
		fireEvent.click(screen.getByRole("img", { name: "User idea" }));
		fireEvent.click(screen.getByRole("button", { name: "Select Image" }));

		// Ensure the image picker callback happened and the new image was added in the updateIdea callback.
		expect(ideaProps.openImagePicker).toHaveBeenCalledTimes(1);
		expect(ideaProps.updateIdea).toHaveBeenCalledWith({
			id: 1,
			type: "image",
			x: 25,
			y: 40,
			text: "Test Idea",
			imageId: 20,
			imageSrc: "/new-image.png",
			highlighted: false,
		});

		ideaProps.updateIdea.mockClear();

		// Highlight calls the updateIdea callback with highlighted set to true
		fireEvent.click(screen.getByRole("button", { name: "Highlight" }));

		expect(ideaProps.updateIdea).toHaveBeenCalledWith({
			id: 1,
			type: "image",
			x: 25,
			y: 40,
			text: "Test Idea",
			imageId: 10,
			imageSrc: "/old-image.png",
			highlighted: true,
		});

		// Remove the previous callback
		ideaProps.updateIdea.mockClear();

		// Submit Closes the change window and updateIdea is called
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));

		expect(ideaProps.updateIdea).toHaveBeenCalledWith({
			id: 1,
			type: "image",
			x: 25,
			y: 40,
			text: "Test Idea",
			imageId: 10,
			imageSrc: "/old-image.png",
			highlighted: false,
		});

		// Open the Idea and delete the Idea with the button
		fireEvent.click(screen.getByRole("img", { name: "User idea" }));
		fireEvent.click(screen.getByRole("button", { name: "Delete Idea" }));

		// Ensure deleteIdea is called with the correct idea id.
		expect(ideaProps.deleteIdea).toHaveBeenCalledTimes(1);
		expect(ideaProps.deleteIdea).toHaveBeenCalledWith(1);
	});

	// Ensure the Idea moves properly when a different X and Y value is provided to it
	it("X and Y values properly move the Idea", () => {
		const { rerender } = render(<Idea {...ideaProps} />);

		const idea = screen.getByText("Test Idea");

		// Idea begins at the right position
		expect(idea).toHaveStyle("left: 25%");
		expect(idea).toHaveStyle("top: 40%");

		// Position Changed
		rerender(
			<Idea
				{...ideaProps}
				x={70}
				y={15}
			/>
		);

		// Idea is at a new position
		expect(screen.getByText("Test Idea")).toHaveStyle("left: 70%");
		expect(screen.getByText("Test Idea")).toHaveStyle("top: 15%");
	});

	// Ensure highlighting works with manual highlighting and path targeting
	it("Idea Highlight Works Properly", () => {
		const { rerender } = render(<Idea {...ideaProps} />);

		// Idea is not highlighted
		expect(screen.getByText("Test Idea")).not.toHaveStyle("border: 2px solid #ffd700");

		// Manually highlight Idea
		rerender(
			<Idea
				{...ideaProps}
				highlighted={true}
			/>
		);

		// Idea is highlighted
		expect(screen.getByText("Test Idea")).toHaveStyle("border: 2px solid #ffd700");

		// Path highlights Idea
		rerender(
			<Idea
				{...ideaProps}
				highlighted={false}
				pathHighlighted={true}
			/>
		);

		// Idea is highlighted
		expect(screen.getByText("Test Idea")).toHaveStyle("border: 2px solid #ffd700");
	});
});
