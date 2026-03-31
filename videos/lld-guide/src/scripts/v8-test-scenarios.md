# V8: Test Scenarios

## Scene: Title (~5s)
[Visual: TitleCard with number 8, title "Test Scenarios", subtitle "Building an LLD — Part 8"]
"In this final video, we'll cover Test Scenarios — where you validate your feature end-to-end using Given, When, Then format."

## Scene: What & Why (~40s)
[Visual: SectionDiagram with highlightSection=7]
"Test Scenarios capture the business scenarios that validate your feature using Behaviour-Driven Development principles. They translate into Cucumber feature files for automated testing. There are four types of scenarios. Positive tests cover the happy path where the feature works as expected. Negative tests handle validation failures, error handling, and invalid inputs. Edge cases test boundary conditions and unusual combinations. And Sanity checks are lightweight tests confirming basic feature readiness. Each scenario is assigned a priority: L1 for critical tests that must pass before release, L2 for important tests needed for a complete release, and L3 for nice-to-have coverage of rare paths."

## Scene: Walkthrough (~70s)
[Visual: CodeBlock with Given/When/Then example; then TableView with scenario types and priorities]
"Each scenario has a descriptive name, the service it tests, its priority level, preconditions defining the initial state, numbered steps for actions performed, the expected result or error code, and reference models for traceability. Preconditions and steps reference your Test Data sets by name with specific overrides. For example: 'Given an Individual Party with Full Contact Details, When I call partyCreation, Then I receive a 200 OK response with a generated partyId.' For negative scenarios, include specific error codes in expected results. For example: 'Given a party with number 123 already exists, When I create another party with number 123, Then I receive a PARTY_NUMBER_ALREADY_EXISTS error.' The coverage goal is comprehensive — aim to capture all business scenarios, both positive and negative. Cover every service with at least one positive and one negative test."

## Scene: Recap + Next (~15s)
[Visual: BulletList with 4 key takeaways]
"To wrap up the series: Test Scenarios complete the LLD by validating everything you've designed. Use Given, When, Then format and reference your Test Data by name. Prioritize with L1, L2, and L3. Together, these seven sections take you from requirements to a complete, testable implementation blueprint. Thanks for watching the LLD guide series."
