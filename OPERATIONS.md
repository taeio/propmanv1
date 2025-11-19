# PropMan Operations Guide

## Database Backup & Recovery

### Automated Backups (Replit PostgreSQL)
Replit's managed PostgreSQL database (Neon-backed) provides automatic backups:
- **Point-in-time recovery**: Replit databases support rollback to any point in the last 7 days
- **Automatic snapshots**: Taken continuously with minimal performance impact
- **Multi-region replication**: Data is replicated across multiple availability zones

### Manual Backup Procedure
To create a manual backup before major changes:

```bash
# Export database to SQL file
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file
ls -lh backup_*.sql
```

### Recovery Procedure
To restore from a backup:

```bash
# Restore from SQL file
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Or use Replit's built-in rollback feature (recommended)
# 1. Navigate to Database tab in Replit
# 2. Click "Restore" and select restore point
# 3. Confirm restoration
```

### Disaster Recovery Plan

1. **Database Corruption/Data Loss**
   - Use Replit's point-in-time recovery to restore to last known good state
   - Verify data integrity after restoration
   - Review application logs to identify cause

2. **Application Deployment Failure**
   - Use Replit's rollback feature to revert code to previous checkpoint
   - Verify workflows restart successfully
   - Check browser console for frontend errors

3. **Rate Limit Table Corruption**
   - Rate limits auto-cleanup every 5 minutes
   - If needed, manually truncate: `TRUNCATE TABLE rate_limits;`
   - System will rebuild rate limit entries on next requests

4. **Session Table Cleanup**
   - Sessions auto-expire after 7 days
   - Manual cleanup if needed: `DELETE FROM sessions WHERE expire < NOW();`

## Logging & Monitoring

### Structured Logging
PropMan uses structured JSON logging for production monitoring:

```typescript
import { logger } from './server/logger';

// Log levels: debug, info, warn, error
logger.info('User logged in', { userId: user.id, ip: req.ip });
logger.error('Payment failed', { paymentId, userId }, error);
```

### Log Levels
Configure via `LOG_LEVEL` environment variable:
- `debug`: All logs (development only)
- `info`: Informational messages and above (recommended for production)
- `warn`: Warnings and errors only
- `error`: Errors only (critical monitoring)

### Key Events Logged

**Authentication:**
- Login attempts (success/failure)
- Session creation/destruction
- Rate limit enforcement

**Payments:**
- Stripe payment intent creation
- Payment success/failure
- Webhook events

**Errors:**
- API errors with context
- Database errors
- Rate limiting errors

### Monitoring Best Practices

1. **Production Monitoring**
   - Set `LOG_LEVEL=info` in production
   - Monitor error logs for critical issues
   - Set up alerts for rate limit violations

2. **Error Tracking**
   - All errors logged with stack traces
   - Context includes userId, endpoint, method
   - Integrate with external service (Sentry, LogRocket) for advanced tracking

3. **Performance Monitoring**
   - Monitor rate limit table growth: `SELECT COUNT(*) FROM rate_limits;`
   - Check session table size: `SELECT COUNT(*) FROM sessions;`
   - Database query performance via Replit Database analytics

## Deployment Checklist

Before publishing to production:

- [ ] Set all required environment variables (see `.env.example`)
- [ ] Verify `SESSION_SECRET` is unique and strong
- [ ] Configure Stripe API keys (live mode)
- [ ] Set `NODE_ENV=production`
- [ ] Set `LOG_LEVEL=info`
- [ ] Test authentication flow end-to-end
- [ ] Test payment flow with Stripe test mode first
- [ ] Verify rate limiting works (attempt >10 login requests)
- [ ] Check CSRF protection (inspect network requests for x-csrf-token header)
- [ ] Test multi-tenant isolation (create two users, verify data separation)
- [ ] Review database indexes: `\d+ projects`, `\d+ clients`, etc.
- [ ] Create manual database backup before deployment
- [ ] Document rollback procedure for team

## Database Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Review rate limit table size: `SELECT pg_size_pretty(pg_total_relation_size('rate_limits'));`
- Check for orphaned sessions: `SELECT COUNT(*) FROM sessions WHERE expire < NOW();`

**Monthly:**
- Analyze database performance: `ANALYZE;`
- Review slow queries in Replit Database analytics
- Check for missing indexes on frequently queried columns

**Quarterly:**
- Full database backup and test restoration
- Review and update database schemas for new features
- Audit user accounts for inactive users

### Database Schema Updates

Use Drizzle ORM migrations via `npm run db:push`:

```bash
# 1. Update schema in shared/schema.ts
# 2. Push changes to database
npm run db:push

# If data-loss warning appears:
npm run db:push --force

# 3. Verify schema changes
psql $DATABASE_URL -c "\d+ table_name"
```

## Security Audit Checklist

- [ ] All API endpoints use authentication middleware
- [ ] All POST/PUT/DELETE endpoints use CSRF protection
- [ ] Session cookies use secure, httpOnly, sameSite=strict
- [ ] Rate limiting enforced on all endpoints
- [ ] Passwords hashed with scrypt
- [ ] No secrets in code or logs
- [ ] Database uses prepared statements (Drizzle ORM)
- [ ] Input validation on all API endpoints (Zod schemas)
- [ ] Stripe webhooks verify signatures
- [ ] Multi-tenant data isolation (userId foreign keys)

## Support & Troubleshooting

### Common Issues

**Issue: Rate limits reset not working**
- Check `rate_limits` table: `SELECT * FROM rate_limits LIMIT 10;`
- Verify `resetTime` values are in the future
- Check cleanup logs for errors

**Issue: Sessions not persisting**
- Verify `DATABASE_URL` is set
- Check `sessions` table exists: `\dt sessions`
- Verify `SESSION_SECRET` is set
- Check browser cookies (should see `propman.sid`)

**Issue: CSRF token errors**
- Verify all mutations use `fetchWithCsrf` helper
- Check browser cookies for CSRF cookie
- Review network requests for `x-csrf-token` header

**Issue: Payments not recording**
- Check Stripe webhook configuration
- Verify `STRIPE_SECRET_KEY` is set (live mode)
- Review Stripe dashboard for webhook delivery status
- Check application logs for payment errors
