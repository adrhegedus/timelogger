//#region IMPORTS
// Libraries
import React, { useContext, useEffect, useState } from "react"
import { DateTime, Duration } from "luxon"
import { Redirect } from "react-router-dom"

// Components
import { Pencil, XLg } from "react-bootstrap-icons"
import { Button, Card, Spinner } from "react-bootstrap"

// Fragments
import { TasksTable, TimeRecordsTable } from "~/Fragments/ProjectDetail__Tables"
import ProjectAttributes from "~/Fragments/Project__Attributes"

// Helpers
import { get_for_projectDetail, HTTP_STATUS } from "~/Helpers/api"
import { ModalContext } from "~/Helpers/ModalProvider"
import DelC from "~/Helpers/DeleteConfirmationConfigs"
import ModalC from "~/Helpers/ModalConfigs"

// Styles
import styles from "./ProjectDetailView.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { ITasksFormProps } from "~/Forms/TasksForm"
import { Project } from "~/Types/models"

//#endregion
// --------------------------------------------------


const ProjectDetailView = (props: { projectId: number }) => {
	//#region SETUP
	const { showModal, populateModalWithHistory, isModalOpen } = useContext(ModalContext)

	const [project, setProject] = useState<Project>({} as Project)
	const [timeByDate, setTimeByDate] = useState<{date: string, time: number}[]>()
	const [loading, setLoading] = useState(true)
	const [redirect, setRedirect] = useState(false)

	// Fetch project data
	useEffect(() => {
		get_for_projectDetail(props.projectId, showModal)
			.then((res) => {
				if (res.status === HTTP_STATUS.OK) {
					const processedRes: Project = {
						...res.data,
						deadline: DateTime.fromISO(res.data.deadline as string),
						trackedMillis: Duration.fromMillis(res.data.trackedMillis as number)
							.shiftTo("hours", "minutes")
					}

					setProject(processedRes)
					setTimeByDate(res.data.timeRecordsByDate)
				}

				// If the task doesn't exist, force redirect to /tasks
				// Modal from the request will inform the user
				else { setRedirect(true) }

				setLoading(false)
			})
	}, [props.projectId])

	//#endregion
	// --------------------------------------------------


	//#region HANDLERS
	const handleEditProject = () => {
		isModalOpen
			? populateModalWithHistory(ModalC.ProjectCrUpForm({action: "update", project}))
			: showModal(ModalC.ProjectCrUpForm({action: "update", project}))
	}

	const handleDeleteProject = () => {
		isModalOpen
			? populateModalWithHistory(ModalC.DeleteConfirmation(DelC.Project(project)))
			: showModal(ModalC.DeleteConfirmation(DelC.Project(project)))
	}

	//#endregion
	// --------------------------------------------------


	if (!loading && redirect) return <Redirect to="/projects" />

	return (
		<div className={cx("project-detail-view")}>
			{/* Header */}
			<header className="mb-3">
				<div className="h1 mb-1 d-flex align-items-center gap-2">
					{project.name}
				</div>
				{project.description && <i className="text-muted">{project.description}</i>}
				<hr/>
			</header>


			{/* Attributes */}
			<div className={cx("attributes", "container gap-3")}>
				{loading
					? <Spinner animation="border" />
					: <ProjectAttributes {...project} />
				}
			</div>
			<hr/>


			{/* Actions */}
			<div className="actions d-flex gap-2 justify-content-end container">
				<Button
					variant={"outline-primary"}
					size={"sm"}
					className={"d-flex align-items-center gap-1"}
					onClick={handleEditProject}
				>
					<Pencil />&nbsp;Edit
				</Button>

				<Button
					variant={"outline-danger"}
					size={"sm"}
					className={"d-flex align-items-center gap-1"}
					onClick={handleDeleteProject}
				>
					<XLg />&nbsp;Delete
				</Button>
			</div>


			{/* Tasks */}
			<div id={cx("tasks-card")} className={cx("mt-5")}>
				<div className="mb-1 text-uppercase fw-bolder fs-4 opacity-50">Tasks</div>
				{loading
					? <Spinner animation="border"/>
					: <Card>
						<Card.Body className="p-4 gap-4 overflow-auto">
							<TasksTable project={project} cx={cx} showModal={showModal} />
						</Card.Body>
						<Card.Footer className="p-3 d-flex justify-content-end">
							<Button
								variant="outline-secondary"
								size="sm"
								type="button"
								id="createProject"
								className="align-items-center d-flex gap-1"
								onClick={() => {
									const payload: ITasksFormProps = { action: "create", projectId: project.projectId }
									isModalOpen
										? populateModalWithHistory(ModalC.TaskCrUpForm(payload))
										: showModal(ModalC.TaskCrUpForm(payload))
								}}
							>
								Add task
							</Button>
						</Card.Footer>
					</Card>
				}
			</div>


			{/* Time records */}
			<div id={cx("time-records-card")} className={cx("mt-5")}>
				<div className="mb-1 text-uppercase fw-bolder fs-4 opacity-50">Time records</div>
				{loading
					? <Spinner animation="border"/>
					: <Card>
						<Card.Body className="p-4 gap-4 overflow-auto">
							{typeof timeByDate !== "undefined" &&
								<TimeRecordsTable timeByDate={timeByDate} cx={cx}/>
							}
						</Card.Body>
					</Card>
				}
			</div>
		</div>
	)
}

export default ProjectDetailView