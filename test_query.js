const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const w = await prisma.workflow.findUnique({where: {id: 'cmo3ee1nm0001x384qfkn7uaf'}, include: {nodes: true}});
  console.log(JSON.stringify(w, null, 2));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
