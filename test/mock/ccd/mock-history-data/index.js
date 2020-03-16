const appealSubmittedHistoryEvent = require('./data/appeal-submitted');
const awaitingReasonsForAppealHistoryEvent = require('./data/awaiting-reasons-for-appeal');
const partialAppealStartedHistoryEvent = require('./data/partial-appeal-started');
const partialAwaitingReasonsForAppealHistoryEvent = require('./data/partial-awaiting-reasons-for-appeal');

module.exports = {
  appealSubmittedHistoryEvent,
  partialAppealStartedHistoryEvent,
  awaitingReasonsForAppealHistoryEvent,
  partialAwaitingReasonsForAppealHistoryEvent
};