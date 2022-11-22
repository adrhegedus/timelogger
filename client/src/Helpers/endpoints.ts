const DEV_ENDPOINTS = {
	route_home: "api/home",
	route_projects: "api/projects/all",
	route_projectDetail: "api/projects",
	route_tasks: "api/tasks/all",
	route_taskDetail: "api/tasks",
	route_timeRecordDetail: "api/time",

	task_form: "api/names/tasks",
	timeRecord_form: "api/names/time",

	create_project: "api/projects/create",
	update_project: "api/projects/update",
	delete_project: "api/projects/delete",

	create_task: "api/tasks/create",
	update_task: "api/tasks/update",
	delete_task: "api/tasks/delete",

	create_time_record: "api/time/create",
	update_time_record: "api/time/update",
	delete_time_record: "api/time/delete",
}

// const PROD_ENDPOINTS = { }
// export default import.meta.env.MODE === "development" ? DEV_ENDPOINTS : PROD_ENDPOINTS

export default DEV_ENDPOINTS