# ServiceLink QA database reset

These scripts are for the local MySQL `servicelink` database. They keep the
admin-managed catalog (`categories` and `service_catalog`) and all `ADMIN`
accounts. Everything else is treated as QA/transactional data.

## 1. Take a backup

```powershell
mysqldump -u root -p servicelink > servicelink-before-qa.sql
```

## 2. Reset QA data

Open MySQL from the repository root and explicitly enable the guarded reset:

```sql
USE servicelink;
SET @allow_qa_reset = 1;
SOURCE backend/scripts/qa/reset-qa-data.sql;
```

The reset dynamically discovers Hibernate-created tables, so newly added
transactional tables are cleared too. It preserves:

- `users` rows whose role is `ADMIN`
- `categories`
- `service_catalog`

## 3. Reinsert QA data through the application

Use the normal API/UI flows instead of raw inserts so passwords are encoded and
all dependent records are created correctly:

1. Register a customer and complete onboarding.
2. Register a provider, submit KYC, approve it as admin, select catalog services,
   configure availability, and activate a subscription.
3. Register a business, complete its organization/workspace/subscription flow,
   and add/import a provider.
4. Create a customer appointment and exercise payment, status, reschedule,
   cancellation, notification, and review flows.
5. Create a business job and exercise assignment, attendance, SLA, billing, and
   audit-log flows.

Raw SQL user inserts are deliberately not included: they bypass BCrypt/password
handling and application validations, producing misleading QA results.

## 4. Inspect all QA data

```sql
USE servicelink;
SOURCE backend/scripts/qa/inspect-qa-data.sql;
```

The first result lists every table and its estimated row count. The following
result sets return full data from `users` first and then every non-catalog table.
The final result summarizes the preserved service catalog.

