Feature: Federal Revenue by Company dataset preview

  Scenario: The table has a Company column and one column per calendar year
    Given I navigate to the federal revenue by company dataset page
    Then the company table has column "Company"
    And the company table has column "2021"
    And the company table has column "2023"
    And the company table has company row "Exxon Mobil Corporation"

  Scenario: The preview renders the reactive top-companies chart
    Given I navigate to the federal revenue by company dataset page
    Then the company chart title contains "company"

  Scenario: The filters are From, Search companies, Commodity and Revenue type
    Given I navigate to the federal revenue by company dataset page
    Then the company filter "From" is present
    And the company filter "Search companies" is present
    And the company filter "Commodity" is present
    And the company filter "Revenue type" is present

  Scenario: Breaking out by Commodity groups the table with a Commodity column
    Given I navigate to the federal revenue by company dataset page
    When I set the company breakout to "Commodity"
    Then the company table has group band "Exxon Mobil Corporation"
    And the company table has column "Commodity"
    And the company table has detail row "Oil"

  Scenario: Filter values are read from the URL query parameters
    Given I navigate to the federal revenue by company dataset page with query "?breakout=commodity"
    Then the company table has group band "Exxon Mobil Corporation"

  Scenario: Changing the breakout reflects into the URL query
    Given I navigate to the federal revenue by company dataset page
    When I set the company breakout to "Commodity"
    Then the page URL contains "breakout=commodity"

  Scenario: Sorting by Company reorders the flat table alphabetically
    Given I navigate to the federal revenue by company dataset page
    Then the first company row is "Exxon Mobil Corporation"
    When I sort the company table by "Company"
    Then the first company row is "Chevron U.S.A. Inc."
