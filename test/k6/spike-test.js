import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

const config = new SharedArray("config", function () {
  return [JSON.parse(open("./config.json"))];
})[0];

const enabledApis = config.apis.filter((api) => api.enabled);

const maxTimeSec = 90; // total test duration

const warmup = Math.floor(maxTimeSec * 0.1);
const spike1 = Math.floor(maxTimeSec * 0.08);
const cool1 = Math.floor(maxTimeSec * 0.08);
const pause1 = Math.floor(maxTimeSec * 0.08);
const spike2 = Math.floor(maxTimeSec * 0.12);
const cool2 = Math.floor(maxTimeSec * 0.08);
const pause2 = Math.floor(maxTimeSec * 0.08);
const spike3 = Math.floor(maxTimeSec * 0.12);
const cool3 = Math.floor(maxTimeSec * 0.08);
const finish =
  maxTimeSec - warmup - spike1 - cool1 - pause1 - spike2 - cool2 - pause2;

export let options = {
  stages: [
    { duration: `${warmup}s`, target: 10 }, // warmup
    { duration: `${spike1}s`, target: 50 }, // first spike
    { duration: `${cool1}s`, target: 10 }, // cool down
    { duration: `${pause1}s`, target: 0 }, // pause
    { duration: `${spike2}s`, target: 100 }, // second spike
    { duration: `${cool2}s`, target: 10 }, // cool down
    { duration: `${pause2}s`, target: 0 }, // pause
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
  sleep(1); // vu interval between iterations
}
