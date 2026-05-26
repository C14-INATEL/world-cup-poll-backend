export function isUniqueConstraintError(err: unknown): boolean {
	if (typeof err !== 'object' || err === null) {
		return false
	}

	const error = err as any

	return error.code === '23505' || error.cause?.code === '23505'
}
