import fs from 'node:fs'
import path from 'node:path'

/* ------------------ helpers ------------------ */

const env = (key, fallback = 'unknown') =>
	(process.env[key] || fallback).toLowerCase()

const escapeHtml = (str) =>
	String(str).replace(/[&<>"']/g, (char) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	}[char]))

const readIfExists = (filePath) => {
	if (!fs.existsSync(filePath)) {
		console.warn(`File not found: ${filePath}`)
		return null
	}
	return fs.readFileSync(filePath, 'utf-8')
}

const safePct = (v) => (typeof v === 'number' ? v : 0)

/* ------------------ pipeline status ------------------ */

const results = [
	env('TEST_RESULT'),
	env('BUILD_RESULT'),
	env('DOCKER_RESULT'),
	env('DEPLOY_RESULT'),
]

const resolvePipelineStatus = (results) => {
	if (results.includes('failure')) return 'failure'
	if (results.includes('cancelled')) return 'cancelled'
	if (results.every(r => r === 'success')) return 'success'
	if (results.includes('skipped')) return 'skipped'
	return 'unknown'
}

const pipelineStatus = resolvePipelineStatus(results)

const STATUS_META = {
	success: { label: '[OK]', color: '#0f766e' },
	failure: { label: '[FAIL]', color: '#b91c1c' },
	cancelled: { label: '[CANCELLED]', color: '#374151' },
	skipped: { label: '[SKIPPED]', color: '#9a3412' },
	unknown: { label: '[UNKNOWN]', color: '#1d4ed8' },
}

const { label: statusLabel, color: statusColor } =
	STATUS_META[pipelineStatus] || STATUS_META.unknown

/* ------------------ github context ------------------ */

const repository = process.env.GITHUB_REPOSITORY || 'unknown-repository'
const branch = process.env.GITHUB_REF_NAME || 'unknown-branch'
const commit = process.env.GITHUB_SHA || 'unknown-sha'
const actor = process.env.GITHUB_ACTOR || 'unknown-actor'
const runId = process.env.GITHUB_RUN_ID || ''
const runNumber = process.env.GITHUB_RUN_NUMBER || ''
const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'

const detailsUrl = `${serverUrl}/${repository}/actions/runs/${runId}`

/* ------------------ artifacts parsing ------------------ */

const artifactsDir = process.env.TEST_ARTIFACTS_DIR || '.artifacts/test-reports'

const parseJunitSummary = (filePath) => {
	const xml = readIfExists(filePath)
	if (!xml) return null

	const getAttr = (attr) =>
		Number.parseInt(xml.match(new RegExp(`${attr}="(\\d+)"`))?.[1] || '0', 10)

	const tests = getAttr('tests')
	const failures = getAttr('failures')
	const errors = getAttr('errors')
	const skipped = getAttr('skipped')
	const time = xml.match(/time="([0-9.]+)"/)?.[1] || '0'

	return {
		tests,
		passed: Math.max(tests - failures - errors - skipped, 0),
		failures,
		errors,
		skipped,
		time,
	}
}

const parseCoverageSummary = (filePath) => {
	const raw = readIfExists(filePath)
	if (!raw) return null

	const data = JSON.parse(raw)
	const total = data?.total
	if (!total) return null

	return {
		lines: total.lines?.pct ?? null,
		statements: total.statements?.pct ?? null,
		functions: total.functions?.pct ?? null,
		branches: total.branches?.pct ?? null,
	}
}

const junitPath = path.join(artifactsDir, 'reports', 'junit.xml')

const junit = parseJunitSummary(junitPath)

const coverage = parseCoverageSummary(
	path.join(artifactsDir, 'coverage', 'coverage-summary.json')
)

const parseFailedTests = (filePath) => {
	const xml = readIfExists(filePath)
	if (!xml) return []

	const testCases = [...xml.matchAll(/<testcase[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/testcase>/g)]

	return testCases
		.filter(([, , content]) =>
			content.includes('<failure') || content.includes('<error')
		)
		.map(([_, name]) => name)
}

/* ------------------ summaries ------------------ */

const jobsSummary = {
	test: results[0],
	build: results[1],
	docker: results[2],
	deploy: results[3],
}

const testsSummary = junit
	? `total=${junit.tests} passed=${junit.passed} failed=${junit.failures + junit.errors} skipped=${junit.skipped} duration=${junit.time}s`
	: 'report unavailable'

const failedTests = parseFailedTests(junitPath)

/* ------------------ content ------------------ */

const icon = {
	success: '✅',
	failure: '❌',
	cancelled: '⚠️',
	skipped: '⏭️',
	unknown: '❓',
}

const coverageColor = (pct) => {
	if (pct >= 80) return '#16a34a'
	if (pct >= 60) return '#ca8a04'
	return '#dc2626'
}

const commitUrl = `${serverUrl}/${repository}/commit/${commit}`

const jobsListHtml = Object.entries(jobsSummary)
	.map(([name, status]) => `
		<tr>
			<td style="padding:6px 0;">${icon[status]} <b>${name}</b></td>
			<td style="padding:6px 0;color:#6b7280;">${status}</td>
		</tr>
	`).join('')

const failedTestsHtml = failedTests.length
	? `
	<h3 style="margin:20px 0 8px;color:#b91c1c;">Failed Tests</h3>
	<div style="padding:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
	  <ul style="margin:0;padding-left:18px;">
	    ${failedTests
				.slice(0, 10)
				.map((t) => `<li>${escapeHtml(t)}</li>`)
				.join('')}
	  </ul>
	  ${
			failedTests.length > 10
				? `<p style="margin-top:8px;font-size:12px;color:#6b7280;">
			+ ${failedTests.length - 10} more...
		   </p>`
				: ''
		}
	</div>
`
	: ''

const subject = `${statusLabel} ${repository} • ${branch} • #${runNumber}`

const htmlBody = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial;">
    
    <table width="100%" style="max-width:720px;margin:auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
      
      <!-- HEADER -->
      <tr>
        <td style="background:${statusColor};padding:20px;color:white;">
          <h2 style="margin:0;font-size:20px;">
            ${statusLabel} Pipeline ${pipelineStatus.toUpperCase()}
          </h2>
          <p style="margin:6px 0 0;font-size:13px;opacity:.9;">
            ${repository} • ${branch} • Run #${runNumber}
          </p>
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td style="padding:20px;color:#111827;font-size:14px;">

          <table width="100%" style="margin-bottom:16px;">
            <tr><td><b>👤 Actor:</b></td><td>${escapeHtml(actor)}</td></tr>
            <tr><td><b>🌿 Branch:</b></td><td>${escapeHtml(branch)}</td></tr>
            <tr>
              <td><b>🔗 Commit:</b></td>
              <td>
                <a href="${escapeHtml(commitUrl)}" style="color:#2563eb;text-decoration:none;">
                  ${escapeHtml(commit.slice(0,7))}
                </a>
              </td>
            </tr>
          </table>

          <!-- JOBS -->
          <h3 style="margin:16px 0 8px;">Jobs</h3>
          <table width="100%" style="border-top:1px solid #e5e7eb;">
            ${jobsListHtml}
          </table>

          <!-- TESTS -->
          <h3 style="margin:20px 0 8px;">Tests</h3>
          <div style="padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
            ${escapeHtml(testsSummary)}
          </div>

          <!-- COVERAGE -->
          <h3 style="margin:20px 0 8px;">Coverage</h3>
          <div style="padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
            ${
							coverage
								? `
              <div>Lines: <b style="color:${coverageColor(coverage.lines)}">${safePct(coverage.lines)}%</b></div>
              <div>Statements: <b style="color:${coverageColor(coverage.statements)}">${safePct(coverage.statements)}%</b></div>
              <div>Functions: <b style="color:${coverageColor(coverage.functions)}">${safePct(coverage.functions)}%</b></div>
              <div>Branches: <b style="color:${coverageColor(coverage.branches)}">${safePct(coverage.branches)}%</b></div>
            `
								: 'Coverage unavailable'
						}
          </div>

					${failedTestsHtml}
					
          <!-- CTA -->
          <div style="margin-top:24px;">
            <a href="${escapeHtml(detailsUrl)}"
              style="display:inline-block;padding:12px 18px;background:#111827;color:white;border-radius:8px;text-decoration:none;font-size:14px;">
              View workflow run
            </a>
          </div>

        </td>
      </tr>

    </table>

  </body>
</html>`

/* ------------------ outputs ------------------ */

const outputDir = process.env.EMAIL_OUTPUT_DIR || '.artifacts/email'
fs.mkdirSync(outputDir, { recursive: true })

fs.writeFileSync(path.join(outputDir, 'subject.txt'), subject)
fs.writeFileSync(path.join(outputDir, 'body.html'), htmlBody)

console.log('Email content generated')