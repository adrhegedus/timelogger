//#region IMPORTS
// Libraries
import React, { lazy, Suspense } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

// Components
import { Spinner } from "react-bootstrap"
import Navbar from "~/Components/Navbar"

// Helpers
import { ModalProvider } from "~/Helpers/ModalProvider"

// Routes
const Home = lazy(() => import("~/Routes/Home"))
const Projects = lazy(() => import("~/Routes/Projects"))
const Tasks = lazy(() => import("~/Routes/Tasks"))
const ProjectDetail = lazy(() => import("~/Routes/ProjectDetail"))
const TaskDetail = lazy(() => import("~/Routes/TaskDetail"))

//#endregion
// --------------------------------------------------

function App() {
	return (
		<Router>
			<Suspense fallback={
				<div className="h-100 d-flex justify-content-center align-items-center">
					<Spinner animation="border" role="status" />
				</div>
			}>
				<ModalProvider>
					<Navbar />
					<Switch>
						<Route exact path="/" component={Home} />
						<Route exact path="/projects" component={Projects} />
						<Route exact path="/tasks" component={Tasks} />
						<Route path="/project/:projectId" component={ProjectDetail} />
						<Route path="/task/:taskId" component={TaskDetail} />
						{/* <Route path="/test" component={Test} /> */}
					</Switch>
				</ModalProvider>
			</Suspense>
		</Router>
	)
}

export default App