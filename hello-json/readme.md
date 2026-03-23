## hello-json

Demonstrates that YAML and JSON are fully interchangeable in ADML.

### What this example shows

| File | Format | Purpose |
|------|--------|---------|
| `workspace.json` | JSON | Workspace definition (most examples use `.yaml`) |
| `plan.yaml` | YAML | Plan with two entries |
| `json-task.task.json` | JSON | A simulate task written in JSON |
| `yaml-task.task.yaml` | YAML | A simulate task written in YAML |

The parser treats `.yaml`, `.yml`, and `.json` identically — pick whichever
format your team prefers, or mix them within the same workspace.

### Run it

```powershell
./run-example.ps1 hello-json
```
