---
title: "Vocabulary Tools"
description: "Add custom vocabulary entries, import from CSV/JSON, manage your vocabulary collection, and export for permanent storage"
layout: "single"
type: "page"
---

## Vocabulary Tools

Use the tools below to enhance your learning experience with custom vocabulary entries. You can:

- **Add entries manually** - Enter new vocabulary words one at a time
- **Import from CSV or JSON** - Bulk upload vocabulary from files
- **Manage entries** - View, edit, and delete your custom vocabulary
- **Export data** - Download your vocabulary collection to save or share

Your custom entries are stored locally on this device and can be exported to save permanently or to commit to the GitHub repository.

{{< vocab-entry-form >}}

### Tips

- **Minimum required fields**: Bulgarian translation, German translation, category, and CEFR level
- **CSV format**: The system expects CSV with columns: bulgarian, german, category, level, cultural_note, linguistic_note, examples
- **Examples field**: Use JSON format for multiple examples (e.g., `["example 1", "example 2"]`)
- **Custom entries**: All entries you add are marked with `source: 'manual'` for easy tracking
- **Permanent storage**: Export your data and commit it to GitHub to permanently save your custom vocabulary
