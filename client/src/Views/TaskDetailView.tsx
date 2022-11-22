//#region IMPORTS
// Libraries
import React, { useContext, useEffect, useState } from "react"
import { Redirect } from "react-router-dom"
import { DateTime, Duration } from "luxon"

// Components
import { ListNested, Pencil, Stopwatch, XLg } from "react-bootstrap-icons"
import { Button, Card, Spinner } from "react-bootstrap"
import { CardTitle } from "~/Components/Titles"

// Fragments
import { SubtasksTable, TimeRecordsTable } from "~/Fragments/TaskDetail__Tables"
import TaskAttributes from "~/Fragments/Task__Attributes"

// Helpers
import { get_for_taskDetail, HTTP_STATUS } from "~/Helpers/api"
import { ModalContext } from "~/Helpers/ModalProvider"
import DelC from "~/Helpers/DeleteConfirmationConfigs"
import ModalC from "~/Helpers/ModalConfigs"

// Styles
import styles from "./TaskDetailView.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { ITimeRecordFormProps } from "~/Forms/TimeRecordForm"
import { Task } from "~/Types/models"

//#endregion
// --------------------------------------------------


const TaskDetailView = (props: { taskId: number }) => {
	//#region SETUP
	const modalContext = useContext(ModalContext)
	const { showModal, populateModalWithHistory, isModalOpen } = modalContext

	const [task, setTask] = useState<Task>({} as Task)
	const [loading, setLoading] = useState(true)
	const [redirect, setRedirect] = useState(false)

	// Fetch resources
	useEffect(() => {
		get_for_taskDetail(props.taskId, showModal)
			.then((res) => {
				if (res.status === HTTP_STATUS.OK) {
					const processedRes: Task = {
						...res.data,
						deadline: DateTime.fromISO(res.data.deadline as string),
						trackedMillis: Duration.fromMillis(res.data.trackedMillis as number)
							.shiftTo("hours", "minutes")
					}

					setTask(processedRes)
				}

				// If the task doesn't exist, force redirect to /tasks
				// Modal from the request will inform the user
				else { setRedirect(true) }

				setLoading(false)
			})
	}, [props.taskId])

	//#endregion
	// --------------------------------------------------


	//#region HANDLERS
	const handleEditTask = () => {
		isModalOpen
			? populateModalWithHistory(ModalC.TaskCrUpForm({ action: "update", task }))
			: showModal(ModalC.TaskCrUpForm({ action: "update", task }))
	}

	const handleDeleteTask = () => {
		isModalOpen
			? populateModalWithHistory(ModalC.DeleteConfirmation(DelC.Task(task)))
			: showModal(ModalC.DeleteConfirmation(DelC.Task(task)))
	}

	const handleAddSubtask = () => {
		isModalOpen
			? populateModalWithHistory(ModalC.TaskCrUpForm({ action: "create", parentTaskId: task.taskId }))
			: showModal(ModalC.TaskCrUpForm({ action: "create", parentTaskId: task.taskId }))
	}

	//#endregion
	// --------------------------------------------------


	if (!loading && redirect) return <Redirect to="/tasks" />

	return (
		<div className={cx("task-detail-view", "d-flex flex-column gap-5")}>
			<div>
				{/* Header */}
				<header className="mb-3">
					<div className="h1 mb-1 d-flex align-items-center gap-2">
						{task.name}
					</div>
					{task.description && <i className="text-muted">{task.description}</i>}
					<hr/>
				</header>


				{/* Attributes */}
				<div className={cx("attributes", "container gap-3")}>
					{loading
						? <Spinner animation="border" />
						: <TaskAttributes {...task} />
					}
				</div>
				<hr/>


				{/* Actions */}
				<div className="actions d-flex gap-2 justify-content-end container">
					<Button
						variant={"outline-secondary"}
						size={"sm"}
						className={"d-flex align-items-center gap-1"}
						onClick={handleAddSubtask}
					>
						<ListNested />&nbsp;Add subtask
					</Button>

					<Button
						variant={"outline-primary"}
						size={"sm"}
						className={"d-flex align-items-center gap-1"}
						onClick={handleEditTask}
					>
						<Pencil />&nbsp;Edit
					</Button>

					<Button
						variant={"outline-danger"}
						size={"sm"}
						className={"d-flex align-items-center gap-1"}
						onClick={handleDeleteTask}
					>
						<XLg />&nbsp;Delete
					</Button>
				</div>
			</div>


			{/* Subtasks */}
			{loading
				? <Spinner animation="border"/>
				: <SubtasksTable
					subtasks={task.subtasks}
					parentTaskId={task.taskId}
					modalContext={modalContext}
				/>
			}


			{/* Time tracking */}
			<div id={cx("times-card")} className={cx("my-0")}>
				<CardTitle>Time registrations</CardTitle>
				<Card>
					<Card.Body className="p-4 gap-4 overflow-auto">
						{<TimeRecordsTable task={task} modalContext={modalContext}/>}
					</Card.Body>
					<Card.Footer className="p-3 d-flex justify-content-end">
						<Button
							variant="outline-secondary"
							size="sm"
							type="button"
							id="createProject"
							className="align-items-center d-flex gap-1"
							onClick={() => {
								const payload: ITimeRecordFormProps = { action: "create", taskId: props.taskId }
								isModalOpen
									? populateModalWithHistory(ModalC.TimeRecordCrUpForm(payload))
									: showModal(ModalC.TimeRecordCrUpForm(payload))
							}}
						>
							<Stopwatch />&nbsp;Track time
						</Button>
					</Card.Footer>
				</Card>
			</div>
		</div>
	)
}

export default TaskDetailView