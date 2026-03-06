Feature: Home page

  Scenario: Home page loads successfully
    Given I navigate to the home page
    Then the government banner is visible
    And the site header is visible
    And the main content area is visible
    And the site footer is visible
