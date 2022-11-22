import { SlashCircle, Stopwatch, Type } from "react-bootstrap-icons"
import { DateTime, Duration } from "luxon"
import React from "react"
import TaskListEntry from "~/Fragments/TaskListEntry"
import { Table } from "react-bootstrap"
import { IModal } from "~/Types/modal"
import { Project } from "~/Types/models"
import { ArgumentArray } from "classnames"

export const TasksTable = ({ project, cx, showModal }: ITaskTableProps) => (
	<Table id={cx("tasks-table")}>
		<thead>
			<tr>
				<th style={{width: "50%"}}><span><Type/> Name</span></th>
				<th style={{width: "17%"}}><span><SlashCircle/> Status</span></th>
				<th style={{width: "33%"}}><span><Stopwatch/> Tracked time</span></th>
			</tr>
		</thead>
		<tbody>
			{project.tasks.map((t, t_index) => {
				t.trackedMillis = Duration.fromMillis(t.trackedMillis as number)
					.shiftTo("hours", "minutes")

				return (
					<React.Fragment key={t_index}>
						<tr key={`t-${t_index}`}>
							<TaskListEntry
								t={t}
								cx={cx}
								showModal={showModal}
								from={"project"}
							/>
						</tr>
						{t.isParentTask && t.subtasks.map((st, st_index) => (
							<tr key={`st-${st_index}`}>
								<TaskListEntry
									t={st}
									cx={cx}
									showModal={showModal}
									from={"project"}
									isSubtask={true}
								/>
							</tr>
						))}
					</React.Fragment>
				)
			})}
		</tbody>
	</Table>
)

export interface ITaskTableProps {
	project: Project,
	cx: (...args: ArgumentArray) => string
	showModal: IModal["showModal"]
}

export const TimeRecordsTable = ({ timeByDate, cx }: ITimeRecordsTableProps) => (
	<Table id={cx("time-records-table")}>
		<tbody>
			{timeByDate && timeByDate.map((tr, tr_index) => (
				<tr key={`tr-${tr_index}`}>
					<td>
						<b>{DateTime.fromISO(tr.date).toLocaleString({dateStyle: "full"})}:</b>
						&nbsp;
						{Duration.fromMillis(tr.time)
							.shiftTo("hours", "minutes")
							.toHuman({ unitDisplay: "narrow" })}
					</td>
				</tr>
			))}
		</tbody>
	</Table>
)

export interface ITimeRecordsTableProps {
	timeByDate: { date: string, time: number }[],
	cx: (...args: ArgumentArray) => string
}