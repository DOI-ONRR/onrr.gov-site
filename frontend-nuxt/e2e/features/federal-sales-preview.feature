Feature: Federal Sales dataset preview

  Scenario: Federal sales renders a flat table with the six measure columns
    Given I navigate to the federal sales dataset page
    Then the federal sales table has column "Sales Volume"
    And the federal sales table has column "Sales Value"
    And the federal sales table has column "RVLA"
    And the federal sales table has commodity row "Oil"

  Scenario: The preview renders the reactive commodity charts
    Given I navigate to the federal sales dataset page
    Then the federal sales chart section "Sales volume by commodity" is visible
    And the federal sales chart section "Royalty value less allowances (RVLA) by commodity" is visible
    And a federal sales chart pane "Oil" is visible
    And a federal sales chart pane "Gas" is visible
    And a federal sales chart pane "NGL" is visible

  Scenario: The federal sales filters are From, Commodity, Land type and Region
    Given I navigate to the federal sales dataset page
    Then the federal sales filter "From" is present
    And the federal sales filter "Commodity" is present
    And the federal sales filter "Land type" is present
    And the federal sales filter "State/Offshore Region" is present

  Scenario: Breaking out by Land Type groups the table with a Land Type column
    Given I navigate to the federal sales dataset page
    When I set the federal sales breakout to "Land Type"
    Then the federal sales table has group band "Oil"
    And the federal sales table has column "Land Type"
    And the federal sales table has detail row "Federal Onshore"

  Scenario: Filter values are read from the URL query parameters
    Given I navigate to the federal sales dataset page with query "?breakout=land_type"
    Then the federal sales table has group band "Oil"

  Scenario: Changing a filter reflects into the URL query
    Given I navigate to the federal sales dataset page
    When I set the federal sales breakout to "Land Type"
    Then the page URL contains "breakout=land_type"

  Scenario: Sorting by Commodity reorders the flat table alphabetically
    Given I navigate to the federal sales dataset page
    Then the first federal sales commodity row is "Oil"
    When I sort the federal sales table by "Commodity"
    Then the first federal sales commodity row is "Gas"
