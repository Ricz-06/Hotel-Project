const prisma = require('./client');

async function main() {

    console.log('🌱 Iniciando seed...');

    await prisma.factura.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.habitacion.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.usuario.deleteMany();

    // Admin
    await prisma.usuario.create({
        data: {
            nombre:   'Administrador',
            correo:   'admin@hotel.com',
            password: '1234',
            role:     'ADMIN'
        }
    });

    // Habitaciones iniciales
    const habitaciones = [
        { numero: 101, tipo: 'Normal', servicios: ['WiFi', 'Baño privado', 'Aire acondicionado'] },
        { numero: 102, tipo: 'Normal', servicios: ['WiFi', 'Baño privado', 'Aire acondicionado'] },
        { numero: 201, tipo: 'Deluxe', servicios: ['WiFi premium', 'Desayuno incluido', 'Acceso a piscina'] },
        { numero: 202, tipo: 'Deluxe', servicios: ['WiFi premium', 'Desayuno incluido', 'Acceso a piscina'] },
        { numero: 301, tipo: 'VIP',    servicios: ['WiFi premium', 'Desayuno buffet', 'Spa privado'] },
        { numero: 302, tipo: 'VIP',    servicios: ['WiFi premium', 'Desayuno buffet', 'Spa privado'] },
    ];

    for (const h of habitaciones) {
        await prisma.habitacion.create({ data: h });
    }

    console.log('✅ Seed completado:');
    console.log('   👤 admin@hotel.com / 1234');
    console.log('   🛏  6 habitaciones creadas');
}

main()
    .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
