import moment from 'moment';

function getDeadline(currentAppealStatus: string, history) {
  switch (currentAppealStatus) {
    case 'appealStarted': {
      return null;
    }
    case 'appealSubmitted': {
      const daysToDeadline = 14;
      const triggeringDate = history['appealSubmitted'].date;
      const formattedDeadline = moment(triggeringDate).add(daysToDeadline, 'days').format('DD MMMM YYYY');
      return formattedDeadline || null;
    }
  }
  return;
}

export {
  getDeadline
};