Feature: Handbooks index page

  Scenario: Handbooks render as cards
    Given the API returns handbooks data
    And I navigate to the handbooks page
    Then I see 3 handbook cards
    And handbook card 1 has the title "Minerals Revenue Reporter Handbook"
    And handbook card 1 shows the release "Release 4.5"
    And handbook card 1 has an interactive link to "/references/handbooks/minerals-revenue-reporter-handbook"
    And handbook card 1 has a download link "Download (Word document)"

  Scenario: Interactive button hides when a handbook has no interactive_url
    Given the API returns handbooks data
    And I navigate to the handbooks page
    Then handbook card 2 has no interactive link
    And handbook card 2 has a download link "Download (PDF)"

  Scenario: Release badge hides when a handbook has no release
    Given the API returns handbooks data
    And I navigate to the handbooks page
    Then handbook card 3 has no release badge

  Scenario: Full-width layout has no side navigation
    Given the API returns handbooks data
    And I navigate to the handbooks page
    Then the handbooks page heading "Handbooks" is visible
    And the handbooks page has no side navigation
