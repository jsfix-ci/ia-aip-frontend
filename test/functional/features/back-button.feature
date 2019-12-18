Feature: Back button
  In order to navigate
  As a citizen
  I want to be able to navigate Back

Scenario: Navigate back to task list page
  Given I am authenticated as a valid appellant
  When I click on Home office details
  Then I should be taken to the home office ref number page
  When I enter "A12345" and click Save and Continue
  Then I should see error summary

  When I enter "A1234567" and click Save and Continue
  Then I should see letter sent page
  When I click on back button
  Then I should be taken to the home office ref number page
  And I shouldnt see error summary
