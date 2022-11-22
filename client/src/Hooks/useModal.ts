import { useMemo, useRef, useState } from "react"
import { IModal, ModalConfig } from "~/Types/modal"

const useModal = (): IModal => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [_modalConfig, set_modalConfig] = useState({} as ModalConfig)

	/** Stores the current configuration of the modal. */
	const modalConfig = useMemo(() => _modalConfig, [_modalConfig])

	/** Store of the remembered states of the modal. */
	const storedStates = useRef<ModalConfig[]>([])

	/**
	 * Populates the modal with the given configuration and shows it.
	 * @param config The modal configuration to apply.
	 */
	const showModal = (config: ModalConfig) => {
		populateModal(config)
		setIsModalOpen(true)
	}

	/** Hides the modal and removes stored states (if any). */
	const hideModal = () => {
		setIsModalOpen(false)
		clearStoredStates()
	}

	/**
	 * Populates the modal with the given configuration.
	 * @param config The modal configuration to apply.
	 */
	const populateModal = (config: ModalConfig) => { set_modalConfig(config) }

	/**
	 * Stores the current state and populates the modal with the given config.
	 * @param config The modal configuration to apply.
	 */
	const populateModalWithHistory = (config: ModalConfig) => {
		storeState()
		populateModal(config)
	}

	/** Stores the current state of the modal. */
	const storeState = () => { storedStates.current.push(_modalConfig) }

	/** Removes all stored states of the modal. */
	const clearStoredStates = () => { storedStates.current = [] }

	/**
	 * Retrieves the given state of the modal from history.
	 * @param index The index of the state to retrieve. Defaults to the last state.
	 */
	const popState = (index = -1) => {
		if (index === -1 && storedStates.current.length > 0) {
			set_modalConfig(storedStates.current.pop() as ModalConfig)
		} else if (index >= 0 && storedStates.current.length > index) {
			set_modalConfig(storedStates.current.splice(index, 1)[0])
		}
	}


	return {
		isModalOpen,
		modalConfig,
		showModal,
		hideModal,
		populateModal,
		populateModalWithHistory,
		popState,
		storeState,
		storedStates,
		clearStoredStates,
	}
}

export default useModal