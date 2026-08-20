Feature: Handbook detail page

  Scenario: Header, rail, and complete-handbook button
    Given I navigate to the handbook detail page
    Then the handbook heading "Minerals Revenue Reporter Handbook" is visible
    And the handbook shows the release "Release 4.5, dated 3/18/2026"
    And the handbook rail links to "Table of contents"
    And the handbook rail links to "Chapters"
    And the handbook rail links to "Supplemental information"
    And the handbook rail links to "Contact"
    And the handbook has a complete-handbook button to "/document/RRM-Printable.Minerals.Revenue.Handbook.docx"

  Scenario: Table of contents renders with page links
    Given I navigate to the handbook detail page
    Then the TOC has 3 entries
    And the TOC entry "Naming Conventions" links to "/document/RRM.pdf#23"
    And the TOC row "Chapters" has no link

  Scenario: Table of contents search filters entries
    Given I navigate to the handbook detail page
    When I search the TOC for "naming"
    Then the TOC has 1 entry
    And the TOC entry "Naming Conventions" links to "/document/RRM.pdf#23"

  Scenario: Chapters and contact sections
    Given I navigate to the handbook detail page
    Then the chapters section lists 2 documents
    And the contact box shows "Aaron Lindquist"
    And the contact box has a mailto link for "aaron.lindquist@onrr.gov"

  Scenario: Handbook detail is full-width with no side navigation
    Given I navigate to the handbook detail page
    Then the handbook has no side navigation
