Feature: Contact details
  In order complete my appeal
  As a citizen
  I want to be able to enter my contact details

  Scenario: Home office reference page
    Given I have an appeal with home office details, name, date of birth, nationality and address
    And I have logged in
    And I am on the contact details page
    When I click save for later
    Then I should see the task-list page
    And I shouldnt be able to click "Type of appeal"

    Given I am on the contact details page
    And I click save and continue
    Then I should see error summary

    Given I am on the contact details page
    When I enter text message number "07899999999"
    And I click save for later
    Then I should see the task-list page
    And I should be able to click "Type of appeal"

    Given I am on the contact details page
    When I enter text message number "07899999999"
    And I click save and continue
    Then I should see the task-list page
    And I should be able to click "Type of appeal"