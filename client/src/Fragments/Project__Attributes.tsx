import React from "react"
import { Duration } from "luxon"

import { Badge, Col, Row } from "react-bootstrap"
import { Calendar2X, SlashCircle, Stopwatch } from "react-bootstrap-icons"

import { Project } from "~/Types/models"

const ProjectAttributes = (p: Project) => (
	<div id="project__attributes" className="d-flex flex-column gap-2">
		{/* Status */}
		<Row>
			<Col className="d-flex align-items-center gap-2 fw-bold">
				<SlashCircle className=""/>
				Status
			</Col>
			<Col className="text-end">
				{<Badge bg={p.isCompleted ? "success" : "info"}>
					{p.isCompleted ? "Completed" : "In progress"}
				</Badge>}
			</Col>
		</Row>


		{/* Deadline */}
		<Row>
			<Col className="d-flex align-items-center gap-2 fw-bold">
				<Calendar2X className=""/>
				Deadline
			</Col>
			<Col className="text-end">{p.deadline.toLocaleString()}</Col>
		</Row>


		{/* Tracked time */}
		<Row>
			<Col className="d-flex align-items-center gap-2 fw-bold">
				<Stopwatch className=""/>
				Tracked time
			</Col>
			<Col className="text-end">{(p.trackedMillis as Duration).toHuman({unitDisplay: "narrow"})}</Col>
		</Row>
	</div>
)

export default ProjectAttributes