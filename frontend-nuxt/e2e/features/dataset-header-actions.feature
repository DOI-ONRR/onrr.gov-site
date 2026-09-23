Feature: Dataset page header actions

  Scenario: A dataset with a preview shows both actions, with Download secondary
    Given I navigate to the monthly disbursements dataset page
    Then the dataset header button "Preview & filter data" is a primary button
    And the dataset header button "Download files" is an outline button

  Scenario: A dataset without a source collection hides the preview action and promotes Download
    Given I navigate to the reference tables dataset page
    Then the dataset header button "Preview & filter data" is not rendered
    And the dataset header button "Download files" is a primary button
    And the download card "Full dataset (CSV)" is not rendered
    And the "Full dataset (PDF)" download card has a download link
