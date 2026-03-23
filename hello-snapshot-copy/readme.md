# hello-snapshot-copy — Copying snapshot rows into a working table

Demonstrates the intended authoring shape for the `snapshot-to-working-copy`
task type. The example shows a common migration sequence:

1. apply schema for the snapshot-side staging table
2. apply schema for the working-side target table
3. seed snapshot rows from CSV
4. copy the snapshot rowset into the working table using explicit mappings
   and a literal assignment

## Workspace layout

```text
hello-snapshot-copy/
  workspace.yaml
  schemas/
    snapshot/
      customer_snapshot.table.yaml
    working/
      m_customer_working.table.yaml
  seed-data/
    snapshot-customers.csv
  snapshot-module/
    plan.yaml
    apply-snapshot-schema.task.yaml
    apply-working-schema.task.yaml
    seed-snapshot-customers.task.yaml
    stage-customers.task.yaml
```

## Key ideas

1. `sourceConnectionName` and `sourceObjectName` are always explicit.
2. `connectionName` and `table` still follow the usual target-side defaults model.
3. `columns.mappings` accepts both source-column assignments and literal assignments.
4. `preClearTable: true` means whole-table replacement for that run.
5. The task is intentionally more reviewable than raw `sql-execute` because the
  source object, target table, and target-column coverage are all visible in YAML.
6. Cross-connection copies declare the allowed bridge in `workspace.yaml`; the task keeps
  `sourceObjectName` unqualified and leaves schema resolution to the configured bridge strategy.

## Note

This example is added as an authoring/reference workspace. When you execute it with
different source and target connection names, the environment must also provide
`connectionBridgeConfig` so the runtime can resolve the source schema for the declared
`working -> snapshot` bridge.
