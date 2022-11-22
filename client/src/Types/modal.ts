import React from "react"

export type ModalConfig = {
	title: string
	content: React.ReactNode
	onEnterKey?: (e?: React.MouseEvent | React.KeyboardEvent) => void
	onExit?: (e?: React.MouseEvent | React.KeyboardEvent) => void
	expandTo?: string
}

export interface IModal {
	isModalOpen: boolean
	modalConfig: ModalConfig
	storedStates: React.MutableRefObject<ModalConfig[]>
	showModal: (config: ModalConfig) => void
	hideModal: () => void
	populateModal: (config: ModalConfig) => void
	populateModalWithHistory: (config: ModalConfig) => void
	popState: (index?: number) => void
	storeState: () => void
	clearStoredStates: () => void
}