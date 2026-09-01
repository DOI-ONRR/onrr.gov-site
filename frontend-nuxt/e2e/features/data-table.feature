Feature: Data table block (collection-driven reference table)

  Scenario: Flat source — columns, formatted rows, and a footnote
    Given I navigate to the valuation page
    Then the data table has columns "Month", "Calendar month average", "Roll"
    And the data table has 3 rows
    And the data table shows "September 2024"
    And the data table shows "$69.37"
    And the data table footnote links to "/document/nymex.xlsx"

  Scenario: Embedded-array (snapshot) source explodes into rows, with an "as of" line
    Given I navigate to the valuation page
    Then the nested data table has columns "Abbr.", "Index zone", "Price"
    And the nested data table has 2 rows
    And the nested data table shows "Oklahoma Zone 1"
    And the nested data table shows "$2.12"
    And the nested data table shows the as-of "Prices for March 2026"
