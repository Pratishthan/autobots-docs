# V6: Logical Processing Units

## Scene: Title (~5s)
[Visual: TitleCard with number 6, title "Logical Processing Units", subtitle "Building an LLD — Part 6"]
"In this video, we'll cover Logical Processing Units — the atomic business operations that make up your Flows."

## Scene: What & Why (~40s)
[Visual: SectionDiagram with highlightSection=5]
"LPUs break down complex business functionality into smaller, reusable chunks. Each LPU performs exactly one business operation. They come in three types: Manual, where the developer writes code from scratch. LLM Assisted, where code is generated from a plain English business logic description. And Standard, which uses a platform-provided pattern like CRUD persistence. LPUs are classified into eight sub-types: Validation, Enrichment, Host Call, Processing, Persistence, SetDefaults, Transformation, and Complete."

## Scene: Walkthrough (~70s)
[Visual: TableView with 8 sub-types; then CodeBlock with LPU definition example]
"Each LPU definition includes a Unit Name — the programmatic name like 'validateParty' or 'partyPersist'. The Type — Manual, LLM Assisted, or Standard. The Sub-Type for functional classification. Input and Output models consumed and produced. Referenced Data — models used during processing but sourced from elsewhere. And most importantly, the Business Logic — step-by-step description in plain English. For example, a validation LPU might say: Step one, check if party number already exists in the database. Step two, if it exists, throw a PARTY_NUMBER_ALREADY_EXISTS error. Step three, if it doesn't exist, pass validation. This plain English description is what makes code generation possible — write clearly and the generated code follows your intent."

## Scene: Recap + Next (~15s)
[Visual: BulletList with 3 key takeaways]
"To recap: LPUs are atomic operations classified by type and sub-type. Write business logic in plain English with numbered steps. Keep them reusable across flows. Next, we'll cover Test Data — creating the payloads that drive your test scenarios."
