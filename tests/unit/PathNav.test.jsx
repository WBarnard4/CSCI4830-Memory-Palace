import { createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, test, vi } from "vitest";
import { PathNav } from "@/model/room/path/PathNav.jsx";

describe("PathNav Unit Tests", () => {
	// PathNav does not appear when active=false
	test("Does not appear when active=false", () => {
		render(
			<PathNav
				active={false}
				pathIndex={0}
				total={3}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>
		);

		expect(screen.queryByLabelText("Previous Path")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Next Path")).not.toBeInTheDocument();
	});

	// PathNav appears and display the current path position when active=true
	test("Previous and next buttons as well as the current path index appears when active=true", () => {
		render(
			<PathNav
				active={true}
				pathIndex={1}
				total={5}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>
		);

		expect(screen.getByLabelText("Previous Path")).toBeInTheDocument();
		expect(screen.getByLabelText("Next Path")).toBeInTheDocument();
		expect(screen.getByText("2 / 5")).toBeInTheDocument();
	});

	// Previous and Next buttons call their callbacks
	test("Previous Path button calls onPrev and Next Path button calls onNext", () => {
		const onPrev = vi.fn();
		const onNext = vi.fn();

		render(
			<PathNav
				active={true}
				pathIndex={1}
				total={5}
				onPrev={onPrev}
				onNext={onNext}
			/>
		);

		fireEvent.click(screen.getByLabelText("Previous Path"));
		fireEvent.click(screen.getByLabelText("Next Path"));

		expect(onPrev).toHaveBeenCalledTimes(1);
		expect(onNext).toHaveBeenCalledTimes(1);
	});

	// PathNav closes after the animation finishes
	test("PathNav stops appearing after active switches from true to false", () => {
		const { container, rerender } = render(
			<PathNav
				active={true}
				pathIndex={0}
				total={3}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>
		);

		rerender(
			<PathNav
				active={false}
				pathIndex={0}
				total={3}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>
		);

		waitFor(() => { expect(container.querySelector(".path-nav")) .toHaveClass("menu-transition-closing"); });
		const pathNav = container.querySelector(".path-nav");

		// Activate the closing animation ending
		const animationEvent = createEvent.animationEnd(pathNav);
		Object.defineProperty(animationEvent, "animationName", { value: "menu-panel-close", });
		fireEvent(pathNav, animationEvent);

		// PathNav no longer appears
		waitFor(() => { expect(screen.queryByLabelText("Previous Path")).not.toBeInTheDocument(); });

	});
});
