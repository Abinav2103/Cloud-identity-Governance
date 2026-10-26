import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { dbState, connectDB } from './db';
import { memoryStore } from './memoryStore';
import {
  UserModel,
  AccessRequestModel,
  PrivilegedAccountModel,
  AuditLogModel,
} from './models';

export const apiRouter = Router();

const googleOAuthClient = new OAuth2Client();

// DB Status & Health Endpoint
apiRouter.get('/status', (req: Request, res: Response) => {
  res.json({
    connected: dbState.isConnected,
    connecting: dbState.isConnecting,
    status: dbState.statusMessage,
    mode: dbState.isConnected ? 'MongoDB Atlas' : 'In-Memory State',
    hasUri: Boolean(dbState.currentUri && !dbState.currentUri.includes('YOUR_')),
  });
});

// Configure or test MongoDB URI dynamically from UI
apiRouter.post('/connect-db', async (req: Request, res: Response) => {
  const { connectionString } = req.body;
  if (!connectionString) {
    return res.status(400).json({ error: 'Connection string is required' });
  }
  const result = await connectDB(connectionString);
  res.json({
    ...result,
    connected: dbState.isConnected,
    status: dbState.statusMessage,
  });
});

// -------------------------------------------------------------
// Users Routes
// -------------------------------------------------------------
apiRouter.post('/auth/google', async (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const { credential } = req.body;

  if (!clientId) {
    return res.status(503).json({ error: 'Google sign-in is not configured on the server.' });
  }
  if (typeof credential !== 'string' || !credential) {
    return res.status(400).json({ error: 'A Google credential is required.' });
  }

  try {
    const ticket = await googleOAuthClient.verifyIdToken({ idToken: credential, audience: clientId });
    const identity = ticket.getPayload();
    if (!identity?.email || identity.email_verified !== true) {
      return res.status(401).json({ error: 'A verified Google email address is required.' });
    }

    const email = identity.email.toLowerCase();
    const lastLogin = new Date().toISOString();
    let user;

    if (dbState.isConnected) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser?.status === 'suspended') {
        return res.status(403).json({ error: 'This account is suspended.' });
      }
      user = existingUser
        ? await UserModel.findOneAndUpdate({ email }, { lastLogin }, { new: true })
        : await UserModel.create({
            id: `google-${identity.sub}`,
            name: identity.name || email,
            email,
            role: 'Developer',
            department: 'Engineering',
            status: 'active',
            lastLogin,
            mfaEnabled: true,
          });
    } else {
      const existingUser = memoryStore.users.find((candidate) => candidate.email.toLowerCase() === email);
      if (existingUser?.status === 'suspended') {
        return res.status(403).json({ error: 'This account is suspended.' });
      }
      if (existingUser) {
        existingUser.lastLogin = lastLogin;
        user = existingUser;
      } else {
        user = {
          id: `google-${identity.sub}`,
          name: identity.name || email,
          email,
          role: 'Developer' as const,
          department: 'Engineering',
          status: 'active' as const,
          lastLogin,
          mfaEnabled: true,
        };
        memoryStore.users.push(user);
      }
    }

    return res.json(user);
  } catch {
    return res.status(401).json({ error: 'Google credential verification failed.' });
  }
});

apiRouter.get('/users', async (req: Request, res: Response) => {
  try {
    if (dbState.isConnected) {
      const users = await UserModel.find();
      return res.json(users);
    }
    res.json(memoryStore.users);
  } catch (err: any) {
    res.json(memoryStore.users);
  }
});

apiRouter.post('/users', async (req: Request, res: Response) => {
  try {
    const newUser = req.body;
    if (dbState.isConnected) {
      const created = await UserModel.create(newUser);
      return res.status(201).json(created);
    }
    memoryStore.users.push(newUser);
    res.status(201).json(newUser);
  } catch (err: any) {
    memoryStore.users.push(req.body);
    res.status(201).json(req.body);
  }
});

apiRouter.patch('/users/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (dbState.isConnected) {
      const updated = await UserModel.findOneAndUpdate({ id }, { status }, { new: true });
      return res.json(updated);
    }
    memoryStore.users = memoryStore.users.map((u) => (u.id === id ? { ...u, status } : u));
    res.json({ id, status });
  } catch (err: any) {
    memoryStore.users = memoryStore.users.map((u) =>
      u.id === req.params.id ? { ...u, status: req.body.status } : u
    );
    res.json({ id: req.params.id, status: req.body.status });
  }
});

// -------------------------------------------------------------
// Access Requests Routes
// -------------------------------------------------------------
apiRouter.get('/access-requests', async (req: Request, res: Response) => {
  try {
    if (dbState.isConnected) {
      const [requests, users, accounts] = await Promise.all([
        AccessRequestModel.find().sort({ requestedAt: -1 }).lean(),
        UserModel.find().lean(),
        PrivilegedAccountModel.find().lean(),
      ]);
      const usersById = new Map(users.map((user: any) => [String(user._id ?? user.id), user]));
      const accountsById = new Map(accounts.map((account: any) => [String(account._id ?? account.id), account]));

      return res.json(requests.map((request: any) => {
        const requesterId = String(request.requesterId ?? request.requester?._id ?? request.requester ?? '');
        const accountId = String(request.privilegedAccount?._id ?? request.privilegedAccount ?? '');
        const requester = usersById.get(requesterId);
        const account = accountsById.get(accountId);
        const rawStatus = String(request.status ?? 'pending').toLowerCase();
        const status = ['active', 'expired', 'revoked'].includes(rawStatus)
          ? `${rawStatus[0].toUpperCase()}${rawStatus.slice(1)}`
          : ['pending', 'approved', 'denied'].includes(rawStatus) ? rawStatus : 'pending';
        const durationHours = Number(request.durationHours) || 4;

        return {
          id: String(request.id ?? request._id ?? ''),
          requesterId,
          requesterName: request.requesterName ?? request.requester?.name ?? requester?.name ?? 'Unknown requester',
          cloud: request.cloud ?? account?.provider ?? account?.cloud ?? 'AWS',
          resourceName: request.resourceName ?? request.accountName ?? account?.accountName ?? account?.name ?? 'Unknown resource',
          isPrivileged: Boolean(request.isPrivileged ?? String(account?.accountType ?? '').toLowerCase().includes('admin')),
          justification: request.justification ?? request.reason ?? request.reviewComment ?? 'No justification provided',
          status,
          requestedAt: request.requestedAt ?? request.createdAt?.toISOString?.() ?? '',
          reviewedAt: request.reviewedAt,
          reviewedBy: request.reviewedBy?.name ?? usersById.get(String(request.reviewedBy))?.name ?? request.reviewedBy,
          durationHours,
          durationMinutes: Number(request.durationMinutes) || durationHours * 60,
          approvedAt: request.approvedAt,
          expiresAt: request.expiresAt,
          riskScore: request.riskScore,
          riskReasons: Array.isArray(request.riskReasons) ? request.riskReasons : [],
        };
      }));
    }
    res.json(memoryStore.accessRequests);
  } catch (err: any) {
    res.json(memoryStore.accessRequests);
  }
});

apiRouter.post('/access-requests', async (req: Request, res: Response) => {
  try {
    const newReq = req.body;
    if (dbState.isConnected) {
      const created = await AccessRequestModel.create(newReq);
      return res.status(201).json(created);
    }
    memoryStore.accessRequests.unshift(newReq);
    res.status(201).json(newReq);
  } catch (err: any) {
    memoryStore.accessRequests.unshift(req.body);
    res.status(201).json(req.body);
  }
});

apiRouter.patch('/access-requests/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy, reviewedAt, approvedAt, expiresAt } = req.body;
    const updateData: any = { status };
    if (reviewedBy !== undefined) updateData.reviewedBy = reviewedBy;
    if (reviewedAt !== undefined) updateData.reviewedAt = reviewedAt;
    if (approvedAt !== undefined) updateData.approvedAt = approvedAt;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;

    if (dbState.isConnected) {
      let updated = await AccessRequestModel.findOneAndUpdate({ id }, updateData, { new: true });
      if (!updated && /^[a-f\d]{24}$/i.test(id)) {
        updated = await AccessRequestModel.findByIdAndUpdate(id, updateData, { new: true });
      }
      return res.json(updated);
    }
    memoryStore.accessRequests = memoryStore.accessRequests.map((r) =>
      r.id === id ? { ...r, ...updateData } : r
    );
    res.json({ id, ...updateData });
  } catch (err: any) {
    memoryStore.accessRequests = memoryStore.accessRequests.map((r) =>
      r.id === req.params.id ? { ...r, ...req.body } : r
    );
    res.json({ id: req.params.id, ...req.body });
  }
});

// -------------------------------------------------------------
// Privileged Accounts (PAM) Routes
// -------------------------------------------------------------
apiRouter.get('/privileged-accounts', async (req: Request, res: Response) => {
  try {
    if (dbState.isConnected) {
      const accounts = await PrivilegedAccountModel.find();
      return res.json(accounts);
    }
    res.json(memoryStore.privilegedAccounts);
  } catch (err: any) {
    res.json(memoryStore.privilegedAccounts);
  }
});

apiRouter.post('/privileged-accounts', async (req: Request, res: Response) => {
  try {
    const newPam = req.body;
    if (dbState.isConnected) {
      const created = await PrivilegedAccountModel.create(newPam);
      return res.status(201).json(created);
    }
    memoryStore.privilegedAccounts.push(newPam);
    res.status(201).json(newPam);
  } catch (err: any) {
    memoryStore.privilegedAccounts.push(req.body);
    res.status(201).json(req.body);
  }
});

apiRouter.post('/privileged-accounts/:id/rotate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lastRotated } = req.body;
    if (dbState.isConnected) {
      const updated = await PrivilegedAccountModel.findOneAndUpdate(
        { id },
        { lastRotated, vaultStatus: 'Checked-In' },
        { new: true }
      );
      return res.json(updated);
    }
    memoryStore.privilegedAccounts = memoryStore.privilegedAccounts.map((p) =>
      p.id === id ? { ...p, lastRotated, vaultStatus: 'Checked-In' } : p
    );
    res.json({ id, lastRotated, vaultStatus: 'Checked-In' });
  } catch (err: any) {
    res.json({ id: req.params.id, ...req.body });
  }
});

// -------------------------------------------------------------
// Audit Logs Routes
// -------------------------------------------------------------
apiRouter.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    if (dbState.isConnected) {
      const [rawLogs, users] = await Promise.all([
        AuditLogModel.find().lean(),
        UserModel.find().lean(),
      ]);

      const usersById = new Map(users.map((u: any) => [String(u._id ?? u.id), u]));

      // Sort logs by timestamp or createdAt descending
      const sortedLogs = rawLogs.sort((a: any, b: any) => {
        const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
        const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      const normalizedLogs = sortedLogs.map((log: any, idx: number) => {
        const actorId = String(log.performedBy ?? log.actorId ?? '');
        const foundUser = usersById.get(actorId);

        const actor = log.actor || foundUser?.name || 'System Admin';
        const actorRole = log.actorRole || foundUser?.role || 'Admin';
        const action = log.action || log.description || 'System Event';
        const target =
          log.target ||
          (log.targetType ? `${log.targetType} :: ${log.targetId || 'Resource'}` : 'System :: Core');

        let formattedTime = log.timestamp;
        if (!formattedTime && log.createdAt) {
          try {
            const d = new Date(log.createdAt);
            const pad = (n: number) => String(n).padStart(2, '0');
            formattedTime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
          } catch {
            formattedTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
          }
        }
        if (!formattedTime) {
          formattedTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
        }

        let status: 'SUCCESS' | 'DENIED' | 'PENDING' = 'SUCCESS';
        const rawStatus = String(log.status || 'SUCCESS').toUpperCase();
        if (rawStatus === 'SUCCESS' || rawStatus === 'DENIED' || rawStatus === 'PENDING') {
          status = rawStatus;
        }

        const ipAddress = log.ipAddress || '127.0.0.1';
        const id = String(log.id || log._id || `LOG-${1000 + idx}`);

        return {
          id,
          actor,
          actorRole,
          action,
          target,
          timestamp: formattedTime,
          status,
          ipAddress,
          hash: log.hash,
          previousHash: log.previousHash,
        };
      });

      return res.json(normalizedLogs);
    }
    res.json(memoryStore.auditLogs);
  } catch (err: any) {
    res.json(memoryStore.auditLogs);
  }
});

apiRouter.post('/audit-logs', async (req: Request, res: Response) => {
  try {
    const newLog = req.body;
    if (dbState.isConnected) {
      const created = await AuditLogModel.create(newLog);
      return res.status(201).json(created);
    }
    memoryStore.auditLogs.unshift(newLog);
    res.status(201).json(newLog);
  } catch (err: any) {
    memoryStore.auditLogs.unshift(req.body);
    res.status(201).json(req.body);
  }
});
