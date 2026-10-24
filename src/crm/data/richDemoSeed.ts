import { CARS } from '../../data/cars';
import type {
  Appointment,
  Booking,
  CrmPersistedState,
  FollowUp,
  Lead,
  LeadActivity,
  LeadPriority,
  LeadSource,
  LeadStatus,
  StockVehicle,
} from '../types/crm.types';

const now = new Date();

function atDaysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function atToday(hour: number, minute = 0): string {
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function atDaysFromNow(days: number, hour = 11, minute = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const INDIAN_FIRST = [
  'Amit',
  'Priya',
  'Rahul',
  'Sneha',
  'Vikram',
  'Neha',
  'Imran',
  'Pooja',
  'Karan',
  'Anita',
  'Rohit',
  'Deepak',
  'Kavita',
  'Sanjay',
  'Meera',
  'Arjun',
  'Divya',
  'Nikhil',
  'Shreya',
  'Manoj',
];

const INDIAN_LAST = [
  'Kumar',
  'Singh',
  'Sharma',
  'Patil',
  'Deshmukh',
  'Kulkarni',
  'Joshi',
  'Mehta',
  'Reddy',
  'Nair',
  'Gupta',
  'Verma',
  'Iyer',
  'Malhotra',
  'Chavan',
];

function pickName(i: number): string {
  return `${INDIAN_FIRST[i % INDIAN_FIRST.length]} ${INDIAN_LAST[(i * 3) % INDIAN_LAST.length]}`;
}

function mobileFor(i: number): string {
  return `98${String(20000000 + i * 137).slice(0, 8)}`;
}

/** Showcase dataset aligned with DriveNext-style dashboard mockup. */
export function createRichDemoSeed(): CrmPersistedState {
  const adminId = 'user-admin';
  const amitId = 'user-amit';
  const priyaId = 'user-priya';
  const rohanId = 'user-rohan';

  const settings = {
    dealershipName: 'DriveNext',
    dealershipPhone: '088888 85076',
    dealershipAddress: 'Kondhwa, Pune, Maharashtra',
    leadSources: [
      'OLX',
      'Cars24',
      'CarWale',
      'Website',
      'Phone Call',
      'Walk-in',
      'WhatsApp',
      'Facebook',
      'Instagram',
      'Referral',
      'Other',
    ] as LeadSource[],
    leadStatuses: [
      'New',
      'Contacted',
      'Qualified',
      'Visit/Test Drive Scheduled',
      'Test Drive Completed',
      'Negotiation',
      'Booking',
      'Won',
      'Lost',
      'On Hold',
    ] as LeadStatus[],
    stockAgingDaysThreshold: 45,
    defaultFollowUpDays: 2,
  };

  const extraModels = [
    { brand: 'Tata', model: 'Nexon XZ+', year: 2021, price: 985000, km: 28400, fuel: 'Petrol' as const },
    { brand: 'Honda', model: 'City V', year: 2020, price: 925000, km: 35200, fuel: 'Petrol' as const },
    { brand: 'Mahindra', model: 'XUV300 W8', year: 2019, price: 875000, km: 42100, fuel: 'Diesel' as const },
    { brand: 'Hyundai', model: 'i20 Sportz', year: 2021, price: 725000, km: 22100, fuel: 'Petrol' as const },
    { brand: 'Maruti', model: 'Swift VXI', year: 2020, price: 595000, km: 31800, fuel: 'Petrol' as const },
  ];

  const vehicles: StockVehicle[] = [];
  const baseCars = [...CARS];
  while (baseCars.length < 36) {
    const m = extraModels[baseCars.length % extraModels.length];
    baseCars.push({
      ...CARS[baseCars.length % CARS.length],
      id: `demo-veh-${baseCars.length}`,
      brand: m.brand,
      model: m.model,
      year: m.year,
      price: m.price,
      kilometres: m.km,
      fuelType: m.fuel,
    });
  }
  for (let idx = 0; idx < 36; idx++) {
    const car = baseCars[idx];
    const availability = idx < 24 ? 'Available' : idx < 32 ? 'Reserved' : 'Sold';
    vehicles.push({
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      kilometres: car.kilometres,
      fuelType: car.fuelType as StockVehicle['fuelType'],
      transmission: car.transmission,
      color: car.color,
      previousOwners: car.owners,
      registrationCity: 'Pune, MH',
      condition: 'Good',
      purchasePrice: Math.round(car.price * 0.86),
      refurbishmentCost: 12000,
      otherExpenses: 8000,
      sellingPrice: car.price,
      minSellingPrice: Math.round(car.price * 0.94),
      image: car.image,
      description: car.description,
      availability,
      showOnWebsite: idx < 30,
      addedById: idx % 2 ? amitId : adminId,
      createdAt: atDaysAgo(idx === 0 ? 182 : 48 + (idx % 40)),
      updatedAt: atDaysAgo(1),
    });
  }

  const sourceSlots: LeadSource[] = [
    ...Array(18).fill('OLX' as LeadSource),
    ...Array(10).fill('Cars24' as LeadSource),
    ...Array(7).fill('Website' as LeadSource),
    ...Array(5).fill('Walk-in' as LeadSource),
    ...Array(4).fill('Phone Call' as LeadSource),
    ...Array(2).fill('Facebook' as LeadSource),
    ...Array(2).fill('Other' as LeadSource),
  ];

  const statusSlots: LeadStatus[] = [
    ...Array(12).fill('New' as LeadStatus),
    ...Array(8).fill('Contacted' as LeadStatus),
    ...Array(6).fill('Qualified' as LeadStatus),
    ...Array(4).fill('Visit/Test Drive Scheduled' as LeadStatus),
    ...Array(4).fill('Test Drive Completed' as LeadStatus),
    ...Array(2).fill('Negotiation' as LeadStatus),
    ...Array(4).fill('Won' as LeadStatus),
    ...Array(2).fill('Lost' as LeadStatus),
    ...Array(6).fill('On Hold' as LeadStatus),
  ];

  const trendDays = [3, 5, 4, 6, 8, 5, 7];
  let leadIdx = 0;
  let hotCount = 0;
  const leads: Lead[] = [];

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const count = trendDays[6 - dayOffset];
    for (let j = 0; j < count && leadIdx < 38; j++) {
      const status = statusSlots[leadIdx];
      const isClosed = status === 'Won' || status === 'Lost' || status === 'On Hold';
      let priority: LeadPriority = leadIdx % 3 === 0 ? 'Warm' : 'Cold';
      if (!isClosed && hotCount < 8) {
        priority = 'Hot';
        hotCount++;
      }
      const staff = leadIdx % 3 === 0 ? amitId : leadIdx % 3 === 1 ? priyaId : rohanId;
      const createdAt =
        dayOffset === 0 && j < 7 ? atToday(9 + j, 15) : atDaysAgo(dayOffset, 9 + j);
      leads.push({
        id: `LEAD-${String(leadIdx + 1).padStart(4, '0')}`,
        customerName: pickName(leadIdx),
        mobile: mobileFor(leadIdx),
        source: sourceSlots[leadIdx],
        preferredCar: vehicles[leadIdx % vehicles.length].model,
        budgetMax: vehicles[leadIdx % vehicles.length].sellingPrice,
        budget: vehicles[leadIdx % vehicles.length].sellingPrice,
        priority,
        assignedStaffId: status === 'New' && j < 3 ? null : staff,
        status,
        city: 'Pune',
        createdById: adminId,
        createdAt,
        updatedAt: atDaysAgo(Math.min(dayOffset, 2)),
        lastContactAt: isClosed ? atDaysAgo(3) : status === 'New' ? undefined : atDaysAgo(1),
        nextFollowUpAt: !isClosed ? atToday(10 + (j % 6), (j * 10) % 60) : undefined,
        interestedVehicleId: vehicles[leadIdx % 20].id,
      });
      leadIdx++;
    }
  }
  const SOURCES_ROT: LeadSource[] = [
    'OLX',
    'Cars24',
    'Website',
    'Walk-in',
    'Phone Call',
    'Facebook',
    'Instagram',
    'WhatsApp',
    'Referral',
    'Other',
  ];
  const STATUS_ROT: LeadStatus[] = [
    'New',
    'Contacted',
    'Qualified',
    'Visit/Test Drive Scheduled',
    'Test Drive Completed',
    'Negotiation',
    'Booking',
    'Won',
    'Lost',
    'On Hold',
  ];

  while (leadIdx < 248) {
    const status = statusSlots[leadIdx] ?? STATUS_ROT[leadIdx % STATUS_ROT.length];
    const isClosed = status === 'Won' || status === 'Lost' || status === 'On Hold';
    const source = sourceSlots[leadIdx] ?? SOURCES_ROT[leadIdx % SOURCES_ROT.length];
    const staff = leadIdx % 3 === 0 ? amitId : leadIdx % 3 === 1 ? priyaId : rohanId;
    let priority: LeadPriority = leadIdx % 4 === 0 ? 'Hot' : leadIdx % 2 ? 'Warm' : 'Cold';
    if (isClosed) priority = 'Cold';
    const createdAt =
      leadIdx < 55 && leadIdx >= 48
        ? atToday(8 + (leadIdx % 10), (leadIdx * 7) % 60)
        : atDaysAgo(1 + (leadIdx % 90), 10 + (leadIdx % 8));
    leads.push({
      id: `LEAD-${String(leadIdx + 1).padStart(4, '0')}`,
      customerName: pickName(leadIdx),
      mobile: mobileFor(leadIdx),
      email: `${pickName(leadIdx).replace(/\s/g, '.').toLowerCase()}@email.com`,
      source,
      preferredCar: vehicles[leadIdx % vehicles.length].model,
      budgetMin: Math.round(vehicles[leadIdx % vehicles.length].sellingPrice * 0.85),
      budgetMax: vehicles[leadIdx % vehicles.length].sellingPrice,
      budget: vehicles[leadIdx % vehicles.length].sellingPrice,
      priority,
      assignedStaffId: leadIdx % 7 === 0 ? null : staff,
      status,
      city: leadIdx % 5 === 0 ? 'Mumbai, Maharashtra' : 'Pune, Maharashtra',
      fuelType: leadIdx % 2 ? 'Petrol' : 'Diesel',
      transmission: leadIdx % 3 ? 'Manual' : 'Automatic',
      purchaseTimeline: 'Within 30 days',
      createdById: adminId,
      createdAt,
      updatedAt: atDaysAgo(leadIdx % 14),
      lastContactAt: isClosed ? atDaysAgo(4) : atDaysAgo(leadIdx % 5),
      nextFollowUpAt: !isClosed ? atToday(9 + (leadIdx % 8), (leadIdx * 11) % 60) : undefined,
      interestedVehicleId: vehicles[leadIdx % vehicles.length].id,
    });
    leadIdx++;
  }

  const openLeads = leads.filter(
    (l) => !['Won', 'Lost', 'On Hold'].includes(l.status),
  );
  const followUps: FollowUp[] = [];
  const todayNotes = [
    'Customer asked to call after office — confirm Creta price',
    'WhatsApp: interested in finance options, share EMI chart',
    'Showroom visit reminder — bring RC copy',
    'Call back: budget discussion around ₹8–9L',
    'Follow up on test-drive feedback for City V',
    'Remind about weekend stock viewing',
    'Customer said call at 4 pm today',
    'Confirm insurance quote shared yesterday',
    'Negotiate token amount — ready to book',
    'Ask for alternate number if no pickup',
  ];
  const todaySlots: [number, number][] = [
    [9, 0],
    [9, 45],
    [10, 15],
    [10, 45],
    [11, 30],
    [12, 0],
    [14, 0],
    [15, 15],
    [16, 0],
    [17, 30],
  ];
  todaySlots.forEach(([h, m], i) => {
    const lead = openLeads[i];
    if (!lead) return;
    const staff =
      lead.assignedStaffId ?? (i % 3 === 0 ? amitId : i % 3 === 1 ? priyaId : rohanId);
    followUps.push({
      id: `fu-today-${i}`,
      leadId: lead.id,
      scheduledAt: atToday(h, m),
      type: i % 3 === 0 ? 'Call' : i % 3 === 1 ? 'WhatsApp' : 'Visit',
      assignedStaffId: staff,
      notes: todayNotes[i % todayNotes.length],
      status: 'Pending',
      createdById: adminId,
      createdAt: atDaysAgo(1),
      updatedAt: atDaysAgo(0),
    });
    lead.nextFollowUpAt = atToday(h, m);
  });

  const overdueNotes = [
    'Missed call yesterday — customer wanted price match vs Cars24',
    'No answer twice — try WhatsApp then call',
    'Promised callback for Nexon XZ+ — overdue',
    'Finance docs pending — chase customer',
    'Wife wants to see car — reschedule visit',
    'Said “call me tomorrow” (yesterday) — still pending',
  ];
  for (let o = 0; o < 6; o++) {
    const lead = openLeads[12 + o];
    if (!lead) continue;
    const staff =
      lead.assignedStaffId ?? (o % 2 ? priyaId : amitId);
    followUps.push({
      id: `fu-over-${o}`,
      leadId: lead.id,
      scheduledAt: atDaysAgo(1 + (o % 3), 16 - o, (o * 10) % 60),
      type: o % 2 ? 'Call' : 'WhatsApp',
      assignedStaffId: staff,
      notes: overdueNotes[o % overdueNotes.length],
      status: 'Pending',
      createdById: adminId,
      createdAt: atDaysAgo(5),
      updatedAt: atDaysAgo(2),
    });
    lead.nextFollowUpAt = atDaysAgo(1 + (o % 3), 16 - o, 0);
  }

  const upcomingNotes = [
    'Call after 2 days — customer travelling',
    'Share updated quotation next week',
    'Remind for Saturday test drive',
    'Follow up on exchange valuation',
    'Check if salary credit done for down payment',
    'Confirm colour preference before booking',
    'Send video of underbody / engine bay',
    'Wife available only after Wednesday',
  ];
  for (let u = 0; u < 8; u++) {
    const lead = openLeads[20 + u];
    if (!lead) continue;
    const staff =
      lead.assignedStaffId ?? (u % 3 === 0 ? amitId : u % 3 === 1 ? priyaId : rohanId);
    const when = atDaysFromNow(1 + (u % 5), 10 + (u % 6), (u * 15) % 60);
    followUps.push({
      id: `fu-up-${u}`,
      leadId: lead.id,
      scheduledAt: when,
      type: u % 4 === 0 ? 'Visit' : u % 2 ? 'Call' : 'WhatsApp',
      assignedStaffId: staff,
      notes: upcomingNotes[u % upcomingNotes.length],
      status: 'Pending',
      createdById: adminId,
      createdAt: atDaysAgo(1),
      updatedAt: atDaysAgo(0),
    });
    lead.nextFollowUpAt = when;
  }

  // A few completed ones so history looks real on lead pages
  for (let c = 0; c < 4; c++) {
    const lead = openLeads[30 + c];
    if (!lead) continue;
    followUps.push({
      id: `fu-done-${c}`,
      leadId: lead.id,
      scheduledAt: atDaysAgo(2 + c, 11, 0),
      type: 'Call',
      assignedStaffId: lead.assignedStaffId ?? amitId,
      notes: 'Earlier reminder',
      outcome: 'Spoke — customer will visit this weekend',
      status: 'Completed',
      createdById: adminId,
      createdAt: atDaysAgo(4),
      updatedAt: atDaysAgo(2),
    });
  }

  const appointments: Appointment[] = [];
  const apptTodayNotes = [
    'Customer wants morning slot — Creta petrol',
    'Bring co-applicant for finance discussion',
    'First visit — show 3 options under ₹9L',
    'Confirm DL before test drive',
    'Family visiting together',
    'Exchange evaluation after drive',
  ];
  const apptTodaySpecs: [number, number, Appointment['type']][] = [
    [10, 0, 'Test Drive'],
    [11, 30, 'Showroom Visit'],
    [13, 0, 'Test Drive'],
    [15, 0, 'Showroom Visit'],
    [16, 30, 'Test Drive'],
    [17, 45, 'Showroom Visit'],
  ];
  apptTodaySpecs.forEach(([h, m, type], i) => {
    const lead = openLeads[5 + i] ?? leads[5 + i];
    if (!lead) return;
    appointments.push({
      id: `appt-t-${i}`,
      leadId: lead.id,
      vehicleId: vehicles[i + 2].id,
      type,
      scheduledAt: atToday(h, m),
      assignedStaffId: i % 2 ? amitId : priyaId,
      location: 'DriveNext showroom, Kondhwa',
      notes: apptTodayNotes[i % apptTodayNotes.length],
      status: i % 2 ? 'Confirmed' : 'Scheduled',
      createdById: adminId,
      createdAt: atDaysAgo(2),
      updatedAt: atDaysAgo(0),
    });
  });
  for (let o = 0; o < 4; o++) {
    const lead = openLeads[18 + o] ?? leads[18 + o];
    if (!lead) continue;
    appointments.push({
      id: `appt-over-${o}`,
      leadId: lead.id,
      vehicleId: vehicles[4 + o].id,
      type: o % 2 ? 'Test Drive' : 'Showroom Visit',
      scheduledAt: atDaysAgo(1, 14 - o, 0),
      assignedStaffId: o % 2 ? priyaId : amitId,
      location: 'DriveNext showroom, Kondhwa',
      notes: 'Customer no-show risk — call before slot',
      status: 'Scheduled',
      createdById: adminId,
      createdAt: atDaysAgo(3),
      updatedAt: atDaysAgo(1),
    });
  }
  for (let u = 0; u < 8; u++) {
    const lead = openLeads[10 + u] ?? leads[10 + u];
    if (!lead) continue;
    appointments.push({
      id: `appt-up-${u}`,
      leadId: lead.id,
      vehicleId: vehicles[8 + (u % 10)].id,
      type: u % 2 ? 'Test Drive' : 'Showroom Visit',
      scheduledAt: atDaysFromNow(1 + (u % 5), 10 + (u % 6), 0),
      assignedStaffId: u % 3 === 0 ? amitId : u % 3 === 1 ? priyaId : rohanId,
      location: 'DriveNext showroom',
      notes:
        u % 2
          ? 'Booked via WhatsApp — send location pin'
          : 'Prefer automatic — keep City / i20 ready',
      status: u % 3 === 0 ? 'Confirmed' : 'Scheduled',
      createdById: adminId,
      createdAt: atDaysAgo(1),
      updatedAt: atDaysAgo(1),
    });
  }
  for (let d = 0; d < 3; d++) {
    const lead = openLeads[28 + d] ?? leads[28 + d];
    if (!lead) continue;
    appointments.push({
      id: `appt-done-${d}`,
      leadId: lead.id,
      vehicleId: vehicles[12 + d].id,
      type: 'Test Drive',
      scheduledAt: atDaysAgo(2 + d, 11, 0),
      assignedStaffId: amitId,
      location: 'DriveNext showroom',
      notes: 'Completed drive',
      status: 'Completed',
      outcome: 'Liked the car — negotiating token',
      createdById: adminId,
      createdAt: atDaysAgo(4),
      updatedAt: atDaysAgo(2),
    });
  }

  const salePrices = [710000, 685000, 725000, 720000];
  const bookings: Booking[] = salePrices.map((price, i) => ({
    id: `bkg-${i + 1}`,
    leadId: leads.filter((l) => l.status === 'Won')[i]?.id ?? leads[40 + i].id,
    vehicleId: vehicles.filter((v) => v.availability === 'Sold')[i]?.id ?? vehicles[32 + i].id,
    agreedPrice: price,
    tokenAmount: 50000,
    bookingDate: atDaysAgo(5 + i * 3),
    paymentMode: 'UPI',
    status: 'Sold/Delivered' as const,
    assignedStaffId: i % 2 ? amitId : priyaId,
    createdById: adminId,
    createdAt: atDaysAgo(8 + i),
    updatedAt: atDaysAgo(2 + i),
    deliveryDate: atDaysAgo(1 + i),
    notes: 'April delivery — showcase sale',
  }));

  const activities: LeadActivity[] = [
    {
      id: 'act-1',
      leadId: leads[0].id,
      actorId: amitId,
      type: 'lead_created',
      title: 'New lead created from OLX',
      detail: 'Customer enquired about Hyundai i20',
      createdAt: atToday(8, 20),
    },
    {
      id: 'act-2',
      leadId: leads[3].id,
      actorId: priyaId,
      type: 'contact',
      title: 'WhatsApp conversation logged',
      detail: 'Shared Swift photos and on-road quote',
      createdAt: atToday(9, 45),
    },
    {
      id: 'act-3',
      leadId: leads[8].id,
      actorId: amitId,
      type: 'appointment',
      title: 'Test drive scheduled',
      detail: 'Honda City V — tomorrow 11:30 AM',
      createdAt: atToday(10, 10),
    },
    {
      id: 'act-4',
      leadId: leads[12].id,
      actorId: adminId,
      type: 'status_change',
      title: 'Status updated',
      detail: 'Qualified → Visit/Test Drive Scheduled',
      createdAt: atToday(11, 0),
    },
    {
      id: 'act-5',
      leadId: leads[0].id,
      actorId: adminId,
      type: 'note',
      title: 'Vehicle added to stock',
      detail: 'Tata Nexon XZ+ listed at ₹9.85 Lakh',
      createdAt: atDaysAgo(0, 16, 30),
    },
    {
      id: 'act-6',
      leadId: leads[5].id,
      actorId: priyaId,
      type: 'booking',
      title: 'Booking recorded',
      detail: 'Token received — Maruti Swift',
      createdAt: atDaysAgo(1, 14, 0),
    },
  ];

  return {
    version: 2,
    leadCounter: 248,
    settings,
    users: [
      {
        id: adminId,
        name: 'Rohit Sharma',
        email: 'admin@unityauto.com',
        phone: '9888888888',
        role: 'admin',
        status: 'active',
        password: 'admin123',
        createdAt: atDaysAgo(120),
      },
      {
        id: amitId,
        name: 'Amit Kumar',
        email: 'amit@drivenext.in',
        phone: '9876500001',
        role: 'sales',
        status: 'active',
        password: 'staff123',
        createdAt: atDaysAgo(90),
      },
      {
        id: priyaId,
        name: 'Priya Singh',
        email: 'priya@unityauto.com',
        phone: '9876500002',
        role: 'sales',
        status: 'active',
        password: 'staff123',
        createdAt: atDaysAgo(80),
      },
      {
        id: rohanId,
        name: 'Rohan Mehta',
        email: 'rahul@unityauto.com',
        phone: '9876500003',
        role: 'staff',
        status: 'active',
        password: 'staff123',
        createdAt: atDaysAgo(70),
      },
    ],
    vehicles,
    leads,
    followUps,
    appointments,
    bookings,
    activities,
    auditLogs: [
      {
        id: 'log-1',
        actorId: adminId,
        action: 'login_success',
        recordType: 'auth',
        recordId: adminId,
        createdAt: atToday(8, 0),
      },
    ],
  };
}
