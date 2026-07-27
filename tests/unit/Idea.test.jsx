// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi, } from "vitest";

import { render, screen, cleanup, fireEvent, } from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

import { Idea } from "@/model/room/idea/Idea.jsx";

let ideaProps;

const bathroomImage = "../../src/assets/generic_bathroom.jpg";

/**
 * Ideas open their editor on a click (pointer down + up with no
 * movement between) and move/resize/rotate via pointer drags, so
 * tests interact through pointer events rather than click events.
 */
function pointerClick(element) {
	fireEvent.pointerDown(element, { button: 0, pointerId: 1 });
	fireEvent.pointerUp(element, { button: 0, pointerId: 1 });
}

/**
 * Fake room the Idea converts pointer pixels into percentages
 * with: 1000x500 base pixels, positioned at the page origin.
 */
const fakeRoomRef = {
	current: {
		getBoundingClientRect: () => ({
			width: 1000,
			height: 500,
			left: 0,
			top: 0,
		}),
		offsetWidth: 1000,
		offsetHeight: 500,
	},
};

const fakeRoomBase = { width: 1000, height: 500 };

/** The styled idea box is the parent of the text span / image. */
function getIdeaBox(childElement) {
	return childElement.parentElement;
}

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
		roomRef: fakeRoomRef,
		roomBaseDimensions: fakeRoomBase,
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
		// Text idea displays its text at the right position
		render(<Idea {...ideaProps} />);

		const textBox = getIdeaBox(screen.getByText("Test Idea"));
		expect(textBox).toHaveStyle("left: 25%");
		expect(textBox).toHaveStyle("top: 40%");
		expect(textBox).toHaveStyle("z-index: 3");

		cleanup();

		// Image idea displays its image; text is not rendered for
		// image ideas.
		render(
			<Idea
				{...ideaProps}
				type="image"
				imageId={10}
				imageSrc={bathroomImage}
			/>
		);

		const image = screen.getByRole("img", { name: "User idea" });
		expect(image).toBeInTheDocument();
		expect(image).toHaveAttribute("src", bathroomImage);
		expect(screen.queryByText("Test Idea")).not.toBeInTheDocument();

		const imageBox = getIdeaBox(image);
		expect(imageBox).toHaveStyle("left: 25%");
		expect(imageBox).toHaveStyle("top: 40%");
	});

	// Text Idea callbacks work properly
	it("Text Idea Callback Arguments are Called Only On Correct Button Presses", () => {
		const { container } = render(<Idea {...ideaProps} />);

		// Callbacks have not been called yet
		expect(ideaProps.updateIdea).not.toHaveBeenCalled();
		expect(ideaProps.deleteIdea).not.toHaveBeenCalled();

		// Open Idea editing menu (pointer click, no movement)
		pointerClick(screen.getByText("Test Idea"));

		const textInput = container.querySelector('textarea[name="text"]');

		// Highlight calls the updateIdea callback with highlighted set to true
		fireEvent.click(screen.getByRole("button", { name: "Highlight" }));

		expect(ideaProps.updateIdea).toHaveBeenCalledWith({
			id: 1,
			type: "text",
			x: 25,
			y: 40,
			w: null,
			h: null,
			r: 0,
			text: "Test Idea",
			imageId: null,
			imageSrc: null,
			highlighted: true,
		});

		// Remove the previous callback
		ideaProps.updateIdea.mockClear();

		// Text value changed
		fireEvent.change(textInput, {
			target: {
				value: "Updated Test Idea",
			},
		});

		// Click submit
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));

		// updateIdea callback called with the updated text; position
		// is unchanged since moving is done by dragging, not the form.
		expect(ideaProps.updateIdea).toHaveBeenCalledTimes(1);
		expect(ideaProps.updateIdea).toHaveBeenCalledWith({
			id: 1,
			type: "text",
			x: 25,
			y: 40,
			w: null,
			h: null,
			r: 0,
			text: "Updated Test Idea",
			imageId: null,
			imageSrc: null,
			highlighted: false,
		});

		// Open the Idea and delete the Idea with the button
		pointerClick(screen.getByText("Test Idea"));
		fireEvent.click(screen.getByRole("button", { name: "Delete Idea" }));

		// Ensure deleteIdea is called with the correct idea id.
		expect(ideaProps.deleteIdea).toHaveBeenCalledTimes(1);
		expect(ideaProps.deleteIdea).toHaveBeenCalledWith(1);
	});

	// Image Idea callbacks work properly
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
		pointerClick(screen.getByRole("img", { name: "User idea" }));
		fireEvent.click(screen.getByRole("button", { name: "Select Image" }));

		// Ensure the image picker callback happened and the new image was added in the updateIdea callback.
		expect(ideaProps.openImagePicker).toHaveBeenCalledTimes(1);
		expect(ideaProps.updateIdea).toHaveBeenCalledWith({
			id: 1,
			type: "image",
			x: 25,
			y: 40,
			w: null,
			h: null,
			r: 0,
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
			w: null,
			h: null,
			r: 0,
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
			w: null,
			h: null,
			r: 0,
			text: "Test Idea",
			imageId: 10,
			imageSrc: "/old-image.png",
			highlighted: false,
		});

		// Open the Idea and delete the Idea with the button
		pointerClick(screen.getByRole("img", { name: "User idea" }));
		fireEvent.click(screen.getByRole("button", { name: "Delete Idea" }));

		// Ensure deleteIdea is called with the correct idea id.
		expect(ideaProps.deleteIdea).toHaveBeenCalledTimes(1);
		expect(ideaProps.deleteIdea).toHaveBeenCalledWith(1);
	});

	// Ensure the Idea moves properly when a different X and Y value is provided to it
	it("X and Y values properly move the Idea", () => {
		const { rerender } = render(<Idea {...ideaProps} />);

		const idea = getIdeaBox(screen.getByText("Test Idea"));

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
		expect(getIdeaBox(screen.getByText("Test Idea"))).toHaveStyle("left: 70%");
		expect(getIdeaBox(screen.getByText("Test Idea"))).toHaveStyle("top: 15%");
	});

	// Dragging an Idea commits the new position through updateIdea
	it("Dragging the Idea calls updateIdea with the new position", () => {
		render(<Idea {...ideaProps} />);

		const idea = getIdeaBox(screen.getByText("Test Idea"));

		// Drag 100px right and 50px down in a 1000x500 room:
		// +10% on both axes.
		fireEvent.pointerDown(idea, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
		fireEvent.pointerMove(idea, { pointerId: 1, clientX: 100, clientY: 50 });
		fireEvent.pointerUp(idea, { button: 0, pointerId: 1, clientX: 100, clientY: 50 });

		expect(ideaProps.updateIdea).toHaveBeenCalledWith({
			id: 1,
			type: "text",
			x: 35,
			y: 50,
			w: null,
			h: null,
			r: 0,
			text: "Test Idea",
			imageId: null,
			imageSrc: null,
			highlighted: false,
		});

		// A drag is not a click: the editor did not open.
		expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
	});

	// Ensure highlighting works with manual highlighting and path targeting
	it("Idea Highlight Works Properly", () => {
		const { rerender } = render(<Idea {...ideaProps} />);

		// Idea is not highlighted
		expect(getIdeaBox(screen.getByText("Test Idea"))).not.toHaveStyle("border: 2px solid #ffd700");

		// Manually highlight Idea
		rerender(
			<Idea
				{...ideaProps}
				highlighted={true}
			/>
		);

		// Idea is highlighted
		expect(getIdeaBox(screen.getByText("Test Idea"))).toHaveStyle("border: 2px solid #ffd700");

		// Path highlights Idea
		rerender(
			<Idea
				{...ideaProps}
				highlighted={false}
				pathHighlighted={true}
			/>
		);

		// Idea is highlighted
		expect(getIdeaBox(screen.getByText("Test Idea"))).toHaveStyle("border: 2px solid #ffd700");
	});
});
