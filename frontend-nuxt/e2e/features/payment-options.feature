Feature: Payment options hub (page bands, link-title cards)

  Scenario: Full-width bands render heading, hint, and link-title cards
    Given I navigate to the payment options page
    Then the payment options heading "Payment options" is visible
    And the band heading "Ways to pay" is visible
    And the band hint "The channel your money moves through" is visible
    And the card "Pay.gov" links to "/paying/payment-options/pay-gov"
    And the payment options page has no side navigation

  Scenario: Link-title cards render as links, not buttons
    Given I navigate to the payment options page
    Then there are 3 link-title cards
    And the link-title cards have no button
