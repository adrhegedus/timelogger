import React, { FormEvent, ReactNode, useContext, useState } from "react"
import axios from "axios"
import { Button, FloatingLabel, Form } from "react-bootstrap"
import { ModalContext } from "~/Helpers/ModalProvider"
import Endpoints from "~/Helpers/api"

const DeleteConfirmationView = (props: IDeleteConfirmationViewProps) => {
	const [reassuranceMatch, setReassuranceMatch] = useState(false)
	const modalContext = useContext(ModalContext)

	const deleteAction = (e: FormEvent) => {
		e.preventDefault()
		Endpoints[props.endpoint](props.name, props.id, axios.CancelToken.source(), modalContext)
	}

	return (
		<div id="delete-confirmation-form">
			{/* Title */}
			<p className="mb-4 h2 fw-light">Are you sure you want to delete<br/> {props.name}?</p>
			<div className="form">
				<Form onSubmit={deleteAction} className="d-flex flex-column gap-3">
					{/* Information text */}
					<div>{props.informationText}</div>
					<hr/>


					{/* Reassurance */}
					{props.reassure
						? <FloatingLabel controlId="reassurance" label={`Type "${props.reassuranceText}" to confirm.`}>
							<Form.Control
								pattern={props.reassuranceText}
								type="text"
								autoFocus
								autoComplete="off"
								placeholder={" "}
								onChange={(e) => setReassuranceMatch(e.target.value === props.reassuranceText)}
							/>
						</FloatingLabel>
						: null}


					{/* Buttons */}
					<div className="buttons d-flex gap-2 justify-content-end">
						<Button type={"button"} variant="outline-secondary" onClick={() => modalContext.hideModal()}>
							Cancel
						</Button>

						<Button type={"submit"} variant="danger" disabled={props.reassure && !reassuranceMatch}>
							Delete
						</Button>
					</div>
				</Form>
			</div>
		</div>
	)
}

export default DeleteConfirmationView

export interface IDeleteConfirmationViewProps {
	id: number
	name: string
	informationText: ReactNode
	reassure?: boolean
	reassuranceText?: string
	endpoint: keyof typeof Endpoints
}

DeleteConfirmationView.defaultProps = { reassure: false }