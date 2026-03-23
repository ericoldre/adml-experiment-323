# hello-validate — Inline methodology validation

Demonstrates the smallest end-to-end workspace for the `methodology-validate`
task. The example does not require a database connection. It only validates the
inline `methodology:` declarations declared on two `table-schema` artifacts.

## Workspace layout

```text
hello-validate/
  workspace.yaml
  schemas/
    src/
      customer.table.yaml
    tgt/
      customer.table.yaml
    wrk/
      customer_s.table.yaml
      customer_t.table.yaml
  validate-module/
    plan.yaml
    validate-methodology.task.yaml
```

## What it validates

- `customer_s.table.yaml` declares `working-staging-table-ddl`
  and references both a source table and a target table.
- `customer_t.table.yaml` declares `working-target-table-ddl`
  and references the target table.
- The `methodology-validate` task targets `schemas/wrk/*.table.yaml`
  and writes a report to `reports/methodology-report.json`.

## Run it

```powershell
./run-example.ps1 hello-validate
```

Because this workspace has no `connections:` section, the runner executes it
without requiring `local-dev/local.env.yaml` or a running Postgres container.
