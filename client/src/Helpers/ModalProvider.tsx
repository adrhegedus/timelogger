import React, { createContext, PropsWithChildren } from "react"
import useModal from "~/Hooks/useModal"
import Modal from "~/Components/Modal"
import { IModal } from "~/Types/modal"

const ModalContext = createContext<IModal>({} as IModal)

const ModalProvider = ({ children }: PropsWithChildren) => {
	const {
		isModalOpen,
		modalConfig,
		showModal,
		hideModal,
		populateModal,
		populateModalWithHistory,
		storedStates,
		storeState,
		popState,
		clearStoredStates,
	} = useModal()

	return (
		<ModalContext.Provider value={{
			isModalOpen,
			modalConfig,
			showModal,
			hideModal,
			populateModal,
			populateModalWithHistory,
			storedStates,
			storeState,
			popState,
			clearStoredStates
		}}>
			<Modal />
			{children}
		</ModalContext.Provider>
	)
}

export { ModalProvider, ModalContext }