# V3: Data Models

## Scene: Title (~5s)
[Visual: TitleCard with number 3, title "Data Models", subtitle "Building an LLD — Part 3"]
"In this video, we'll cover the Data Models section — where you define every data structure your feature touches."

## Scene: What & Why (~40s)
[Visual: SectionDiagram with highlightSection=2]
"Data Models is typically the first technical section you fill in after Background. It defines all the data structures involved in your feature, organized into three categories. Data at rest — JPA entities and database tables that persist data, needing primary key strategies and indexes. Data in motion — Kafka messages and queue payloads flowing through messaging systems, which should be self-contained. And data at the API boundary — DTOs and request/response objects exchanged via APIs, with clear attribute boundaries."

## Scene: Walkthrough (~80s)
[Visual: CodeBlock with entity YAML example; then TableView with model types]
"Each data model has four key properties. Model Type classifies it as a DTO, Entity, Hybrid, or Embedded value object. 'Is New Model' indicates whether you're creating from scratch or enhancing an existing model. Parent Model links child models to their parent. And Primary Key Strategy defines how IDs are generated — auto-increment, UUID, or composite keys. For each model, you define two tables. The Schema table lists every attribute with its data type, whether it's mandatory, any default value, and a business description. The Business Metadata table adds human-readable labels, business key flags, and validation rules. Don't forget enumerations — list them at the end with their allowed values and descriptions. A tip: start from business entities before listing technical fields, and define child models separately with a clear parent reference."

## Scene: Recap + Next (~15s)
[Visual: BulletList with 3 key takeaways]
"To recap: Data Models cover three data categories — at rest, in motion, and at the API boundary. Each model needs a schema, business metadata, and clear type classification. Next, we'll look at Services — how your feature is exposed to consumers."
