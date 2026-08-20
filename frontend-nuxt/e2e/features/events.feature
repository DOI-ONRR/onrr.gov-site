Feature: Events page

  Scenario: Page header and on-this-page rail
    Given the API returns events data
    And I navigate to the events page
    Then the events heading "Events" is visible
    And the breadcrumbs show "Home" and "Events"
    And the on-this-page rail links to "Reporter training"
    And the on-this-page rail links to "Indian outreach & events"
    And the on-this-page rail links to "Other ONRR events"

  Scenario: Featured reporter training card
    Given the API returns events data
    And I navigate to the events page
    Then the training card shows the tag "Registration open"
    And the training card title is "In-Person Reporter Training, Denver"
    And the training card has 2 registration buttons
    And the first registration button reads "Oil and Gas Registration"
    And the training card shows the venue "Sheraton Denver West Hotel"
    And the training card has a mailto link for "Reporter.Training@onrr.gov"

  Scenario: Indian outreach events render as cards
    Given the API returns events data
    And I navigate to the events page
    Then the outreach section has 2 event cards
    And the first outreach card title is "Indian Hills Pow Wow"
    And the first outreach card shows field "Location" with value "Oklahoma City"
    And the first outreach card shows field "Who should attend"
    And the first outreach card has a mailto link for "onrroutreachokc@onrr.gov"
    And the first outreach card has an external link with class "usa-link--external"

  Scenario: Multi-day outreach event shows a date range
    Given the API returns events data
    And I navigate to the events page
    Then the second outreach card date contains the outreach 2 start date
    And the second outreach card date contains the outreach 2 end date

  Scenario: Other ONRR events render in their own section
    Given the API returns events data
    And I navigate to the events page
    Then the other section has 1 event card
    And the first other card title is "ONRR Public Comment Session"

  Scenario: No training hides the rail entry and empties the other section
    Given the API returns outreach events only
    And I navigate to the events page
    Then the on-this-page rail does not link to "Reporter training"
    And the outreach section has 2 event cards
    And the other section shows "No upcoming events at this time."

  Scenario: No events shows empty states
    Given the API returns no events
    And I navigate to the events page
    Then the outreach section shows "No upcoming events at this time."
    And the other section shows "No upcoming events at this time."
