import { render, screen, cleanup, fireEvent, getByRole } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import RoomScreen from "@/model/room/RoomScreen";

let roomProps;

describe("RoomScreen Unit Tests", () => {
    beforeEach(() => {
        roomProps = {
            roomData: {name:"Test Room"},
            updateRoomData: vi.fn(),
            openImagePicker: vi.fn(),
            onGoHome: vi.fn(),
            onGoLoad: vi.fn(),
            onGoNew: vi.fn(),
            onChangeRoom: vi.fn(),
        }
    });

    it("renders menus correctly", () => {
        render(<RoomScreen {...roomProps} />);

        // Menu and Path Menu load
        expect(screen.getByRole("button", {name: "Open menu"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Open path menu"})).toBeInTheDocument();

        // Clicking Menu opens it
        fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
        expect(screen.getByText("Test Room")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Open path menu" }));
        expect(screen.getByText("Path Order")).toBeInTheDocument();
    });

    it("creates an idea correctly", () => {
        const {container} = render(<RoomScreen {...roomProps} />);
        const background = container.querySelector("div.room");

        // Open Idea creation menu
        fireEvent.doubleClick(background);
        expect(screen.getByRole("button", {name: "X"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Text"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Image"})).toBeInTheDocument();

        // Create Text Idea
        fireEvent.click(screen.getByRole("button", {name: "Text"}));
        expect(screen.getByText("New Text Idea")).toBeInTheDocument();


    });
});