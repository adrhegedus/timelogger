//#region IMPORTS
// Libraries
import { yupResolver } from "@hookform/resolvers/yup"
import React, { useContext, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { DateTime } from "luxon"
import * as yup from "yup"
import axios from "axios"

// Components
import { Button, Col, Form, Row, Spinner } from "react-bootstrap"
import { ActionTitle } from "~/Components/Titles"

// Helpers
import { create_time_record, get_for_timeRecordsForm, update_time_record } from "~/Helpers/api"
import { isTracking, startTracking } from "~/Helpers/timeTracker"
import { ModalContext } from "~/Helpers/ModalProvider"

// Styles
import styles from "./Forms.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { Task, TimeRecord } from "~/Types/models"
import ModalC from "~/Helpers/ModalConfigs"

//#endregion
// --------------------------------------------------


/**
 * Type definition for the inputs of the TimeRecord form.
 * Includes settable properties of the TimeRecord model.
 */
export type TimeRecordWritableProperties = Pick<TimeRecord, "note" | "startTime" | "endTime" | "taskId">

const TimeRecordForm = (props: ITimeRecordFormProps) => {
	//#region SETUP
	// Modal
	const modalContext = useContext(ModalContext)

	// TimeRecord
	const timeRecord = typeof(props.timeRecord) === "undefined"
		? undefined
		: props.timeRecord as TimeRecord

	if (timeRecord !== undefined) {
		timeRecord.startTime = DateTime.fromISO(timeRecord.startTime as string)
		timeRecord.endTime = DateTime.fromISO(timeRecord.endTime as string)
	}

	// Get names
	const [tasks, setTasks] = useState<Task[]>([] as Task[])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		get_for_timeRecordsForm().then((res) => {
			setTasks(res.data)
			setLoading(false)
		})
	}, [])

	// Task ID for tracking
	const [taskId, setTaskId] = useState<number | undefined>(props.taskId)

	//#endregion
	// --------------------------------------------------

	//#region Form setup
	const validationSchema = yup.object().shape({
		note: yup.string(),
		startTime: yup.date().required("Time records must have a start time.")
			.nullable()
			.typeError("Time records must have a start time.")
			.test("is-valid-date", "Start time must be a valid date.", (value) => {
				if (value === undefined) return true
				return DateTime.fromJSDate(value as Date).isValid
			}),
		endTime: yup.date().required("Time records must have an end time.")
			.nullable()
			.typeError("Time records must have an end time.")
			.test("is-valid-date", "End time must be a valid date.", (value) => {
				if (value === undefined) return true
				return DateTime.fromJSDate(value as Date).isValid
			})
			.test("is-after-start", "End time must be after start time.", function (value) {
				if (value === undefined) return true
				const startTime = this.parent.startTime as Date
				return DateTime.fromJSDate(value as Date) > DateTime.fromJSDate(startTime)
			})
			.test("is-at-least-30-minutes", "Time records must be at least 30 minutes long.", function (value) {
				if (value === undefined) return true
				const startTime = this.parent.startTime as Date
				return (
					DateTime.fromJSDate(value as Date)
						.diff(DateTime.fromJSDate(startTime), "minutes")
						.minutes >= 30
				)
			}),
		taskId: yup.number().required()
			.typeError("Time records must be assigned to a specific task.")
			.test("is-valid-task", "Task must be a valid task.", (value) => {
				if (value === undefined) return true
				return tasks.some(t => t.taskId === value)
			})
			.test("is-unfinished-project", "Time records cannot be assigned to a finished project.", (value) => {
				if (value === undefined) return true
				return tasks.find(t => t.taskId === value)?.project?.isCompleted === false
			})
	})


	const { register, handleSubmit, formState: { errors }, watch, setValue} =
		useForm<TimeRecordWritableProperties>({ resolver: yupResolver(validationSchema) })

	// Set up watch for instant calculation of duration
	const w_startTime = watch("startTime", timeRecord?.startTime)
	const w_endTime = watch("endTime", timeRecord?.endTime)


	const onSubmit = (data: TimeRecordWritableProperties) => {
		const cancelToken = axios.CancelToken.source()

		if (props.action === "create") { create_time_record(data, cancelToken, modalContext) }
		else { update_time_record(data, (timeRecord as TimeRecord).timeRecordId, cancelToken, modalContext) }
	}

	// Memoize names, so that they don't recalculate on re-render
	const taskNames = useMemo(() => (
		tasks.map((t) => (
			<option value={t.name} key={t.taskId}>
				{t.project.name}
			</option>
		))
	), [tasks])

	//#endregion
	// --------------------------------------------------


	if (loading) {
		return (
			<div id="timeRecord-form">
				<ActionTitle>
					{props.action === "create"
						? "Creating a new time record"
						: "Making changes to time record"}
				</ActionTitle>
				<Spinner animation={"border"} />
			</div>
		)
	}

	return (
		<div id="timeRecord-form">
			<ActionTitle>
				{props.action === "create"
					? "Creating a new time record"
					: "Making changes to time record"}
			</ActionTitle>
			<div className={cx("form container")}>
				<Form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">

					{/* Task */}
					<Form.Group controlId="taskId" className="mb-3">
						<Form.Label>Associate with task</Form.Label>
						{/* Actual TaskId field */}
						<Form.Control
							{...register("taskId")}
							hidden={true}
							defaultValue={props.taskId}
						/>

						{/* Shadow TaskId field with datalist for easier selection */}
						<Form.Control
							onChange={(e) => {
								const t = tasks.find(t => t.name === e.target.value)
								if (t) {
									setValue("taskId", t.taskId)
									setTaskId(t.taskId)
								}
							}}
							defaultValue={props.taskId ? tasks.find(t => t.taskId === props.taskId)?.name : undefined}
							list="tasks"
							isInvalid={!!errors.taskId}
						/>
						<datalist id="tasks">{taskNames}</datalist>
						<Form.Control.Feedback type="invalid">
							{errors.taskId && errors.taskId.message}
						</Form.Control.Feedback>
					</Form.Group>


					{/* Times */}
					<div>
						<Row className="mb-2">
							{/* Start time */}
							<Col>
								<Form.Group controlId="startTime">
									<Form.Label>From</Form.Label>
									<Form.Control
										{...register("startTime", { required: true })}
										type={"datetime-local"}
										defaultValue={
											((timeRecord?.startTime as DateTime) ?? DateTime.now())
												.toFormat("yyyy-MM-dd'T'HH:mm")
										}
										isInvalid={!!errors.startTime}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.startTime && errors.startTime.message}
									</Form.Control.Feedback>
								</Form.Group>
							</Col>


							{/* End time */}
							<Col>
								<Form.Group controlId="endTime">
									<Form.Label>Until</Form.Label>
									<Form.Control
										{...register("endTime", { required: true })}
										type={"datetime-local"}
										defaultValue={
											((timeRecord?.endTime as DateTime) ?? DateTime.now().plus({ minutes: 30 }))
												.toFormat("yyyy-MM-dd'T'HH:mm")
										}
										isInvalid={!!errors.endTime}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.endTime && errors.endTime.message}
									</Form.Control.Feedback>
								</Form.Group>
							</Col>
						</Row>

						{/* Calculated duration */}
						<div className="text-muted fst-italic mb-3">
							→&nbsp;
							{(w_startTime && w_endTime)
								? DateTime.fromISO(w_endTime as string)
									.diff(DateTime.fromISO(w_startTime as string))
									.shiftTo("hours", "minutes")
									.toHuman({ unitDisplay: "narrow" })
								: "0h, 30m"}
						</div>
					</div>


					{/* Note */}
					<Form.Group controlId="note" className="mb-3">
						<Form.Label>Note</Form.Label>
						<Form.Control
							{...register("note")}
							as={"textarea"}
							defaultValue={timeRecord?.note ?? ""}
						/>
					</Form.Group>


					{/* Buttons */}
					<div className="align-self-end mt-4 d-flex gap-2">
						{/* Show tracker option if TaskId is picked */}
						{typeof taskId === "undefined"
							? null
							: <Button variant="secondary" type="button" onClick={() => {
								if (isTracking()) {
									modalContext.populateModal(ModalC.TimeTrackerAlreadyTracking())
								}

								else {
									const task = tasks.find(t => t.taskId === taskId) as Task
									modalContext.hideModal()
									startTracking({ taskId: task.taskId, name: task.name })
									window.location.reload()
								}
							}}>
								Start a timer
							</Button>}

						{/* Submit */}
						<Button type="submit" variant="primary">
							{props.action === "create"
								? "Create"
								: "Save changes"}
						</Button>
					</div>
				</Form>
			</div>
		</div>
	)
}

export default TimeRecordForm

export interface ITimeRecordFormProps {
	action: "create" | "update"
	timeRecord?: TimeRecordWritableProperties
	taskId?: number
}