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
    }
    always {
      archiveArtifacts(
        artifacts: 'coverage/**',
        fingerprint: true,
        allowEmptyArchive: true
      )
      cleanWs()
    }
  }
}
