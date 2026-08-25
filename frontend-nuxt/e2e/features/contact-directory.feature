Feature: Per-topic contacts directory

  Scenario: A topic page lists its contacts in groups with role-coloured cards
    Given I open the "oil-gas-reporting" contacts page
    Then the contacts page heading is "Oil & Gas Reporting contacts"
    And the directory shows 2 groups
    And the directory shows 4 contact cards
    And the card for "Michael Anspach" has the "supervisor" role style
    And the card for "Katie Connor" has the "indian" role style
    And the card for "Maria Foster" has the "federal" role style

  Scenario: The filter narrows the directory
    Given I open the "oil-gas-reporting" contacts page
    When I filter contacts by "Foster"
    Then the directory shows 1 contact card
