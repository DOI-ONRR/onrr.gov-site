Feature: Dataset page header actions

  Scenario: A dataset with a preview shows both actions, with Download secondary
    Given I navigate to the monthly disbursements dataset page
    Then the dataset header button "Preview & filter data" is a primary button
    And the dataset header button "Download files" is an outline button

  Scenario: A dataset without a source collection has no preview or download section, only supplemental content
    Given I navigate to the reference tables dataset page
    Then the dataset header button "Preview & filter data" is not rendered
    And the dataset header button "Download files" is not rendered
    And the download section is not rendered
    And the page shows a supplemental download link to "/reports/historical-allocations.pdf"
