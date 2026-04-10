import nodemailer from 'nodemailer'
import fs from 'node:fs'
import path from 'node:path'

const getRequiredEnv = (name) => {
	const value = process.env[name]
	if (!value) {
		throw new Error(`Missing ${name} secret`)
	}
	return value
}

const toBoolean = (value, defaultValue) => {
	if (value == null) return defaultValue
	return ['1', 'true', 'yes', 'y'].includes(value.toLowerCase())
}

const testResult = (process.env.TEST_RESULT || 'unknown').toLowerCase()
const buildResult = (process.env.BUILD_RESULT || 'unknown').toLowerCase()
const dockerResult = (process.env.DOCKER_RESULT || 'unknown').toLowerCase()
const deployResult = (process.env.DEPLOY_RESULT || 'unknown').toLowerCase()

const mailServer = getRequiredEnv('MAIL_SERVER')
const mailPort = Number.parseInt(process.env.MAIL_PORT || '465', 10)
const mailSecure = toBoolean(process.env.MAIL_SECURE, mailPort === 465)
const mailUsername = getRequiredEnv('MAIL_USERNAME')
const mailPassword = getRequiredEnv('MAIL_PASSWORD')
const mailTo = getRequiredEnv('MAIL_TO')
const mailFrom = process.env.MAIL_FROM || `World Cup Poll CI <${mailUsername}>`
const artifactsDir = process.env.TEST_ARTIFACTS_DIR || '.artifacts/test-reports'

const resolvePipelineStatus = (results) => {
	if (results.includes('failure')) return 'failure'
	if (results.includes('cancelled')) return 'cancelled'
	if (results.includes('skipped')) return 'skipped'
	if (results.every((result) => result === 'success')) return 'success'
	return 'unknown'
}

const pipelineStatus = (process.env.PIPELINE_STATUS || resolvePipelineStatus([testResult, buildResult, dockerResult, deployResult])).toLowerCase()
const statusIcon = {
	success: '[OK]',
	failure: '[FAIL]',
	cancelled: '[CANCELLED]',
	skipped: '[SKIPPED]',
	unknown: '[UNKNOWN]',
}[pipelineStatus] || '[UNKNOWN]'

const repository = process.env.GITHUB_REPOSITORY || 'unknown-repository'
const branch = process.env.GITHUB_REF_NAME || 'unknown-branch'
const commit = process.env.GITHUB_SHA || 'unknown-sha'
const actor = process.env.GITHUB_ACTOR || 'unknown-actor'
const runId = process.env.GITHUB_RUN_ID || ''
const runNumber = process.env.GITHUB_RUN_NUMBER || ''
const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'

const jobsSummary = [
	`test=${testResult}`,
	`build=${buildResult}`,
	`docker=${dockerResult}`,
	`deploy=${deployResult}`,
].join(' | ')

const detailsUrl = `${serverUrl}/${repository}/actions/runs/${runId}`
const subject = `${statusIcon} Pipeline ${pipelineStatus.toUpperCase()} - ${branch} #${runNumber}`

const parseJunitSummary = (filePath) => {
	if (!fs.existsSync(filePath)) return null

	const xml = fs.readFileSync(filePath, 'utf-8')
	const tests = Number.parseInt(xml.match(/tests="(\d+)"/)?.[1] || '0', 10)
	const failures = Number.parseInt(xml.match(/failures="(\d+)"/)?.[1] || '0', 10)
	const errors = Number.parseInt(xml.match(/errors="(\d+)"/)?.[1] || '0', 10)
	const skipped = Number.parseInt(xml.match(/skipped="(\d+)"/)?.[1] || '0', 10)
	const time = xml.match(/time="([0-9.]+)"/)?.[1] || '0'
	const passed = Math.max(tests - failures - errors - skipped, 0)

	return {
		tests,
		passed,
		failures,
		errors,
		skipped,
		time,
	}
}

const parseCoverageSummary = (filePath) => {
	if (!fs.existsSync(filePath)) return null

	const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
	const total = data.total
	if (!total) return null

	return {
		lines: total.lines?.pct ?? null,
		statements: total.statements?.pct ?? null,
		functions: total.functions?.pct ?? null,
		branches: total.branches?.pct ?? null,
	}
}

const junitPath = path.join(artifactsDir, 'reports', 'junit.xml')
const coverageSummaryPath = path.join(artifactsDir, 'coverage', 'coverage-summary.json')
const junitSummary = parseJunitSummary(junitPath)
const coverageSummary = parseCoverageSummary(coverageSummaryPath)

const coverageLine = coverageSummary
	? `coverage: lines=${coverageSummary.lines}% statements=${coverageSummary.statements}% functions=${coverageSummary.functions}% branches=${coverageSummary.branches}%`
	: 'coverage: unavailable'

const testsLine = junitSummary
	? `tests: total=${junitSummary.tests} passed=${junitSummary.passed} failed=${junitSummary.failures + junitSummary.errors} skipped=${junitSummary.skipped} duration=${junitSummary.time}s`
	: 'tests: report unavailable'

const message = [
	`${statusIcon} Pipeline ${pipelineStatus.toUpperCase()} (#${runNumber})`,
	`repo: ${repository}`,
	`branch: ${branch}`,
	`commit: ${commit}`,
	`actor: ${actor}`,
	`jobs: ${jobsSummary}`,
	testsLine,
	coverageLine,
	`details: ${detailsUrl}`,
].join('\n')

const attachments = []
if (fs.existsSync(junitPath)) {
	attachments.push({
		filename: 'junit.xml',
		path: junitPath,
	})
}

if (fs.existsSync(coverageSummaryPath)) {
	attachments.push({
		filename: 'coverage-summary.json',
		path: coverageSummaryPath,
	})
}

const transporter = nodemailer.createTransport({
	host: mailServer,
	port: mailPort,
	secure: mailSecure,
	auth: {
		user: mailUsername,
		pass: mailPassword,
	},
})

await transporter.sendMail({
	from: mailFrom,
	to: mailTo,
	subject,
	text: message,
	attachments,
})

console.log('Pipeline email notification sent successfully')
