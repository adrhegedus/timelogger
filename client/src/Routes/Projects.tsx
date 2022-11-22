//#region IMPORTS
// Libraries
import { useEffect, useState } from "react"
import { DateTime, Duration } from "luxon"
import { Link } from "react-router-dom"

// Components
import { Card, Col, Row, Spinner } from "react-bootstrap"

// Fragments
import ProjectAttributes from "~/Fragments/Project__Attributes"

// Helpers
import { get_for_projects } from "~/Helpers/api"

// Styles
import styles from "./Projects.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

// Types
import { Project } from "~/Types/models"

//#endregion
// --------------------------------------------------


const Projects = () => {
	const [projects, setProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)

	// Fetch resources
	useEffect(() => {
		get_for_projects().then((res) => {
			const processedProjects: Project[] = res.data.map((p: Project) => {
				return {
					...p,
					deadline: DateTime.fromISO(p.deadline as string),
					trackedMillis: Duration.fromMillis(p.trackedMillis as number).shiftTo("hours", "minutes"),
				}
			})

			setProjects(processedProjects)
			setLoading(false)
		})
	}, [])


	if (loading) { return (
		<div className="container d-flex flex-column p-5 gap-5 mt-5">
			<header className="display-2">
				<span>Projects</span>
				<hr/>
			</header>


			<div id={cx("project-list")} className="container"><Spinner animation={"border"} /></div>
		</div>
	) }


	return (
		<div className="container d-flex flex-column p-5 gap-5 mt-5">
			<header className="display-2">
				<span>Projects</span>
				<hr/>
			</header>


			<div id={cx("project-list")} className="container">
				<Row xs={1} md={2} lg={3} className="g-4">
					{projects.map((p: Project, index) => (
						<Col key={index}>
							<Card
								as={Link}
								to={`/project/${p.projectId}`}
								className={cx("text-black h-100", "project-list__project", {
									"project-list__project--completed": p.isCompleted
								})}
							>
								<Card.Body className="d-flex flex-column p-4 gap-2">
									<Card.Title className="mb-2">{p.name}</Card.Title>
									<Card.Text className="fst-italic text-muted mb-0">{p.description}</Card.Text>
								</Card.Body>

								<Card.Footer className="p-3">
									<ProjectAttributes {...p} />
								</Card.Footer>
							</Card>
						</Col>
					))}
				</Row>
			</div>
		</div>
	)
}

export default Projects