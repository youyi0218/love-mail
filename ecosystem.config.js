module.exports = {
  apps: [{
    name: "love-letter",
    script: "server/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 5682
    },
    node_args: "--experimental-json-modules",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: "logs/error.log",
    out_file: "logs/out.log",
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
} 