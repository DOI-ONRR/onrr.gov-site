Feature: Renewable energy payments (topic page with Pay.gov + contact blocks)

  Scenario: Rail, Pay.gov form, and contact box render
    Given I navigate to the renewable energy page
    Then the renewable heading "Renewable energy payments" is visible
    And the renewable rail links to "Bid deposits"
    And the renewable rail links to "Contact"
    And a Pay.gov form card titled "ONRR Renewable Energy Bid Deposit" is visible
    And that form links to Pay.gov at "https://pay.gov/re-bid-deposit"
    And the contact box heading "Questions about a renewable energy payment?" is visible
    And the contact box has a mailto link for "ONRR-RFMASGL@onrr.gov"

  Scenario: All three Pay.gov forms render, interspersed
    Given I navigate to the renewable energy page
    Then there are 3 Pay.gov form cards
