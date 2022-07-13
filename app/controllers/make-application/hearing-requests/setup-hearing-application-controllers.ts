import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../../paths';
import { DocumentManagementService } from '../../../service/document-management-service';
import UpdateAppealService from '../../../service/update-appeal-service';
import { deleteSupportingEvidence, getProvideSupportingEvidence, getProvideSupportingEvidenceCheckAndSend, getProvideSupportingEvidenceYesOrNo, getRequestSent, postProvideSupportingEvidence, postProvideSupportingEvidenceCheckAndSend, postProvideSupportingEvidenceYesOrNo, uploadSupportingEvidence } from '../make-application-common';
import { getAdjournHearingApplication, postAdjournHearingApplication } from './adjourn-hearing-application';
import { getExpediteHearingApplication, postExpediteHearingApplication } from './expedite-hearing-application';
import { getHearingApplicationType, postHearingApplicationType } from './hearing-application-type';

function validate(redirectToUrl: string) {
  return (_req: Request, res: Response, next: NextFunction) => {
    try {
      let errorCode: string;
      if (res.locals.errorCode) {
        errorCode = res.locals.errorCode;
      }
      if (errorCode) {
        return res.redirect(`${redirectToUrl}?error=${errorCode}`);
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

function setupHearingApplicationControllers(middleware: Middleware[], updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService): Router {
  const router = Router();
  router.get(paths.makeApplication.expedite, middleware, getExpediteHearingApplication);
  router.get(paths.makeApplication.adjourn, middleware, getAdjournHearingApplication);
  router.get(paths.makeApplication.supportingEvidenceExpedite, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.supportingEvidenceAdjourn, middleware, getProvideSupportingEvidenceYesOrNo);
  router.get(paths.makeApplication.askChangeHearing, middleware, getHearingApplicationType);
  router.get(paths.makeApplication.provideSupportingEvidenceExpedite, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.provideSupportingEvidenceAdjourn, middleware, getProvideSupportingEvidence);
  router.get(paths.makeApplication.provideSupportingEvidenceDeleteFile, middleware, deleteSupportingEvidence(documentManagementService));
  router.get(paths.makeApplication.checkAnswerExpedite, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.get(paths.makeApplication.checkAnswerAdjourn, middleware, getProvideSupportingEvidenceCheckAndSend);
  router.get(paths.makeApplication.requestSent, middleware, getRequestSent);
  router.post(paths.makeApplication.expedite, middleware, postExpediteHearingApplication);
  router.post(paths.makeApplication.adjourn, middleware, postAdjournHearingApplication);
  router.post(paths.makeApplication.askChangeHearing, middleware, postHearingApplicationType);
  router.post(paths.makeApplication.provideSupportingEvidenceExpedite, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.provideSupportingEvidenceAdjourn, middleware, postProvideSupportingEvidence);
  router.post(paths.makeApplication.supportingEvidenceExpedite, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.supportingEvidenceAdjourn, middleware, postProvideSupportingEvidenceYesOrNo);
  router.post(paths.makeApplication.provideSupportingEvidenceUploadFile, middleware, validate(paths.makeApplication.provideSupportingEvidenceExpedite), uploadSupportingEvidence(documentManagementService));
  router.post(paths.makeApplication.checkAnswerExpedite, middleware, validate(paths.makeApplication.provideSupportingEvidenceExpedite), postProvideSupportingEvidenceCheckAndSend(updateAppealService));
  router.post(paths.makeApplication.checkAnswerAdjourn, middleware, validate(paths.makeApplication.provideSupportingEvidenceAdjourn), postProvideSupportingEvidenceCheckAndSend(updateAppealService));
  return router;
}

export {
  setupHearingApplicationControllers,
  validate
};
