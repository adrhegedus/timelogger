//#region IMPORTS
// Libraries
import React from "react"
import { DateTime, Duration } from "luxon"
import { Link } from "react-router-dom"

// Components
import {
	BoxArrowInRight,
	BoxArrowRight, CardText,
	ListNested,
	Pencil,
	SlashCircle,
	Stopwatch,
	Type,
	XLg
} from "react-bootstrap-icons"
import { Badge, Button, Card, Table } from "react-bootstrap"

// Helpers
import ModalC from "~/Helpers/ModalConfigs"

// Styles
import styles from "./TaskDetail__Tables.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { Task } from "~/Types/models"
import { IModal } from "~/Types/modal"
import DelC from "~/Helpers/DeleteConfirmationConfigs"

//#endregion
// --------------------------------------------------

export const SubtasksTable = (props: ISubtasksTableProps) => {
	if (props.subtasks.length === 0) return null

	return (
		<div id={cx("subtasks-card")} className={cx("my-0")}>
			<div className="mb-1 text-uppercase fw-bolder fs-4 opacity-50">Subtasks</div>
			<Card>
				<Card.Body className="p-4 gap-4 overflow-auto">
					<Table id={cx("subtasks-table")}>
						<thead>
							<tr>
								<th style={{width: "50%"}}><span><Type/> Name</span></th>
								<th style={{width: "17%"}}><span><SlashCircle/> Status</span></th>
								<th style={{width: "33%"}}><span><Stopwatch/> Tracked time</span></th>
							</tr>
						</thead>
						<tbody>
							{props.subtasks.map((st, t_index) => {
								st.trackedMillis = Duration.fromMillis(st.trackedMillis as number)
									.shiftTo("hours", "minutes")

								return (
									<tr key={t_index}>
										<td>
											<span className="d-flex align-items-center gap-2 justify-content-between">
												<Link
													to={`/task/${st.taskId}`}
													onClick={(e) => e.stopPropagation()}
													className="d-flex align-items-center gap-2 link-muted"
												>
													{st.name}
												</Link>

												<div className="flex-grow-1"/>

												<span
													className={cx("prog-disclosure", "d-flex align-items-center fs-7 gap-2")}>
													<div title="Edit" onClick={(e) => {
														e.stopPropagation()
														props.modalContext.showModal(ModalC.TaskCrUpForm({
															action: "update",
															task: st
														}))
													}}><Pencil/></div>
													<div className="text-danger" title="Delete" onClick={(e) => {
														e.stopPropagation()
														props.modalContext.showModal(ModalC.DeleteConfirmation(DelC.Task(st)))
													}}><XLg/></div>
												</span>
											</span>
										</td>
										<td>
											<Badge bg={st.isCompleted ? "success" : "info"}>
												{st.isCompleted ? "Completed" : "In progress"}
											</Badge>
										</td>
										<td>
											{(st.trackedMillis as Duration).toHuman({ unitDisplay: "narrow" })}
										</td>
									</tr>
								)
							})}
						</tbody>
					</Table>
				</Card.Body>
				<Card.Footer className="p-3 d-flex justify-content-end">
					<Button
						variant="outline-secondary"
						size="sm"
						type="button"
						id="createProject"
						className="align-items-center d-flex gap-1"
						onClick={() => {
							props.modalContext.isModalOpen
								? props.modalContext.populateModalWithHistory(ModalC.TaskCrUpForm({
									action: "create",
									parentTaskId: props.parentTaskId
								}))
								: props.modalContext.showModal(ModalC.TaskCrUpForm({
									action: "create",
									parentTaskId: props.parentTaskId
								}))
						}}
					>
						<ListNested />&nbsp;Add subtask
					</Button>
				</Card.Footer>
			</Card>
		</div>
	)
}

interface ISubtasksTableProps {
	subtasks: Task[]
	parentTaskId: number
	modalContext: IModal
}


export const TimeRecordsTable = (props: { task: Task, modalContext: IModal }) => (
	<Table id={cx("times-table")}>
		<thead>
			<tr>
				<th style={{width: "20%"}}><span><BoxArrowRight/> Start time</span></th>
				<th style={{width: "20%"}}><span><BoxArrowInRight/> End time</span></th>
				<th style={{width: "20%"}}><span><Stopwatch/> Duration</span></th>
				<th style={{width: "40%"}}><span><CardText/> Note</span></th>
			</tr>
		</thead>
		<tbody>
			{props.task.timeRecords?.map((tr, tr_index) => {
				tr.trackedMillis = Duration.fromMillis(tr.trackedMillis as number)
					.shiftTo("hours", "minutes")

				return (
					<tr key={tr_index}>
						{/* Start time */}
						<td>
							{DateTime.fromISO(tr.startTime as string).toLocaleString({
								dateStyle: "short", timeStyle: "short"
							})}
						</td>


						{/* End time */}
						<td>
							{DateTime.fromISO(tr.endTime as string).toLocaleString({
								dateStyle: "short", timeStyle: "short"
							})}
						</td>


						{/* Duration */}
						<td>{tr.trackedMillis.toHuman({ unitDisplay: "narrow" })}</td>


						{/* Note */}
						<td>
							<span className="d-flex align-items-center gap-2 justify-content-between">
								{tr.note ?? ""}


								{/* Spacer */}
								<div className="flex-grow-1"/>


								{/* Actions */}
								<span className={cx("prog-disclosure", "d-flex align-items-center fs-7 gap-2")}>
									<div title="Edit" onClick={(e) => {
										e.stopPropagation()
										props.modalContext.showModal(ModalC.TimeRecordCrUpForm({
											action: "update",
											timeRecord: tr,
											taskId: tr.taskId
										}))
									}}><Pencil/></div>
									<div className="text-danger" title="Delete" onClick={(e) => {
										e.stopPropagation()
										props.modalContext.showModal(ModalC.DeleteConfirmation(DelC.TimeRecord(tr)))
									}}><XLg/></div>
								</span>
							</span>
						</td>
					</tr>
				)
			})}
		</tbody>
	</Table>
)