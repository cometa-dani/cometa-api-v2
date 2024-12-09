const { PrismaClient } = require('@prisma/client');
const { parseDate } = require('./parseDate');
const prisma = new PrismaClient();

const getRamdomStadium = () => Math.floor(Math.random() * stadiums.length);

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

const events = [
  {
    name: 'GROUP STAGE - GROUP A: Qatar vs Lebanon', // 1
    description: 'A thrilling encounter in Group A, featuring host nation Qatar against Lebanon, promising an exciting clash of talent.',
    date: parseDate('12/01/2024 19:00:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS'],
  },
  {
    name: 'GROUP STAGE - GROUP A: China PR vs Tajikistan',  //2
    description: 'Group A match between China PR and Tajikistan, where both teams aim to prove their prowess on the field.',
    date: parseDate('13/01/2024 17:30:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
  {
    name: 'GROUP STAGE - GROUP A: Lebanon vs China PR', //3
    description: 'An important Group A showdown between Lebanon and China PR, with both teams seeking a crucial victory.',
    date: parseDate('17/01/2024 14:30:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
  {
    name: 'GROUP STAGE - GROUP A: Tajikistan vs Qatar', // 4
    description: 'Group A match where Tajikistan takes on Qatar, promising fierce competition and strategic gameplay.',
    date: parseDate('17/01/2024 17:30:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
  {
    name: 'GROUP STAGE - GROUP A: Tajikistan vs Lebanon',  //5
    description: 'A Group A face-off between Tajikistan and Lebanon, where each team fights for a place in the tournament\'s next stage.',
    date: parseDate('22/01/2024 18:00:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
  {
    name: 'GROUP STAGE - GROUP A: Qatar vs China PR', // 6
    description: 'Group A match featuring Qatar against China PR, offering an exciting clash of football skills.',
    date: parseDate('22/01/2024 18:00:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
  {
    name: 'GROUP STAGE - GROUP B: Australia vs India', // 7
    description: 'Group B contest between Australia and India, with both teams vying for supremacy on the field.',
    date: parseDate('13/01/2024 14:30:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
  {
    name: 'GROUP STAGE - GROUP B: Uzbekistan vs Syria',  // 8
    description: 'Group B match featuring Uzbekistan and Syria, offering a compelling encounter.',
    date: parseDate('13/01/2024 20:30:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
  {
    name: 'GROUP STAGE - GROUP B: Syria vs Australia',  //9
    description: 'A Group B showdown where Syria faces Australia, promising a challenging match for both sides.',
    date: parseDate('18/01/2024 14:30:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
  {
    name: 'GROUP STAGE - GROUP B: India vs Uzbekistan',  // 10
    description: 'Group B encounter between India and Uzbekistan, highlighting the pursuit of victory and advancement.',
    date: parseDate('18/01/2024 17:30:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
  {
    name: 'GROUP STAGE - GROUP B: Syria vs India',  // 11
    description: 'A Group B clash between Syria and India, where both teams compete for crucial points.',
    date: parseDate('23/01/2024 14:30:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
  {
    name: 'GROUP STAGE - GROUP B: Australia vs Uzbekistan',  // 12
    description: 'Group B match featuring Australia against Uzbekistan, showcasing top-class football action.',
    date: parseDate('23/01/2024 16:30:00'),
    mediaUrl: 'https://ynlqvrticeutltbgimpj.supabase.co/storage/v1/object/public/seeds/8.png',
    categories: ['SPORTS']
  },
];


const footBallEventsSeed = async () => {
  const exists = await prisma.organization.findUnique({ where: { email: 'email@email.com' } });
  if (!exists) {
    const newOrganization = await prisma.organization.create({
      data: {
        name: 'Asian Cup',
        description: 'The best football in the entire world.',
        email: 'email@email.com',
        uid: 'asian-cup',
        avatarUrl: '',
        phone: '0969711306',
        locations: {
          createMany: {
            data: stadiums.map(stadium => ({
              name: stadium.name,
              description: stadium.description,
              latitude: stadium.latitude,
              longitude: stadium.longitude,
            }))
          }
        }
      },
      include: { locations: true }
    });
    const existEvents = await prisma.event.count();
    if (existEvents) return;
    const promsifiedEvents = events.map(event => {
      return prisma.event.create({
        data: {
          name: event.name,
          description: event.description,
          locationId: newOrganization.locations[getRamdomStadium()].id,
          organizationId: newOrganization.id,
          date: event.date,
          categories: event.categories,
          photos: {
            create: [{
              url: event.mediaUrl,
              order: 0,
            }]
          }
        },
      });
    });

    await Promise.all(promsifiedEvents);
  }
};

exports.footBallEventsSeed = footBallEventsSeed;
