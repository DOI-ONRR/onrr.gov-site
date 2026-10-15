Feature: Primary navigation (desktop megamenu)

  The desktop megamenu opens from a top-level button and can be dismissed by
  clicking outside the nav or pressing Escape (not only by clicking the open
  trigger's caret again).

  Background:
    Given I am on a page with the primary navigation

  Scenario: Open a dropdown from its top-level button
    When I open the "Revenue Data" nav menu
    Then the "Revenue Data" nav menu is open

  Scenario: Clicking the trigger again closes its own menu
    When I open the "Revenue Data" nav menu
    And I click the "Revenue Data" nav button
    Then the "Revenue Data" nav menu is closed

  Scenario: Clicking outside the nav closes the open menu
    When I open the "Revenue Data" nav menu
    And I click outside the navigation
    Then the "Revenue Data" nav menu is closed

  Scenario: Pressing Escape closes the open menu and returns focus to its button
    When I open the "Revenue Data" nav menu
    And I press Escape
    Then the "Revenue Data" nav menu is closed
    And the "Revenue Data" nav button is focused

  Scenario: Clicking inside the open panel keeps the menu open
    When I open the "Revenue Data" nav menu
    And I click inside the open "Revenue Data" nav panel
    Then the "Revenue Data" nav menu is open

  Scenario: Opening another top-level item moves the open menu
    When I open the "Revenue Data" nav menu
    And I open the "About" nav menu
    Then the "About" nav menu is open
    And the "Revenue Data" nav menu is closed
