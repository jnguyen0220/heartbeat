import  {parentPort, workerData} from  "worker_threads";
import got from "got"

const { worker } = workerData.job;
const {
  workerData: { url },
} = worker;

const result = { url, ok: false };

got(url, { timeout: { request: 2000 } })
  .then((res) => {
    result.ok = res.statusCode === 200;
  }).catch(err => {}).finally(() => {
    parentPort.postMessage(result);
  });