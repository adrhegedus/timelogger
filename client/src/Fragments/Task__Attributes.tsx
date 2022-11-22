import React from "react"
import { Link } from "react-router-dom"
import { DateTime, Duration } from "luxon"

import { Badge, Col, Row } from "react-bootstrap"
import { Calendar2X, File, LayerBackward, SlashCircle, Stopwatch } from "react-bootstrap-icons"

import { Task } from "~/Types/models"

const TaskAttributes = (t: Task) => (
	<div id="task__attributes" className="d-flex flex-column gap-2">
		{/* Status */}
		<Row>
			<Col className="d-flex align-items-center gap-2 fw-bold">
				<SlashCircle/> Status
			</Col>
			<Col className="text-end">
				{<Badge bg={t.isCompleted ? "success" : "info"}>
					{t.isCompleted ? "Completed" : "In progress"}
				</Badge>}
			</Col>
		</Row>


		{/* Project */}
		<Row>
			<Col className="d-flex align-items-center gap-2 fw-bold">
				<File/> Project
			</Col>
			<Col className="text-end">
				<Link to={`/project/${t.project.projectId}`}>{t.project.name}</Link>
			</Col>
		</Row>


		{/* Deadline */}
		<Row>
			<Col className="d-flex align-items-center gap-2 fw-bold">
				<Calendar2X/> Deadline
			</Col>
			<Col className="text-end">{DateTime.fromISO(t.project.deadline as string).toLocaleString()}</Col>
		</Row>


		{/* Tracked time */}
		<Row>
			<Col className="d-flex align-items-center gap-2 fw-bold">
				<Stopwatch/> Tracked time
			</Col>
			<Col className="text-end">{(t.trackedMillis as Duration).toHuman({ unitDisplay: "narrow" })}</Col>
		</Row>


		{/* Parent task*/}
		{ t.isSubtask
			? <Row>
				<Col className="d-flex align-items-center gap-2 fw-bold">
					<LayerBackward/> Parent task
				</Col>
				<Col className="text-end">
					<Link to={`/task/${(t.parentTask as Task).taskId}`}>
						{(t.parentTask as Task).name}
					</Link>
				</Col>
			</Row>
			: null
		}
	</div>
)

export default TaskAttributes