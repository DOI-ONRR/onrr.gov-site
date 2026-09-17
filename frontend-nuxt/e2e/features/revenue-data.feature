Feature: Revenue Data landing page

  Scenario: Page structure loads correctly
    Given I navigate to the revenue data page
    Then the revenue data breadcrumbs show "Home" and "Revenue Data"
    And the revenue data heading "Revenue Data" is visible
    And the "Explore the data" button is visible
    And the "Find a dataset" button is visible

  Scenario: Explore the data section renders both charts
    Given I navigate to the revenue data page
    Then the revenue data section heading "Explore the data" is visible
    And the chart card "Disbursements by year" is visible
    And the chart card "Top states by disbursements" is visible

  Scenario: Find a dataset section lists the datasets
    Given I navigate to the revenue data page
    Then the revenue data section heading "Find a dataset" is visible
    And the dataset card "Monthly disbursements" is visible
    And the dataset card "Fiscal year disbursements" is visible
    And the dataset card "Monthly Production" is visible
    And the dataset card "Yearly Production" is visible
    And the dataset card "Revenue" is visible
    And the dataset card "Federal sales" is visible
    And the dataset card "Revenue by company" is visible
    And the dataset card "Reference data" is visible

  Scenario: Active dataset cards link to their preview pages
    Given I navigate to the revenue data page
    Then the dataset card "Monthly disbursements" links to "/revenue-data/monthly-disbursements"
    And the dataset card "Fiscal year disbursements" links to "/revenue-data/fiscal-year-disbursements"
    And the dataset card "Monthly Production" links to "/revenue-data/monthly-production"
    And the dataset card "Yearly Production" links to "/revenue-data/yearly-production"
    And the dataset card "Revenue" links to "/revenue-data/revenue-by-commodity"

  Scenario: About this data section is visible
    Given I navigate to the revenue data page
    Then the revenue data section heading "About this data" is visible
