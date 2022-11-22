//#region IMPORTS
// Libraries
import { CancelTokenSource } from "axios"
import { ReactNode } from "react"

// Components
import { XCircleFill } from "react-bootstrap-icons"

// Forms
import TimeRecordForm, { ITimeRecordFormProps } from "~/Forms/TimeRecordForm"
import ProjectForm, { IProjectFormProps } from "~/Forms/ProjectForm"
import TasksForm, { ITasksFormProps } from "~/Forms/TasksForm"

// Fragments
import APIFeedback from "~/Fragments/APIFeedback"

// Views
import DeleteConfirmationView, { IDeleteConfirmationViewProps } from "~/Views/DeleteConfirmationView"
import ProjectDetailView from "~/Views/ProjectDetailView"
import TaskDetailView from "~/Views/TaskDetailView"

// Types
import { Project, Task } from "~/Types/models"
import { ModalConfig } from "~/Types/modal"

//#endregion
// --------------------------------------------------


//#region Create/update forms
const ProjectCrUpForm = (props: IProjectFormProps) => {
	return {
		title: props.action === "create"
			? "Start project"
			: "Update project",
		content: <ProjectForm {...props}/>
	} as ModalConfig
}

const TaskCrUpForm = (props: ITasksFormProps) => ({
	title: props.action === "create"
		? "Create task"
		: "Update task",
	content: <TasksForm {...props}/>
} as ModalConfig)

const TimeRecordCrUpForm = (props: ITimeRecordFormProps) => ({
	title: props.action === "create"
		? "Track time"
		: "Update time",
	content: <TimeRecordForm {...props}/>
} as ModalConfig)

//#endregion
// --------------------------------------------------


//#region Previews
const ProjectPreview = (project: Project) => ({
	title: project.name,
	content: <ProjectDetailView projectId={project.projectId}/>,
	expandTo: `/project/${project.projectId}`
} as ModalConfig)

const TaskPreview = (task: Task) => ({
	title: task.name,
	content: <TaskDetailView taskId={task.taskId}/>,
	expandTo: `/task/${task.taskId}`
} as ModalConfig)

//#endregion
// --------------------------------------------------


//#region API requests
const APIPending = (props: { title: string, message: string, cancelToken: CancelTokenSource }) => {
	return {
		title: props.title,
		content: <APIFeedback status={"pending"} title={props.title} message={props.message} />,
		onExit: () => { props.cancelToken.cancel() }
	} as ModalConfig
}

const APISuccess = (props: { title: string, message: string }) => {
	return {
		title: props.title,
		content: <APIFeedback status={"success"} title={props.title} message={props.message} />,
		onExit: () => { window.location.reload() }
	} as ModalConfig
}

const APIError = (props: { title: string, message: ReactNode }) => {
	return {
		title: props.title,
		content: <APIFeedback status={"error"} title={props.title} message={props.message} />,
	} as ModalConfig
}

//#endregion
// --------------------------------------------------


//#region 404s
const ProjectPage404 = (projectId: number) => {
	return {
		title: "Project not found",
		content: <div>
			<div className="display-2 mb-4 text-danger"><XCircleFill/></div>
			<p className="h4 mb-2 fw-bolder">Project with ID {projectId} not found</p>
			<div className="h6">The project you are looking for does not exist.</div>
		</div>,
		onExit: () => { window.location.href = "/projects" }
	} as ModalConfig
}

const TaskPage404 = (taskId: number) => {
	return {
		title: "Task not found",
		content: <div>
			<div className="display-2 mb-4 text-danger"><XCircleFill/></div>
			<p className="h4 mb-2 fw-bolder">Task with ID {taskId} not found</p>
			<div className="h6">The task you are looking for does not exist.</div>
		</div>,
		onExit: () => { window.location.href = "/tasks" }
	} as ModalConfig
}

//#endregion
// --------------------------------------------------


const DeleteConfirmation = (props: IDeleteConfirmationViewProps) => {
	return {
		title: "Confirm deletion",
		content: <DeleteConfirmationView {...props} />,
		onExit: () => { window.location.reload() }
	} as ModalConfig
}


const TimeTrackerAlreadyTracking = () => {
	return {
		title: "Starting time tracker failed",
		content: <div>
			<div className="display-2 mb-4 text-danger"><XCircleFill/></div>
			<p className="h4 mb-2 fw-bolder">Can&apos;t start a new time tracker</p>
			<div className="h6">Already tracking time for another task.</div>
		</div>,
		onExit: () => { window.location.reload() }
	} as ModalConfig
}


const ModalC = {
	ProjectCrUpForm,
	TaskCrUpForm,
	TimeRecordCrUpForm,

	ProjectPreview,
	TaskPreview,

	APIPending,
	APISuccess,
	APIError,

	ProjectPage404,
	TaskPage404,

	DeleteConfirmation,
	TimeTrackerAlreadyTracking
}

export default ModalC