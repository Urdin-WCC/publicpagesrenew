<<<<<<< HEAD
import { PrismaClient, Role, SectionType, WidgetType } from '@prisma/client';
=======
si.import { PrismaClient, Role } from '@prisma/client';
>>>>>>> feature/modulo4
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

  // Create global config if it doesn't exist
  await prisma.globalConfig.upsert({
    where: { id: 'global' },
<<<<<<< HEAD
    update: {
      maintenanceMode: false,
      activeThemeId: 'default',
    },
=======
    update: {},
>>>>>>> feature/modulo4
    create: {
      id: 'global',
      siteName: 'Neurowitch',
      siteUrl: 'http://localhost:3000',
<<<<<<< HEAD
      maintenanceMode: false,
      activeThemeId: 'default',
    },
  });

  // Create default theme preset
  const defaultTheme = await prisma.themePreset.upsert({
    where: { id: 'default' },
    update: {
      isActive: true,
      cssVariables: {
        // Light mode variables
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
        // Dark mode variables
        '--dark-background': '#1a1a1a',
        '--dark-foreground': '#ffffff',
        '--dark-primary': '#8b5cf6',
        '--dark-primary-foreground': '#ffffff',
        '--dark-secondary': '#2d3748',
        '--dark-secondary-foreground': '#f7fafc',
        '--dark-accent': '#6d28d9',
        '--dark-accent-foreground': '#ffffff',
        '--dark-muted': '#2d3748',
        '--dark-muted-foreground': '#a0aec0',
        '--dark-card': '#2d3748',
        '--dark-card-foreground': '#ffffff',
        '--dark-border': '#4a5568',
        '--dark-input': '#4a5568',
        '--dark-ring': '#8b5cf6',
      },
    },
    create: {
      id: 'default',
      name: 'Default Theme',
      description: 'Default theme for Neurowitch',
      isActive: true,
      cssVariables: {
        // Light mode variables
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
        // Dark mode variables
        '--dark-background': '#1a1a1a',
        '--dark-foreground': '#ffffff',
        '--dark-primary': '#8b5cf6',
        '--dark-primary-foreground': '#ffffff',
        '--dark-secondary': '#2d3748',
        '--dark-secondary-foreground': '#f7fafc',
        '--dark-accent': '#6d28d9',
        '--dark-accent-foreground': '#ffffff',
        '--dark-muted': '#2d3748',
        '--dark-muted-foreground': '#a0aec0',
        '--dark-card': '#2d3748',
        '--dark-card-foreground': '#ffffff',
        '--dark-border': '#4a5568',
        '--dark-input': '#4a5568',
        '--dark-ring': '#8b5cf6',
      },
    },
  });

  // Create site sections
  const header = await prisma.siteSection.upsert({
    where: { id: 'header' },
    update: {
      isActive: true,
    },
    create: {
      id: 'header',
      name: 'Header',
      type: SectionType.HEADER,
      isActive: true,
    },
  });

  const footer = await prisma.siteSection.upsert({
    where: { id: 'footer' },
    update: {
      isActive: true,
    },
    create: {
      id: 'footer',
      name: 'Footer',
      type: SectionType.FOOTER,
      isActive: true,
    },
  });

  const sidebar = await prisma.siteSection.upsert({
    where: { id: 'sidebar' },
    update: {
      isActive: true,
    },
    create: {
      id: 'sidebar',
      name: 'Sidebar',
      type: SectionType.SIDEBAR,
      isActive: true,
    },
  });

  // Create menu items for header
  await prisma.menuItem.upsert({
    where: { id: 'home' },
    update: {
      order: 1,
      isActive: true,
    },
    create: {
      id: 'home',
      label: 'Inicio',
      url: '/',
      order: 1,
      sectionId: header.id,
      isActive: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'blog' },
    update: {
      order: 2,
      isActive: true,
    },
    create: {
      id: 'blog',
      label: 'Blog',
      url: '/blog',
      order: 2,
      sectionId: header.id,
      isActive: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'portfolio' },
    update: {
      order: 3,
      isActive: true,
    },
    create: {
      id: 'portfolio',
      label: 'Portfolio',
      url: '/portfolio',
      order: 3,
      sectionId: header.id,
      isActive: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'about' },
    update: {
      order: 4,
      isActive: true,
    },
    create: {
      id: 'about',
      label: 'Acerca de',
      url: '/about',
      order: 4,
      sectionId: header.id,
      isActive: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'contact' },
    update: {
      order: 5,
      isActive: true,
    },
    create: {
      id: 'contact',
      label: 'Contacto',
      url: '/contact',
      order: 5,
      sectionId: header.id,
      isActive: true,
    },
  });

  // Create widgets for sidebar
  await prisma.widget.upsert({
    where: { id: 'search' },
    update: {
      order: 1,
      isActive: true,
    },
    create: {
      id: 'search',
      title: 'Buscar',
      type: WidgetType.SEARCH,
      order: 1,
      sectionId: sidebar.id,
      isActive: true,
    },
  });

  await prisma.widget.upsert({
    where: { id: 'latest-posts' },
    update: {
      order: 2,
      isActive: true,
      config: {
        count: 5,
      },
    },
    create: {
      id: 'latest-posts',
      title: 'Últimas Publicaciones',
      type: WidgetType.LATEST_POSTS,
      order: 2,
      sectionId: sidebar.id,
      isActive: true,
      config: {
        count: 5,
      },
    },
  });

  await prisma.widget.upsert({
    where: { id: 'categories' },
    update: {
      order: 3,
      isActive: true,
    },
    create: {
      id: 'categories',
      title: 'Categorías',
      type: WidgetType.CATEGORIES,
      order: 3,
      sectionId: sidebar.id,
      isActive: true,
    },
  });

  await prisma.widget.upsert({
    where: { id: 'social-links' },
    update: {
      order: 4,
      isActive: true,
      config: {
        links: [
          { platform: 'twitter', url: 'https://twitter.com/neurowitch' },
          { platform: 'facebook', url: 'https://facebook.com/neurowitch' },
          { platform: 'instagram', url: 'https://instagram.com/neurowitch' },
          { platform: 'linkedin', url: 'https://linkedin.com/company/neurowitch' },
        ],
      },
    },
    create: {
      id: 'social-links',
      title: 'Redes Sociales',
      type: WidgetType.SOCIAL_LINKS,
      order: 4,
      sectionId: sidebar.id,
      isActive: true,
      config: {
        links: [
          { platform: 'twitter', url: 'https://twitter.com/neurowitch' },
          { platform: 'facebook', url: 'https://facebook.com/neurowitch' },
          { platform: 'instagram', url: 'https://instagram.com/neurowitch' },
          { platform: 'linkedin', url: 'https://linkedin.com/company/neurowitch' },
        ],
      },
    },
  });

  // Create widgets for footer
  await prisma.widget.upsert({
    where: { id: 'footer-text' },
    update: {
      order: 1,
      isActive: true,
      content: '<p>Neurowitch es una plataforma de gestión de contenido moderna y flexible. © 2025 Todos los derechos reservados.</p>',
    },
    create: {
      id: 'footer-text',
      title: 'Acerca de Nosotros',
      type: WidgetType.TEXT,
      order: 1,
      sectionId: footer.id,
      isActive: true,
      content: '<p>Neurowitch es una plataforma de gestión de contenido moderna y flexible. © 2025 Todos los derechos reservados.</p>',
    },
  });

  await prisma.widget.upsert({
    where: { id: 'footer-social' },
    update: {
      order: 2,
      isActive: true,
      config: {
        links: [
          { platform: 'twitter', url: 'https://twitter.com/neurowitch' },
          { platform: 'facebook', url: 'https://facebook.com/neurowitch' },
          { platform: 'instagram', url: 'https://instagram.com/neurowitch' },
          { platform: 'linkedin', url: 'https://linkedin.com/company/neurowitch' },
        ],
      },
    },
    create: {
      id: 'footer-social',
      title: 'Síguenos',
      type: WidgetType.SOCIAL_LINKS,
      order: 2,
      sectionId: footer.id,
      isActive: true,
      config: {
        links: [
          { platform: 'twitter', url: 'https://twitter.com/neurowitch' },
          { platform: 'facebook', url: 'https://facebook.com/neurowitch' },
          { platform: 'instagram', url: 'https://instagram.com/neurowitch' },
          { platform: 'linkedin', url: 'https://linkedin.com/company/neurowitch' },
        ],
      },
    },
  });

  await prisma.widget.upsert({
    where: { id: 'newsletter' },
    update: {
      order: 3,
      isActive: true,
    },
    create: {
      id: 'newsletter',
      title: 'Suscríbete a nuestro boletín',
      type: WidgetType.NEWSLETTER,
      order: 3,
      sectionId: footer.id,
      isActive: true,
    },
=======
    },
  });

  // Obtener los usuarios creados
  const master = await prisma.user.findUnique({ where: { email: 'master@app.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@app.com' } });
  const editor = await prisma.user.findUnique({ where: { email: 'editor@app.com' } });
  const collaborator = await prisma.user.findUnique({ where: { email: 'collaborator@app.com' } });

  // Insertar logs administrativos iniciales
  await prisma.adminAction.createMany({
    data: [
      {
        userId: admin?.id || "",
        action: "Inicio de sesión",
        module: "auth",
        details: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // hace 2 horas
      },
      {
        userId: master?.id || "",
        action: "Actualizó configuración",
        module: "config",
        details: "Cambió el nombre del sitio",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // hace 3 horas
      },
      {
        userId: admin?.id || "",
        action: "Exportó logs",
        module: "stats",
        details: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // hace 5 horas
      },
      {
        userId: editor?.id || "",
        action: "Editó página",
        module: "pages",
        details: "Página: /acerca",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // hace 6 horas
      },
      {
        userId: admin?.id || "",
        action: "Reinició estadísticas",
        module: "stats",
        details: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // hace 8 horas
      },
      {
        userId: collaborator?.id || "",
        action: "Creó publicación",
        module: "blog",
        details: "Título: Primer post",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // hace 12 horas
      },
      {
        userId: admin?.id || "",
        action: "Eliminó usuario",
        module: "users",
        details: "Usuario: test@app.com",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15), // hace 15 horas
      },
      {
        userId: master?.id || "",
        action: "Agregó usuario",
        module: "users",
        details: "Usuario: nuevo@app.com",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // hace 18 horas
      },
      {
        userId: editor?.id || "",
        action: "Editó proyecto",
        module: "portfolio",
        details: "Proyecto: Proyecto1",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20), // hace 20 horas
      },
      {
        userId: admin?.id || "",
        action: "Cerró sesión",
        module: "auth",
        details: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // hace 24 horas
      },
    ],
>>>>>>> feature/modulo4
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
