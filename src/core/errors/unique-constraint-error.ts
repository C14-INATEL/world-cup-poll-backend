export function isUniqueConstraintError(err: unknown): boolean {
	if (
		typeof err === 'object' &&
		err !== null &&
		'cause' in err &&
		isUniqueConstraintError((err as any).cause)
	) {
		return true
	}

	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		(err as any).code === '23505'
	)
}
