const HandledExceptionView = (props: HandledException) => {
	return (
		<div className="handledExceptionView">
			<hr/>
			<p className="h5 mt-4 mb-3">{props.cause}</p>
			<div className="d-flex flex-column gap-2">
				{props.errors.map((error, index) => (
					<div key={index} className="text-muted">{error.name}: {error.error}</div>
				))}
			</div>
		</div>
	)
}

export default HandledExceptionView

export type HandledException = {
	code: "VAL-400" | "ID-404" | "SQL-500"
	cause: string
	errors: {
		name: string
		error: string
	}[]
}