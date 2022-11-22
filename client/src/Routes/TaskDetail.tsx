import React from "react"
import { useParams } from "react-router-dom"
import TaskDetailView from "~/Views/TaskDetailView"


const TaskDetail = () => {
	const { taskId } = useParams<{ taskId: string }>()

	return (
		<div id="wrapper" className="container flex-column p-5">
			<TaskDetailView taskId={+taskId} />
		</div>
	)
}

export default TaskDetail