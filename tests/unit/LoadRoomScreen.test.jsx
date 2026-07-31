// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import LoadRoomScreen from "@/model/main-screens/LoadRoomScreen";
import HOME_STATES from "@/model/main-screens/States.jsx"

let props;

describe("LoadRoomScreen Unit Tests", () => {
    beforeEach(async () => {
        props = {
            isOpen: HOME_STATES.LOAD,
            onClose: vi.fn(),
            onCloseLoad: vi.fn(),
        };
    });

    it("doesn't render without isOpen()", () => {
        render(<LoadRoomScreen isOpen={-1} />);
        expect(screen.queryByRole("button", { name: "Clear Search" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Select" })).not.toBeInTheDocument();
    });

    it("renders correctly", () => {
        render(<LoadRoomScreen {...props} />);
        expect(screen.queryByRole("button", { name: "Clear Search" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Select" })).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Search rooms...")).toBeInTheDocument();
    });
});