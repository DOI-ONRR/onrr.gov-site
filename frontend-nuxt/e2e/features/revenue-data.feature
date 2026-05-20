Feature: Revenue Data landing page

  Scenario: Page structure loads correctly
    Given I navigate to the revenue data page
    Then the revenue data breadcrumbs show "Home" and "Revenue Data"
    And the heading "About natural resources revenue data" is visible
    And the "Production" data tab is visible
    And the "Revenue" data tab is visible
    And the "Disbursements" data tab is visible
    And the "Production" data tab is selected by default

  Scenario: Side navigation is visible
    Given I navigate to the revenue data page
    Then the side navigation is visible
    And the side navigation contains "Revenue Data"

  Scenario: Production tab displays filters and chart
    Given I navigate to the revenue data page
    Then the "Yearly" frequency button is active
    And the "Period" select is visible
    And the "Product" select is visible
    And the production chart is visible

  Scenario: Production tab displays comparison table
    Given I navigate to the revenue data page
    Then the comparison heading "Comparison" is visible
    And the comparison table is visible
    And the comparison table has a "Total" row

  Scenario: Switching to Revenue tab
    Given I navigate to the revenue data page
    When I click the "Revenue" data tab
    Then the "Revenue" data tab is selected
    And the "Period" select is visible
    And the "Breakout" select is visible

  Scenario: Switching to Disbursements tab
    Given I navigate to the revenue data page
    When I click the "Disbursements" data tab
    Then the "Disbursements" data tab is selected
    And the "Period" select is visible
    And the "Breakout" select is visible

  Scenario: What's New sidebar displays production card
    Given I navigate to the revenue data page
    Then the What's New section is visible
    And the "Production" card is visible in the sidebar
    And the "Production" card contains "FY 2025"

  Scenario: What's New sidebar displays revenue card
    Given I navigate to the revenue data page
    Then the "Revenue" card is visible in the sidebar
    And the "Revenue" card contains "FY 2025"

  Scenario: What's New sidebar displays disbursements card
    Given I navigate to the revenue data page
    Then the "Disbursements" card is visible in the sidebar
    And the "Disbursements" card contains "FY 2025"

  Scenario: Latest release details card is visible
    Given I navigate to the revenue data page
    Then the "Latest release details" card is visible in the sidebar

  Scenario: Monthly frequency changes period options
    Given I navigate to the revenue data page
    When I click the "Monthly" frequency button
    Then the "Period" select contains "Most Recent 12 Months"
