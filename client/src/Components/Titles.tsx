import React, { PropsWithChildren } from "react"

//* Custom title component for cards. */
export const CardTitle = ({ children }: PropsWithChildren) => (
	<div className="mb-1 text-uppercase fw-bolder fs-4 opacity-50">{children}</div>
)

//* Custom title component for actions (form headers). */
export const ActionTitle = ({ children }: PropsWithChildren) => (<>
	<p className="mb-2 h2 fw-light">{children}</p>
	<hr className="mb-5"/>
</>)