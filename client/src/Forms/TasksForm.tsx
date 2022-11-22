//#region IMPORTS
// Libraries
import React, { ChangeEvent, useContext, useEffect, useMemo, useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import axios from "axios"

// Components
import { Button, Form, FormCheck, InputGroup } from "react-bootstrap"
import { ActionTitle } from "~/Components/Titles"
import { Plus } from "react-bootstrap-icons"

// Helpers
import { create_task, get_for_tasksForm, update_task } from "~/Helpers/api"
import { ModalContext } from "~/Helpers/ModalProvider"
import ModalC from "~/Helpers/ModalConfigs"

// Styles
import styles from "./Forms.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { Project, Task } from "~/Types/models"

//#endregion
// --------------------------------------------------


/**
 * Type definition for the inputs of the Task form.
 * Includes settable properties of the Task model.
 */
export type TaskWritableProperties = Pick<Task, "name" | "description" | "isCompleted" | "projectId" | "parentTaskId">

const TasksForm = (props: ITasksFormProps) => {
	//#region SETUP
	// Task
	const task = props.action === "create"
		? undefined
		: props.task as Task

	// Modal
	const modalContext = useContext(ModalContext)

	// Load projects to pick from
	const [projects, setProjects] = useState<Pick<Project, "projectId" | "name">[]>([])
	const [tasks, setTasks] = useState<(Pick<Task, "taskId" | "name" | "project" | "projectId">)[]>([])
	const [isSubtask, setIsSubtask] = useState((task?.isSubtask !== undefined) || (props.parentTaskId !== undefined))
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		get_for_tasksForm().then((res) => {
			setProjects(res.data.projects)
			setTasks(res.data.tasks)

			setLoading(false)
		})
	}, [])

	//#endregion
	// --------------------------------------------------


	//#region Form setup
	const validationSchema = yup.object({
		name: yup.string().required("Tasks must have a name."),
		description: yup.string(),
		isCompleted: yup.boolean(),
		projectId: yup.number().required("Tasks must be assigned to a project.")
			.nullable()
			.oneOf(projects.map(p => p.projectId), "Tasks must be assigned to an existing project."),
		isSubtask: yup.boolean(),
		parentTaskId: yup.number().nullable()
			.when("isSubtask", {
				is: false,
				then: yup.number().transform(() => null).nullable().notRequired(),
				otherwise: yup.number().nullable()
					.typeError("Parent task must be a valid task.")
					.test("is-subtask", "Subtasks must be assigned to an existing task.", (value) => {
						return !isSubtask && value === undefined || isSubtask && tasks.some(t => t.taskId === value)
					})
					.test("is-not-parent-of-self", "A task cannot be its own parent.", (value) => {
						if (!isSubtask && value === undefined) return true
						return value !== task?.taskId
					})
			})
	})


	const { register, handleSubmit, formState: { errors }, setValue } =
		useForm<TaskWritableProperties & Pick<Task, "isSubtask">>({ resolver: yupResolver(validationSchema) })

	const onSubmit = (data: TaskWritableProperties & Partial<Pick<Task, "isSubtask">>) => {
		const cancelToken = axios.CancelToken.source()
		delete data.isSubtask

		if (props.action === "create") { create_task(data, cancelToken, modalContext) }
		else { update_task(data, (task as Task).taskId, cancelToken, modalContext) }
	}

	// Memoize names, so that they don't recalculate on re-render
	const taskNames = useMemo(() => (
		tasks.map((t) => (
			<option value={t.name} key={t.taskId}>
				{t.project.name}
			</option>
		))
	), [tasks])

	//#endregion
	// --------------------------------------------------


	if (loading) {
		return (
			<div id="task-form">
				<ActionTitle>
					{props.action === "create"
						? "Starting a new task"
						: `Making changes to ${(task as Task).name}`}
				</ActionTitle>
				<div className="spinner-border"></div>
			</div>
		)
	}

	return (
		<div id="task-form">
			<ActionTitle>
				{props.action === "create"
					? "Creating a new task"
					: `Making changes to ${(task as Task).name}`}
			</ActionTitle>

			<div className={cx("form")}>
				<Form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">

					{/* Name */}
					<Form.Group controlId="name" className="mb-3">
						<Form.Label>Name</Form.Label>
						<Form.Control
							{...register("name", { required: true })}
							defaultValue={task?.name}
							autoFocus
							autoComplete="off"
							isInvalid={!!errors.name}
						/>
						<Form.Control.Feedback type="invalid">
							{errors.name && errors.name.message}
						</Form.Control.Feedback>
					</Form.Group>


					{/* Description */}
					<Form.Group controlId="description" className="mb-3">
						<Form.Label>Description</Form.Label>
						<Form.Control
							{...register("description", { required: true })}
							defaultValue={task?.description}
							autoComplete="off"
						/>
					</Form.Group>


					{/* Project */}
					<Form.Group controlId="projectId" className="mb-3">
						<Form.Label>Project</Form.Label>
						<InputGroup>
							<Form.Select
								{...register("projectId", { required: true })}
								defaultValue={props.projectId ?? task?.projectId}
								disabled={isSubtask}
							>
								{projects.map((p, p_index) => (
									<option
										value={p.projectId}
										key={p_index}
									>
										{p.name}
									</option>
								))}
							</Form.Select>

							{/* Create new project button */}
							<Button
								type="button"
								variant="light"
								className="border text-black d-flex align-items-center fs-5"
								disabled={task?.isSubtask ?? isSubtask}
								onClick={() => {
									return modalContext.populateModalWithHistory(
										ModalC.ProjectCrUpForm({ action: "create" })
									)
								}}
							>
								<Plus/>
							</Button>
						</InputGroup>

						{isSubtask
							? <Form.Text className="text-muted fst-italic">Overridden by parent task.</Form.Text>
							: null}

						<Form.Control.Feedback type="invalid">
							{errors.projectId && errors.projectId.message}
						</Form.Control.Feedback>
					</Form.Group>


					{/* Completed */}
					<FormCheck
						type="checkbox"
						label="Completed"
						className="mb-3"
						{...register("isCompleted")}
					/>


					{/* Subtasks */}
					<Form.Group controlId="subtasks" className="mb-3">
						<Form.Label>Is a subtask</Form.Label>
						<InputGroup id="subtask-control">
							{/* IsSubtask */}
							<span className="input-group-text">
								<input
									{...register("isSubtask")}
									type="checkbox"
									checked={isSubtask}
									onChange={(e: ChangeEvent<HTMLInputElement>) => setIsSubtask(e.target.checked)}
									className="form-check-input mt-0"
								/>
							</span>

							{/* Shadow field with datalist for easier selection */}
							<Form.Control
								onChange={(e) => {
									const t = tasks.find(t => t.name === e.target.value)
									if (t) {
										setValue("parentTaskId", t.taskId)
										setValue("projectId", t.projectId)
									}
								}}
								disabled={!isSubtask}
								placeholder={isSubtask ? "Subtask to" : ""}
								defaultValue={tasks.find(t => t.taskId === (task?.parentTaskId ?? props.parentTaskId))?.name}
								list="tasks"
								isInvalid={!!errors.parentTaskId}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.parentTaskId && errors.parentTaskId.message}
							</Form.Control.Feedback>
						</InputGroup>

						{/* Actual ParentTaskId */}
						<Form.Control {...register("parentTaskId")} hidden={true}/>
						<datalist id="tasks">{taskNames}</datalist>
					</Form.Group>


					{/* Submit */}
					<Button type="submit" variant="primary" className="align-self-end mt-4">
						{props.action === "create"
							? "Create"
							: "Save changes"}
					</Button>
				</Form>
			</div>
		</div>
	)
}

export default TasksForm

export interface ITasksFormProps {
	action: "create" | "update"
	task?: TaskWritableProperties
	projectId?: number
	parentTaskId?: number
}