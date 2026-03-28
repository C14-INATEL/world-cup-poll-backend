export class UnitOfWorkMock {
	async execute<T>(fn: (tx: any) => Promise<T>): Promise<T> {
		return fn({})
	}
}
