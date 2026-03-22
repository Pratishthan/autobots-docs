# FBP Data Types

The FBP platform provides pre-built data types for common business concepts. When defining [data models](../building-an-lld/lld-data-models.md), use these types instead of raw primitives where applicable.

There are two registries — **DTO types** for API boundary models and **Entity types** for persistent models. When a model is `Hybrid`, use the DTO type in the Schema table; the framework maps it to the entity counterpart automatically.

---

## DTO Data Types

Used when Model Type is **DTO** or **Hybrid**.

| Type | Base Type | Description |
|---|---|---|
| `AmountDTO` | object | Currency amount with `value` (double, max 999,999,999,999) and `currencyCode` (ISO 3-letter code). Both fields required |
| `NullableAmountDTO` | object | Nullable variant of AmountDTO — use when the amount field itself is optional |
| `OptionalAmountDTO` | object | Same structure as AmountDTO but with no required fields — use when both sub-fields can be omitted |
| `BusinessDateDTO` | string (date) | Business date in `YYYY-MM-DD` format (e.g., `2020-10-25`) |
| `NullableBusinessDateDTO` | string (date) | Nullable variant of BusinessDateDTO |
| `FrequencyDTO` | object | Scheduling frequency — combines derivation method, period, holiday handling, and sub-frequency details |
| `MonthFrequencyDTO` | object | Monthly scheduling details — method, week frequency, day of week, date of month. Sub-type of FrequencyDTO |
| `WeeklyFrequencyDTO` | object | Weekly scheduling details — day of week (0–6). Sub-type of FrequencyDTO |
| `FbpName` | string | Name field — max 255 chars, pattern: alphanumeric, underscore, hyphen, space |
| `FbpYesNoFlag` | string | Single-character flag — allowed values: `Y`, `N` |
| `FbpCodeIdentifier` | string | Code/identifier field — max 50 chars, pattern: alphanumeric, underscore, hyphen |

### FrequencyDTO — Detail

The `FrequencyDTO` is a composite type with the following properties:

| Property | Type | Values / Constraints | Description |
|---|---|---|---|
| frequencyDerivationMethod | string (enum) | `FIXED_DATE`, `ANNIVERSARY_BASED`, `NAN` | How the frequency date is determined |
| frequencyPeriods | string (enum) | `EVERY_N_DAYS`, `DAILY`, `WEEKLY`, `FORTNIGHTLY`, `MONTHLY`, `QUARTERLY`, `HALF_YEARLY`, `YEARLY`, `NAN` | The recurrence period |
| startMonth | integer | max: 11 | Starting month (0-indexed) |
| everyNDay | integer | | Number of days for `EVERY_N_DAYS` period |
| monthFrequency | MonthFrequencyDTO | | Monthly scheduling details |
| onHoliday | string (enum) | `NEXT_DAY`, `PREVIOUS_DAY`, `SKIP`, `NAN` | Behaviour when frequency date falls on a holiday |
| weeklyFrequency | WeeklyFrequencyDTO | | Weekly scheduling details |

---

## Entity Data Types

Used when Model Type is **Entity**. The framework automatically maps between DTO and Entity types.

| Type | Base Type | DTO Counterpart | Description |
|---|---|---|---|
| `Amount` | object | `AmountDTO` | Persistent currency amount with value and currency code |
| `BusinessDate` | string (date) | `BusinessDateDTO` | Persistent business date |

---

## Related

- [Lld Data Models](../building-an-lld/lld-data-models.md) — Data Models guide that references these types
- [Lld Template](lld-template.md) — LLD template where these types are used
