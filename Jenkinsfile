pipeline {
  agent {
    docker {
      image 'node:lts-slim'
    }
  }
  stages {
    stage('build') {
      steps {
        sh 'node --version'
      }
    }
  }
}