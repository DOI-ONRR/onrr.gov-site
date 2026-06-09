Feature: Events page

  Scenario: Events page displays two tabs
    Given I navigate to the events page
    Then the "Indian Outreach & Events" tab is visible
    And the "Other ONRR Events" tab is visible
    And the "Indian Outreach & Events" tab is selected

  Scenario: Outreach events display as cards with all fields
    Given the API returns events data
    And I navigate to the events page
    Then I see 2 event cards on the "Indian Outreach & Events" tab
    And the first event card title is "INDIAN MINERALS TRAINING"
    And the first event card date contains the event 1 date
    And the first event card shows the field "Time" with "1:00 p.m. - 5:00 p.m. CT"
    And the first event card shows the field "Location" with "Tulsa, OK"
    And the first event card shows the field "Description"
    And the first event card shows the field "Who Should Attend"
    And the first event card shows the field "Contact" with "John Smith"
    And the first event card shows the field "Email"
    And the first event card has a mailto link for "john.smith@onrr.gov"

  Scenario: Multi-day event shows date range
    Given the API returns events data
    And I navigate to the events page
    Then the second event card date contains the event 2 start date
    And the second event card date contains the event 2 end date

  Scenario: Switching to Other ONRR Events tab
    Given the API returns events data
    And I navigate to the events page
    When I click the "Other ONRR Events" tab
    Then the "Other ONRR Events" tab is selected
    And I see 1 event card on the "Other ONRR Events" tab

  Scenario: Other ONRR Events tab shows training event details
    Given the API returns events data
    And I navigate to the events page
    When I click the "Other ONRR Events" tab
    Then the first event card title is "ONRR REPORTER TRAINING"
    And the first event card shows the field "Location" with "Virtual (Microsoft Teams)"

  Scenario: External links in event fields get proper classes
    Given the API returns events data
    And I navigate to the events page
    When I click the "Other ONRR Events" tab
    Then the first event card has an external link with class "usa-link--external"

  Scenario: Empty state when no outreach events exist
    Given the API returns no events
    And I navigate to the events page
    Then I see the message "No upcoming events at this time." on the "Indian Outreach & Events" tab

  Scenario: Empty state when no other events exist
    Given the API returns outreach events only
    And I navigate to the events page
    When I click the "Other ONRR Events" tab
    Then I see the message "No upcoming events at this time." on the "Other ONRR Events" tab

  Scenario: Breadcrumbs show correct path
    Given I navigate to the events page
    Then the breadcrumbs show "Home" and "Events"
