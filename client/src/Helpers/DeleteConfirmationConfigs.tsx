//#region IMPORTS
// Libraries
import React from "react"

// Views
import { IDeleteConfirmationViewProps } from "~/Views/DeleteConfirmationView"

// Types
import { Project, Task, TimeRecord } from "~/Types/models"
import { ExclamationTriangleFill } from "react-bootstrap-icons"

//#endregion
// --------------------------------------------------


//#region CONFIGURATIONS
const project = (p: Project) => ({
	id: p.projectId,
	name: p.name,
	informationText: (<div className="d-flex align-items-center gap-2">
		<ExclamationTriangleFill className="text-danger"/>
		This will also delete all associated tasks, their subtasks, and time registrations.
	</div>),
	endpoint: "delete_project",
	reassure: true,
	reassuranceText: p.name,
}) as IDeleteConfirmationViewProps


const task = (t: Task) => ({
	id: t.taskId,
	name: t.name,
	informationText: (<div className="d-flex align-items-center gap-2">
		<ExclamationTriangleFill className="text-danger"/>
		This will also delete all associated subtasks and time registrations.
	</div>),
	endpoint: "delete_task",
	reassure: false,
}) as IDeleteConfirmationViewProps


const timeRecord = (tr: TimeRecord) => ({
	id: tr.timeRecordId,
	name: "Time record",
	informationText: null,
	endpoint: "delete_time_record",
	reassure: false,
}) as IDeleteConfirmationViewProps

//#endregion
// --------------------------------------------------

const DelC = {
	Project: project,
	Task: task,
	TimeRecord: timeRecord
}

export default DelC