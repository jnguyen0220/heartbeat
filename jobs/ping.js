import  {parentPort, workerData} from  "worker_threads";
import net from "net";

const REQUEST_TIMEOUT = 1000;
const { worker } = workerData.job;
const {
  workerData: { url, port },
} = worker;

const result = { url, ok: false };

const socket = new net.Socket();
socket.setTimeout(REQUEST_TIMEOUT, () => {
  socket.destroy();
  parentPort.postMessage(result);
});
socket.connect(port, url, () => {
  socket.end();
  result.ok = true;
  parentPort.postMessage(result);
});

socket.on("timeout", () => {
  socket.end();
  parentPort.postMessage(result);
});

socket.on("error", () => {
  socket.end();
  parentPort.postMessage(result);
});