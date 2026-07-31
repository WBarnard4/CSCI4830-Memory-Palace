// @vitest-environment jsdom

import "fake-indexeddb/auto";

import { beforeAll, beforeEach, afterAll, describe, expect, it, vi, } from "vitest";

import { db, saveImage, getImageUrl, createRoom, getAllRooms, getAdjacentRoomId, updateRoomName, saveRoom, deleteRoom, loadRoom, } from "@/db/db.js";

const createObjectURLMock = vi.fn();

beforeAll(() => {
	Object.defineProperty(URL, "createObjectURL", {
		configurable: true,
		writable: true,
		value: createObjectURLMock,
	});
});

// Clear the database
beforeEach(async () => {
	await db.delete();
	await db.open();

	createObjectURLMock.mockReset();
	createObjectURLMock.mockReturnValue("blob:test-image");
});

// Test database removed at the end
afterAll(async () => {
	await db.delete();
});

// Creates a fake image file
function createTestImage(name = "test-image.png") {
	return new File(["fake image data"], name, { type: "image/png", });
}

// Unit tests for all database functions
describe("Database Unit Tests", () => {
	// The saveImage function properly saves an image data and getImageUrl returns the url from the db.
	it("saveImage saves an image and getImageUrl retreives its URL", async () => {
		const imageId = await saveImage(createTestImage());

		const storedImage = await db.images.get(imageId);
		const imageUrl = await getImageUrl(imageId);

		expect(storedImage.name).toBe("test-image.png");
		expect(imageUrl).toBe("blob:test-image");
		expect(createObjectURLMock).toHaveBeenCalledWith(storedImage.data);
	});

	// Ensure that null gets returned when no image exists with the provided imageId
	it("getImageUrl returns null when no image exists", async () => {
		const imageUrl = await getImageUrl(999);

		expect(imageUrl).toBeNull();
		expect(createObjectURLMock).not.toHaveBeenCalled();
	});

	// Ensure createRoom adds the information to the database properly.
	it("createRoom creates a room with given information", async () => {
		const roomId = await createRoom("Test Room", null, "/test-room.jpg");

		const room = await db.rooms.get(roomId);

		expect(room).toEqual({
			id: roomId,
			name: "Test Room",
			imageId: null,
			imgSrc: "/test-room.jpg",
		});
	});

	// Ensure getAllRooms returns rooms in the order they were added, newest first.
	it("getAllRooms gets all rooms from newest to oldest", async () => {
		await createRoom("First Room", null, "/first-room.jpg");
		await createRoom("Second Room", null, "/second-room.jpg");

		const rooms = await getAllRooms();

		expect(rooms).toHaveLength(2);
		expect(rooms[0].name).toBe("Second Room");
		expect(rooms[1].name).toBe("First Room");
	});

	// Ensure getAdjacentRoomId returns the proper room ids of neighboring rooms or null if none exist
	it("getAdjacentRoomId returns the adjacent room ids or null when none exist", async () => {
		const firstRoomId = await createRoom("First Room", null, null);

		expect(await getAdjacentRoomId(firstRoomId, 1)).toBeNull();

		const secondRoomId = await createRoom("Second Room", null, null);
		const thirdRoomId = await createRoom("Third Room", null, null);

		expect(await getAdjacentRoomId(thirdRoomId, 1)).toBe(secondRoomId);
		expect(await getAdjacentRoomId(thirdRoomId, -1)).toBe(firstRoomId);
		expect(await getAdjacentRoomId(999, 1)).toBeNull();
	});

	// Ensure updateRoomName actually updates the correct field in the database.
	it("updateRoomName updates the name of a room", async () => {
		const roomId = await createRoom("Old Name", null, null);

		await updateRoomName(roomId, "New Name");

		const room = await db.rooms.get(roomId);

		expect(room.name).toBe("New Name");
	});

	// Ensure saving, loading, and deleting functions for rooms all work properly.
	it("saveRoom, loadRoom, and deleteRoom save, load, and delete a room properly", async () => {
		const imageId = await saveImage(createTestImage("background.png"));

		const roomId = await saveRoom(
			{
				name: "Saved Room",
				imageId: imageId,
				imgSrc: null,
			},
			[
				{
					type: "text",
					x: 25,
					y: 40,
					title: "Test Idea",
					text: "Test Description",
				},
			]
		);

		const loadedRoom = await loadRoom(roomId);

		expect(loadedRoom.id).toBe(roomId);
		expect(loadedRoom.name).toBe("Saved Room");
		expect(loadedRoom.imageId).toBe(imageId);
		expect(loadedRoom.imgSrc).toBe("blob:test-image");
		expect(loadedRoom.ideas).toHaveLength(1);
		expect(loadedRoom.ideas[0].title).toBe("Test Idea");

		await deleteRoom(roomId);

		expect(await db.rooms.get(roomId)).toBeUndefined();
		expect(await db.ideas.where("roomId").equals(roomId).count()).toBe(0);
		expect(await db.images.get(imageId)).toBeUndefined();
	});

	// Ensure loading and deleting rooms that do not exist to return null and do nothing.
	it("Handles loading or deleting a room that does not exist", async () => {
		expect(await loadRoom(999)).toBeNull();
		await expect(deleteRoom(999)).resolves.toBeUndefined();
	});
});
