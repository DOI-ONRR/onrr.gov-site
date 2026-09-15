Feature: Production dataset preview

  Scenario: Yearly production renders a flat pivot grouped by product
    Given I navigate to the yearly production dataset page
    Then the production pivot has product row "Gas (mcf)"
    And the production pivot has product row "Oil (bbl)"
    And the production pivot has year column "2023"
    And the production pivot is a flat table

  Scenario: The annual filters are Period, Land class, Land category, Region and Commodity
    Given I navigate to the yearly production dataset page
    Then the production filter "Period" is present
    And the production filter "Land class" is present
    And the production filter "Land category" is present
    And the production filter "State/Offshore Region" is present
    And the production filter "Product" is present

  Scenario: Switching the Period from Fiscal to Calendar year updates the chart title
    Given I navigate to the yearly production dataset page
    Then the production chart title contains "fiscal year"
    When I set the production period to "Calendar year"
    Then the production chart title contains "calendar year"

  Scenario: Breaking out by State groups the table with a State column
    Given I navigate to the yearly production dataset page
    When I set the production breakout to "State"
    Then the production pivot has group band "Gas (mcf)"
    And the production pivot has column header "State"
    And the production pivot has detail row "Wyoming"

  Scenario: Monthly production renders a grouped table with month detail
    Given I navigate to the monthly production dataset page
    Then the production pivot has group band "Gas (mcf)"
    And the production pivot has column header "Month"
    And production month detail rows are visible

  Scenario: A populated dataset shows the Scope and Data publication sections
    Given I navigate to the yearly production dataset page
    Then the dataset section "Scope" is visible
    And the dataset section "Data publication" is visible
