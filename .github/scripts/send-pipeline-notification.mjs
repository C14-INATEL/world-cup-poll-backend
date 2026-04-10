const webhookUrl = process.env.PIPELINE_WEBHOOK_URL

if (!webhookUrl) {
	throw new Error('Missing PIPELINE_WEBHOOK_URL secret')
}

const testResult = (process.env.TEST_RESULT || 'unknown').toLowerCase()
const buildResult = (process.env.BUILD_RESULT || 'unknown').toLowerCase()
const dockerResult = (process.env.DOCKER_RESULT || 'unknown').toLowerCase()
const deployResult = (process.env.DEPLOY_RESULT || 'unknown').toLowerCase()

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
const message = [
	`${statusIcon} Pipeline ${pipelineStatus.toUpperCase()} (#${runNumber})`,
	`repo: ${repository}`,
	`branch: ${branch}`,
	`commit: ${commit}`,
	`actor: ${actor}`,
	`jobs: ${jobsSummary}`,
	`details: ${detailsUrl}`,
].join('\n')

const payload = {
	text: message,
	content: message,
}

const response = await fetch(webhookUrl, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(payload),
})

if (!response.ok) {
	const body = await response.text()
	throw new Error(`Notification failed with status ${response.status}: ${body}`)
}

console.log('Pipeline notification sent successfully')
