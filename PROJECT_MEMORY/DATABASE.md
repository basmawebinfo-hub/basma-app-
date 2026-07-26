# Database Schema & RLS Matrix

This document provides a comprehensive security and structural analysis of the BASMA AI database schema.

---

## 1. Database Schema Status

* **Static Schema file (`supabase/schema.sql`)**: Contains definitions for:
  * `profiles`
  * `instances`
  * `contacts`
  * `chats`
  * `messages`
  * `webhook_configs`
  * `webhook_events`
  * `webhook_deliveries`
* **Dynamic tables**: Several additional tables are referenced in the codebase but are created either remotely or dynamically via migrations:
  * `user_webhook_tokens`
  * `subscriptions`
  * `plans`
  * `api_keys`
  * `auto_reply_rules`
  * `campaigns`
  * `campaign_contacts`
  * `notifications`
  * `support_messages`
  * `api_usage_log`
  * `credit_transactions`
  * `telegram_chat_state`

---

## 2. Row Level Security (RLS) Matrix

Below is a table-by-table audit of RLS policies defined in `schema.sql`:

| Table Name | RLS Status | Select Policy | Insert Policy | Update Policy | Delete Policy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **profiles** | **ENABLED** | `auth.uid() = id` | Trigger/Db Function | `auth.uid() = id` | Restricted (Admin) |
| **instances** | **ENABLED** | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| **contacts** | **ENABLED** | Own instance | Own instance | Own instance | Own instance |
| **chats** | **ENABLED** | Own instance | Own instance | Own instance | Own instance |
| **messages** | **ENABLED** | Own instance | Own instance | Own instance | Own instance |
| **webhook_configs**| **ENABLED** | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| **webhook_events** | **ENABLED** | Own instance | Own instance | Own instance | Own instance |
| **webhook_deliveries**|**ENABLED**| Own webhook config | Own webhook config | Own webhook config | Own webhook config |

---

## 3. Account Deletion & Cascading Cleans

### Cascading Deletions:
* `profiles.id` references `auth.users(id)` with `on delete cascade`. Deleting an authentication account automatically purges the corresponding profile.
* `instances.user_id` references `auth.users(id)` with `on delete cascade`.
* `contacts.instance_id` references `instances.id` with `on delete cascade`.
* `chats.instance_id` references `instances.id` with `on delete cascade`.
* `messages.instance_id` references `instances.id` with `on delete cascade`.
* `webhook_configs.user_id` references `auth.users(id)` with `on delete cascade`.
* `webhook_events.instance_id` references `instances.id` with `on delete cascade`.
* `webhook_deliveries.event_id` and `webhook_config_id` reference parent tables with `on delete cascade`.

**Result**: Deleting an `auth.user` safely and fully cascades across all public tables, leaving zero orphaned records.
