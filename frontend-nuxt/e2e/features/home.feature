Feature: Home page

  Scenario: Page chrome loads
    Given I navigate to the home page
    Then the government banner is visible
    And the site header is visible
    And the main content area is visible
    And the site footer is visible

  Scenario: Hero renders CMS content and CTAs
    Given I navigate to the home page
    Then the hero heading "Natural resources revenue, collected and returned to the public" is visible
    And the hero has 2 CTAs
    And the first hero CTA is a primary button
    And the second hero CTA is an outline-inverse button

  Scenario: Cards band renders a flexible card grid
    Given I navigate to the home page
    Then the band "What do you need to do?" is a cards band with 3 cards
    And the "What do you need to do?" cards use an auto-fit grid

  Scenario: Prose band renders body and aside
    Given I navigate to the home page
    Then the band "Indian mineral owners and Tribes" has body and aside columns
    And the "Indian mineral owners and Tribes" band background is muted

  Scenario: Chart band renders the disbursements chart
    Given I navigate to the home page
    Then the band "The numbers, updated monthly" renders a chart
    And the "The numbers, updated monthly" chart shows takeaway "$1.1B disbursed in Dec 2025."

  Scenario: Steps band renders numbered steps
    Given I navigate to the home page
    Then the band "How revenue works" is a steps band with 3 steps
    And the first step is numbered "1" titled "Companies produce"

  Scenario: Announcements section renders the three most recent as cards
    Given I navigate to the home page
    Then the announcements section heading "Announcements" is visible
    And the announcements section shows 3 cards
    And the first announcement card is titled "Q1 reporting deadline extended"
