export function isUniqueConstraintError(err: unknown): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		(err as any).code === '23505'
	)
}
