//#region IMPORTS
// Libraries
import React from "react"
import { Link } from "react-router-dom"
import { DateTime, Duration } from "luxon"

// Components
import { Calendar2X, File, Pencil, Stopwatch, Type, XLg } from "react-bootstrap-icons"
import { Table } from "react-bootstrap"

// Fragments
import TaskListEntry from "~/Fragments/TaskListEntry"

// Helpers
import DelC from "~/Helpers/DeleteConfirmationConfigs"
import ModalC from "~/Helpers/ModalConfigs"

// Styles
import styles from "./Home__Tables.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { Project } from "~/Types/models"
import { IModal } from "~/Types/modal"

//#endregion
// --------------------------------------------------


export const ProjectsTable = (sortedProjects: Project[], showModal: IModal["showModal"]) => (
	<Table id={cx("projects-table")}>
		<thead>
			<tr>
				<th style={{width: "42%"}}><span><Type/> Name</span></th>
				<th style={{width: "42%"}}><span><Calendar2X/> Deadline</span></th>
				<th style={{width: "16%"}}><span><Stopwatch/> Tracked time</span></th>
			</tr>
		</thead>
		<tbody>
			{sortedProjects.map((p) => (
				<tr key={p.projectId} onClick={() => showModal(ModalC.ProjectPreview(p))}>
					<td>
						<span className="d-flex align-items-center gap-2 justify-content-between">
							{/* Name with link */}
							<Link
								to={`/project/${p.projectId}`}
								className="link-muted"
								onClick={(e) => e.stopPropagation()}
							>
								{p.name}
							</Link>


							{/* Spacer */}
							<div className="flex-grow-1"/>


							{/* Actions */}
							<span className={cx("prog-disclosure", "d-flex align-items-center fs-7 gap-2")}>
								<div title="Edit" onClick={(e) => {
									e.stopPropagation()
									showModal(ModalC.ProjectCrUpForm({
										action: "update",
										project: p
									}))
								}}><Pencil/></div>
								<div className="text-danger" title="Delete" onClick={(e) => {
									e.stopPropagation()
									showModal(ModalC.DeleteConfirmation(DelC.Project(p)))
								}}><XLg/></div>
							</span>
						</span>
					</td>


					{/* Deadline */}
					<td>
						{p.deadline.toLocaleString()}
						&nbsp;
						{p.isCompleted
							? null
							: <>({(p.deadline as DateTime).toRelative({unit: "days"})})</>
						}
					</td>


					{/* Tracked time */}
					<td>{(p.trackedMillis as Duration).toHuman({unitDisplay: "narrow"})}</td>
				</tr>
			))}
		</tbody>
	</Table>
)


export const TasksTable = (sortedProjects: Project[], showModal: IModal["showModal"]) => (
	<Table id={cx("tasks-table")}>
		<thead>
			<tr>
				<th style={{width: "42%"}}><span><Type/> Name</span></th>
				<th style={{width: "42%"}}><span><File/> Project</span></th>
				<th style={{width: "16%"}}><span><Stopwatch/> Tracked time</span></th>
			</tr>
		</thead>
		<tbody>
			{sortedProjects.map((p, p_index) => {
				return (
					<React.Fragment key={p_index}>
						{p.tasks.map((t, t_index) => {
							t.trackedMillis = Duration.fromMillis(t.trackedMillis as number)
								.shiftTo("hours", "minutes")

							return (
								<React.Fragment key={t_index}>
									{/* Parent task */}
									<tr key={`t-${t_index}`}>
										<TaskListEntry t={t} p={p} cx={cx} showModal={showModal} from={"home"}/>
									</tr>

									{/* Subtasks */}
									{t.isParentTask && t.subtasks.map((st, st_index) => (
										<tr key={`st-${st_index}`}>
											<TaskListEntry
												t={st}
												p={p}
												cx={cx}
												showModal={showModal}
												from={"home"}
												isSubtask={true}
											/>
										</tr>
									))}
								</React.Fragment>
							)
						})}
					</React.Fragment>
				)
			})}
		</tbody>
	</Table>
)