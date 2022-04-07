import express, { NextFunction, Request, Response } from 'express';
import {
  getPrivateHearingQuestion,
  postPrivateHearingQuestion,
  setupPrivateHearingQuestionController
} from '../../../../../app/controllers/hearing-requirements/other-needs/private-hearing-question';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Other Needs Section: Private Hearing Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          hearingRequirements: {
            otherNeeds: {}
          }
        } as Partial<Appeal>
      },
      idam: {
        userDetails: {
          uid: 'someid'
        }
      },
      cookies: {
        '__auth-token': 'atoken'
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPrivateHearingQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupPrivateHearingQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion);
    });
  });

  describe('getPrivateHearingQuestion', () => {
    it('should render question page', () => {

      getPrivateHearingQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/hearing-private',
        pageTitle: 'Will you need a private hearing?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          title: 'Will you need a private hearing?',
          hint: 'A private hearing means the public will not be allowed to attend.',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        saveAndContinue: true

      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getPrivateHearingQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postPrivateHearingQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postPrivateHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          href: '#answer',
          key: 'answer',
          text: 'Select yes if you need a private hearing'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/hearing-private',
        pageTitle: 'Will you need a private hearing?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          title: 'Will you need a private hearing?',
          hint: 'A private hearing means the public will not be allowed to attend.',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        saveAndContinue: true
      };

      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', expectedArgs);
    });

    it('should validate and redirect to next page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postPrivateHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsPrivateHearingReason);
      expect(req.session.appeal.hearingRequirements.otherNeeds.privateAppointment).to.be.true;
    });

    it('should validate if appellant answers no and redirect to next page', async () => {
      req.body['answer'] = 'no';
      await postPrivateHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsHealthConditions);
      expect(req.session.appeal.hearingRequirements.otherNeeds.privateAppointment).to.be.false;
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postPrivateHearingQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});