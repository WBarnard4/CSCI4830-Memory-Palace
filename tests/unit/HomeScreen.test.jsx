// @vitest-environment jsdom

import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import HomeScreen from "@/model/main-screens/HomeScreen";
import HOME_STATES from "@/model/main-screens/States.jsx"

let props;

describe("HomeScreen Unit Tests", () => {
    beforeEach(() => {
        props = {
            isOpen: HOME_STATES.MAIN,
            openLoad: vi.fn(),
            openNew: vi.fn(),
        };
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();

    });

    it("doesn't render without isOpen()", () => {
        render(<HomeScreen isOpen={-1} />);
        expect(screen.queryByRole("button", { name: "Load Room" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "New Room" })).not.toBeInTheDocument();
    });

    it("calls correct functions when buttons are clicked", async () => {
        render(<HomeScreen {...props} />)

        // Click Load Room
        fireEvent.click(screen.queryByRole("button", { name: "Load Room" }));
        expect(props.openLoad).toHaveBeenCalledTimes(1);

        // Click New Room
        fireEvent.click(screen.queryByRole("button", { name: "New Room" }));
        expect(props.openNew).toHaveBeenCalledTimes(1);

    });
});