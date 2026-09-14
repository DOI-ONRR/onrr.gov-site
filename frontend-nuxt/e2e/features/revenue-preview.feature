Feature: Revenue dataset preview

  Scenario: Revenue renders a flat pivot grouped by commodity with currency values
    Given I navigate to the revenue dataset page
    Then the revenue pivot has commodity row "Oil"
    And the revenue pivot has commodity row "Not tied to a commodity"
    And the revenue pivot shows a currency value
    And the revenue pivot is a flat table

  Scenario: The revenue filters are Period, Year, Land type, Revenue type, Region and Commodity
    Given I navigate to the revenue dataset page
    Then the revenue filter "Period" is present
    And the revenue filter "Year from" is present
    And the revenue filter "Land type" is present
    And the revenue filter "Revenue type" is present
    And the revenue filter "State/Offshore Region" is present
    And the revenue filter "Commodity" is present

  Scenario: The Period selector offers Monthly, Calendar year and Fiscal year
    Given I navigate to the revenue dataset page
    Then the revenue period options are "Monthly", "Calendar year" and "Fiscal year"

  Scenario: Switching the Period to Monthly groups the table with month detail
    Given I navigate to the revenue dataset page
    Then the revenue pivot is a flat table
    When I set the revenue period to "Monthly"
    Then the revenue pivot has group band "Oil"
    And the revenue pivot has column header "Month"

  Scenario: The chart is a multi-series currency chart (not small multiples)
    Given I navigate to the revenue dataset page
    Then the revenue chart title contains "fiscal year"
    And the revenue chart is not small multiples

  Scenario: A dataset with no scope or publication hides those section headers
    Given I navigate to the revenue dataset page
    Then the dataset section "Scope" is not rendered
    And the dataset section "Data publication" is not rendered
