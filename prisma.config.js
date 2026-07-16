module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || "file:d:/인터그리비티/saju/prisma/dev.db",
  },
};
