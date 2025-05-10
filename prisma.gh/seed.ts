import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default users with hashed passwords
  const password = await hash('12345.Abcd', 10);

  // Create master user
  await prisma.user.upsert({
    where: { email: 'master@app.com' },
    update: {},
    create: {
      email: 'master@app.com',
      name: 'master',
      password,
      role: Role.MASTER,
    },
  });

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@app.com' },
    update: {},
    create: {
      email: 'admin@app.com',
      name: 'admin',
      password,
      role: Role.ADMIN,
    },
  });

  // Create editor user
  await prisma.user.upsert({
    where: { email: 'editor@app.com' },
    update: {},
    create: {
      email: 'editor@app.com',
      name: 'editor',
      password,
      role: Role.EDITOR,
    },
  });

  // Create collaborator user
  await prisma.user.upsert({
    where: { email: 'collaborator@app.com' },
    update: {},
    create: {
      email: 'collaborator@app.com',
      name: 'collaborator',
      password,
      role: Role.COLLABORATOR,
    },
  });

  // Create default theme presets
  const defaultLight = await prisma.themePreset.create({
    data: {
      name: 'Default Light',
      config: JSON.stringify({
        // Light theme variables
        '--background': '#ffffff',
        '--foreground': '#1a1a1a',
        '--primary': '#6d28d9',
        '--primary-foreground': '#ffffff',
        '--secondary': '#f3f4f6',
        '--secondary-foreground': '#1f2937',
        '--accent': '#8b5cf6',
        '--accent-foreground': '#ffffff',
        '--muted': '#f3f4f6',
        '--muted-foreground': '#6b7280',
        '--card': '#ffffff',
        '--card-foreground': '#1a1a1a',
        '--border': '#e5e7eb',
        '--input': '#e5e7eb',
        '--ring': '#6d28d9',
      })
    }
  });

  const defaultDark = await prisma.themePreset.create({
    data: {
      name: 'Default Dark',
      config: JSON.stringify({
        // Dark theme variables
        '--background': '#1a1a1a',
        '--foreground': '#ffffff',
        '--primary': '#8b5cf6',
        '--primary-foreground': '#ffffff',
        '--secondary': '#2d3748',
        '--secondary-foreground': '#f7fafc',
        '--accent': '#6d28d9',
        '--accent-foreground': '#ffffff',
        '--muted': '#2d3748',
        '--muted-foreground': '#a0aec0',
        '--card': '#2d3748',
        '--card-foreground': '#ffffff',
        '--border': '#4a5568',
        '--input': '#4a5568',
        '--ring': '#8b5cf6',
      })
    }
  });

  // Create global config if it doesn't exist
  await prisma.globalConfig.upsert({
    where: { id: 'global' },
    update: {
      maintenanceMode: false,
      defaultLightThemePresetId: defaultLight.id,
      defaultDarkThemePresetId: defaultDark.id,
      themeAssignments: JSON.stringify({}),
      loadingSpinnerConfig: JSON.stringify({ enabled: false, overlayColor: 'rgba(255,255,255,0.8)' }),
      themeSwitcherConfig: JSON.stringify({ enabled: true, position: 'bottom-right' }),
      stickyElementsConfig: JSON.stringify({ header: false, sidebar: false, footer: false, themeSwitcher: false }),
    },
    create: {
      id: 'global',
      siteName: 'Neurowitch',
      siteUrl: 'http://localhost:3000',
      maintenanceMode: false,
      defaultLightThemePresetId: defaultLight.id,
      defaultDarkThemePresetId: defaultDark.id,
      themeAssignments: JSON.stringify({}),
      loadingSpinnerConfig: JSON.stringify({ enabled: false, overlayColor: 'rgba(255,255,255,0.8)' }),
      themeSwitcherConfig: JSON.stringify({ enabled: true, position: 'bottom-right' }),
      stickyElementsConfig: JSON.stringify({ header: false, sidebar: false, footer: false, themeSwitcher: false }),
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
