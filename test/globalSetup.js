const { PrismaClient } = require('../generated/prisma');
require('dotenv').config();

module.exports = async function () {
  const prisma = new PrismaClient();
  try {
    await prisma.user.deleteMany({
      where: { login: 'TEST_AUTH_LOGIN' },
    });
    console.log('Test user cleaned up');
  } finally {
    await prisma.$disconnect();
  }
};
