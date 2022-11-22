//#region IMPORTS
// Libraries
import React from "react"

// Components
import { ReactComponent as Stopwatch } from "~/Assets/addtime.svg"
import { ReactComponent as Project } from "~/Assets/project.svg"
import { ReactComponent as Task } from "~/Assets/task.svg"
import { CardTitle } from "~/Components/Titles"
import { Card } from "react-bootstrap"

// Styles
import styles from "./Home__QuickActions.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { IModal } from "~/Types/modal"

// Views
import ModalC from "~/Helpers/ModalConfigs"

//#endregion
// --------------------------------------------------

const QuickActions = (showModal: IModal["showModal"]) => {
	const newTask = () => showModal(ModalC.TaskCrUpForm({action: "create"}))
	const newProject = () => showModal(ModalC.ProjectCrUpForm({action: "create"}))
	const newTimer = () => showModal(ModalC.TimeRecordCrUpForm({action: "create"}))

	return (
		<div id={cx("quick-actions")}>
			<CardTitle>Quick actions</CardTitle>
			<div className="d-flex flex-wrap gap-2">
				{/* Create task */}
				<Card className="flex-grow-1 p-3" id={cx("quick-action__new-task")} onClick={() => newTask()}>
					<div className="d-flex align-items-center gap-3 h5 m-0">
						<Task/>
						<p className="m-0 fs-7">Create new task</p>
					</div>
				</Card>


				{/* Track time */}
				<Card className="flex-grow-1 p-3" id={cx("quick-action__track-time")} onClick={() => newTimer()}>
					<div className="d-flex align-items-center gap-3 h5 m-0">
						<Stopwatch/>
						<p className="m-0 fs-7">Track time</p>
					</div>
				</Card>


				{/* Start project */}
				<Card className="flex-grow-1 p-3" id={cx("quick-action__new-project")} onClick={() => newProject()}>
					<div className="d-flex align-items-center gap-3 h5 m-0">
						<Project/>
						<p className="m-0 fs-7">Start new project</p>
					</div>
				</Card>
			</div>
		</div>
	)
}

export default QuickActions