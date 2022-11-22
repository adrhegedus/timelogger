import { DateTime } from "luxon"
import { Task } from "~/Types/models"


/** Returns the start time. */
export const getStartTime = () => {
	const _st = localStorage.getItem("startTime")
	return _st ? DateTime.fromISO(_st) : null
}

/** Returns whether the tracker is currently running. */
export const isTracking = () => localStorage.getItem("startTime") !== null


/** Starts a new time registration timer, by storing the current time in the local storage. */
export const startTracking = (t: Pick<Task, "taskId" | "name">) => {
	if (getStartTime() === null) {
		const _startTime = DateTime.now()

		localStorage.setItem("startTime", _startTime.toISO())
		localStorage.setItem("task", JSON.stringify(t))
		return
	}

	throw new Error("Time registration timer is already running.")
}


/** Stops the time registration timer and returns the timers calculated duration. */
export const stopTracking = () => {
	const startTime = getStartTime() as DateTime
	const endTime = DateTime.now()

	localStorage.removeItem("startTime")
	localStorage.removeItem("task")

	return [startTime.toISO(), endTime.toISO()]
}