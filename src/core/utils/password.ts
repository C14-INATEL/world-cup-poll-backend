import argon2 from 'argon2'

export function compareHashPassword(plainPassword: string, hashedPassword: string) {
	return argon2.verify(hashedPassword, plainPassword)
}

export function hashPassword(password: string, options?: argon2.Options) {
	return argon2.hash(password, options)
}
