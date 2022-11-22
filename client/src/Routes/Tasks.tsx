//#region IMPORTS
// Libraries
import React, { useContext, useEffect, useState } from "react"

// Components
import { Card, Spinner } from "react-bootstrap"
import { CardTitle } from "~/Components/Titles"

// Fragments
import Tasks__Tables from "~/Fragments/Tasks__Tables"

// Helpers
import { ModalContext } from "~/Helpers/ModalProvider"
import { get_for_tasks } from "~/Helpers/api"

// Types
import { Project } from "~/Types/models"

//#endregion
// --------------------------------------------------


const Tasks = () => {
	const [projects, setProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)

	const { showModal } = useContext(ModalContext)

	// Fetch resources
	useEffect(() => {
		get_for_tasks().then((res) => {
			setProjects(res.data)
			setLoading(false)
		})
	}, [])


	if (loading) {
		return (
			<div className="container d-flex flex-column p-5 gap-5 mt-5">
				<header className="display-2">
					<span>Tasks</span>
					<hr/>
				</header>

				<div id="task-list" className="container"><Spinner animation={"border"} /></div>
			</div>
		)
	}


	return (
		<div className="container d-flex flex-column p-5 gap-5 mt-5">
			<header className="display-2">
				<span>Tasks</span>
				<hr/>
			</header>


			<div id="task-list" className="container">
				{projects.map((p, p_index) => (
					<div key={p_index} className="container mb-5">
						<CardTitle>{p.name}</CardTitle>
						<Card>
							<Card.Body className="p-3 gap-4 overflow-auto">
								<Tasks__Tables p={p} showModal={showModal} key={p_index}/>
							</Card.Body>
						</Card>
					</div>
				))}
			</div>
		</div>
	)
}

export default Tasks