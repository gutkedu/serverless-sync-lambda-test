import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

const config = new SharedArray("config", function () {
  return [JSON.parse(open("./config.json"))];
})[0];

const enabledApis = config.apis.filter((api) => api.enabled);

// Set the total test time in seconds
const maxTimeSec = 30;
// Calculate durations for ramp pattern (proportional to maxTimeSec)
const rampUp = Math.floor(maxTimeSec * 0.2); // 20% ramp-up
const steady = Math.floor(maxTimeSec * 0.6); // 60% steady load
const rampDown = maxTimeSec - rampUp - steady; // remaining for ramp-down

export let options = {
  stages: [
    { duration: `${rampUp}s`, target: 10 }, // ramp up to 10 VUs
    { duration: `${steady}s`, target: 100 }, // steady load
    { duration: `${rampDown}s`, target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  for (const api of enabledApis) {
    let res = http.post(api.url, JSON.stringify({ test: "data" }), {
      headers: { "Content-Type": "application/json" },
      tags: { api: api.name },
    });
    check(res, {
      "status is 200": (r) => r.status === 200,
    });
  }
  sleep(1); // interval between iterations
}
