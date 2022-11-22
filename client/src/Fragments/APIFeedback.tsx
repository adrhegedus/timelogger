import { CSSProperties, ReactNode } from "react"
import { Spinner } from "react-bootstrap"
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons"

const APIFeedback = (props: IAPIFeedbackProps) => {
	// Define CSS override for broken Bootstrap styling
	const spinnerStyleVars = {
		"--bs-spinner-width": 1 + "em",
		"--bs-spinner-height": 1 + "em",
		"--bs-spinner-border-width": 0.15 + "em"
	} as CSSProperties

	const element = {
		pending: <Spinner animation={"border"} style={spinnerStyleVars} />,
		success: <div className={"text-success"}><CheckCircleFill/></div>,
		error: <div className={"text-danger"}><XCircleFill/></div>
	}

	return (
		<div>
			<div className="display-2 mb-4">{element[props.status]}</div>
			<p className="h4 mb-2 fw-bolder">{props.title}</p>
			<div className="h6">{props.message}</div>
		</div>
	)
}

export default APIFeedback

export interface IAPIFeedbackProps {
	status: "pending" | "success" | "error"
	title: string
	message: ReactNode
}