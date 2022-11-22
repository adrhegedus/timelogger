//#region IMPORTS
// Libraries
import React, { useContext } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router-dom"

// Components
import { ArrowLeft, ArrowsAngleExpand, XLg } from "react-bootstrap-icons"
import { Fade } from "react-bootstrap"

// Hooks
import useEventListener from "~/Hooks/useEventListener"

// Helpers
import { ModalContext } from "~/Helpers/ModalProvider"

// Styles
import styles from "./Modal.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

//#endregion
// --------------------------------------------------

/** A modal component for full-screen dialogs. */
const Modal = () => {
	const { isModalOpen, modalConfig, hideModal, popState, storedStates } = useContext(ModalContext)


	//#region HANDLERS
	const close = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.stopPropagation()
		if (modalConfig.onExit) modalConfig.onExit()
		hideModal()
	}

	const back = () => {
		if (modalConfig.onExit) modalConfig.onExit()
		if (storedStates.current.length > 0) popState()
	}

	const handleKeyDown = (originalEvent: Event) => {
		const e = originalEvent as unknown as React.KeyboardEvent
		if (e.key === "Escape") close(e)
		else if (e.key === "ArrowLeft" && !(document.activeElement instanceof HTMLInputElement)) back()
		else if (e.key === "Backspace" && !(document.activeElement instanceof HTMLInputElement)) back()
		else if (e.key === "Enter" && modalConfig.onEnterKey) modalConfig.onEnterKey(e)
	}

	useEventListener("keydown", handleKeyDown)

	//#endregion
	// --------------------------------------------------


	return createPortal(
		<Fade in={isModalOpen} timeout={200} mountOnEnter unmountOnExit>
			<div id={cx("modal__window")} onClick={close}>
				<div id={cx("modal__wrapper")} onClick={(e) => e.stopPropagation()}>
					<div id={cx("modal__header")}>
						{/* Back button */}
						{storedStates.current && storedStates.current.length > 0
							? <button onClick={() => { popState() }}><ArrowLeft/></button>
							: null
						}


						{/* Title */}
						<p id={cx("modal__title")}>{modalConfig.title}</p>


						{/* Spacer */}
						<div className="flex-grow-1"/>


						{/* Expand */}
						{typeof modalConfig.expandTo === "string"
							? <Link to={modalConfig.expandTo} title="Show as page" onClick={close}>
								<ArrowsAngleExpand/>
							</Link>
							: null
						}


						{/* Close */}
						<button onClick={hideModal} title="Close"><XLg/></button>
					</div>

					<div id={cx("modal__content")}>{modalConfig.content}</div>
				</div>
			</div>
		</Fade>,
		document.getElementById("modal") as Element
	)
}

Modal.defaultProps = { title: "", content: "" }

export default Modal