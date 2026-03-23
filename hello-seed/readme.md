# hello-seed — Loading reference data from CSV files

Demonstrates the `seed-data-load` task type, which bulk-loads rows from a
flat file into a working-database table. This is the recommended approach
for populating cross-reference tables, lookup values, and other reference
data that lives in version-controlled CSV files.

## Workspace layout

```
hello-seed/
  workspace.yaml                          # connections declare schema: paths
  schemas/
    working/
      M_SEED_CUSTOMERS.table.yaml              # target table schema
  seed-data/
    customers.csv                         # 7 rows of customer reference data
  seed-module/
    plan.yaml                             # schema-apply + seed-data-load
    apply-working-schema.task.yaml        # ensures tables exist
    seed-customers.task.yaml              # loads CSV into M_SEED_CUSTOMERS
```

## Key ideas

1. **CSV files are version-controlled assets** — seed data lives alongside
   the workspace in `seed-data/` and is diffable in pull requests.
2. **Column mappings rename headers** — the CSV uses lowercase source-system
   names (`customer_id`, `name`) while the target table uses uppercase
   migration names (`CUSTOMER_ID`, `CUSTOMER_NAME`). The `columns.mappings`
   section declares the translation.
3. **`preClearTable: true` is idempotent** — running the plan twice produces
   the same result because existing rows are deleted before re-loading.
4. **Schema-apply runs first** — the plan applies the table schema before
   loading data, so tables are guaranteed to exist.
5. **`dataFile` paths are relative** — the path is resolved relative to the
   task file's location, so `../seed-data/customers.csv` reaches the shared
   `seed-data/` directory.

## Running

```powershell
./run-example.ps1 hello-seed
```
