// @vitest-environment jsdom

import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { db, createRoom } from "@/db/db.js";

import LoadRoomScreen from "@/model/main-screens/LoadRoomScreen";
import HOME_STATES from "@/model/main-screens/States.jsx"

let props;
let roomProps1;
let roomProps2;

describe("LoadRoomScreen Unit Tests", () => {
    beforeEach(async () => {
        props = {
            isOpen: HOME_STATES.LOAD,
            onClose: vi.fn(),
            onCloseLoad: vi.fn(),
        };

        // Clear rooms table before tests are run
        // db.rooms.clear();


        // Fill rooms table with test data
        roomProps1 = {
            name: "bathroom"
        }
        roomProps2 = {
            name: "living room"
        }
        await createRoom("roomProps1", null, null);
        await createRoom("roomProps2", null, null);

        db.rooms.add({
            name: "bathroom"
        });

        
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();

    });

    it("doesn't render without isOpen()", () => {
        render(<LoadRoomScreen isOpen={-1} />);
        expect(screen.queryByRole("button", { name: "Clear Search" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Select" })).not.toBeInTheDocument();
    });


    // Room test data should be loaded, but "No saved rooms yet" is all that shows
    it("dispays stored rooms correctly", async () => {

        render(<LoadRoomScreen {...props} />);

        expect(await screen.getByDisplayValue("bathroom")).toBeInTheDocument();
    });

});