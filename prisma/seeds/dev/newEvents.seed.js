// import { PrismaClient } from '@prisma/client';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const { parseDate } = require('./seeds');
// import { parseDate } from './seed.js';


/**
 *
 * @type {import('@prisma/client').Organization[]}
 */
const newOrganizations = [
  {
    id: 2,
    name: 'Chotto Matte',
    email: 'doha@chotto-matte.com',
    phone: '5996 52 349',
    webPage: 'https://chotto-matte.com/',
    password: '123456',
    instagramPage: 'https://www.instagram.com/chottomatteglobal/'
  },

  // WARNING lacks coordinates

  // {
  //   id: 3,
  //   name: 'Anima Gallery',
  //   email: 'art@animagallery.com',
  //   phone: '974 4002 7437',
  //   webPage: 'https://www.instagram.com/animagallery/',
  //   password: '123456',
  // },

  {
    id: 4,
    name: 'Megapolis',
    email: 'info@palma-intl.com',
    phone: '44378444',
    webPage: 'https://megapolisqatar.com/index.html',
    password: '123456',
    instagramPage: 'https://www.instagram.com/megapolisqatar/'
  },
  // {
  //   id: 5,
  //   name: 'The Bistro',
  //   email: 'bistro@gmail.com',  // invented
  //   password: '123456',
  //   instagramPage: 'https://www.instagram.com/b12beachclubdoha/?hl=en'
  // },
];


/**
 *
 * @type {import('@prisma/client').Location[]}
 */
const locations = [
  {
    name: 'The St. Regis Marsa Arabia Island',
    latitude: 25.368925,
    longitude: 51.543934,
    organizationId: 2,
  },
  // {
  //   name: 'The St. Regis Marsa Arabia Island',
  //   latitude: 25.368925,
  //   longitude: 51.543934,
  //   organizationId: 2,
  // },
  {
    name: 'Andalucia Way, Building B12، The Pearl, Doha',
    latitude: 25.366978,
    longitude: 51.551305,
    organizationId: 4,
  },
  // {
  //   name: 'B12 Beach Club Doha - Westbay',
  //   latitude: 25.332246,
  //   longitude: 51.534544,
  //   organizationId: 5,
  // },
];


const seedNewEvents = async (parseDate) => {

  /**
   *
   * @type {import('@prisma/client').Event[]}
   */
  const events = [
    {
      name: 'Chotto Matte',
      // locationId: 2,
      organizationId: 2,
      date: parseDate('12/01/2024 19:00:00'),
      mediaType: 'IMAGE',
      category: 'PARTY',
      mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/dev%2FChotto%20Matte(1).png?alt=media&token=7b4fd3c0-d22e-4584-b300-c8a04f0e6350',
      description:
        `⭐ Viaja a través de tus historias favoritas con Mundo Pixar, la exposición inmersiva más grande de Pixar hasta la fecha, que llega por primera vez a nuestro país. Los escenarios más famosos de Toy Story, Coco, Up, Buscando a Nemo o Del revés, cobran vida a tamaño real en esta experiencia mágica en el Recinto Ferial de IFEMA Madrid.

  🎁 ¡Regala entradas para la experiencia Mundo Pixar a los tuyos con nuestra Tarjeta Regalo! Descúbrela aquí 🎁

  Entradas para Mundo Pixar en Madrid
  🎫 Entrada general con acceso a la experiencia:

  - Entrada General
  - Entrada Reducida - Diversidad Funcional, Estudiantes, Senior (mayores de 65 años), Niños (de 3 a 17 años)
  - Pack 4 entradas (2 adultos + 2 Niños)
  - Grupo (mínimo 10 personas)
  - Entrada Precio Único - Martes y miércoles por la mañana con precio reducido
  - Entrada Gratuita (menores de 3 años) - Añádela al comprar, seleccionando previamente otro tipo de entrada (excepto Niños de 3 a 17 años)

  🎫 Entrada VIP - Flexi-Ticket + Fast Track* con acceso a la exposición a cualquier hora del día y sin colas
  *La encontrarás en el selector, eligiendo la primera sesión disponible del día

  Qué vas a disfrutar
  🌟 La exposición inmersiva más grande de Pixar hasta la fecha
  🏠 Los escenarios de tus películas favoritas a gran escala: la habitación de Toy Story, la Casa de Up… ¡y más!
  🎈 En un gran espacio de más de 3.000 m2 lleno de escenografía, imágenes y muchas sorpresas

  Información
  📅 Fecha y hora: elige la fecha y hora que quieras directamente en el selector de entradas
  ⏳ Duración: 55-65 minutos aprox.
  📍 Lugar: Espacio 5.1, Recinto Ferial de IFEMA Madrid
  👤 Edad: todas las edades
  ♿ Accesibilidad: recinto accesible para personas con movilidad reducida
  ❓ Puedes consultar las preguntas frecuentes y sus respuestas aquí
  👉 No está permitido acceder al interior la exposición con carritos de bebé, maletas u otros objetos voluminosos. Se ha habilitado una zona específica en el hall del recinto para poder guardarlos. Su coste es de 5€ por objeto voluminoso`
    },
    {
      name: 'Megapolis - Billards',
      // locationId: 4,
      organizationId: 4,
      date: parseDate('12/01/2024 19:00:00'),
      mediaType: 'IMAGE',
      category: 'PARTY',
      mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/dev%2FMegapolis.png?alt=media&token=d8269caa-3a64-4de1-9dd9-e48c932c630a',
      description:
        `⭐ Viaja a través de tus historias favoritas con Mundo Pixar, la exposición inmersiva más grande de Pixar hasta la fecha, que llega por primera vez a nuestro país. Los escenarios más famosos de Toy Story, Coco, Up, Buscando a Nemo o Del revés, cobran vida a tamaño real en esta experiencia mágica en el Recinto Ferial de IFEMA Madrid.

  🎁 ¡Regala entradas para la experiencia Mundo Pixar a los tuyos con nuestra Tarjeta Regalo! Descúbrela aquí 🎁

  Entradas para Mundo Pixar en Madrid
  🎫 Entrada general con acceso a la experiencia:

  - Entrada General
  - Entrada Reducida - Diversidad Funcional, Estudiantes, Senior (mayores de 65 años), Niños (de 3 a 17 años)
  - Pack 4 entradas (2 adultos + 2 Niños)
  - Grupo (mínimo 10 personas)
  - Entrada Precio Único - Martes y miércoles por la mañana con precio reducido
  - Entrada Gratuita (menores de 3 años) - Añádela al comprar, seleccionando previamente otro tipo de entrada (excepto Niños de 3 a 17 años)

  🎫 Entrada VIP - Flexi-Ticket + Fast Track* con acceso a la exposición a cualquier hora del día y sin colas
  *La encontrarás en el selector, eligiendo la primera sesión disponible del día

  Qué vas a disfrutar
  🌟 La exposición inmersiva más grande de Pixar hasta la fecha
  🏠 Los escenarios de tus películas favoritas a gran escala: la habitación de Toy Story, la Casa de Up… ¡y más!
  🎈 En un gran espacio de más de 3.000 m2 lleno de escenografía, imágenes y muchas sorpresas

  Información
  📅 Fecha y hora: elige la fecha y hora que quieras directamente en el selector de entradas
  ⏳ Duración: 55-65 minutos aprox.
  📍 Lugar: Espacio 5.1, Recinto Ferial de IFEMA Madrid
  👤 Edad: todas las edades
  ♿ Accesibilidad: recinto accesible para personas con movilidad reducida
  ❓ Puedes consultar las preguntas frecuentes y sus respuestas aquí
  👉 No está permitido acceder al interior la exposición con carritos de bebé, maletas u otros objetos voluminosos. Se ha habilitado una zona específica en el hall del recinto para poder guardarlos. Su coste es de 5€ por objeto voluminoso`
    },
    //   {
    //     name: 'B12 Beach Club Doha',
    //     locationId: 5,
    //     organizationId: 5,
    //     date: parseDate('12/01/2024 19:00:00'),
    //     mediaType: 'VIDEO',
    //     category: 'PARTY',
    //     mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/dev%2FB12.mov?alt=media&token=95f4dc56-9fd1-414c-8e10-0601ec634a78',
    //     description:
    //       `⭐ Viaja a través de tus historias favoritas con Mundo Pixar, la exposición inmersiva más grande de Pixar hasta la fecha, que llega por primera vez a nuestro país. Los escenarios más famosos de Toy Story, Coco, Up, Buscando a Nemo o Del revés, cobran vida a tamaño real en esta experiencia mágica en el Recinto Ferial de IFEMA Madrid.

    // 🎁 ¡Regala entradas para la experiencia Mundo Pixar a los tuyos con nuestra Tarjeta Regalo! Descúbrela aquí 🎁

    // Entradas para Mundo Pixar en Madrid
    // 🎫 Entrada general con acceso a la experiencia:

    // - Entrada General
    // - Entrada Reducida - Diversidad Funcional, Estudiantes, Senior (mayores de 65 años), Niños (de 3 a 17 años)
    // - Pack 4 entradas (2 adultos + 2 Niños)
    // - Grupo (mínimo 10 personas)
    // - Entrada Precio Único - Martes y miércoles por la mañana con precio reducido
    // - Entrada Gratuita (menores de 3 años) - Añádela al comprar, seleccionando previamente otro tipo de entrada (excepto Niños de 3 a 17 años)

    // 🎫 Entrada VIP - Flexi-Ticket + Fast Track* con acceso a la exposición a cualquier hora del día y sin colas
    // *La encontrarás en el selector, eligiendo la primera sesión disponible del día

    // Qué vas a disfrutar
    // 🌟 La exposición inmersiva más grande de Pixar hasta la fecha
    // 🏠 Los escenarios de tus películas favoritas a gran escala: la habitación de Toy Story, la Casa de Up… ¡y más!
    // 🎈 En un gran espacio de más de 3.000 m2 lleno de escenografía, imágenes y muchas sorpresas

    // Información
    // 📅 Fecha y hora: elige la fecha y hora que quieras directamente en el selector de entradas
    // ⏳ Duración: 55-65 minutos aprox.
    // 📍 Lugar: Espacio 5.1, Recinto Ferial de IFEMA Madrid
    // 👤 Edad: todas las edades
    // ♿ Accesibilidad: recinto accesible para personas con movilidad reducida
    // ❓ Puedes consultar las preguntas frecuentes y sus respuestas aquí
    // 👉 No está permitido acceder al interior la exposición con carritos de bebé, maletas u otros objetos voluminosos. Se ha habilitado una zona específica en el hall del recinto para poder guardarlos. Su coste es de 5€ por objeto voluminoso`
    //   }
  ];

  for await (const organization of newOrganizations) {
    const exists = await prisma.organization.findUnique({ where: { id: organization.id } });

    if (!exists) {
      const newOrganization = await prisma.organization.create({
        data: {
          ...organization,
        }
      });

      const newLocation = await prisma.location.create({
        data: {
          ...locations.find(location => location.organizationId === newOrganization.id)
        }
      });

      await prisma.event.create({
        data: {
          ...events.find(event => event.organizationId === newOrganization.id),
          locationId: newLocation.id
        }
      });
    }
  }
};

// export { seedNewEvents };
exports.seedNewEvents = seedNewEvents;
