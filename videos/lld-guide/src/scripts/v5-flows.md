# V5: Flows

## Scene: Title (~5s)
[Visual: TitleCard with number 5, title "Flows", subtitle "Building an LLD — Part 5"]
"In this video, we'll cover the Flows section — where you define how Logical Processing Units are orchestrated within each service."

## Scene: What & Why (~35s)
[Visual: SectionDiagram with highlightSection=4]
"A Flow defines the sequence in which LPUs execute within a service. While a Service exposes business functionality to consumers and an LPU performs a single atomic operation, a Flow sits between them — defining the orchestration. Which LPUs run, and in what order? A service may have one or more flows, covering both happy-path processing and error handling."

## Scene: Walkthrough (~70s)
[Visual: BulletList with flow pattern steps; then TableView with state transitions]
"Most flows follow a standard five-step pattern. First, Validate — check inputs and business rules. Second, Enrich — fetch additional data needed for processing. Third, Process — apply business rules and calculations. Fourth, Persist — store the result in the database. And fifth, Publish — notify downstream systems via events. Not every flow needs all five steps, but this pattern gives you a reliable starting point. For each flow, you define state transitions. Each state has a name — like Validated, Enriched, or Persisted — a description of what has been accomplished, which states it can transition to, and what triggers that transition. You also document transactional boundaries — which LPUs are grouped in a single transaction and what the rollback strategy is if something fails."

## Scene: Recap + Next (~15s)
[Visual: BulletList with 3 key takeaways]
"To recap: Flows orchestrate LPUs in sequence within a service. Follow the standard pattern — Validate, Enrich, Process, Persist, Publish. Define state transitions and transactional boundaries explicitly. Next, we'll dive into LPUs — the atomic building blocks of your flows."
