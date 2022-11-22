//#region IMPORTS
// Libraries
import { yupResolver } from "@hookform/resolvers/yup"
import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import { DateTime } from "luxon"
import * as yup from "yup"
import axios from "axios"

// Components
import { Button, Form, FormCheck } from "react-bootstrap"
import { ActionTitle } from "~/Components/Titles"

// Helpers
import { create_project, update_project } from "~/Helpers/api"
import { ModalContext } from "~/Helpers/ModalProvider"

// Styles
import styles from "./Forms.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { Project } from "~/Types/models"

//#endregion
// --------------------------------------------------


/**
 * Type definition for the inputs of the Project form.
 * Includes settable properties of the Project model.
 */
export type ProjectWritableProperties = Pick<Project, "name" | "description" | "deadline" | "isCompleted">

const ProjectForm = (props: IProjectFormProps) => {
	const modalContext = useContext(ModalContext)

	// Project
	const project = props.action === "create"
		? undefined
		: props.project as Project


	//#region Form setup
	const validationSchema = yup.object({
		name: yup.string().required("Projects must have a name."),
		description: yup.string(),
		deadline: yup.date().required("Projects must have a deadline.")
			.nullable()
			.typeError("Projects must have a deadline.")
			.test("is-valid-date", "Deadline must be a valid date.", (value) => {
				if (value === undefined) return true
				return DateTime.fromJSDate(value as Date).isValid
			}),
		isCompleted: yup.boolean(),
	})


	const {register, handleSubmit, formState: { errors }} = useForm<ProjectWritableProperties>({
		resolver: yupResolver(validationSchema)
	})

	const onSubmit = (data: ProjectWritableProperties) => {
		const cancelToken = axios.CancelToken.source()

		if (props.action === "create") { create_project(data, cancelToken, modalContext) }
		else { update_project(data, (project as Project).projectId, cancelToken, modalContext) }
	}

	//#endregion
	// --------------------------------------------------


	return (
		<div id="project-form">
			<ActionTitle>
				{props.action === "create"
					? "Starting a new project"
					: `Making changes to ${(project as Project).name}`}
			</ActionTitle>

			<div className={cx("form container")}>
				<Form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">

					{/* Name */}
					<Form.Group controlId="name" className="mb-3">
						<Form.Label>Name</Form.Label>
						<Form.Control
							{...register("name", { required: true })}
							defaultValue={project?.name}
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
							as="textarea"
							{...register("description")}
							defaultValue={project?.description ?? ""}
							autoComplete="off"
							style={{ resize: "vertical" }}
						/>
					</Form.Group>


					{/* Deadline */}
					<Form.Group controlId="deadline" className="mb-3">
						<Form.Label>Deadline</Form.Label>
						<Form.Control
							{...register("deadline", { required: true })}
							type={"date"}
							defaultValue={
								project?.deadline
									? (project.deadline as DateTime).toFormat("yyyy-MM-dd")
									: undefined
							}
							isInvalid={!!errors.deadline}
						/>
						<Form.Control.Feedback type="invalid">
							{errors.deadline && errors.deadline.message}
						</Form.Control.Feedback>
					</Form.Group>


					{/* IsCompleted */}
					<FormCheck
						type="checkbox"
						label="Completed"
						className="mb-3"
						{...register("isCompleted")}
					/>


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

export default ProjectForm

export interface IProjectFormProps {
	action: "create" | "update"
	project?: ProjectWritableProperties
}