Feature: Journey landing page

  Scenario: Journey layout and steps render
    Given I navigate to the journey landing page
    Then the journey landing heading "Getting Started" is visible
    And the journey has 2 steps
    And the first journey step is "Learn how leasing works"

  Scenario: Aside callout box
    Given I navigate to the journey landing page
    Then the journey callout is visible
    And the journey callout contains "Stuck, or not sure this applies to you?"
    And the journey callout has a CTA "Contact ONRR"

  Scenario: Aside references list
    Given I navigate to the journey landing page
    Then the journey references heading "Key references" is visible
    And the journey has 2 references

  Scenario: Path cards
    Given I navigate to the journey landing page
    Then the journey path heading "What are you reporting?" is visible
    And the journey has 2 path cards
    And the journey has 1 highlighted path card

  Scenario: Related band above the footer
    Given I navigate to the journey landing page
    Then the journey related heading "Once you're set up" is visible
    And the journey related band has 3 cards
    And the "Report" related card links to "/reporting"
