# SIAS BLOCKED-002 Remediation Playbook

**Status**: ready to execute, requires human-provided SSH credentials
**Origin**: BLOCKED-002 in `.ai/SIAS_BLOCKED_REGISTRY_20260723.md`
**Target**: restore SSH access to `154.217.241.238` (STAGING-004) hosting the
  Redis cluster that SIAS depends on for task queue + cache.

---

## What's blocked

The Redis cluster used by SIAS TianJi staging runs on host `154.217.241.238`
(STAGING-004). Since at least 2026-07-23, this host has been unreachable via
SSH from the operator workstation. All SIAS staging tasks that need persistent
queue state are currently parked.

## Required inputs (must be provided by human before execution)

1. **SSH credentials** for `154.217.241.238`:
   - Username (e.g., `root`, `deploy`, `ubuntu`)
   - SSH key path on operator workstation (e.g., `~/.ssh/id_ed25519`)
   - Or: temporary SSH password via Bastion / VPN (not committed)
2. **Network access path**:
   - Direct public IP? Or via Bastion / WireGuard / Tailscale?
   - Required firewall rule changes (operator can't make these)
3. **Redis auth** (if enabled):
   - `requirepass` value from `/etc/redis/redis.conf` (read-only)
4. **Confirm scope**:
   - Is this host ONLY Redis, or also other services?
   - Can it be safely restarted, or is it production-shared?

## Pre-flight verification (operator runs these, paste output back)

```bash
# 1. Network reachability
nc -zv -w 5 154.217.241.238 22         # SSH port
nc -zv -w 5 154.217.241.238 6379       # Redis port
nc -zv -w 5 154.217.241.238 16379      # Redis Cluster bus (if cluster mode)

# 2. Existing SSH config
ls -la ~/.ssh/
cat ~/.ssh/config 2>/dev/null | grep -A 5 "Host 154\." || echo "no entry yet"

# 3. Operator's outbound IP (for firewall rule request)
curl -fsS https://ifconfig.me
```

## Remediation steps (after SSH confirmed)

### Step 1 — Add SSH config entry

```bash
# Append to ~/.ssh/config
cat >> ~/.ssh/config <<EOF

Host sias-staging-004
    HostName 154.217.241.238
    User <USERNAME_FROM_HUMAN>
    IdentityFile ~/.ssh/<KEY_FROM_HUMAN>
    IdentitiesOnly yes
    ServerAliveInterval 30
    ServerAliveCountMax 3
EOF

chmod 600 ~/.ssh/config
ssh-add ~/.ssh/<KEY_FROM_HUMAN>
```

### Step 2 — Verify connectivity

```bash
ssh sias-staging-004 'hostname && uptime && whoami'
# Expected: shows host info, uptime, current user
```

If this fails → STOP. Don't proceed. The remaining steps require confirmed
SSH access.

### Step 3 — Redis health check

```bash
ssh sias-staging-004 'redis-cli ping'
# Expected: PONG

ssh sias-staging-004 'redis-cli info replication'
# If cluster mode, shows master/replica status

ssh sias-staging-004 'redis-cli config get maxmemory-policy'
# Expected: noeviction (per sias-staging-003-redis-persistence skill)
```

### Step 4 — Persistence verification

```bash
ssh sias-staging-004 'redis-cli config get appendonly'
# Expected: yes (if using AOF)

ssh sias-staging-004 'redis-cli config get appendfsync'
# Expected: everysec

ssh sias-staging-004 'redis-cli bgsave'
# Triggers RDB snapshot, non-blocking
# Wait 5s, then:
ssh sias-staging-004 'ls -lh /var/lib/redis/dump.rdb'
```

### Step 5 — Test queue durability (write + kill + restart + read)

```bash
# On staging-004
ssh sias-staging-004 'redis-cli LPUSH test:queue "task-a" "task-b" "task-c"'
ssh sias-staging-004 'redis-cli LLEN test:queue'
# Expected: (integer) 3

# Simulate restart
ssh sias-staging-004 'systemctl restart redis'    # or docker restart redis
sleep 5

ssh sias-staging-004 'redis-cli ping'
# Expected: PONG

ssh sias-staging-004 'redis-cli LLEN test:queue'
# Expected: (integer) 3

ssh sias-staging-004 'redis-cli LRANGE test:queue 0 -1'
# Expected: task-a, task-b, task-c (or in reverse order)

ssh sias-staging-004 'redis-cli DEL test:queue'
# Cleanup test data
```

### Step 6 — Update SIAS BLOCKED REGISTRY

After all checks PASS:

```bash
# On operator workstation
cd ~/tianji-global/.ai

# Edit SIAS_BLOCKED_REGISTRY_*.md, change BLOCKED-002:
#   - Status: infra_blocked → completed
#   - Resolution: "SSH restored to 154.217.241.238 via <method>. Redis cluster
#     verified healthy, persistence enabled, queue durability test passed on
#     <YYYY-MM-DD>."
#   - Resolved in: PR #NNN

# Commit + PR
git checkout -b sias/unblock-002-redis
# (after editing)
git add SIAS_BLOCKED_REGISTRY_*.md
git commit -m "sias: unblock BLOCKED-002 (Redis cluster on 154.217.241.238)"
gh pr create --draft --title "sias: unblock BLOCKED-002"
```

### Step 7 — Re-enable SIAS STAGING-003

Once BLOCKED-002 is resolved, the conveyor can re-attempt STAGING-003 with
real Redis instead of the local fallback. Load skill
`sias-staging-003-redis-persistence` for the persistence config.

## Hard rules

- Do NOT commit SSH credentials, passwords, or `requirepass` to any repo.
- Do NOT run `redis-cli FLUSHDB` or `FLUSHALL` — destroys data.
- Do NOT change `maxmemory-policy` without backup of current value.
- Do NOT skip the queue durability test — it's the actual proof of BLOCKED-002
  resolution.
- Do NOT enable BLOCKED-003 (Stripe test mode) or BLOCKED-007 (live Stripe)
  during this remediation.

## Pitfalls

- **Outbound IP changed**: if operator moved networks, firewall rules from
  before may block new IP. Re-request firewall rule.
- **Redis Cluster vs standalone**: if `redis-cli cluster info` shows
  `cluster_enabled:1`, this playbook needs cluster-aware commands
  (`redis-cli --cluster check`). Escalate to specialist.
- **AOF rewrite in progress**: `appendonly yes` plus heavy write load can
  trigger AOF rewrite. Check `INFO persistence` for `aof_rewrite_in_progress`
  before testing.
- **Disk full**: if Redis can't write to `/var/lib/redis/`, persistence
  silently fails. Check `df -h` before testing.

## Evidence chain

- Pre-flight output (operator pastes nc / curl results)
- Step 2 SSH success log
- Step 3 Redis INFO output
- Step 5 queue durability test log (before + after restart)
- BLOCKED REGISTRY diff after resolution
- New `.ai/SIAS_BLOCKED_002_REMEDIATION_<date>.md` report

## Related skills

- `sias-staging-003-redis-persistence` — Redis config best practice
- `sias-container-debug-technique` — container-level debug
- `sias-multi-server-debug-workflow` — multi-host patterns
- `cloud-vps-ssh-timeout-debug` — general SSH debugging

## Decision points (human must approve before each)

1. **Approve firewall rule change** if needed (operator IP vs STAGING-004)
2. **Approve Redis restart** during Step 5 (acknowledges brief downtime)
3. **Approve BLOCKED-002 status change** after Step 5 passes
4. **Approve re-enabling STAGING-003** conveyor runs

If any decision point is rejected → STOP and report back.
