import { appealApplicationStatus } from '../../../app/utils/tasks-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('getStatus', () => {

  const appeal: Appeal = {
    application: {
      homeOfficeRefNumber: 'reference no',
      appealType: null,
      contactDetails: null,
      dateLetterSent: {
        day: 1,
        month: 1,
        year: 1980
      },
      isAppealLate: true,
      lateAppeal: null,
      personalDetails: {
        givenNames: 'given names',
        familyName: 'family name',
        dob: null,
        nationality: null
      },
      tasks: {
        homeOfficeDetails: {
          saved: false,
          completed: false,
          active: true
        },
        personalDetails: {
          saved: true,
          completed: false,
          active: false
        },
        contactDetails: {
          saved: false,
          completed: false,
          active: false
        },
        typeOfAppeal: {
          saved: false,
          completed: false,
          active: false
        },
        checkAndSend: {
          saved: false,
          completed: false,
          active: false
        }
      }
    },
    caseBuilding: {},
    hearingRequirements: {}
  };

  const status = {
    homeOfficeDetails: {
      saved: true,
      completed: false,
      active: true
    },
    personalDetails: {
      saved: true,
      completed: false,
      active: false
    },
    contactDetails: {
      saved: false,
      completed: false,
      active: false
    },
    typeOfAppeal: {
      saved: false,
      completed: false,
      active: false
    },
    checkAndSend: {
      saved: false,
      completed: false,
      active: false
    }
  };

  it('should update status in session', () => {
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status homeOfficeDetails as completed and mark active next task', () => {
    appeal.application.isAppealLate = false;
    status.homeOfficeDetails.completed = true;
    status.personalDetails.active = true;
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status personalDetails as completed and mark active next task', () => {
    appeal.application.personalDetails.dob = {
      day: 1,
      month: 1,
      year: 1980
    };
    appeal.application.personalDetails.nationality = 'Angola';
    appeal.application.contactDetails = {
      address: {
        line1: '60 GPS London United Kingdom  W1W 7RT60 GPS London United Kingdom  W1W 7RT',
        postcode: 'W1W 7RT'
      }
    };
    status.personalDetails.completed = true;
    status.contactDetails.active = true;
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status contactDetails as completed and mark active next task', () => {
    appeal.application.contactDetails = {
      ...appeal.application.contactDetails,
      phone: '07769118762'
    };
    status.contactDetails = {
      ...status.contactDetails,
      completed: true,
      saved: true
    };
    status.typeOfAppeal.active = true;
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status contactDetails as completed', () => {
    appeal.application.contactDetails = {
      ...appeal.application.contactDetails,
      phone: undefined,
      email: 'email@test.com'
    };
    status.contactDetails = {
      ...status.contactDetails,
      completed: true,
      saved: true
    };
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status typeOfAppeal as completed', () => {
    appeal.application.appealType = ['type'];
    status.typeOfAppeal = {
      ...status.typeOfAppeal,
      completed: true,
      saved: true
    };
    status.checkAndSend.active = true;
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });
});
