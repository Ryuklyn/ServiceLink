-- delete_pro_data.sql

START TRANSACTION;

-- 1. Delete Attendance logs of assigned team members/jobs
DELETE FROM pro_job_attendance 
WHERE job_ticket_id IN (
    SELECT id FROM pro_job_tickets 
    WHERE organization_id IN (
        SELECT w.organization_id FROM workspaces w 
        JOIN pro_users pu ON w.id = pu.workspace_id 
        JOIN users u ON pu.user_id = u.id 
        WHERE u.role = 'PRO'
    )
);

-- 2. Delete Job assignments of team members
DELETE FROM pro_job_assignments 
WHERE job_ticket_id IN (
    SELECT id FROM pro_job_tickets 
    WHERE organization_id IN (
        SELECT w.organization_id FROM workspaces w 
        JOIN pro_users pu ON w.id = pu.workspace_id 
        JOIN users u ON pu.user_id = u.id 
        WHERE u.role = 'PRO'
    )
);

-- 3. Delete SLA, billing, and audit logs of B2B job tickets
DELETE FROM pro_job_billing 
WHERE job_ticket_id IN (
    SELECT id FROM pro_job_tickets 
    WHERE organization_id IN (
        SELECT w.organization_id FROM workspaces w 
        JOIN pro_users pu ON w.id = pu.workspace_id 
        JOIN users u ON pu.user_id = u.id 
        WHERE u.role = 'PRO'
    )
);

DELETE FROM pro_job_sla 
WHERE job_ticket_id IN (
    SELECT id FROM pro_job_tickets 
    WHERE organization_id IN (
        SELECT w.organization_id FROM workspaces w 
        JOIN pro_users pu ON w.id = pu.workspace_id 
        JOIN users u ON pu.user_id = u.id 
        WHERE u.role = 'PRO'
    )
);

DELETE FROM pro_audit_logs 
WHERE job_ticket_id IN (
    SELECT id FROM pro_job_tickets 
    WHERE organization_id IN (
        SELECT w.organization_id FROM workspaces w 
        JOIN pro_users pu ON w.id = pu.workspace_id 
        JOIN users u ON pu.user_id = u.id 
        WHERE u.role = 'PRO'
    )
);

-- 4. Delete the Job tickets themselves
DELETE FROM pro_job_tickets 
WHERE organization_id IN (
    SELECT w.organization_id FROM workspaces w 
    JOIN pro_users pu ON w.id = pu.workspace_id 
    JOIN users u ON pu.user_id = u.id 
    WHERE u.role = 'PRO'
);

-- 5. Delete payment transactions linked to the subscriptions
DELETE FROM payment_transactions 
WHERE subscription_id IN (
    SELECT id FROM subscriptions 
    WHERE workspace_id IN (
        SELECT workspace_id FROM pro_users 
        WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO')
    )
);

DELETE FROM pro_payment_transactions 
WHERE subscription_id IN (
    SELECT id FROM subscriptions 
    WHERE workspace_id IN (
        SELECT workspace_id FROM pro_users 
        WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO')
    )
);

-- 6. Delete workspace subscriptions
DELETE FROM subscriptions 
WHERE workspace_id IN (
    SELECT workspace_id FROM pro_users 
    WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO')
);

-- 7. Delete workspace preferred services mapping
DELETE FROM workspace_services 
WHERE workspace_id IN (
    SELECT workspace_id FROM pro_users 
    WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO')
);

-- 8. Delete user-level dependencies (profiles, notifications, preferences) for both PRO owners & team members
DELETE FROM notifications 
WHERE recipient_id IN (SELECT id FROM users WHERE role = 'PRO') 
   OR recipient_id IN (
       SELECT user_id FROM team_members 
       WHERE workspace_id IN (
           SELECT workspace_id FROM pro_users 
           WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO')
       ) AND user_id IS NOT NULL
   );

DELETE FROM notification_preferences 
WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO') 
   OR user_id IN (
       SELECT user_id FROM team_members 
       WHERE workspace_id IN (
           SELECT workspace_id FROM pro_users 
           WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO')
       ) AND user_id IS NOT NULL
   );

DELETE FROM user_profiles 
WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO') 
   OR user_id IN (
       SELECT user_id FROM team_members 
       WHERE workspace_id IN (
           SELECT workspace_id FROM pro_users 
           WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO')
       ) AND user_id IS NOT NULL
   );

-- 9. Delete team members mapping
DELETE FROM team_members 
WHERE workspace_id IN (
    SELECT workspace_id FROM pro_users 
    WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO')
);

-- 10. Delete Pro user mappings
DELETE FROM pro_users 
WHERE user_id IN (SELECT id FROM users WHERE role = 'PRO');

-- 11. Delete associated workspaces
DELETE FROM workspaces 
WHERE id IN (
    SELECT workspace_id FROM (
        SELECT pu.workspace_id FROM pro_users pu 
        JOIN users u ON pu.user_id = u.id 
        WHERE u.role = 'PRO'
    ) temp
);

-- 12. Delete organizations owning those workspaces
DELETE FROM organizations 
WHERE id IN (
    SELECT organization_id FROM (
        SELECT w.organization_id FROM workspaces w 
        JOIN pro_users pu ON w.id = pu.workspace_id 
        JOIN users u ON pu.user_id = u.id 
        WHERE u.role = 'PRO'
    ) temp
);

-- 13. Delete Team member user accounts
DELETE FROM users 
WHERE id IN (
    SELECT user_id FROM (
        SELECT tm.user_id FROM team_members tm 
        JOIN workspaces w ON tm.workspace_id = w.id 
        JOIN pro_users pu ON w.id = pu.workspace_id 
        JOIN users u ON pu.user_id = u.id 
        WHERE u.role = 'PRO' AND tm.user_id IS NOT NULL
    ) temp
);

-- 14. Delete the main PRO user accounts
DELETE FROM users 
WHERE role = 'PRO';

COMMIT;
