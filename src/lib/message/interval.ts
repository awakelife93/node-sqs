import _ from "lodash";
import { getMessageToDeleteWorker } from ".";
import { getCacheItem, setCacheItem } from "../../lib/cache";
import { CacheKeyStatus, ErrorStatus } from "../../lib/enum";
import { SubScribeRequestIE } from "../../lib/interface";
import worker from "../../lib/worker";
import publisher from "../../lib/publisher";
import constant from "../constant";

const intervalPullingMessage = async (queueUrls: string[]): Promise<void> => {
  try {
    // first shot
    await intervalWorker(queueUrls);
    const intervalPullingMessageId: NodeJS.Timer = setInterval(
      async() => {
        await intervalWorker(queueUrls);
    }, constant.MESSAGE_PULLING_TIME);

    setCacheItem(CacheKeyStatus.INTERVAL_PULLING_MESSAGE_ID, intervalPullingMessageId);
  } catch(error) {
    console.error(`============ intervalPullingMessage Error ============ ${error}`);
    // todo: restart인지, clear인지 에러 로직에 대해서 고민해보기...
    throw new Error(ErrorStatus.STOP_INTERVAL_PULLING_MESSAGE);
  }
};

const clearIntervalPullingMessage = (): void => {
  const intervalPullingMessageId = getCacheItem(CacheKeyStatus.INTERVAL_PULLING_MESSAGE_ID, null);

  if (!_.isNull(intervalPullingMessageId)) {
    clearInterval(intervalPullingMessageId);
    setCacheItem(CacheKeyStatus.INTERVAL_PULLING_MESSAGE_ID, null);
  }
};

const reStartIntervalPullingMessage = (): void => {
  clearIntervalPullingMessage();
  worker();
};

const intervalWorker = async (queueUrls: string[]): Promise<void> => {
  // todo: 얻어오고 지워냈으므로, 애네들을 SubScribe Server로 보내야함.
  const messageItem: SubScribeRequestIE = await getMessageToDeleteWorker(queueUrls);
  console.log(`go subscribe ==============>`);
  console.log(messageItem);

  // * 다시 샘플 데이터를 넣어주기 위해서 잠깐 넣어 놓음.
  setTimeout(async () => {
    await publisher(queueUrls);
  }, 5000);
};

const intervalController = {
  intervalPullingMessage,
  clearIntervalPullingMessage,
  reStartIntervalPullingMessage
};

export default intervalController;