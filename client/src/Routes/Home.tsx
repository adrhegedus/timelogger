//#region IMPORTS
// Libraries
import React, { useContext, useEffect, useMemo, useState } from "react"
import { DateTime, Duration } from "luxon"
import { Link } from "react-router-dom"

// Components
import { ArrowRight } from "react-bootstrap-icons"
import { Card, Spinner } from "react-bootstrap"
import { CardTitle } from "~/Components/Titles"

// Fragments
import { ProjectsTable, TasksTable } from "~/Fragments/Home__Tables"
import QuickActions from "~/Fragments/Home__QuickActions"

// Helpers
import { ModalContext } from "~/Helpers/ModalProvider"
import { get_for_home } from "~/Helpers/api"

// Types
import { Project } from "~/Types/models"

// Views
import { TrackingTimeView } from "~/Views/TrackTimeView"

//#endregion
// --------------------------------------------------

const Home = () => {
	//#region SETUP
	const [projects, setProjects] = useState<Project[]>([])
	const [loadingProjects, setLoadingProjects] = useState(true)

	// Memoize sorted projects to avoid recalculation on re-render
	const sortedProjects = useMemo(() => {
		return projects.sort((a, b) => {
			return (
				(a.isCompleted && !b.isCompleted ? 1 : -1) ||
				(a.deadline as DateTime).toMillis() - (b.deadline as DateTime).toMillis()
			)
		})
	}, [projects])

	// Fetch resources
	useEffect(() => {
		get_for_home().then((res) => {
			const processedProjects: Project[] = res.data.map((p: Project) => {
				return {
					...p,
					deadline: DateTime.fromISO(p.deadline as string),
					trackedMillis: Duration.fromMillis(p.trackedMillis as number).shiftTo("hours", "minutes"),
					tasks: p.tasks.filter((t) => !t.isCompleted)
				}
			})

			setProjects(processedProjects)
			setLoadingProjects(false)
		})
	}, [])

	const { showModal } = useContext(ModalContext)

	//#endregion
	// --------------------------------------------------


	// Render
	return (
		<div id="content" className="container d-flex flex-column p-5 gap-5 mt-5">
			{/* Welcome */}
			<header className="display-2 gap-2 text-start">Welcome, freelancer</header>


			{/* Currently tracking view */}
			<TrackingTimeView />


			{/* Quick actions */}
			{QuickActions(showModal)}


			{/* Projects */}
			<div id="projects-card">
				<div className="card__header d-flex justify-content-between align-items-baseline">
					<CardTitle>Active projects</CardTitle>
					<Link to="/projects" className="text-primary fs-7 d-flex align-items-center gap-2">
						View all<ArrowRight/>
					</Link>
				</div>
				<Card>
					<Card.Body className="p-4 gap-4 overflow-auto">
						{loadingProjects
							? <Spinner animation="border" />
							: ProjectsTable(sortedProjects, showModal)
						}
					</Card.Body>
				</Card>
			</div>


			{/* Tasks */}
			<div id="tasks-card">
				<div className="card__header d-flex justify-content-between align-items-baseline">
					<CardTitle>Open tasks</CardTitle>
					<Link to="/tasks" className="text-primary fs-7 d-flex align-items-center gap-2">
						View all<ArrowRight/>
					</Link>
				</div>
				<Card>
					<Card.Body className="p-4 gap-4 overflow-auto">
						{loadingProjects
							? <Spinner animation="border" />
							: TasksTable(sortedProjects, showModal)
						}
					</Card.Body>
				</Card>
			</div>
		</div>
	)
}

export default Home