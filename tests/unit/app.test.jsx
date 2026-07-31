import { render, screen, cleanup, fireEvent, getByRole } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import App from "@/App";

describe("App System Tests", () => {

    it("navigates pages correctly", () => {
        render(<App />);

        // Opens Welcome Popup on HomeScreen
        expect(screen.getByText("Welcome to Memory Palace!")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();

        // Closes Welcome Popup
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(screen.getByText("Memory Palace")).toBeInTheDocument();
        expect(screen.getByText("Pick a Background Room")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Load Room" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "New Room" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Info" })).toBeInTheDocument();

        // Open Welcome Popup again
        fireEvent.click(screen.getByRole("button", { name: "Info" }));
        expect(screen.getByText("Welcome to Memory Palace!")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Close" }));

        // Open LoadRoom
        fireEvent.click(screen.getByRole("button", { name: "Load Room" }));
        expect(screen.queryByRole("button", { name: "Clear Search" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Select" })).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Search rooms...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Back to home" })).toBeInTheDocument();

        // Goes Home
        fireEvent.click(screen.getByRole("button", { name: "Back to home" }));
        expect(screen.getByRole("button", { name: "Load Room" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "New Room" })).toBeInTheDocument();

        // Opens NewRoom
        fireEvent.click(screen.getByRole("button", { name: "New Room" }));
        fireEvent.click(screen.queryByRole("button", { name: "Bedroom" }));
        expect(screen.getByDisplayValue("Bedroom")).toBeInTheDocument();
        
        // Creates New Room
        fireEvent.click(screen.getByRole("button", { name: "Create Room" }));

    });

});