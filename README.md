# Equestre-Web
Equestre Web application works with Equestre Pro and received data from Equestre Live app.

## Requirements
* MySql
* Node

## Getting Started
1. install db and db structure. dump file is located in `sqldump/dump.sql`.
2. Run the application
```
$ node push_server.js
```

## Deployment Guide
In order to deploy this to production server, please install forever.
```
$ npm install -g forever
$ forever start forever.json
```
