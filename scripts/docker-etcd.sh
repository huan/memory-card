#!/usr/bin/env bash

set -e

function main () {
  case $1 in
    start)
      start
      ;;
    stop)
      stop
      ;;
    *)
      >&2 echo "Usage: docker-etcd.sh [start|stop]"
      exit 1
      ;;
  esac
}

function start () {
  echo "Starting etcd server..."
  docker run -d --rm --name etcd-server \
      --network bridge \
      --publish 2379:2379 \
      --publish 2380:2380 \
      --env ALLOW_NONE_AUTHENTICATION=yes \
      --env ETCD_ADVERTISE_CLIENT_URLS=http://etcd-server:2379 \
      bitnami/etcd:latest
  echo "Started."
}

function stop () {
  echo "Stopping etcd server..."
  docker stop etcd-server
  echo "Stopped."
}

main "$@"
