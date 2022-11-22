//#region IMPORTS
// Libraries
import axios, { CancelTokenSource } from "axios"

// Forms
import { TimeRecordWritableProperties } from "~/Forms/TimeRecordForm"
import { ProjectWritableProperties } from "~/Forms/ProjectForm"
import { TaskWritableProperties } from "~/Forms/TasksForm"

// Helpers
import ENDPOINTS from "~/Helpers/endpoints"
import ModalC from "~/Helpers/ModalConfigs"

// Types
import { Project, Task } from "~/Types/models"
import { IModal } from "~/Types/modal"

// Views
import HandledExceptionView, { HandledException } from "~/Views/HandledExceptionView"

//#endregion
// --------------------------------------------------


//#region SETUP
axios.defaults.baseURL = import.meta.env.VITE_API_BASEURL
axios.defaults.headers.common["Access-Control-Allow-Origin"] = ["0.0.0.0", "localhost", "127.0.0.1"]
axios.defaults.headers.common["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE"
axios.defaults.headers.common["Access-Control-Allow-Headers"] = "Content-Type"
axios.defaults.headers.common["Content-Security-Policy"] = "default-src 'self'"

export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
}

//#endregion
// --------------------------------------------------


//#region Route-based and component-based get requests
/** Fetches the resources for the home page. */
export const get_for_home = async () => axios.get(ENDPOINTS.route_home)


/** Fetches the resources for the projects page. */
export const get_for_projects = async () => axios.get(ENDPOINTS.route_projects)


/** Fetches the resources for the tasks page. */
export const get_for_tasks = async () => axios.get(ENDPOINTS.route_tasks)


/**
 * Fetches the resources for the project detail page.
 * @param projectId - ID of the project to get.
 * @param showModal - A reference to the modal's showModal method.
 * @returns {Promise<AxiosResponse<any>>} - The HTTP response as a Promise.
 */
export const get_for_projectDetail = async (projectId: number, showModal: IModal["showModal"]) => {
	return await axios.get(ENDPOINTS.route_projectDetail, { params: { projectId }})
		.catch(err => {
			// Unhandled exception
			if (!err.response) {
				showModal(ModalC.APIError({
					title: "Something went wrong",
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				showModal(ModalC.APIError({
					title: "Getting project failed",
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})
		.then(res => res)
}


/**
 * Fetches the resources for the task detail page.
 * @param taskId - ID of the task to get.
 * @param showModal - A reference to the modal's showModal method.
 * @returns {Promise<AxiosResponse<any>>} - The HTTP response as a Promise.
 */
export const get_for_taskDetail = async (taskId: number, showModal: IModal["showModal"]) => {
	return await axios.get(ENDPOINTS.route_taskDetail, { params: { taskId }})
		.catch(err => {
			// Unhandled exception
			if (!err.response) {
				showModal(ModalC.APIError({
					title: "Something went wrong",
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				showModal(ModalC.APIError({
					title: "Getting task failed",
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})
		.then(res => res)
}


/** Fetches the names for the task create/update form. */
export const get_for_tasksForm = async () => axios.get(ENDPOINTS.task_form)


/** Fetches the names for the time record create/update form. */
export const get_for_timeRecordsForm = async () => axios.get(ENDPOINTS.timeRecord_form)

//#endregion
// --------------------------------------------------


//#region Project
/**
 * Requests to create a new project instance.
 * @param p - A set of Project's writable properties.
 * @param token - A token to cancel the request.
 * @param modalContext - The set of methods and attributes exposed by the Modal context.
 */
export const create_project = async (p: ProjectWritableProperties, token: CancelTokenSource, modalContext: IModal) => {
	// Display pending request in modal
	const modalContent = { title: "Starting project", message: "Please wait.", cancelToken: token }

	modalContext.isModalOpen
		? modalContext.populateModalWithHistory(ModalC.APIPending(modalContent))
		: modalContext.showModal(ModalC.APIPending(modalContent))


	await axios.post(ENDPOINTS.create_project, {...p}, { cancelToken: token.token })
		.catch(err => {
			// Cancelled request
			if (axios.isCancel(err)) { modalContext.hideModal() }

			// Unhandled exception
			if (!err.response) {
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: "Starting project failed",
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: "Starting project failed",
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})

		.then(res => {
			if (res.status === HTTP_STATUS.CREATED) {
				const project = res.data as Project

				modalContext.clearStoredStates()
				modalContext.populateModal(ModalC.APISuccess({
					title: "Project started successfully.",
					message: `Project ${project.name} has been started.`,
				}))
			}
		})
}


/**
 * Requests to update an existing project instance.
 * @param p - A set of Project's writable properties to update the entry with.
 * @param projectId - ID of the Project to update.
 * @param token - A token to cancel the request.
 * @param modalContext - The set of methods and attributes exposed by the Modal context.
 */
export const update_project = async (p: ProjectWritableProperties, projectId: number, token: CancelTokenSource,
	modalContext: IModal) => {
	const modalContent = { title: `Updating ${p.name}`, message: "Please wait.", cancelToken: token }

	modalContext.isModalOpen
		? modalContext.populateModalWithHistory(ModalC.APIPending(modalContent))
		: modalContext.showModal(ModalC.APIPending(modalContent))

	await axios.put(ENDPOINTS.update_project, {...p}, {
		cancelToken: token.token,
		params: { projectId }
	})
		.catch(err => {
			// Cancelled request
			if (axios.isCancel(err)) { modalContext.hideModal() }

			// Unhandled exception
			if (!err.response) {
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: `Updating ${p.name} failed`,
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: `Updating ${p.name} failed`,
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})
		.then(res => {
			if (res.status === HTTP_STATUS.NO_CONTENT) {
				modalContext.clearStoredStates()
				modalContext.populateModal(ModalC.APISuccess({
					title: "Project updated successfully.",
					message: `Changes made to ${p.name} are now saved.`,
				}))
			}
		})
}


/**
 * Requests to update an existing project instance.
 * @param name - Name of the Project to delete.
 * @param projectId - ID of the Project to delete.
 * @param token - A token to cancel the request.
 * @param modalContext - The set of methods and attributes exposed by the Modal context.
 */
export const delete_project = async (name: string, projectId: number, token: CancelTokenSource, modalContext: IModal) => {
	const modalContent = { title: `Deleting ${name}`, message: "Please wait.", cancelToken: token }

	modalContext.isModalOpen
		? modalContext.populateModalWithHistory(ModalC.APIPending(modalContent))
		: modalContext.showModal(ModalC.APIPending(modalContent))

	await axios.delete(ENDPOINTS.delete_project, { cancelToken: token.token, params: { projectId }})
		.catch(err => {
			// Cancelled request
			if (axios.isCancel(err)) { modalContext.hideModal() }

			// Unhandled exception
			if (!err.response) {
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: `Deleting ${name} failed`,
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: `Deleting ${name} failed`,
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})
		.then(res => {
			if (res.status === HTTP_STATUS.NO_CONTENT) {
				modalContext.clearStoredStates()
				modalContext.populateModal(ModalC.APISuccess({
					title: "Project deleted successfully.",
					message: `Project ${name}, as well as all associated tasks and time records have been deleted.`,
				}))
			}
		})
}

//#endregion
// --------------------------------------------------


//#region Task
/**
 * Requests to create a new Task instance.
 * @param t - A set of Task's writable properties.
 * @param token - A token to cancel the request.
 * @param modalContext - The set of methods and attributes exposed by the Modal context.
 */
export const create_task = async (t: TaskWritableProperties, token: CancelTokenSource, modalContext: IModal) => {
	const modalContent = { title: "Creating task", message: "Please wait.", cancelToken: token }

	modalContext.isModalOpen
		? modalContext.populateModalWithHistory(ModalC.APIPending(modalContent))
		: modalContext.showModal(ModalC.APIPending(modalContent))

	await axios.post(ENDPOINTS.create_task, {...t}, { cancelToken: token.token })
		.catch(err => {
			// Cancelled request
			if (axios.isCancel(err)) { modalContext.hideModal() }

			// Unhandled exception
			if (!err.response) {
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: "Creating task failed",
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: "Creating task failed",
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})
		.then(res => {
			if (res.status === HTTP_STATUS.CREATED) {
				const task = res.data as Task

				modalContext.clearStoredStates()
				modalContext.populateModal(ModalC.APISuccess({
					title: "Task created successfully.",
					message: `Task ${task.name} has been created.`,
				}))
			}
		})
}


/**
 * Requests to update an existing task instance.
 * @param t - A set of Task's writable properties to update the entry with.
 * @param taskId - ID of the task to update.
 * @param token - A token to cancel the request.
 * @param modalContext - The set of methods and attributes exposed by the Modal context.
 */
export const update_task = async (t: TaskWritableProperties, taskId: number, token: CancelTokenSource, modalContext: IModal) => {
	const modalContent = { title: `Updating ${t.name}`, message: "Please wait.", cancelToken: token }

	modalContext.isModalOpen
		? modalContext.populateModalWithHistory(ModalC.APIPending(modalContent))
		: modalContext.showModal(ModalC.APIPending(modalContent))

	await axios.put(ENDPOINTS.update_task, {...t}, {
		cancelToken: token.token,
		params: { taskId }
	})
		.catch(err => {
			// Cancelled request
			if (axios.isCancel(err)) { modalContext.hideModal() }

			// Unhandled exception
			if (!err.response) {
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: `Updating ${t.name} failed`,
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: `Updating ${t.name} failed`,
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})
		.then(res => {
			if (res.status === HTTP_STATUS.NO_CONTENT) {
				modalContext.clearStoredStates()
				modalContext.populateModal(ModalC.APISuccess({
					title: "Task updated successfully.",
					message: `Changes made to ${t.name} are now saved.`,
				}))
			}
		})
}


/**
 * Requests to delete an existing task instance.
 * @param name - The name of the task to delete.
 * @param taskId - ID of the task to delete.
 * @param token - A token to cancel the request.
 * @param modalContext - The set of methods and attributes exposed by the Modal context.
 */
export const delete_task = async (name: string, taskId: number, token: CancelTokenSource, modalContext: IModal) => {
	const modalContent = { title: `Deleting ${name}`, message: "Please wait.", cancelToken: token }

	modalContext.isModalOpen
		? modalContext.populateModalWithHistory(ModalC.APIPending(modalContent))
		: modalContext.showModal(ModalC.APIPending(modalContent))

	await axios.delete(ENDPOINTS.delete_task, { cancelToken: token.token, params: { taskId }})
		.catch(err => {
			// Cancelled request
			if (axios.isCancel(err)) { modalContext.hideModal() }

			// Unhandled exception
			if (!err.response) {
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: `Deleting ${name} failed`,
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: `Deleting ${name} failed`,
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})
		.then(res => {
			if (res.status === HTTP_STATUS.NO_CONTENT) {
				modalContext.clearStoredStates()
				modalContext.populateModal(ModalC.APISuccess({
					title: "Task deleted successfully.",
					message: `Task ${name}, as well as all associated subtasks and time records have been deleted.`,
				}))
			}
		})
}

//#endregion
// --------------------------------------------------


//#region TimeRecord
/**
 * Requests to create a new TimeRecord instance.
 * @param tr - A set of TimeRecord's writable properties.
 * @param token - A token to cancel the request.
 * @param modalContext - The set of methods and attributes exposed by the Modal context.
 */
export const create_time_record = async (tr: TimeRecordWritableProperties, token: CancelTokenSource, modalContext: IModal) => {
	const modalContent = { title: "Adding time record", message: "Please wait.", cancelToken: token }

	modalContext.isModalOpen
		? modalContext.populateModalWithHistory(ModalC.APIPending(modalContent))
		: modalContext.showModal(ModalC.APIPending(modalContent))

	await axios.post(ENDPOINTS.create_time_record, {...tr}, { cancelToken: token.token })
		.catch(err => {
			// Cancelled request
			if (axios.isCancel(err)) { modalContext.hideModal() }

			// Unhandled exception
			if (!err.response) {
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: "Adding time record failed",
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: "Adding time record failed",
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})
		.then(res => {
			if (res.status === HTTP_STATUS.CREATED) {
				modalContext.clearStoredStates()
				modalContext.populateModal(ModalC.APISuccess({
					title: "Time record added successfully.",
					message: "Time record has been created and assigned to the task.",
				}))
			}
		})
}


/**
 * Requests to update an existing time record.
 * @param tr - A set of TimeRecord's writable properties to update the entry with.
 * @param timeRecordId - ID of the TimeRecord instance to update.
 * @param token - A token to cancel the request.
 * @param modalContext - The set of methods and attributes exposed by the Modal context.
 */
export const update_time_record = async (tr: TimeRecordWritableProperties, timeRecordId: number, token: CancelTokenSource, modalContext: IModal ) => {
	const modalContent = { title: "Updating time record", message: "Please wait.", cancelToken: token }

	modalContext.isModalOpen
		? modalContext.populateModalWithHistory(ModalC.APIPending(modalContent))
		: modalContext.showModal(ModalC.APIPending(modalContent))

	await axios.put(ENDPOINTS.update_time_record, {...tr}, {
		cancelToken: token.token,
		params: { timeRecordId }
	})
		.catch(err => {
			// Cancelled request
			if (axios.isCancel(err)) { modalContext.hideModal() }

			// Unhandled exception
			if (!err.response) {
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: "Updating time record failed",
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: "Updating time record failed",
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})
		.then(res => {
			if (res.status === HTTP_STATUS.NO_CONTENT) {
				modalContext.clearStoredStates()
				modalContext.populateModal(ModalC.APISuccess({
					title: "Time record updated successfully.",
					message: "Changes made to the time record are now saved.",
				}))
			}
		})
}


/**
 * Requests to delete an existing TimeRecord instance.
 * @param name - Unused parameter to share signature with the other delete methods.
 * @param timeRecordId - ID of the time record to delete.
 * @param token - A token to cancel the request.
 * @param modalContext - The set of methods and attributes exposed by the Modal context.
 */
export const delete_time_record = async (name: string, timeRecordId: number, token: CancelTokenSource, modalContext: IModal) => {
	const modalContent = { title: "Deleting time record", message: "Please wait.", cancelToken: token }

	modalContext.isModalOpen
		? modalContext.populateModalWithHistory(ModalC.APIPending(modalContent))
		: modalContext.showModal(ModalC.APIPending(modalContent))

	await axios.delete(ENDPOINTS.delete_time_record, { cancelToken: token.token, params: { timeRecordId }})
		.catch(err => {
			// Cancelled request
			if (axios.isCancel(err)) { modalContext.hideModal() }

			// Unhandled exception
			if (!err.response) {
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: "Deleting time record failed",
					message: `An unexpected error came up. Please try again later. (${err.message})`,
				}))
			}

			// Handled exception - bad input
			if (err.response.status === HTTP_STATUS.BAD_REQUEST) {
				const error = err.response.data as HandledException
				modalContext.popState()
				modalContext.populateModalWithHistory(ModalC.APIError({
					title: "Deleting time record failed",
					message: HandledExceptionView(error),
				}))
			}

			return err.response
		})
		.then(res => {
			if (res.status === HTTP_STATUS.NO_CONTENT) {
				modalContext.clearStoredStates()
				modalContext.populateModal(ModalC.APISuccess({
					title: "Time record deleted successfully.",
					message: "Time record has been deleted, and tracked time on the respective task has been updated.",
				}))
			}
		})
}

//#endregion
// --------------------------------------------------


const requestsForDeleteConfirmation = {
	delete_project,
	delete_task,
	delete_time_record,
}

export default requestsForDeleteConfirmation