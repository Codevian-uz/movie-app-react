# API Changes — Auth Module List Endpoints

## Summary

All auth module list endpoints have been updated to follow the standard response format. Two types of changes were made:

1. **Content wrapping** — Endpoints that returned bare arrays now wrap them in `{ "content": [...] }`
2. **Pagination** — Endpoints that used `limit`/`offset` now use `page_number`/`page_size` with full paginated response

---

## 1. Paginated Endpoints (input + output changed)

These 3 endpoints now accept `page_number`/`page_size` instead of `limit`/`offset`, and return pagination metadata.

### GET /api/v1/auth/get-users

**Input changed:**

| Before                       | After                                                |
| ---------------------------- | ---------------------------------------------------- |
| `limit` (integer, optional)  | `page_number` (integer, optional, default 1)         |
| `offset` (integer, optional) | `page_size` (integer, optional, default 20, max 100) |

Other query params unchanged: `id`, `username`, `is_active`, `sort`

**Output changed:**

```
// Before
[{ ...user }]

// After
{
  "page_number": 1,
  "page_size": 20,
  "count": 150,
  "content": [{ ...user }]
}
```

Content item shape unchanged:

```json
{
  "id": "string",
  "username": "string",
  "is_active": true,
  "last_active_at": "2024-01-01T00:00:00Z",
  "roles": ["string"],
  "direct_permissions": ["string"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### GET /api/v1/auth/get-roles

**Input changed:**

| Before                       | After                                                |
| ---------------------------- | ---------------------------------------------------- |
| `limit` (integer, optional)  | `page_number` (integer, optional, default 1)         |
| `offset` (integer, optional) | `page_size` (integer, optional, default 20, max 100) |

Other query params unchanged: `id`, `name`, `sort`

**Output changed:**

```
// Before
[{ ...role }]

// After
{
  "page_number": 1,
  "page_size": 20,
  "count": 150,
  "content": [{ ...role }]
}
```

Content item shape unchanged:

```json
{
  "id": 1,
  "name": "string",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### GET /api/v1/auth/get-user-sessions

**Input changed:**

| Before                       | After                                                |
| ---------------------------- | ---------------------------------------------------- |
| `limit` (integer, optional)  | `page_number` (integer, optional, default 1)         |
| `offset` (integer, optional) | `page_size` (integer, optional, default 20, max 100) |

Other query params unchanged: `user_id` (required), `sort`

**Output changed:**

```
// Before
[{ ...session }]

// After
{
  "page_number": 1,
  "page_size": 20,
  "count": 150,
  "content": [{ ...session }]
}
```

Content item shape unchanged:

```json
{
  "id": 1,
  "user_id": "string",
  "ip_address": "string",
  "user_agent": "string",
  "last_used_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 2. Content-Wrapped Endpoints (output only changed)

These 4 endpoints now wrap their response array in a `{ "content": [...] }` object. No input changes.

### GET /api/v1/auth/get-user-roles

```
// Before
[{ ...role }]

// After
{ "content": [{ ...role }] }
```

Content item shape unchanged:

```json
{
  "id": 1,
  "name": "string",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### GET /api/v1/auth/get-role-permissions

```
// Before
[{ ...permission }]

// After
{ "content": [{ ...permission }] }
```

Content item shape unchanged:

```json
{
  "id": 1,
  "role_id": 1,
  "permission": "string",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### GET /api/v1/auth/get-user-permissions

```
// Before
[{ ...permission }]

// After
{ "content": [{ ...permission }] }
```

Content item shape unchanged:

```json
{
  "id": 1,
  "user_id": "string",
  "permission": "string",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### GET /api/v1/auth/get-my-sessions

```
// Before
[{ ...session }]

// After
{ "content": [{ ...session }] }
```

Content item shape unchanged:

```json
{
  "id": 1,
  "user_id": "string",
  "access_token_expires_at": "2024-01-01T00:00:00Z",
  "refresh_token_expires_at": "2024-01-01T00:00:00Z",
  "ip_address": "string",
  "user_agent": "string",
  "last_used_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## Migration Guide

### For paginated endpoints (get-users, get-roles, get-user-sessions):

1. Replace `limit` query param with `page_size` (default: 20, max: 100)
2. Replace `offset` query param with `page_number` (default: 1, 1-based)
3. Response is now an object — access items via `response.content` instead of treating response as array
4. Use `response.count` for total count, `response.page_number` and `response.page_size` for current pagination state

### For content-wrapped endpoints (get-user-roles, get-role-permissions, get-user-permissions, get-my-sessions):

1. Response is now an object — access items via `response.content` instead of treating response as array
2. No input changes needed
