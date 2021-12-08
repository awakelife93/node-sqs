import env from "../env";
import messageController from "../message";
import { showMaximumDeleteCountOverMessages } from "../message/preprocessor";
import WebSocket from "../protocol/ws";
import publishController from "../publisher";
import queueController from "../queue";

const worker = async (): Promise<void> => {
  if (env.IS_SEND_TO_SOCKET_SUBSCRIBE) {
    console.log("STATEFUL SUBSCRIBE MESSAGE");
    WebSocket.connect();
  } else {
    console.log("STATELESS SUBSCRIBE MESSAGE");
  }

  const { queueUrls } = await queueController();

  await publishController(queueUrls);

  await messageController(queueUrls);

  await showMaximumDeleteCountOverMessages();
};

export default worker;
