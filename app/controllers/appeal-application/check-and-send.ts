import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import * as nunjucks from 'nunjucks';
import i18n from '../../../locale/en.json';
import { countryList } from '../../data/country-list';
import { appealOutOfTimeMiddleware } from '../../middleware/outOfTime-middleware';
import { paths } from '../../paths';
import { Events } from '../../service/ccd-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { statementOfTruthValidation } from '../../utils/validations/fields-validations';

function createSummaryRowsFrom(appealApplication: AppealApplication) {
  let appealTypes: string[] = !Array.isArray(appealApplication.appealType)
    ? [ appealApplication.appealType ] : appealApplication.appealType;

  const appealTypeNames: string[] = appealTypes.map(appealType => {
    return i18n.appealTypes[appealType].name;
  });
  const country = countryList.find(country => country.value === appealApplication.personalDetails.nationality);
  const editParameter = '?edit';
  const rows = [
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.homeOfficeRefNumber,
      [ appealApplication.homeOfficeRefNumber ],
      paths.homeOffice.details + editParameter
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.dateLetterSent,
      [ appealApplication.dateLetterSent.day, moment.months(appealApplication.dateLetterSent.month - 1), appealApplication.dateLetterSent.year ],
      paths.homeOffice.letterSent + editParameter,
      Delimiter.SPACE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.name,
      [ appealApplication.personalDetails.givenNames, appealApplication.personalDetails.familyName ],
      paths.personalDetails.name + editParameter,
      Delimiter.SPACE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.dob,
      [ appealApplication.personalDetails.dob.day, moment.months(appealApplication.personalDetails.dob.month - 1), appealApplication.personalDetails.dob.year ],
      paths.personalDetails.dob + editParameter,
      Delimiter.SPACE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.nationality,
      [ country.name ],
      paths.personalDetails.nationality + editParameter
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.addressDetails,
      [ ...Object.values(appealApplication.personalDetails.address) ],
      paths.personalDetails.enterAddress + editParameter,
      Delimiter.BREAK_LINE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.contactDetails,
      [ appealApplication.contactDetails.email, appealApplication.contactDetails.phone ],
      paths.contactDetails + editParameter,
      Delimiter.BREAK_LINE
    ),
    addSummaryRow(
      i18n.pages.checkYourAnswers.rowTitles.appealType,
      [ appealTypeNames ],
      paths.typeOfAppeal + editParameter
    )
  ];
  if (appealApplication.isAppealLate) {
    const lateAppealValue = [ appealApplication.lateAppeal.reason ];
    if (appealApplication.lateAppeal.evidence) {
      const evidence = {
        evidence: appealApplication.lateAppeal.evidence.name,
        evidenceUrl: '#'
      };
      lateAppealValue.push(i18n.pages.checkYourAnswers.rowTitles.supportingEvidence);
      lateAppealValue.push(nunjucks.renderString(i18n.pages.checkYourAnswers.supportingEvidence, evidence));
    }
    const lateAppealRow = addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.appealLate, lateAppealValue, paths.homeOffice.appealLate);
    rows.push(lateAppealRow);
  }
  return rows;
}

function getCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const summaryRows = createSummaryRowsFrom(application);
    return res.render('appeal-application/check-and-send.njk', {
      summaryRows,
      previousPage: paths.taskList
    });
  } catch (error) {
    next(error);
  }
}

function postCheckAndSend(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {

    const request = req.body;
    try {
      const { application } = req.session.appeal;
      const summaryRows = createSummaryRowsFrom(application);
      const validationResult = statementOfTruthValidation(request);
      if (validationResult) {
        return res.render('appeal-application/check-and-send.njk', {
          summaryRows: summaryRows,
          error: validationResult,
          errorList: Object.values(validationResult),
          previousPage: paths.taskList
        });
      }
      await updateAppealService.submitEvent(Events.SUBMIT_APPEAL, req);
      return res.redirect(paths.confirmation);
    } catch (error) {
      next(error);
    }
  };
}

function setupCheckAndSendController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.checkAndSend, appealOutOfTimeMiddleware, getCheckAndSend);
  router.post(paths.checkAndSend, postCheckAndSend(updateAppealService));
  return router;
}

export {
  createSummaryRowsFrom,
  setupCheckAndSendController,
  getCheckAndSend,
  postCheckAndSend
};