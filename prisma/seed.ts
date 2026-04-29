import { PrismaClient, Role, Status } from '../generated/prisma';
const prisma = new PrismaClient();

interface Article {
  title: string;
  content: string;
  status: Status;
  authorId: string;
  categoryId: string;
  tags: string[];
}

async function main() {
  // Categories
  const categories = [
    {
      name: 'programming',
      description:
        'The programming category covers the creation, testing, and maintenance of software using various languages and paradigms',
    },
    {
      name: 'ai',
      description:
        'Artificial Intelligence (AI) is a category of technologies that enable computers and machines...',
    },
    {
      name: 'photo',
      description:
        'Photography is the art, science, and practice of creating durable images by recording light...',
    },
  ];
  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {
        description: category.description,
      },
      create: category,
    });
    createdCategories.push(created);
  }

  // Tags
  const tags = [
    { name: 'javascript' },
    { name: 'nodejs' },
    { name: 'typescript' },
    { name: 'css' },
    { name: 'tailwindcss' },
  ];
  const createdTags = [];
  for (const tag of tags) {
    const created = await prisma.tag.upsert({
      where: {
        name: tag.name,
      },
      update: {},
      create: tag,
    });
    createdTags.push(created);
  }

  // Users
  const users = [
    { login: 'admin@prisma.io', password: 'admin', role: Role.ADMIN },
    { login: 'editor@prisma.io', password: 'editor', role: Role.EDITOR },
  ];
  const createdUsers = [];
  for (const user of users) {
    const created = await prisma.user.upsert({
      where: {
        login: user.login,
      },
      update: {
        password: user.password,
        role: user.role,
      },
      create: user,
    });
    createdUsers.push(created);
  }

  // Article
  const articles: Article[] = [
    {
      title: 'First Post',
      content: 'Hello world article',
      status: Status.PUBLISHED,
      authorId: createdUsers[0].id,
      categoryId: createdCategories[0].id,
      tags: [createdTags[0].name, createdTags[4].name],
    },
    {
      title: 'Prisma Guide',
      content: 'Intro to Prisma ORM',
      status: Status.DRAFT,
      authorId: createdUsers[1].id,
      categoryId: createdCategories[1].id,
      tags: [createdTags[1].name, createdTags[3].name],
    },
    {
      title: 'Draft Idea',
      content: 'Work in progress',
      status: Status.ARCHIVED,
      authorId: createdUsers[0].id,
      categoryId: createdCategories[0].id,
      tags: [createdTags[0].name, createdTags[2].name, createdTags[4].name],
    },
    {
      title: 'Tech News',
      content: 'Latest updates in tech',
      status: Status.PUBLISHED,
      authorId: createdUsers[1].id,
      categoryId: createdCategories[1].id,
      tags: [createdTags[1].name, createdTags[4].name, createdTags[2].name],
    },
    {
      title: 'Tips & Tricks',
      content: 'Useful dev tips',
      status: Status.ARCHIVED,
      authorId: createdUsers[0].id,
      categoryId: createdCategories[0].id,
      tags: [createdTags[0].name, createdTags[2].name, createdTags[4].name],
    },
  ];

  const createdArticles = [];
  for (const article of articles) {
    const created = await prisma.article.upsert({
      where: {
        title: article.title,
      },
      update: {
        content: article.content,
        status: article.status,
      },
      create: {
        ...article,
        tags: {
          connectOrCreate: article.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
    createdArticles.push(created);
  }

  // Comments
  const comments = [
    {
      content: 'Great article!',
      authorId: createdUsers[0].id,
      articleId: createdArticles[0].id,
    },
    {
      content: 'Very helpful, thanks!',
      authorId: createdUsers[0].id,
      articleId: createdArticles[2].id,
    },
    {
      content: 'Interesting read',
      authorId: createdUsers[1].id,
      articleId: createdArticles[3].id,
    },
  ];

  for (const comment of comments) {
    const existing = await prisma.comment.findFirst({
      where: {
        content: comment.content,
        articleId: comment.articleId,
      },
    });

    if (!existing) {
      await prisma.comment.create({ data: comment });
    }
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
