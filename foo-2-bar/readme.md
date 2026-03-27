This folder is an example ADML workspace scaffold.

Files:

- `workspace.yaml` - workspace marker with `srcfoo`, `tgtbar`, `wrkfoo2bar`, and `migrate` Postgres connections
- `schemas/srcfoo/CUSTOMER.table.yaml` - declarative schema for the quoted uppercase `CUSTOMER` table
- `schemas/tgtbar/VENDOR.table.yaml` - declarative schema for the quoted uppercase `VENDOR` table on the `tgtbar` datasource
- `initialize-foo/plan.yaml` - initialization plan that applies the `srcfoo` schema and loads source seed data
- `initialize-foo/apply-foo-schema.task.yaml` - `schema-apply` task targeting the `srcfoo` datasource
- `initialize-migrate/plan.yaml` - migrate-scoped plan that applies the `migrate` schema and seeds `XTVALUEMAP`
- `initialize-migrate/apply-migrate-schema.task.yaml` - `schema-apply` task targeting the `migrate` datasource
- `initialize-migrate/seed-xtvaluemap.task.yaml` - `seed-data-load` task that loads `XTVALUEMAP.csv` into the `migrate` schema
- `product-transform/plan.yaml` - product transformation plan that stages supplier data into the working schema
- `product-transform/insert-staging-table.task.yaml` - `copy-rows` task that copies `srcfoo.supplier` into `wrkfoo2bar.vendor_foo_supplier_s`
- `product-transform/normalize-supplier-codes.task.yaml` - `migrate-rule-update` task that trims staged `CountryCode` and `StateCode` values before value-map lookups
- `product-transform/xref-supplier-country.task.yaml` - `value-map-apply` task that resolves staged supplier country values via `XTVALUEMAP`
- `product-transform/xref-supplier-state.task.yaml` - `value-map-apply` task that resolves staged supplier state values via `XTVALUEMAP`
- `schemas/migrate/XTVALUEMAP.table.yaml` - value mapping table definition for the `migrate` Postgres connection
- `translations/foo-country-to-bar-country-code.def.yaml` - reusable XTVALUEMAP-backed definition for mapping supplier country values into BAR country codes
- `translations/foo-state-to-bar-region.def.yaml` - reusable XTVALUEMAP-backed definition for mapping supplier state values into BAR region values

## Purpose

`foo-2-bar` follows the same core pattern as `hello-schema`: each connection
declares a schema folder, and plans can invoke `schema-apply` tasks to
reconcile those schemas into PostgreSQL.

This scaffold currently includes source-shaped tables for both the `srcfoo` and
`tgtbar` datasources. Because ADML emits quoted identifiers for PostgreSQL DDL,
uppercase table names such as `"CUSTOMER"` and `"VENDOR"` are preserved in the
database.

The workspace also declares `wrkfoo2bar` as its working schema and `migrate` as
an additional Postgres connection reserved for migration-oriented artifacts.

The main example flow runs `initialize-foo`, `initialize-bar`,
`initialize-migrate`, and `initialize-wrkfoo2bar` before executing the product
transformation plan. Inside `product-transform`, the flow stages supplier rows,
normalizes padded code values in the working table, then applies XTVALUEMAP
lookups for country and region enrichment.

## Postgres Notes

- `XTVALUEMAP` is intentionally uppercase in this example. The schema artifact,
  seed task, and value-map definitions all target the quoted PostgreSQL table
  name `"XTVALUEMAP"`, so `initialize-migrate` must run before
  `product-transform`.
- Raw `where` clauses on tasks are passed through as SQL. When a working table
  uses mixed-case column names such as `CountryCode`, `StateCode`, `ZCOUNTRY`,
  or `ZREGION`, quote those identifiers inside the `where` clause or PostgreSQL
  will fold them to lowercase and fail to resolve the columns.

## Layout

```text
foo-2-bar/
  workspace.yaml
  initialize-migrate/
    apply-migrate-schema.task.yaml
    plan.yaml
    seed-xtvaluemap.task.yaml
  product-transform/
    normalize-supplier-codes.task.yaml
    plan.yaml
    insert-staging-table.task.yaml
    xref-supplier-country.task.yaml
    xref-supplier-state.task.yaml
  schemas/
    migrate/
      XTVALUEMAP.table.yaml
    srcfoo/
      CUSTOMER.table.yaml
    tgtbar/
      VENDOR.table.yaml
  translations/
    foo-country-to-bar-country-code.def.yaml
    foo-state-to-bar-region.def.yaml
  initialize-foo/
    apply-foo-schema.task.yaml
    plan.yaml
```
