import React from "react"
import { useParams } from "react-router-dom"
import ProjectDetailView from "~/Views/ProjectDetailView"


const ProjectDetail = () => {
	const { projectId } = useParams<{ projectId: string }>()

	return (
		<div id="wrapper" className="container flex-column p-5">
			<ProjectDetailView projectId={+projectId} />
		</div>
	)
}

export default ProjectDetail