import { DateTime, Duration } from "luxon"


export type Project = {
	projectId: number
	name: string
	description?: string
	deadline: DateTime | string
	isCompleted: boolean
	trackedMillis: Duration | number
	TimeRecords?: TimeRecord[]
	tasks: Task[]
}

export type TimeRecord = {
	timeRecordId: number
	projectId: number
	startTime: DateTime | string
	endTime: DateTime | string
	trackedMillis: Duration | number
	note?: string
	task?: Task
	taskId?: Task["taskId"]
}


export type Task = {
	taskId: number
	name: string
	description?: string
	isCompleted: boolean
	trackedMillis: Duration | number
	timeRecords?: TimeRecord[]
	project: Project
	projectId: number
	parentTaskId?: number
	parentTask?: Task
	subtasks: Task[]
	isSubtask: boolean
	isParentTask: boolean
}