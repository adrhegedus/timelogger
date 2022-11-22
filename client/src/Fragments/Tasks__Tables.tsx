//#region IMPORTS
// Libraries
import React from "react"

// Components
import { Table } from "react-bootstrap"
import { SlashCircle, Stopwatch, Type } from "react-bootstrap-icons"

// Fragments
import TaskListEntry from "~/Fragments/TaskListEntry"

// Styles
import styles from "./Tasks__Tables.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { IModal } from "~/Types/modal"
import { Project } from "~/Types/models"

//#endregion
// --------------------------------------------------


const TasksTable = (props: { p: Project, showModal: IModal["showModal"] }) => (
	<Table id={cx("tasks-table")} borderless>
		<thead>
			<tr>
				<th style={{width: "50%"}}><span><Type/> Name</span></th>
				<th style={{width: "17%"}}><span><SlashCircle/> Status</span></th>
				<th style={{width: "33%"}}><span><Stopwatch/> Tracked time</span></th>
			</tr>
		</thead>
		<tbody>
			{props.p.tasks.map((t, t_index) => (
				<React.Fragment key={t_index}>
					{/* Parent task */}
					<tr key={`t-${t_index}`}>
						<TaskListEntry t={t} cx={cx} showModal={props.showModal} from={"tasks"}/>
					</tr>

					{/* Subtasks */}
					{t.isParentTask && t.subtasks.map((st, st_index) => (
						<tr key={`st-${st_index}`}>
							<TaskListEntry
								t={st}
								cx={cx}
								showModal={props.showModal}
								from={"tasks"}
								isSubtask={true}
							/>
						</tr>
					))}
				</React.Fragment>
			))}
		</tbody>
	</Table>
)

export default TasksTable