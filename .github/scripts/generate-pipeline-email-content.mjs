import fs from 'node:fs'
import path from 'node:path'

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

const pipelineStatus = resolvePipelineStatus([testResult, buildResult, dockerResult, deployResult])
const statusLabel = {
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
const artifactsDir = process.env.TEST_ARTIFACTS_DIR || '.artifacts/test-reports'
const outputDir = process.env.EMAIL_OUTPUT_DIR || '.artifacts/email'

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

const escapeHtml = (value) => {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
}

const detailsUrl = `${serverUrl}/${repository}/actions/runs/${runId}`
const jobsSummary = [
	`test=${testResult}`,
	`build=${buildResult}`,
	`docker=${dockerResult}`,
	`deploy=${deployResult}`,
].join(' | ')

const junitPath = path.join(artifactsDir, 'reports', 'junit.xml')
const coverageSummaryPath = path.join(artifactsDir, 'coverage', 'coverage-summary.json')
const junitSummary = parseJunitSummary(junitPath)
const coverageSummary = parseCoverageSummary(coverageSummaryPath)

const testsSummary = junitSummary
	? `total=${junitSummary.tests} passed=${junitSummary.passed} failed=${junitSummary.failures + junitSummary.errors} skipped=${junitSummary.skipped} duration=${junitSummary.time}s`
	: 'report unavailable'

const coverageLine = coverageSummary
	? `lines=${coverageSummary.lines}% statements=${coverageSummary.statements}% functions=${coverageSummary.functions}% branches=${coverageSummary.branches}%`
	: 'coverage unavailable'

const statusColor = {
	success: '#0f766e',
	failure: '#b91c1c',
	cancelled: '#374151',
	skipped: '#9a3412',
	unknown: '#1d4ed8',
}[pipelineStatus] || '#1d4ed8'

const subject = `${statusLabel} Pipeline ${pipelineStatus.toUpperCase()} - ${branch} #${runNumber}`

const htmlBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:24px;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:24px;background:${statusColor};color:#ffffff;">
          <h1 style="margin:0;font-size:22px;line-height:1.25;">${escapeHtml(statusLabel)} Pipeline ${escapeHtml(pipelineStatus.toUpperCase())}</h1>
          <p style="margin:8px 0 0;font-size:14px;opacity:.95;">Run #${escapeHtml(runNumber)} on ${escapeHtml(branch)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;color:#111827;">
          <p style="margin:0 0 14px;font-size:14px;"><strong>Repository:</strong> ${escapeHtml(repository)}</p>
          <p style="margin:0 0 14px;font-size:14px;"><strong>Actor:</strong> ${escapeHtml(actor)}</p>
          <p style="margin:0 0 14px;font-size:14px;"><strong>Commit:</strong> ${escapeHtml(commit)}</p>
          <p style="margin:0 0 14px;font-size:14px;"><strong>Jobs:</strong> ${escapeHtml(jobsSummary)}</p>
          <p style="margin:0 0 14px;font-size:14px;"><strong>Tests:</strong> ${escapeHtml(testsSummary)}</p>
          <p style="margin:0 0 22px;font-size:14px;"><strong>Coverage:</strong> ${escapeHtml(coverageLine)}</p>
          <a href="${escapeHtml(detailsUrl)}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;">View workflow run</a>
        </td>
      </tr>
    </table>
  </body>
</html>
`

fs.mkdirSync(outputDir, { recursive: true })
fs.writeFileSync(path.join(outputDir, 'subject.txt'), subject, 'utf-8')
fs.writeFileSync(path.join(outputDir, 'pipeline-notification.html'), htmlBody, 'utf-8')

console.log(`Email content generated at: ${outputDir}`)