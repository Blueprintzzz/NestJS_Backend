import { PrismaClient, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

const MODELS: { name: string; type: VehicleType }[] = [
    // CAR
    { name: 'Alto', type: VehicleType.CAR },
    { name: 'Swift', type: VehicleType.CAR },
    { name: 'Prius', type: VehicleType.CAR },
    { name: 'Honda Fit', type: VehicleType.CAR },
    { name: 'Axio', type: VehicleType.CAR },
    { name: 'Nissan Leaf', type: VehicleType.CAR },
    // SUV
    { name: 'Fortuner', type: VehicleType.SUV },
    { name: 'Montero', type: VehicleType.SUV },
    { name: 'Land Cruiser', type: VehicleType.SUV },
    { name: 'X-Trail', type: VehicleType.SUV },
    // VAN
    { name: 'KDH', type: VehicleType.VAN },
    { name: 'Caravan', type: VehicleType.VAN },
    { name: 'HiAce', type: VehicleType.VAN },
    { name: 'Mercedes Vito', type: VehicleType.VAN },
    // MINIBUS
    { name: 'Rosa', type: VehicleType.MINIBUS },
    { name: 'Isuzu Minibus', type: VehicleType.MINIBUS },
    // LUXURY
    { name: 'Mercedes E-Class', type: VehicleType.LUXURY },
    { name: 'BMW 5 Series', type: VehicleType.LUXURY },
    { name: 'Alphard', type: VehicleType.LUXURY },
    { name: 'Mercedes S-Class', type: VehicleType.LUXURY },
];

async function main() {
    console.log('Seeding vehicle models...');
    let created = 0;
    let skipped = 0;

    for (const model of MODELS) {
        const existing = await prisma.vehicleModel.findUnique({ where: { name: model.name } });
        if (existing) {
            skipped++;
            continue;
        }
        await prisma.vehicleModel.create({ data: model });
        created++;
    }

    console.log(`Done. Created: ${created}, Skipped (already existed): ${skipped}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
