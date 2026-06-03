import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import EditPropertyForm from './EditPropertyForm';

const prisma = new PrismaClient();

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' } } }
  });

  if (!property) {
    notFound();
  }

  return <EditPropertyForm property={property} />;
}
