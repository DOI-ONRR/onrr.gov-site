Feature: Contact hub topic router

  Scenario: Topics render as cards linking to their per-topic pages
    Given I navigate to the contact hub
    Then the contact hub shows 3 topic cards
    And the topic card "Oil & Gas Reporting" links to "/about/contact/oil-gas-reporting"
    And the topic card "Oil & Gas Reporting" shows "reporting and correcting oil and gas"
    And the topic card "Indian Services" links to "/about/contact/indian-services"
