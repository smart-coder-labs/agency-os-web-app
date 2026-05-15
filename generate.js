const fs = require('fs');
const { faker } = require('@faker-js/faker');

const OUTPUT_FILE = 'data.json';
const TOTAL_RECORDS = 1000000;

const writeStream = fs.createWriteStream(OUTPUT_FILE);

async function generateData() {
    console.log(`🚀 Iniciando generación de ${TOTAL_RECORDS} registros...`);

    // Escribimos el inicio del array JSON
    writeStream.write('[\n');

    for (let i = 0; i < TOTAL_RECORDS; i++) {
        const record = {
            _id: faker.database.mongodbObjectId(),
            index: i,
            guid: faker.string.uuid(),
            isActive: faker.datatype.boolean(),
            balance: `$${faker.finance.amount(1000, 4000, 2, '', true)}`,
            picture: 'http://placehold.it/32x32',
            age: faker.number.int({ min: 20, max: 40 }),
            eyeColor: faker.helpers.arrayElement(['blue', 'brown', 'green']),
            name: `${faker.person.firstName()} ${faker.person.lastName()}`,
            gender: faker.person.sex(),
            company: faker.company.name().toUpperCase(),
            email: faker.internet.email(),
            phone: `+1 ${faker.phone.number()}`,
            address: `${faker.location.buildingNumber()} ${faker.location.street()}, ${faker.location.city()}, ${faker.location.state()}, ${faker.location.zipCode()}`,
            about: faker.lorem.paragraph(),
            registered: faker.date.between({ from: '2014-01-01', to: new Date() }).toISOString(),
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
            tags: Array.from({ length: 7 }, () => faker.lorem.word()),
            friends: Array.from({ length: 3 }, (_, idx) => ({
                id: idx,
                name: `${faker.person.firstName()} ${faker.person.lastName()}`
            })),
            greeting: `Hello, ${faker.person.firstName()}! You have ${faker.number.int({ min: 1, max: 10 })} unread messages.`,
            favoriteFruit: faker.helpers.arrayElement(['apple', 'banana', 'strawberry'])
        };

        // Convertir objeto a string
        let jsonString = JSON.stringify(record, null, 2);

        // Añadir coma si no es el último registro
        const isLast = i === TOTAL_RECORDS - 1;
        jsonString = jsonString + (isLast ? '' : ',\n');

        // Manejo de contrapresión (Backpressure) del stream
        if (!writeStream.write(jsonString)) {
            await new Promise(resolve => writeStream.once('drain', resolve));
        }

        // Feedback visual cada 50k registros
        if (i % 50000 === 0 && i !== 0) {
            console.log(`✅ ${i} registros procesados...`);
        }
    }

    // Cerramos el array y el stream
    writeStream.write('\n]');
    writeStream.end();

    writeStream.on('finish', () => {
        console.log(`\n✨ ¡Listo! Se ha generado "${OUTPUT_FILE}" con éxito.`);
    });
}

generateData().catch(console.error);