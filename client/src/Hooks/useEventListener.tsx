import { useRef, useEffect } from "react"

/**
 * Hook that attaches an event listener to an element
 * @param {string} eventName Javascript name for the target event
 * @param {Function} handler Action to be called on event fire
 * @param {Element} [element] Element to attach the handler to
 */
function useEventListener(
	eventName: string,
	handler: (e: Event) => void,
	element = window
) {

	// Create a ref that stores handler (instead of passing it as dep in useEffect, possibly
	// causing a re-run on every render)
	const savedHandler = useRef<(e: Event) => void>({} as (e: Event) => void)

	useEffect(() => {
		savedHandler.current = handler
	}, [handler])

	useEffect(
		() => {
			// Make sure element supports addEventListener
			const isSupported = element && element.addEventListener
			if (!isSupported) return

			// Create event listener that calls handler function stored in ref
			const eventListener = (event: Event) => savedHandler.current(event)

			// Add event listener
			element.addEventListener(eventName, eventListener)

			// Remove event listener on component unmount
			return () => {
				element.removeEventListener(eventName, eventListener)
			}
		},
		[eventName, element] // Re-run if eventName or element changes
	)
}

export default useEventListener