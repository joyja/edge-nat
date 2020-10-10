module.exports = {
  apps: [
    {
      name: 'edge-nat',
      script: './src/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
  deploy: {
    production: {
      user: 'root',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'https://github.com/joyja/edge-nat.git',
      path: 'home/ubuntu/edge-nat',
      'post-deploy':
        'npm install && pm2 startOrRestart ecosystem.config.js --env production',
    },
  },
}
