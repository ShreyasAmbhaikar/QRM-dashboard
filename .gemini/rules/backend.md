# ⚡ Backend Agent Rules

1. **Server Actions & Mutations**: Always check session auth, RBAC permissions via `withPermission()`, and validate inputs via Zod.
2. **Database Queries**: Use Prisma ORM parameterized queries exclusively. Connection pooling configured via `connection_limit=10`.
3. **Audit Trails**: Call `createAuditLog()` for all CREATE, UPDATE, DELETE, or EXPORT actions.
4. **Encryption**: AES-256-GCM encryption for external API keys and OAuth tokens stored in PostgreSQL.
5. **Rate Limiting**: Apply Redis sliding-window rate limiting on API endpoints and public auth routes.
6. **Error Format**: Return standard `ApiResponse<T>` using `successResponse()` and `errorResponse()` helpers.
