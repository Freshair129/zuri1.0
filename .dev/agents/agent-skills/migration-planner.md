# Agent Skill: Migration Planner

> For: Sub-agent
> Trigger: ย้าย feature จาก ZURI เก่า → CO ใหม่

## Task

วางแผนย้าย feature/repo/component จาก E:\ZURI → E:\CO

## Process

1. **อ่าน source จาก ZURI:**
   ```
   Read E:\ZURI\src\lib\repositories\{name}Repo.js
   Read E:\ZURI\src\components\{Name}.js
   Read E:\ZURI\src\app\api\{route}\route.js
   ```

2. **จำแนก code:**
   - Core logic (ใช้ได้ทุก industry)
   - Industry-specific (culinary only)
   - Dead code / deprecated
   - Duplicated logic

3. **Map ไปที่ใหม่:**
   ```
   ZURI repo → CO src/modules/{module}/repo.js
   ZURI component → CO src/modules/{module}/components/
   ZURI API route → CO src/app/api/{module}/
   ```

4. **Identify changes needed:**
   - tenantId parameter (ถ้ายังไม่มี)
   - Repository pattern (ถ้า API calls DB directly)
   - Component splitting (ถ้า > 500 LOC)
   - ID format alignment (id_standards.yaml)

## Output Format
```
## Migration Plan: {Feature}

### Source (ZURI)
- repo: src/lib/repositories/{name}Repo.js (XXX LOC)
- component: src/components/{Name}.js (XXX LOC)
- routes: N API routes

### Target (CO)
- module: src/modules/{category}/{name}/
- splits: component → 3 sub-components

### Changes Required
1. Add tenantId to all queries
2. Split component (2.4K → 3 × ~500 LOC)
3. Move culinary-specific to industry/culinary/

### Dependencies
- Requires: core/crm (Customer model)
- ADR: ADR-066 (component size)
```
