Feature: Monthly disbursements dataset page

  Scenario: The preview pivot renders with groups and year columns
    Given I navigate to the monthly disbursements dataset page
    Then the preview pivot has group "State & local"
    And the preview pivot has group "U.S. Treasury"
    And the preview pivot has year columns "2020" and "2021"
    And the preview pivot has a subtotal row

  Scenario: Grouping by Source switches the pivot dimension
    Given I navigate to the monthly disbursements dataset page
    When I group the pivot by "Source"
    Then the preview pivot has group "Onshore"
    And the preview pivot has group "Offshore"

  Scenario: Negative values use the secondary color
    Given I navigate to the monthly disbursements dataset page
    Then a negative pivot value is styled with text-secondary

  Scenario: Collapse all / Expand all toggles every group
    Given I navigate to the monthly disbursements dataset page
    Then the pivot toggle button reads "Collapse all"
    And month detail rows are visible
    When I click the pivot toggle button
    Then the pivot toggle button reads "Expand all"
    And no month detail rows are visible

  Scenario: Recipients multi-select supports select-all
    Given I navigate to the monthly disbursements dataset page
    Then the recipients trigger reads "All recipients"
    When I open the recipients dropdown
    Then the recipients dropdown has a "Select all" option
    When I toggle select-all in the recipients dropdown
    Then the recipients trigger reads "None selected"

  Scenario: The Download section renders the three cards
    Given I navigate to the monthly disbursements dataset page
    Then the download card "Full dataset (CSV)" shows "All 50,769 records"
    And the download card "Full dataset (XLSX)" shows "All records with data dictionary · 1.9 MB"
    And the "Your filtered selection" download card has a download link
