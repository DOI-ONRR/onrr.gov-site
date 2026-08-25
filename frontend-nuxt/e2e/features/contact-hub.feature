Feature: Contact hub topic router

  Scenario: Topics render as cards linking to their per-topic pages
    Given I navigate to the contact hub
    Then the contact hub shows 3 topic cards
    And the topic card "Oil & Gas Reporting" links to "/about/contact/oil-gas-reporting"
    And the topic card "Oil & Gas Reporting" shows "reporting and correcting oil and gas"
    And the topic card "Indian Services" links to "/about/contact/indian-services"

  Scenario: The finder collapses matches to unique people with coverage and a topic link
    Given I navigate to the contact hub
    When I search the hub for "foster"
    Then the hub shows 1 contact result
    And the hub result "Maria Foster" shows "Companies beginning with A–C"
    And the hub result "Maria Foster" links to "/about/contact/oil-gas-reporting"
    And the topic router is hidden

  Scenario: Clearing the search returns to the topic router
    Given I navigate to the contact hub
    When I search the hub for "foster"
    And I clear the hub search
    Then the contact hub shows 3 topic cards
