type ScoreInput = {
	guessFirst: number
	guessSecond: number
	actualFirst: number
	actualSecond: number
}

type MatchOutcome = 'home' | 'away' | 'draw'

function getOutcome(first: number, second: number): MatchOutcome {
	if (first > second) return 'home'
	if (second > first) return 'away'
	return 'draw'
}

export function calculateScore({
	guessFirst,
	guessSecond,
	actualFirst,
	actualSecond,
}: ScoreInput): number {
	// Regra 1: acertou o placar exato
	if (guessFirst === actualFirst && guessSecond === actualSecond) return 5

	// Regra 2: acertou apenas o vencedor ou empate
	if (getOutcome(guessFirst, guessSecond) === getOutcome(actualFirst, actualSecond)) return 3

	// Regra 3: acertou apenas um dos gols
	if (guessFirst === actualFirst || guessSecond === actualSecond) return 1

	// Regra 4: errou tudo
	return 0
}
