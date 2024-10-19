const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


/**
 *
 * @param {String} date
 */
const parseDate = (date) => {
  const dateString = date;
  const parts = dateString.split(' '); // Split date and time
  const dateParts = parts[0].split('/'); // Split date into day, month, year
  const timeParts = parts[1].split(':'); // Split time into hours, minutes, seconds

  const year = parseInt(dateParts[2]);
  const month = parseInt(dateParts[1]) - 1; // Months are zero-based (January is 0)
  const day = parseInt(dateParts[0]);
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = parseInt(timeParts[2]);

  return new Date(year, month, day, hours, minutes, seconds);
};

/**
 *
 * @type {import('@prisma/client').Location[]}
 */
const stadiums = [
  { name: 'Lusail Stadium', latitude: 25.123456, longitude: 51.654321, description: 'Lusail Stadium is a modern sporting venue located in Lusail, Qatar. It is a state-of-the-art stadium with impressive architecture and is often used for major sporting events.' },
  { name: 'Abdullah Bin Khalifa Stadium', latitude: 25.987654, longitude: 51.987123, description: 'This stadium is known for its vibrant atmosphere during football matches. Located in the heart of Doha, it has hosted numerous exciting games.' },
  { name: 'Al Thumama Stadium', latitude: 25.543210, longitude: 51.109876, description: 'Al Thumama Stadium is a multifunctional sports facility with a focus on promoting physical fitness and community engagement.' },
  { name: 'Al Bayt Stadium', latitude: 25.789012, longitude: 51.876543, description: 'Al Bayt Stadium is an architectural marvel with a distinctive shape resembling a traditional tent. It hosts various sporting events and is a symbol of Qatari heritage.' },
  { name: 'Jassim Bin Stadium', latitude: 25.234567, longitude: 51.432109, description: 'This stadium is dedicated to honoring the legacy of Sheikh Jassim bin Mohammed Al Thani, a prominent figure in Qatari history. It often hosts cultural and sporting events.' },
  { name: 'Khalifa International Stadium', latitude: 25.654321, longitude: 51.765432, description: 'As one of Qatar\'s major stadiums, Khalifa International Stadium has a rich history of hosting prestigious international events, including the IAAF World Championships.' },
  { name: 'Ahmad Bin Ali Stadium', latitude: 25.321098, longitude: 51.890123, description: 'Located in Al Rayyan, this stadium is known for its picturesque surroundings and is a popular venue for football matches and local events.' },
  { name: 'Al Janoub Stadium', latitude: 25.876543, longitude: 51.345678, description: 'Al Janoub Stadium, also known as Al Wakrah Stadium, is celebrated for its architectural design and has hosted several matches during international football tournaments.' },
  { name: 'Education City Stadium', latitude: 25.109876, longitude: 51.234567, description: 'This stadium is a hub for academic and sports excellence. It often serves as a venue for events that promote education and physical fitness in the community.' }
];


const footBallEventsSeed = async () => {
  const organizationId = 1;
  const exists = await prisma.organization.findUnique({ where: { id: organizationId } });

  if (!exists) {
    await prisma.organization.create({
      data: {
        id: organizationId,
        name: 'Asian Cup',
        description: 'The best football in the entire world.',
        email: 'email@email.com',
        mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2FlogoIcon.jpg?alt=media&token=ccbfa155-770b-4382-808d-0ddd6778b061&_gl=1*zkhyre*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5ODAwODA2NC4xNy4xLjE2OTgwMDgwOTguMjYuMC4w',
        password: '123456',
        phone: '0969711306',
        accessToken: 'my-token',
        locations: {
          createMany: {
            data: stadiums.map(stadium => ({
              ...stadium
            }))
          }
        }
      }
    });
    const existEvents = await prisma.event.count();
    if (existEvents) return;

    // await prisma.event.createMany({
    //   data: [
    //     {
    //       name: 'GROUP STAGE - GROUP A: Qatar vs Lebanon', // 1
    //       description: 'A thrilling encounter in Group A, featuring host nation Qatar against Lebanon, promising an exciting clash of talent.',
    //       locationId: 1,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('12/01/2024 19:00:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F1.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL'],
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP A: China PR vs Tajikistan',  //2
    //       description: 'Group A match between China PR and Tajikistan, where both teams aim to prove their prowess on the field.',
    //       locationId: 2,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('13/01/2024 17:30:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F2.png?alt=media&token=8d5c7b70-c3e4-483a-8849-a1e5f1cc3dca&_gl=1*ao255z*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NjA4OC41OC4wLjA.',
    //       categories: 'FOOTBALL'
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP A: Lebanon vs China PR', //3
    //       description: 'An important Group A showdown between Lebanon and China PR, with both teams seeking a crucial victory.',
    //       locationId: 3,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('17/01/2024 14:30:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F3.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL']
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP A: Tajikistan vs Qatar', // 4
    //       description: 'Group A match where Tajikistan takes on Qatar, promising fierce competition and strategic gameplay.',
    //       locationId: 4,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('17/01/2024 17:30:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F4.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL']
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP A: Tajikistan vs Lebanon',  //5
    //       description: 'A Group A face-off between Tajikistan and Lebanon, where each team fights for a place in the tournament\'s next stage.',
    //       locationId: 5,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('22/01/2024 18:00:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F5.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL']
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP A: Qatar vs China PR', // 6
    //       description: 'Group A match featuring Qatar against China PR, offering an exciting clash of football skills.',
    //       locationId: 6,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('22/01/2024 18:00:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F6.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL']
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP B: Australia vs India', // 7
    //       description: 'Group B contest between Australia and India, with both teams vying for supremacy on the field.',
    //       locationId: 7,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('13/01/2024 14:30:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F7.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL']
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP B: Uzbekistan vs Syria',  // 8
    //       description: 'Group B match featuring Uzbekistan and Syria, offering a compelling encounter.',
    //       locationId: 5,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('13/01/2024 20:30:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F8.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL']
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP B: Syria vs Australia',  //9
    //       description: 'A Group B showdown where Syria faces Australia, promising a challenging match for both sides.',
    //       locationId: 5,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('18/01/2024 14:30:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F9.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL']
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP B: India vs Uzbekistan',  // 10
    //       description: 'Group B encounter between India and Uzbekistan, highlighting the pursuit of victory and advancement.',
    //       locationId: 8,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('18/01/2024 17:30:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F10.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL']
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP B: Syria vs India',  // 11
    //       description: 'A Group B clash between Syria and India, where both teams compete for crucial points.',
    //       locationId: 4,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('23/01/2024 14:30:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F11.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL']
    //     },
    //     {
    //       name: 'GROUP STAGE - GROUP B: Australia vs Uzbekistan',  // 12
    //       description: 'Group B match featuring Australia against Uzbekistan, showcasing top-class football action.',
    //       locationId: 9,
    //       organizationId: organizationId,
    //       // mediaType: 'IMAGE',
    //       date: parseDate('23/01/2024 16:30:00'),
    //       mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F12.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
    //       categories: ['FOOTBALL']
    //     },
    //   ],
    // });

    await prisma.event.create({
      data: {
        name: 'GROUP STAGE - GROUP A: Qatar vs Lebanon', // 1
        description: 'A thrilling encounter in Group A, featuring host nation Qatar against Lebanon, promising an exciting clash of talent.',
        locationId: 1,
        organizationId: organizationId,
        // mediaType: 'IMAGE',
        date: parseDate('12/01/2024 19:00:00'),
        // mediaUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F1.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
        categories: ['FOOTBALL'],
        photos: {
          create: [{
            url: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2F1.png?alt=media&token=67c1dbed-3cd2-4ff9-bd07-ea0c582638f7&_gl=1*1du6hxp*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5NzY3NTI2MC43LjEuMTY5NzY3NTY4Mi42MC4wLjA.',
            uuid
          }]
        }
      },
    });
  }
};

// export { footBallEventsSeed };
exports.footBallEventsSeed = footBallEventsSeed;
