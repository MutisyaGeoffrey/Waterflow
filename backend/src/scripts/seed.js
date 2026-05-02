const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create business (using snake_case field names from schema)
  const business = await prisma.business.create({
    data: {
      name: 'Test Water Station',
      phone: '+254700000000',
      mpesa_business_number: '123456'
    }
  });

  console.log('✅ Business created');

  // 2. Create owner (with hashed PIN)
  const hashedOwnerPin = await bcrypt.hash('0000', 10);
  const owner = await prisma.owner.create({
    data: {
      businessId: business.id,
      name: 'Test Owner',
      phone: '+254711111111',
      pinCode: hashedOwnerPin
    }
  });

  console.log('✅ Owner created (PIN hashed)');

  // 3. Create employee (with hashed PIN)
  const hashedEmployeePin = await bcrypt.hash('1234', 10);
  const employee = await prisma.employee.create({
    data: {
      businessId: business.id,
      name: 'Test Employee',
      pinCode: hashedEmployeePin,
      isActive: true
    }
  });

  console.log('✅ Employee created (PIN hashed)');

  // 4. Create containers
  const container5 = await prisma.containerSize.create({
    data: {
      businessId: business.id,
      sizeLiters: 5,
      pricePerLiter: 5
    }
  });

  const container10 = await prisma.containerSize.create({
    data: {
      businessId: business.id,
      sizeLiters: 10,
      pricePerLiter: 5
    }
  });

  const container20 = await prisma.containerSize.create({
    data: {
      businessId: business.id,
      sizeLiters: 20,
      pricePerLiter: 5
    }
  });

  console.log('✅ Containers created');

  // 5. Create sample transactions (⚠️ NO synced_at field)
  for (let i = 0; i < 10; i++) {
    await prisma.transaction.create({
      data: {
        businessId: business.id,
        employeeId: employee.id,
        containerSizeId: container5.id,
        quantity: 2,
        totalLiters: 10,
        totalPrice: 50,
        paymentMethod: i % 2 === 0 ? 'cash' : 'mpesa',
        serviceType: i % 2 === 0 ? 'pickup' : 'delivery',
        mpesaReference: i % 2 === 0 ? null : `MPESA${i}`
      }
    });
  }

  console.log('✅ Transactions created');

  console.log('\n🎉 SEED COMPLETE');
  console.log('Owner Phone: +254711111111');
  console.log('Owner PIN: 0000 (hashed)');
  console.log('Employee PIN: 1234 (hashed)');
  console.log('Business ID:', business.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });