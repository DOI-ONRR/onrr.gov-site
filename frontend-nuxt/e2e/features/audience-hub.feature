Feature: Audience hub page

  Scenario: Header band with breadcrumb, heading, and intro
    Given I navigate to the audience hub page
    Then the hub header heading "Indian Resources" is visible
    And the hub header contains the breadcrumb
    And the hub header intro contains "Revenue from energy and mineral production"

  Scenario: Header band is full-width
    Given I navigate to the audience hub page
    Then the hub header spans the full viewport width

  Scenario: Audience routing cards
    Given I navigate to the audience hub page
    Then the audience heading "Start with who you are" is visible
    And the hub has 3 audience cards

  Scenario: Services list and help box
    Given I navigate to the audience hub page
    Then the services heading "Everything in this section" is visible
    And the hub has 2 services
    And the hub help box has a CTA "Contact ONRR assistance"

  Scenario: Data band chart and links
    Given I navigate to the audience hub page
    Then the data band heading "Learn how it works" is visible
    And the data band has 3 links
    And the data band chart shows takeaway "$911.4M reached Tribes and individual Indian mineral owners in 2025."
