import { PrismaClient, Role, ClientStatus, LeadStatus, AgreementStatus, PostStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash default password
  const hashedPassword = await bcrypt.hash('password123', 12);

  // 1. Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@quantumreachmedia.com' },
    update: {},
    create: {
      name: 'Agency Owner (Super Admin)',
      email: 'admin@quantumreachmedia.com',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
      permission: {
        create: {
          role: Role.SUPER_ADMIN,
          customPermissions: {
            dashboard: 'full',
            clients: 'full',
            leads: 'full',
            agreements: 'full',
            gbp: 'full',
            keywords: 'full',
            competitors: 'full',
            posts: 'full',
            localGrid: 'full',
            servicePages: 'full',
            seoAudit: 'full',
            autoReplies: 'full',
            backlinks: 'full',
            tasks: 'full',
            performance: 'full',
            notifications: 'full',
            activityLog: 'full',
            settings: 'full',
          },
        },
      },
      preferences: {
        create: {
          inApp: true,
          email: true,
          dailyDigest: true,
          digestTime: '09:00',
        },
      },
    },
  });

  // 2. Create SEO Specialist User
  const specialist = await prisma.user.upsert({
    where: { email: 'specialist@quantumreachmedia.com' },
    update: {},
    create: {
      name: 'Alex Vance (SEO Specialist)',
      email: 'specialist@quantumreachmedia.com',
      password: hashedPassword,
      role: Role.SEO_SPECIALIST,
      isActive: true,
      permission: {
        create: {
          role: Role.SEO_SPECIALIST,
          customPermissions: {
            dashboard: 'full',
            clients: 'read',
            leads: 'none',
            agreements: 'none',
            gbp: 'full',
            keywords: 'full',
            competitors: 'full',
            posts: 'read',
            localGrid: 'full',
            servicePages: 'full',
            seoAudit: 'full',
            autoReplies: 'read',
            backlinks: 'full',
            tasks: 'full',
            performance: 'full',
            notifications: 'read',
            activityLog: 'read',
            settings: 'none',
          },
        },
      },
    },
  });

  console.log('✅ Created agency users');

  // 3. Create Sample Clients
  const client1 = await prisma.client.upsert({
    where: { domain: 'apexplumbingnyc.com' },
    update: {},
    create: {
      name: 'Apex Plumbing NYC',
      domain: 'apexplumbingnyc.com',
      industry: 'Plumbing & HVAC',
      status: ClientStatus.ACTIVE,
      healthScore: 92,
      primaryColor: '#2563eb',
      managerId: specialist.id,
      keywords: {
        create: [
          { term: 'emergency plumber nyc', searchVolume: 3600, cpc: 14.50, difficulty: 65, intent: 'Transactional', currentRank: 3, previousRank: 5 },
          { term: 'drain cleaning manhattan', searchVolume: 1900, cpc: 11.20, difficulty: 48, intent: 'Commercial', currentRank: 2, previousRank: 2 },
          { term: 'water heater repair brooklyn', searchVolume: 1200, cpc: 9.80, difficulty: 42, intent: 'Transactional', currentRank: 6, previousRank: 9 },
        ],
      },
      competitors: {
        create: [
          { domain: 'nycplumbingservices.com', domainAuthority: 45, estimatedTraffic: 12500 },
          { domain: 'manhattanplumbingpros.com', domainAuthority: 38, estimatedTraffic: 8400 },
        ],
      },
    },
  });

  const client2 = await prisma.client.upsert({
    where: { domain: 'metrosmilesdental.com' },
    update: {},
    create: {
      name: 'Metro Smiles Dental Care',
      domain: 'metrosmilesdental.com',
      industry: 'Healthcare / Dental',
      status: ClientStatus.ACTIVE,
      healthScore: 88,
      primaryColor: '#0d9488',
      managerId: superAdmin.id,
      keywords: {
        create: [
          { term: 'invisalign provider chicago', searchVolume: 2400, cpc: 18.00, difficulty: 58, intent: 'Commercial', currentRank: 4, previousRank: 4 },
          { term: 'cosmetic dentist loop chicago', searchVolume: 1600, cpc: 22.50, difficulty: 62, intent: 'Transactional', currentRank: 1, previousRank: 3 },
        ],
      },
    },
  });

  console.log('✅ Created sample clients & keywords');

  // 4. Create Sample Leads
  await prisma.lead.createMany({
    data: [
      { companyName: 'Urban Auto Care', contactName: 'David Miller', email: 'david@urbanautocare.com', website: 'urbanautocare.com', status: LeadStatus.NEW, score: 75, estimatedBudget: 1500, createdById: superAdmin.id },
      { companyName: 'Lakeside Family Law', contactName: 'Elena Rostova', email: 'elena@lakesidelaw.com', website: 'lakesidelaw.com', status: LeadStatus.CONTACTED, score: 82, estimatedBudget: 3000, createdById: superAdmin.id },
      { companyName: 'Horizon Solar Solutions', contactName: 'Marcus Vance', email: 'marcus@horizonsolar.io', website: 'horizonsolar.io', status: LeadStatus.PROPOSAL, score: 90, estimatedBudget: 4500, createdById: superAdmin.id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created sample leads');

  // 5. Create Sample Tasks
  await prisma.task.createMany({
    data: [
      { title: 'Fix broken canonical tags for Apex Plumbing', status: 'IN_PROGRESS', priority: 'HIGH', clientId: client1.id, assigneeId: specialist.id },
      { title: 'Generate monthly GBP post calendar for Metro Smiles', status: 'TODO', priority: 'MEDIUM', clientId: client2.id, assigneeId: superAdmin.id },
    ],
    skipDuplicates: true,
  });

  // 6. Create Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SYSTEM_INITIALIZATION',
      resource: 'System',
      newData: { status: 'Database seeded successfully', version: 'v6' },
    },
  });

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
