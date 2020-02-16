import { WCA_EVENTS } from "../constants/wca.constants";

export const wcaEventId2WcaEventName = wcaEventId => {
  let wcaEvent = WCA_EVENTS.find(wcaEvent => wcaEvent.id === wcaEventId);
  return wcaEvent != null ? wcaEvent.name : wcaEventId;
};
