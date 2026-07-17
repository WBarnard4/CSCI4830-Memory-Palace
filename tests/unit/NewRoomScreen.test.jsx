// @vitest-environment jsdom

import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import NewRoomScreen from "@/model/main-screens/NewRoomScreen";
import HOME_STATES from "@/model/main-screens/States.jsx"

let props;

describe("NewRoomScreen Unit Tests", () => {
    beforeEach(() => {
        props = {
            isOpen: HOME_STATES.NEW,
            onClose: vi.fn(),
            onGoHome: vi.fn(),
            openImagePicker: vi.fn(),
        };
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();

    });

    it("updates create menu form with correct room data", async () => {
        render(<NewRoomScreen {...props} />)

        // Click different rooms 
        fireEvent.click(screen.queryByRole("button", { name: "Bedroom" }));
        expect(screen.getByDisplayValue("Bedroom")).toBeInTheDocument();

        fireEvent.click(screen.queryByRole("button", { name: "Living Room" }));
        expect(screen.getByDisplayValue("Living Room")).toBeInTheDocument();

        fireEvent.click(screen.queryByRole("button", { name: "Kitchen" }));
        expect(screen.getByDisplayValue("Kitchen")).toBeInTheDocument();

        fireEvent.click(screen.queryByRole("button", { name: "Bathroom" }));
        expect(screen.getByDisplayValue("Bathroom")).toBeInTheDocument();

        // Inputting new name
        const nameInput = screen.getByDisplayValue("Bathroom");

        fireEvent.change(nameInput, {
            target: {
                value: "New Room",
            },
        });
        expect(screen.getByDisplayValue("New Room")).toBeInTheDocument();


        fireEvent.click(screen.getByRole("button", { name: "Choose Background" }));
        expect(props.openImagePicker).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: "Create Room" }));
        expect(props.onClose).toHaveBeenCalledTimes(1);

    });
});