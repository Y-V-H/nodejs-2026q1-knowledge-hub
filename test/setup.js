const { PrismaClient } = require('../generated/prisma');
require('dotenv').config();
const bcrypt = require('bcrypt');

beforeAll(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.comment.deleteMany({});
    await prisma.article.deleteMany({
      where: {
        OR: [
          {
            title: {
              in: [
                'TEST_ARTICLE',
                'TEST_ARTICLE_FOR_COMMENTS',
                'PUBLISHED_ARTICLE',
                'NO_CATEGORY',
                'NO_TAG',
                'ANOTHER_ARTICLE',
              ],
            },
          },
          { title: { startsWith: 'TEST' } },
        ],
      },
    });
    await prisma.category.deleteMany({ where: { name: 'TEST_CATEGORY' } });
    await prisma.user.deleteMany({
      where: { login: { in: ['TEST_AUTH_LOGIN', 'TEST_LOGIN'] } },
    });

    const hashedPassword = await bcrypt.hash(
      'Tu6!@#%&',
      parseInt(process.env.HASH_SALT || '10'),
    );
    await prisma.user.create({
      data: {
        login: 'TEST_AUTH_LOGIN',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
  } finally {
    await prisma.$disconnect();
  }
});
