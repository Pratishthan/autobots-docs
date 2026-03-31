# V4: Services

## Scene: Title (~5s)
[Visual: TitleCard with number 4, title "Services", subtitle "Building an LLD — Part 4"]
"In this video, we'll cover the Services section — where you define how your feature's business functionality is exposed to consumers."

## Scene: What & Why (~35s)
[Visual: SectionDiagram with highlightSection=3]
"Services describe the entry and exit points of your feature. In Java terms, these map to service classes and methods. Each service can be exposed in three ways: synchronously via REST API with standard CRUD operations, asynchronously via streaming with Kafka or message queues, or through batch processing. The template separates each service into two parts: its identity — what it is and what it does — and its I/O — what goes in and what comes out."

## Scene: Walkthrough (~70s)
[Visual: TableView with service identity fields; then CodeBlock with service I/O example]
"Service Identity captures four properties. Service Name is the programmatic name mapping to your class or method. Service Domain groups it by business area. Operation Type classifies it as Create, Fetch, Update, or Delete. And Description explains what the service does in business terms. Service I/O defines the data flow. Invocation Type specifies sync, async, or both. Parameters lists path and query parameters beyond the request body. Input Model and Output Model reference your Data Models from section two. For services with async behavior, you also capture the queue or topic name, message model, and the event condition that triggers it. A tip: name your services after business operations, not technical implementations, and keep descriptions focused on business outcomes."

## Scene: Recap + Next (~15s)
[Visual: BulletList with 3 key takeaways]
"To recap: Services define how functionality is exposed — sync, async, or batch. Separate identity from I/O for clarity, and reference your Data Models for inputs and outputs. Next, we'll explore Flows — how services orchestrate processing steps."
