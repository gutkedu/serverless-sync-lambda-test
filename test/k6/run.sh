#!/bin/bash
set -e

# Enable k6 web dashboard
export K6_WEB_DASHBOARD=true
export K6_WEB_DASHBOARD_PORT=5665
export K6_WEB_DASHBOARD_PERIOD=2s
export K6_WEB_DASHBOARD_OPEN=true

# Ensure reports directory exists
mkdir -p reports


# Usage description
echo "Usage: $0 [1|2]"
echo "  1: spike-test.js (default)"
echo "  2: ramp-test.js"
echo "You can also use: $0 spike or $0 ramp"

# Interactive prompt if no argument is given
if [ -z "$1" ]; then
  read -p "Select test type [1=spike, 2=ramp]: " USER_INPUT
else
  USER_INPUT="$1"
fi

case "$USER_INPUT" in
  2|ramp)
    TEST_TYPE="ramp"
    TEST_FILE="ramp-test.js"
    ;;
  1|spike|"" )
    TEST_TYPE="spike"
    TEST_FILE="spike-test.js"
    ;;
  *)
    echo "Invalid option. Use 1 (spike) or 2 (ramp)."
    exit 1
    ;;
esac

export K6_WEB_DASHBOARD_EXPORT="reports/${TEST_TYPE}-report-$(date +%Y%m%d-%H%M%S).html"

k6 run "$TEST_FILE"
