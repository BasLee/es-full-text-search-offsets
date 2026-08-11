#!/usr/bin/env bash

curl -s -XPUT 'localhost:9200/demo/_doc/1?refresh' \
  -H 'Content-Type: application/json' \
  -d '{"content":"foo bar baz"}'
