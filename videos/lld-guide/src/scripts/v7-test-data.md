# V7: Test Data

## Scene: Title (~5s)
[Visual: TitleCard with number 7, title "Test Data", subtitle "Building an LLD — Part 7"]
"In this video, we'll cover the Test Data section — where you create reusable payloads that drive your test scenarios."

## Scene: What & Why (~35s)
[Visual: SectionDiagram with highlightSection=6]
"Test Data captures reusable data sets used across your test scenarios. The key principle is base data with overrides. You define data sets with sensible defaults representing a valid happy-path payload. Then each test scenario can override only the fields relevant to its specific case. This keeps your tests concise and maintainable. Test data defined here is created at component level but reused in integration and end-to-end testing."

## Scene: Walkthrough (~80s)
[Visual: TableView with summary table example; then CodeBlock with base + override pattern]
"Test Data uses a two-level structure. First, the Summary Table indexes all data sets with their name, the model they represent, the base data set they inherit from, their purpose, and any notes. Second, the Detail Section has one sub-section per model. Each detail table is wide — rows are data sets and columns are business-relevant attributes. For parent-child relationships, like Party with ContactDetails, each model gets its own table. Child tables include a Parent Data Set column linking each row to its parent. This handles collections naturally — multiple child rows per parent data set. For example, an Individual Party data set might include attributes like party name John Smith, type Individual, and CIF number. A child ContactDetails table would have rows for phone, mobile, and email, each linked back to the parent data set. Name your data sets after business contexts, not technical IDs, and use realistic sample values."

## Scene: Recap + Next (~15s)
[Visual: BulletList with 3 key takeaways]
"To recap: Test Data uses a summary plus detail structure with base data and overrides. Handle parent-child models with linked tables. Use business-meaningful names and realistic values. In our final video, we'll cover Test Scenarios — putting it all together with Given, When, Then."
