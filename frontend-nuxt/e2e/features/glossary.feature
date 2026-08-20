Feature: Glossary page

  Scenario: Terms render grouped by letter
    Given I navigate to the glossary page
    Then the glossary heading "Glossary" is visible
    And the glossary lists 5 terms
    And the glossary count reads "5 terms"
    And the glossary has a letter heading "R"
    And the glossary term "Royalty" is visible

  Scenario: Text filter narrows the list
    Given I navigate to the glossary page
    When I filter the glossary by "royalty"
    Then the glossary lists 1 term
    And the glossary term "Royalty" is visible
    And the glossary count reads "1 of 5 terms match"

  Scenario: Category filter narrows the list
    Given I navigate to the glossary page
    When I select the glossary category "Reporting"
    Then the glossary lists 1 term
    And the glossary term "1099 Form" is visible

  Scenario: A-Z rail marks active and empty letters
    Given I navigate to the glossary page
    Then the A-Z rail links to letter "R"
    And the A-Z rail disables letter "Z"

  Scenario: Each term has a deep-link anchor
    Given I navigate to the glossary page
    Then the glossary term "Royalty" has anchor id "royalty"
