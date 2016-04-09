#!/bin/bash

kill -9 `pidof node`

nohup supervisor -- app.js -p 80 > 80.log &
