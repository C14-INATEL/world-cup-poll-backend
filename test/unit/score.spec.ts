import { describe, expect, test } from 'vitest'
import { calculateScore } from '@/core/utils/score'

describe('calculateScore', () => {
	describe('acerto exato — 5 pontos', () => {
		test('placar exato correto retorna 5', () => {
			expect(
				calculateScore({
					guessFirst: 2,
					guessSecond: 1,
					actualFirst: 2,
					actualSecond: 1,
				}),
			).toBe(5)
		})

		test('empate exato retorna 5', () => {
			expect(
				calculateScore({
					guessFirst: 0,
					guessSecond: 0,
					actualFirst: 0,
					actualSecond: 0,
				}),
			).toBe(5)
		})

		test('placar exato com goleada retorna 5', () => {
			expect(
				calculateScore({
					guessFirst: 4,
					guessSecond: 0,
					actualFirst: 4,
					actualSecond: 0,
				}),
			).toBe(5)
		})
	})

	describe('acertou o vencedor ou empate — 3 pontos', () => {
		test('acertou vencedor do time da casa mas não o placar retorna 3', () => {
			expect(
				calculateScore({
					guessFirst: 3,
					guessSecond: 1,
					actualFirst: 1,
					actualSecond: 0,
				}),
			).toBe(3)
		})

		test('acertou vencedor do time visitante mas não o placar retorna 3', () => {
			expect(
				calculateScore({
					guessFirst: 0,
					guessSecond: 2,
					actualFirst: 1,
					actualSecond: 3,
				}),
			).toBe(3)
		})

		test('acertou empate mas não o placar exato retorna 3', () => {
			expect(
				calculateScore({
					guessFirst: 1,
					guessSecond: 1,
					actualFirst: 2,
					actualSecond: 2,
				}),
			).toBe(3)
		})
	})

	// Para cair na regra 1pt: acertou um gol, mas errou o vencedor
	describe('acertou um gol — 1 ponto', () => {
		test('acertou apenas os gols do primeiro time mas errou o vencedor retorna 1', () => {
			expect(
				calculateScore({
					guessFirst: 2,
					guessSecond: 1,
					actualFirst: 2,
					actualSecond: 3,
				}),
			).toBe(1)
		})

		test('acertou apenas os gols do segundo time mas errou o vencedor retorna 1', () => {
			expect(
				calculateScore({
					guessFirst: 1,
					guessSecond: 2,
					actualFirst: 3,
					actualSecond: 2,
				}),
			).toBe(1)
		})
	})

	describe('errou tudo — 0 pontos', () => {
		test('nenhum acerto retorna 0', () => {
			expect(
				calculateScore({
					guessFirst: 1,
					guessSecond: 2,
					actualFirst: 3,
					actualSecond: 0,
				}),
			).toBe(0)
		})

		test('chutou vitória do primeiro, ganhou o segundo retorna 0', () => {
			expect(
				calculateScore({
					guessFirst: 2,
					guessSecond: 0,
					actualFirst: 0,
					actualSecond: 1,
				}),
			).toBe(0)
		})

		test('chutou empate mas um time venceu retorna 0 quando gols também estão errados', () => {
			expect(
				calculateScore({
					guessFirst: 1,
					guessSecond: 1,
					actualFirst: 3,
					actualSecond: 0,
				}),
			).toBe(0)
		})
	})
})
