import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in the database:');
  console.log(users);
  
  const config = await prisma.globalConfig.findUnique({
    where: { id: 'global' }
  });
  console.log('Global config:');
  console.log(config);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
