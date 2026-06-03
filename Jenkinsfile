pipeline {
  agent any

  environment {
    IMAGE_NAME   = 'world-cup-poll-backend:latest'
    COMPOSE_FILE = '/home/ubuntu/projeto-c14/docker-compose.yml'
  }

  stage('Build image') {
    steps {
      sh 'docker build -t world-cup-poll-backend:latest .'
    }
  }

  stage('Deploy') {
    when { branch 'main' }
    steps {
      sh """
        docker compose -f ${COMPOSE_FILE} up -d --no-deps backend
      """
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}