//#region IMPORTS
// Libraries
import React, { useContext, useEffect, useMemo, useState } from "react"
import { DateTime, Duration } from "luxon"

// Components
import { Stopwatch as StopwatchIcon, StopFill } from "react-bootstrap-icons"
import { CardTitle } from "~/Components/Titles"
import { Card } from "react-bootstrap"

// Helpers
import { ModalContext } from "~/Helpers/ModalProvider"
import { stopTracking } from "~/Helpers/timeTracker"
import ModalC from "~/Helpers/ModalConfigs"

// Styles
import styles from "./TrackTimeView.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { Task } from "~/Types/models"

//#endregion
// --------------------------------------------------


export const TrackingTimeView = () => {
	const modalContext = useContext(ModalContext)

	type PartialTask = Pick<Task, "taskId" | "name">
	const [isTracking, setIsTracking] = useState(localStorage.getItem("startTime") !== null)
	const task = useMemo(() => (
		localStorage.getItem("task") !== null
			? JSON.parse(localStorage.getItem("task") as string)
			: null
	), [])


	const startTime = useMemo(() => (
		localStorage.getItem("startTime") !== null
			? DateTime.fromISO(localStorage.getItem("startTime") as string)
			: null
	), [])


	const [duration, setDuration] = useState(startTime !== null
		? DateTime.now().diff(startTime as DateTime, ["hours", "minutes", "seconds"])
		: Duration.fromObject({ hours: 0, minutes: 0, seconds: 0 }))


	// Update duration every second
	useEffect(() => {
		if (isTracking) {
			const interval = setInterval(() => setDuration(duration => duration.plus({second: 1})), 1000)
			return () => {
				clearInterval(interval)
			}
		}
	}, [isTracking])


	// Stop tracking handler
	const onStopTracking = () => {
		const [startTime, endTime] = stopTracking()
		setIsTracking(false)
		modalContext.showModal(ModalC.TimeRecordCrUpForm({
			action: "create",
			timeRecord: {
				startTime: startTime,
				endTime: endTime,
				taskId: (task as PartialTask).taskId,
			},
			taskId: (task as PartialTask).taskId,
		}))
	}


	if (!isTracking) { return null }

	return (
		<div>
			<CardTitle>Time tracking</CardTitle>
			<div className="d-flex">
				<Card>
					<div
						className={cx("track-time__timer-view", "d-flex align-items-center gap-2 px-3 py-2 w-100")}
						onClick={() => onStopTracking()}
					>
						<StopwatchIcon id={cx("track-time__timer-view__stopwatch-icon")} />
						<StopFill id={cx("track-time__timer-view__stop-icon")} />
						<div><b>{(task as PartialTask).name}:</b> {duration.toFormat("hh:mm:ss")}</div>
					</div>
				</Card>
			</div>
		</div>
	)
}