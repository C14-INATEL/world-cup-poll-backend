pipeline {
  agent any

  tools {
      nodejs 'node22.16'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    NODE_VERSION = '22.12.0'
    CI = 'true'
    IMAGE_NAME = 'world-cup-poll-backend:latest'
    COMPOSE_FILE = '/home/ubuntu/projeto-c14/docker-compose.yml'
    NOTIFICATION_EMAILS = 'viniciusgsimoni@gmail.com, joaovitorlucena000@gmail.com'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh '''
          set -euo pipefail
          npm ci
        '''
      }
    }

    stage('Typecheck') {
      steps {
        sh '''
          set -euo pipefail
          npx tsc -p tsconfig.build.json
        '''
      }
    }

    stage('Test') {
      steps {
        sh '''
          set -euo pipefail
          npm run coverage
        '''
      }
      post{
        always{
          junit(testResults: 'coverage/junit.xml', allowEmptyResults: true)

          publishHTML(target: [
            allowMissing         : true,
            alwaysLinkToLastBuild: true,
            keepAll              : true,
            reportDir            : 'coverage',
            reportFiles          : 'test-report.html', // ← relatório de testes
            reportName           : 'Test Report'])

          publishHTML(target: [
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'coverage',
            reportFiles: 'index.html',
            reportName: 'Coverage Report'])
        }
      }
    }

    stage('Build') {
      steps {
        sh '''
          set -euo pipefail
          npm run build
          docker build -t "${IMAGE_NAME}" .
        '''
      }
    }

    stage('Deploy') {
      steps {
        sh '''
          set -euo pipefail
          docker compose -f "${COMPOSE_FILE}" up -d --no-deps backend
        '''
      }
    }
  }

  post {
    failure {
      echo 'Pipeline failed!'
      script {
        if (env.NOTIFICATION_EMAILS?.trim()) {
          def testSummary = 'Test summary unavailable: coverage/junit.xml was not found. Tests may not have run, or Vitest may have failed before writing the JUnit report.'

          if (fileExists('coverage/junit.xml')) {
            def junitXml = readFile('coverage/junit.xml')
            def testsMatcher = junitXml =~ /<testsuites[^>]*tests="(\d+)"/
            def failuresMatcher = junitXml =~ /<testsuites[^>]*failures="(\d+)"/
            def errorsMatcher = junitXml =~ /<testsuites[^>]*errors="(\d+)"/
            def skippedRootMatcher = junitXml =~ /<testsuites[^>]*skipped="(\d+)"/

            if (testsMatcher.find() && failuresMatcher.find() && errorsMatcher.find()) {
              def totalTests = testsMatcher.group(1).toInteger()
              def failedTests = failuresMatcher.group(1).toInteger()
              def errorTests = errorsMatcher.group(1).toInteger()
              def skippedTests = 0

              if (skippedRootMatcher.find()) {
                skippedTests = skippedRootMatcher.group(1).toInteger()
              } else {
                def skippedMatcher = junitXml =~ /<testsuite[^>]*skipped="(\d+)"/

                while (skippedMatcher.find()) {
                  skippedTests += skippedMatcher.group(1).toInteger()
                }
              }

              def passedTests = Math.max(totalTests - failedTests - errorTests - skippedTests, 0)

              testSummary = """Test summary:
Total: ${totalTests}
Passed: ${passedTests}
Failed: ${failedTests}
Errors: ${errorTests}
Skipped: ${skippedTests}"""
            }
          }

          mail(
            to: env.NOTIFICATION_EMAILS,
            subject: "[Jenkins] Backend failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
Backend pipeline failed.

Job: ${env.JOB_NAME}
Build: #${env.BUILD_NUMBER}
Status: ${currentBuild.currentResult}
URL: ${env.BUILD_URL}

${testSummary}

Check the Jenkins console output and test reports for details.
"""
          )
        } else {
          echo 'No NOTIFICATION_EMAILS configured; skipping email notification.'
        }
      }
    }
    always {
      archiveArtifacts(
        artifacts: 'coverage/**',
        fingerprint: true,
        allowEmptyArchive: true
      )
    }
    cleanup {
      cleanWs()
    }
  }
}
