# hello-xref

Demonstrates the **value-map-apply** task type — the ADML equivalent of the
predecessor application's XREF / value-mapping feature.

## What this example shows

| Concept | File |
|---------|------|
| Workspace with working + lookup connections | [workspace.yaml](workspace.yaml) |
| Reusable value-map definition (XTVALUEMAP) | [translations/foo-country-code-to-bar-country-name.def.yaml](translations/foo-country-code-to-bar-country-name.def.yaml) |
| Second definition with different default | [translations/foo-country-code-to-bar-country-name-not-mapped.def.yaml](translations/foo-country-code-to-bar-country-name-not-mapped.def.yaml) |
| Plan with seed + value-map steps | [hello-xref.plan.yaml](hello-xref.plan.yaml) |
| XTVALUEMAP seed (sql-execute on migrate) | [seed-xtvaluemap.task.yaml](seed-xtvaluemap.task.yaml) |
| Working-table seed (seed-data-load) | [seed-wrk-customer.task.yaml](seed-wrk-customer.task.yaml), [seed-wrk-sales-order.task.yaml](seed-wrk-sales-order.task.yaml) |
| Value-map task using definition default | [translate-country-code.task.yaml](translate-country-code.task.yaml) |
| Value-map task using a different definition's default | [translate-country-code-with-fallback.task.yaml](translate-country-code-with-fallback.task.yaml) |
| Working table schemas | [schemas/working/](schemas/working/) |
| Seed data (CSV) | [seed-data/](seed-data/) |

## Scenario

A migration project moves customer and order data from a **FOO** source system
into a **BAR** target system. Country codes in FOO (`US`, `DE`, `JP`) must be
mapped to country names expected by BAR (`United States`, `Germany`, `Japan`).

The value mappings live in an `XTVALUEMAP` table on the `migrate` database —
maintained by the migration team across mock cycles. This demo bootstraps those
rows via a `sql-execute` task so the example is self-contained.

## Running the example

Prerequisites: local-dev Postgres (see `local-dev/docker-compose.yml`).

```pwsh
# From repo root
dotnet run --project runtime/dotnet/src/Adml.Cli -- run --workspace language/examples/hello-xref
```

The plan executes in order:

1. **apply-working-schema** — creates/updates WRK_CUSTOMER and WRK_SALES_ORDER
2. **seed-xtvaluemap** — creates XTVALUEMAP on migrate and inserts lookup rows
3. **seed-wrk-customer** — loads 5 customer rows from CSV
4. **seed-wrk-sales-order** — loads 5 order rows from CSV
5. **translate-country-code** — maps FOO→BAR country names on WRK_CUSTOMER
6. **translate-country-code-with-fallback** — same mapping on WRK_SALES_ORDER using a definition with NOT_MAPPED default

## How it works

```text
┌──────────────────────────────────────────────────────────┐
│  migrate database — XTVALUEMAP (lookup)                  │
│  (seeded by seed-xtvaluemap task)                        │
│                                                          │
│  DATASOURCE=BAR  CHECKTABLE=COUNTRY_NAME  ZSOURCE=FOO   │
│  ┌────────────────┬──────────────────────┐               │
│  │ ZXREF_VALUE    │ LOAD_VALUE           │               │
│  ├────────────────┼──────────────────────┤               │
│  │ US             │ United States        │               │
│  │ DE             │ Germany              │               │
│  │ JP             │ Japan                │               │
│  └────────────────┴──────────────────────┘               │
└──────────────────────────────────────────────────────────┘
         │
         │  pre-load once per task
         ▼
┌──────────────────────────────────────────────────────────┐
│  working database — WRK_CUSTOMER (after value-map-apply) │
│                                                          │
│  ┌─────────────┬────────────────┬───────────────────┐    │
│  │ CUSTOMER_ID │ SRC_COUNTRY_   │ BAR_COUNTRY_      │    │
│  │             │ CODE           │ NAME              │    │
│  ├─────────────┼────────────────┼───────────────────┤    │
│  │ C001        │ US             │ United States  ←  │    │
│  │ C002        │ DE             │ Germany        ←  │    │
│  │ C003        │ JP             │ Japan          ←  │    │
│  │ C004        │ (NULL)         │ (skipped)         │    │
│  │ C005        │ XX             │ UNKNOWN        ←  │    │
│  └─────────────┴────────────────┴───────────────────┘    │
│                                                          │
│  working database — WRK_SALES_ORDER (after value-map)    │
│                                                          │
│  ┌──────────┬────────────────┬───────────────────┐       │
│  │ ORDER_ID │ ORIGIN_COUNTRY │ DEST_COUNTRY_NAME │       │
│  ├──────────┼────────────────┼───────────────────┤       │
│  │ ORD001   │ US             │ United States  ←  │       │
│  │ ORD002   │ DE             │ Germany        ←  │       │
│  │ ORD003   │ JP             │ Japan          ←  │       │
│  │ ORD004   │ XX             │ NOT_MAPPED     ←  │       │
│  │ ORD005   │ (NULL)         │ (skipped)         │       │
│  └──────────┴────────────────┴───────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

Notice how `XX` produces different results depending on the definition:
- **WRK_CUSTOMER**: `UNKNOWN` (from `foo-country-code-to-bar-country-name` definition)
- **WRK_SALES_ORDER**: `NOT_MAPPED` (from `foo-country-code-to-bar-country-name-not-mapped` definition)

## Key authoring concepts

### Reusable definition

The value-map definition (`kind: value-map-definition`) is declared once in the
workspace and referenced by ID from any number of tasks:

```yaml
valueMap: foo-country-code-to-bar-country-name
```

### Direct column references

The definition declares positional labels for each input/output slot. Each task
lists the actual column names, matched to the definition by position:

```yaml
inputs:
  - SRC_COUNTRY_CODE      # maps to definition slot 0 (source_country_code)

outputs:
  - BAR_COUNTRY_NAME      # maps to definition slot 0 (target_country_name)
```

This means the same definition can be reused across different tables that have
different column names but need the same value mapping.

### Missing-value behavior

The definition owns missing-value behavior via `onMissing` and `default`.
When different tasks need different defaults, they reference different
definitions:

- `leave-unchanged` — does not touch the row
- `set-null` — explicitly writes NULL
- `use-default` — writes the definition's `default` value
- `fail` — fails the entire task

In this example, the two definitions share the same XTVALUEMAP lookup but
differ only in their `onMissing` / `default` settings.

### Row filtering with `where`

An optional `where` clause provides a raw SQL predicate that limits which rows
are processed. This replaces purpose-specific boolean flags and gives authors
full SQL expressiveness:

```yaml
where: |
  NULLIF(ORIGIN_COUNTRY, '') IS NOT NULL
  AND DEST_COUNTRY_NAME IS NULL
```

Any valid SQL WHERE expression works — `NULLIF`, `LIKE`, compound `AND`/`OR`,
sub-selects, etc. Omit `where` to process all rows.

## Related

- [Value-Mapping Problem Statement](../../../.work/stories/current/xref-value-mapping-equivalent/20260314155916-problem.md)
- [Value-Mapping Functional Design](../../../.work/stories/current/xref-value-mapping-equivalent/20260320183954-functional.md)
- [Value-Mapping Architecture Plan](../../../.work/stories/current/xref-value-mapping-equivalent/20260320182639-architecture.md)
