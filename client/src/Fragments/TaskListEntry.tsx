//#region IMPORTS
// Libraries
import { ArgumentArray } from "classnames"
import { Link } from "react-router-dom"
import { Duration } from "luxon"
import React from "react"

// Components
import { ArrowReturnRight, Pencil, Stopwatch, XLg } from "react-bootstrap-icons"
import { Badge } from "react-bootstrap"

// Helpers
import DelC from "~/Helpers/DeleteConfirmationConfigs"
import ModalC from "~/Helpers/ModalConfigs"

// Types
import { Project, Task } from "~/Types/models"
import { IModal } from "~/Types/modal"

//#endregion
// --------------------------------------------------


const TaskListEntry = ({ t, p, cx, showModal, isSubtask, from }: ITaskListProps) => {
	t.trackedMillis = Duration.fromMillis(t.trackedMillis as number)
		.shiftTo("hours", "minutes")

	return (
		<>
			<td>
				<span className="d-flex align-items-center gap-2 justify-content-between">
					{/* Name with link */}
					<Link
						to={`/task/${t.taskId}`}
						onClick={(e) => e.stopPropagation()}
						className={cx("d-flex align-items-center gap-2", "link-muted")}
					>
						{isSubtask && <ArrowReturnRight className="ms-2 opacity-50" />}
						{t.name}
					</Link>


					{/* Spacer */}
					<div className="flex-grow-1"/>


					{/* Actions */}
					<span className={cx("prog-disclosure", "d-flex align-items-center fs-7 gap-2")}>
						{/* Track time */}
						<div title="Track time" onClick={(e) => {
							e.stopPropagation()
							showModal(ModalC.TimeRecordCrUpForm({
								action: "create",
								taskId: t.taskId
							}))
						}}><Stopwatch/></div>


						{/* Edit */}
						<div title="Edit" onClick={(e) => {
							e.stopPropagation()
							showModal(ModalC.TaskCrUpForm({
								action: "update",
								task: t
							}))
						}}><Pencil/></div>


						{/* Delete */}
						<div className="text-danger" title="Delete" onClick={(e) => {
							e.stopPropagation()
							showModal(ModalC.DeleteConfirmation(DelC.Task(t)))
						}}><XLg/></div>
					</span>
				</span>
			</td>

			{/* Status */}
			{ (from === "tasks" || from === "project")
				? <td>
					<Badge bg={t.isCompleted ? "success" : "info"}>
						{t.isCompleted ? "Completed" : "In progress"}
					</Badge>
				</td>
				: null
			}

			{/* Project */}
			{ from === "home"
				? <td>
					<Link to={`/project/${(p as Project).projectId}`} className="link-muted">
						{(p as Project).name}
					</Link>
				</td>
				: null
			}

			{/* Tracked time */}
			<td>
				{(t.trackedMillis as Duration).toHuman({ unitDisplay: "narrow" })}
			</td>
		</>
	)
}

export default TaskListEntry

interface ITaskListProps {
	t: Task,
	p?: Project,
	cx: (...args: ArgumentArray) => string
	from: "home" | "project" | "tasks"
	showModal: IModal["showModal"]
	isSubtask?: boolean
}