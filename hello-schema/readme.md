# hello-schema — Connection-linked declarative database schemas

Demonstrates the recommended pattern for defining and applying database
schemas in ADML: each connection declares a `schema:` path pointing to
its intended schema, and a `schema-apply` task applies that schema to
the database.

## Workspace layout

```
hello-schema/
  workspace.yaml                          # connections declare schema: paths
  schemas/
    working/                              # schema for the 'working' connection
      M_CUSTOMERS.table.yaml
      M_ORDERS.table.yaml
      XT_COMPANY_CODE.table.yaml
  orders-module/
    plan.yaml                             # invokes schema-apply before mappings
    apply-working-schema.task.yaml        # schema-apply task targeting 'working'
    orders-mapping.task.yaml
```

## Key ideas

1. **Connections own their schema** — the `workspace.yaml` connection definition
   includes a `schema:` property pointing to a folder of `*.table.yaml` files.
2. **Schema files are YAML** using the standard `apiVersion`/`kind` envelope
   (`kind: table-schema`), one file per table.
3. **`schema-apply` is a task type** — any plan can include a `schema-apply` task
   that targets a connection. The runtime reads the connection's declared schema
   path and ensures the database matches.
4. **Schemas are shared assets** — they live under `schemas/` (allowlisted in
   `workspace.yaml`) so any module can reference them.
