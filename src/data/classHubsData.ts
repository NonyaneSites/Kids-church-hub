import { 
  ClassId, 
  ClassInfo, 
  ClassHubData, 
  ServiceSegment, 
  PreServiceCheckItem, 
  WorshipSong, 
  IncidentLog, 
  TeamMember, 
  LessonNotesData, 
  ServiceReviewData, 
  PrayerRequest,
  ServiceState 
} from '../types/hub';

export const CLASSES_CONFIG: ClassInfo[] = [
  {
    id: 'jy',
    name: 'Junior Youth',
    shortCode: 'JY',
    colorName: 'Blue Class',
    colorHex: '#3b82f6',
    grade: 'Grade 6-7',
    ageGroup: '12-13 year olds',
    room: 'Youth Upper Hall B',
    themeBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    accentBorder: 'border-blue-500/50',
    accentBg: 'bg-blue-600',
    accentText: 'text-blue-400',
    pillBadge: 'bg-blue-950/80 text-blue-300 border-blue-500/50',
    description: 'High-energy youth worship, life groups, leadership development & peer discussion.',
  },
  {
    id: 'tb',
    name: 'TRAILBLAZERS',
    shortCode: 'TB',
    colorName: 'Pink Class',
    colorHex: '#ec4899',
    grade: 'Grade 4-5',
    ageGroup: '10-11 year olds',
    room: 'The Arena (Hall 2)',
    themeBadge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    accentBorder: 'border-pink-500/50',
    accentBg: 'bg-pink-600',
    accentText: 'text-pink-400',
    pillBadge: 'bg-pink-950/80 text-pink-300 border-pink-500/50',
    description: 'Squad competitions, Sword drills, Armor of God quests, and bold faith activation.',
  },
  {
    id: 'kb',
    name: 'Kingdom Builders',
    shortCode: 'KB',
    colorName: 'Red Class',
    colorHex: '#ef4444',
    grade: 'Grade 1-3',
    ageGroup: '7-9 year olds',
    room: 'Main Children Auditorium',
    themeBadge: 'bg-red-500/20 text-red-300 border-red-500/40',
    accentBorder: 'border-red-500/50',
    accentBg: 'bg-red-600',
    accentText: 'text-red-400',
    pillBadge: 'bg-red-950/80 text-red-300 border-red-500/50',
    description: 'Dynamic bible storytelling, action praise dances, puppet skits & giant memory verse battles.',
  },
  {
    id: 'la-orange',
    name: 'Little Adventures Orange',
    shortCode: 'LA Orange',
    colorName: 'Orange Class',
    colorHex: '#f97316',
    grade: 'Pre-K & Grade R',
    ageGroup: '5-6 year olds',
    room: 'Discovery Wing A',
    themeBadge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    accentBorder: 'border-orange-500/50',
    accentBg: 'bg-orange-600',
    accentText: 'text-orange-400',
    pillBadge: 'bg-orange-950/80 text-orange-300 border-orange-500/50',
    description: 'Animated storybook theater, rhythm clapping, sticker crafts, and loving prayer circles.',
  },
  {
    id: 'la-yellow',
    name: 'Little Adventures Yellow',
    shortCode: 'LA Yellow',
    colorName: 'Yellow Class',
    colorHex: '#eab308',
    grade: 'Toddlers & Preschool',
    ageGroup: '3-4 year olds',
    room: 'Little Explorers Pod',
    themeBadge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    accentBorder: 'border-yellow-500/50',
    accentBg: 'bg-yellow-600',
    accentText: 'text-yellow-400',
    pillBadge: 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50',
    description: 'Sensory floor play, sweet action lullabies, bubble parades, and nurturing toddler care.',
  },
];

function makeInitialTargetEndTime(secondsRemaining: number): string {
  return new Date(Date.now() + secondsRemaining * 1000).toISOString();
}

// -------------------------------------------------------------
// 1. JUNIOR YOUTH (BLUE CLASS, GRADE 6-7)
// -------------------------------------------------------------
const JY_SEGMENTS: ServiceSegment[] = [
  { id: 'jy-seg-1', order: 1, title: 'Welcome Hype & Icebreaker', plannedStartTime: '08:30 AM', durationMinutes: 10, assignedLead: 'Thabo', assignedRole: 'Tech / Host', status: 'completed', notes: 'High energy walk-in music, group handshake challenge' },
  { id: 'jy-seg-2', order: 2, title: 'Live Youth Worship', plannedStartTime: '08:40 AM', durationMinutes: 20, assignedLead: 'Sarah & Band', assignedRole: 'Worship Lead', status: 'completed', notes: 'Modern youth set: Echo & My Testimony' },
  { id: 'jy-seg-3', order: 3, title: 'Real Talk: Peer Pressure & Identity', plannedStartTime: '09:00 AM', durationMinutes: 10, assignedLead: 'Pastor Hope', assignedRole: 'Teacher', status: 'in_progress', keyScripture: 'Romans 12:2', notes: 'Interactive live poll on screen via phones', slideRange: [1, 6] },
  { id: 'jy-seg-4', order: 4, title: 'Message: Anchored in Christ', plannedStartTime: '09:10 AM', durationMinutes: 25, assignedLead: 'Pastor Hope', assignedRole: 'Teacher', status: 'upcoming', keyScripture: 'Colossians 2:6-7', notes: 'Visual demonstration: Anchor vs driftwood', slideRange: [7, 18] },
  { id: 'jy-seg-5', order: 5, title: 'Breakout Life Groups', plannedStartTime: '09:35 AM', durationMinutes: 15, assignedLead: 'Life Group Leaders', assignedRole: '6 Mentors', status: 'upcoming', notes: 'Small circles with discussion guide cards' },
  { id: 'jy-seg-6', order: 6, title: 'Ministry & Altar Call', plannedStartTime: '09:50 AM', durationMinutes: 10, assignedLead: 'Sarah', assignedRole: 'Worship', status: 'upcoming', notes: 'Soft acoustic pad, personal salvation prayers' },
  { id: 'jy-seg-7', order: 7, title: 'Announcements & Merch Drop', plannedStartTime: '10:00 AM', durationMinutes: 10, assignedLead: 'Nomsa', assignedRole: 'Comms', status: 'upcoming', notes: 'Youth Camp early bird registration announcement' },
  { id: 'jy-seg-8', order: 8, title: 'Dismissal & Hangout Lounge', plannedStartTime: '10:10 AM', durationMinutes: 10, assignedLead: 'Nomsa', assignedRole: 'Comms', status: 'upcoming', notes: 'Parent collection verification' },
];

const JY_CHECKLIST: PreServiceCheckItem[] = [
  { id: 'jy-chk-1', label: 'Dual Stage Displays', statusText: 'Online (HDMI-1/2)', isChecked: true, category: 'hardware' },
  { id: 'jy-chk-2', label: 'Wireless Shure Mics (1-4)', statusText: 'Fresh 9V Batteries', isChecked: true, category: 'audio' },
  { id: 'jy-chk-3', label: 'In-Ear Monitor Packs', statusText: 'Synced Ch 38', isChecked: true, category: 'audio' },
  { id: 'jy-chk-4', label: 'Stage Lighting Preset', statusText: 'Scene 3 Youth Hype', isChecked: true, category: 'hardware' },
  { id: 'jy-chk-5', label: 'Live Q&A Polling Screen', statusText: 'Connected', isChecked: true, category: 'media' },
  { id: 'jy-chk-6', label: 'Slide Deck: Anchored', statusText: 'Loaded (22 slides)', isChecked: true, category: 'media' },
  { id: 'jy-chk-7', label: 'Youth Discussion Booklets', statusText: 'Distributed', isChecked: true, category: 'general' },
];

const JY_WORSHIP: WorshipSong[] = [
  { id: 'jy-song-1', order: 1, title: 'Echo (Elevation Youth)', artist: 'Elevation Rhythm', duration: '03:45', durationSeconds: 225, isPlaying: false, bpm: 128 },
  { id: 'jy-song-2', order: 2, title: 'My Testimony', artist: 'Elevation Worship', duration: '04:50', durationSeconds: 290, isPlaying: true, bpm: 98 },
  { id: 'jy-song-3', order: 3, title: 'Goodness of God (Acoustic)', artist: 'Bethel Music', duration: '05:10', durationSeconds: 310, isPlaying: false, bpm: 63 },
];

const JY_LESSON: LessonNotesData = {
  title: 'Anchored: Unshakable Faith in a Noisy World',
  mainScripture: 'Colossians 2:6-7 (TPT)',
  keyPoint: 'When your roots go deep into Christ, no storm or peer pressure can pull you down.',
  memoryVerse: 'Romans 12:2 "Do not conform to the pattern of this world, but be transformed by the renewing of your mind."',
  illustrationGame: 'The Tug-of-War Anchor Challenge: 3 teens try to pull down a weighted anchor stand',
  slidesCount: 22,
  notes: [
    'Tackle the issue of social media approval vs Gods approval.',
    'Give real life examples from high school transitions.',
    'Call for honest prayer during life group breakout.',
  ],
};

// -------------------------------------------------------------
// 2. TRAILBLAZERS (PINK CLASS, GRADE 4-5)
// -------------------------------------------------------------
const TB_SEGMENTS: ServiceSegment[] = [
  { id: 'tb-seg-1', order: 1, title: 'Squad Rollcall & Camp Cheer', plannedStartTime: '08:30 AM', durationMinutes: 10, assignedLead: 'Nomsa', assignedRole: 'Comms / MC', status: 'completed', notes: 'Pink Squad vs Teal Squad cheer battle' },
  { id: 'tb-seg-2', order: 2, title: 'High-Energy Praise & Action Dance', plannedStartTime: '08:40 AM', durationMinutes: 15, assignedLead: 'Sarah', assignedRole: 'Worship Lead', status: 'completed', notes: 'Jump around praise: Super Savior & Unstoppable' },
  { id: 'tb-seg-3', order: 3, title: 'Sword Drill / Bible Speed Quest', plannedStartTime: '08:55 AM', durationMinutes: 10, assignedLead: 'Lebo', assignedRole: 'Presenter', status: 'in_progress', keyScripture: 'Ephesians 6:10-18', notes: 'Kids race to find scripture passages in printed Bibles' },
  { id: 'tb-seg-4', order: 4, title: 'Hero Story: The Armor of God', plannedStartTime: '09:05 AM', durationMinutes: 20, assignedLead: 'Lebo', assignedRole: 'Presenter', status: 'upcoming', keyScripture: 'Ephesians 6:14-17', notes: 'Live cardboard knight suit assembly on stage', slideRange: [1, 15] },
  { id: 'tb-seg-5', order: 5, title: 'Squad Obstacle Relay Race', plannedStartTime: '09:25 AM', durationMinutes: 15, assignedLead: 'Thabo', assignedRole: 'Tech / Game Ref', status: 'upcoming', notes: 'Shield of Faith ball deflect game' },
  { id: 'tb-seg-6', order: 6, title: 'Squad Huddles & Prayer Cards', plannedStartTime: '09:40 AM', durationMinutes: 15, assignedLead: 'Group Coaches', assignedRole: 'Leaders', status: 'upcoming', notes: 'Fill in Armor of God personal courage cards' },
  { id: 'tb-seg-7', order: 7, title: 'Kingdom Giving & Praise', plannedStartTime: '09:55 AM', durationMinutes: 10, assignedLead: 'Pastor Hope', assignedRole: 'Director', status: 'upcoming', notes: 'Interactive offering bucket race' },
  { id: 'tb-seg-8', order: 8, title: 'Dismissal & Security Tag Check', plannedStartTime: '10:05 AM', durationMinutes: 15, assignedLead: 'Nomsa', assignedRole: 'Comms', status: 'upcoming', notes: 'Barcode check on parent pickup tags' },
];

const TB_CHECKLIST: PreServiceCheckItem[] = [
  { id: 'tb-chk-1', label: 'Arena Main TV Wall', statusText: 'Live Feed OK', isChecked: true, category: 'hardware' },
  { id: 'tb-chk-2', label: 'Wireless Lapel & Handheld Mics', statusText: 'Batteries 100%', isChecked: true, category: 'audio' },
  { id: 'tb-chk-3', label: 'Squad Scoreboard Display', statusText: 'Reset to 0-0', isChecked: true, category: 'media' },
  { id: 'tb-chk-4', label: 'Armor of God Props', statusText: 'Helmet, Breastplate, Shield ready', isChecked: true, category: 'general' },
  { id: 'tb-chk-5', label: 'Sound FX Trigger Pad', statusText: 'Fanfare & Horns Loaded', isChecked: true, category: 'audio' },
  { id: 'tb-chk-6', label: 'Relay Cones & Foam Balls', statusText: 'Placed in Arena Center', isChecked: true, category: 'hardware' },
];

const TB_WORSHIP: WorshipSong[] = [
  { id: 'tb-song-1', order: 1, title: 'Unstoppable God (Kids Mix)', artist: 'Elevation Kids', duration: '03:30', durationSeconds: 210, isPlaying: false, bpm: 132 },
  { id: 'tb-song-2', order: 2, title: 'Super Savior Praise', artist: 'Hillsong Kids', duration: '04:15', durationSeconds: 255, isPlaying: true, bpm: 124 },
  { id: 'tb-song-3', order: 3, title: 'King of My Heart', artist: 'Bethel Kids', duration: '04:45', durationSeconds: 285, isPlaying: false, bpm: 72 },
];

const TB_LESSON: LessonNotesData = {
  title: 'Trailblazers Armor Up: The Shield of Faith',
  mainScripture: 'Ephesians 6:16',
  keyPoint: 'Faith in God is our mighty shield that puts out every fiery arrow of doubt!',
  memoryVerse: 'Ephesians 6:11 "Put on the whole armor of God, that you may be able to stand against the schemes of the devil."',
  illustrationGame: 'Fiery Dart Ballistics: Leaders throw sponge darts; volunteer blocks them with the Faith Shield',
  slidesCount: 19,
  notes: [
    'Explain that Roman shields were covered in water-soaked leather to extinguish fiery arrows.',
    'Ask the kids: What lies or doubts do you hear at school? How does God’s truth deflect them?',
    'Award 50 points to the Squad with the fastest Bible drill answers.',
  ],
};

// -------------------------------------------------------------
// 3. KINGDOM BUILDERS (RED CLASS, GRADE 1-3)
// -------------------------------------------------------------
const KB_SEGMENTS: ServiceSegment[] = [
  { id: 'kb-seg-1', order: 1, title: 'Welcome & High-Five Hype', plannedStartTime: '08:30 AM', durationMinutes: 10, assignedLead: 'Pastor Hope', assignedRole: 'Admin', status: 'completed', notes: 'High-five tunnel, introduce new visitors' },
  { id: 'kb-seg-2', order: 2, title: 'Action Songs Praise Dance', plannedStartTime: '08:40 AM', durationMinutes: 15, assignedLead: 'Dance Captains', assignedRole: 'Tech / Worship', status: 'completed', notes: 'Way Maker & Open The Eyes action praise' },
  { id: 'kb-seg-3', order: 3, title: 'Memory Verse Challenge', plannedStartTime: '08:55 AM', durationMinutes: 15, assignedLead: 'Pastor Hope', assignedRole: 'Teacher', status: 'in_progress', keyScripture: '1 Timothy 5:22', notes: 'Boys vs Girls memory verse shout out', slideRange: [10, 14] },
  { id: 'kb-seg-4', order: 4, title: 'Puppet Theater: Barnaby & Goliath', plannedStartTime: '09:10 AM', durationMinutes: 10, assignedLead: 'Puppet Team', assignedRole: 'Media', status: 'upcoming', notes: 'Barnaby learns not to be scared of big problems' },
  { id: 'kb-seg-5', order: 5, title: 'Lesson: David & Goliath (Giant Faith)', plannedStartTime: '09:20 AM', durationMinutes: 20, assignedLead: 'Lebo', assignedRole: 'Presenter', status: 'upcoming', keyScripture: '1 Samuel 17:45-47', notes: 'Goliath 9-foot scale model and foam stones', slideRange: [15, 23] },
  { id: 'kb-seg-6', order: 6, title: 'Giant Ball Toss Game', plannedStartTime: '09:40 AM', durationMinutes: 15, assignedLead: 'Thabo', assignedRole: 'Tech Ref', status: 'upcoming', notes: 'Throw foam balls into giant basket targets' },
  { id: 'kb-seg-7', order: 7, title: 'Giving & Thankfulness Blessing', plannedStartTime: '09:55 AM', durationMinutes: 10, assignedLead: 'Nomsa', assignedRole: 'Comms', status: 'upcoming', notes: 'Animated giving video' },
  { id: 'kb-seg-8', order: 8, title: 'Dismissal & Parents Pick-up', plannedStartTime: '10:05 AM', durationMinutes: 15, assignedLead: 'Nomsa', assignedRole: 'Comms', status: 'upcoming', notes: 'Scan wristbands at door' },
];

const KB_CHECKLIST: PreServiceCheckItem[] = [
  { id: 'kb-chk-1', label: 'Main Center Screen', statusText: 'Connected & 1080p', isChecked: true, category: 'hardware' },
  { id: 'kb-chk-2', label: 'Wireless Mic 1 & 2', statusText: 'Tested, No Feedback', isChecked: true, category: 'audio' },
  { id: 'kb-chk-3', label: 'Puppet Stage Backdrop', statusText: 'Secured with clamps', isChecked: true, category: 'hardware' },
  { id: 'kb-chk-4', label: 'Slide Clicker / Remote', statusText: 'Battery Full', isChecked: true, category: 'hardware' },
  { id: 'kb-chk-5', label: 'David & Goliath Slides', statusText: 'Loaded (23 slides)', isChecked: true, category: 'media' },
  { id: 'kb-chk-6', label: 'Giant Foam Stones Props', statusText: 'Cleaned and ready', isChecked: true, category: 'general' },
  { id: 'kb-chk-7', label: 'Child Check-in Scanner', statusText: 'Online & Synced', isChecked: true, category: 'hardware' },
];

const KB_WORSHIP: WorshipSong[] = [
  { id: 'kb-song-1', order: 1, title: 'Open The Eyes (Kids Action)', artist: 'Newsboys Kids', duration: '03:48', durationSeconds: 228, isPlaying: false, bpm: 110 },
  { id: 'kb-song-2', order: 2, title: 'Way Maker (Action Praise)', artist: 'Sinach Kids', duration: '04:50', durationSeconds: 290, isPlaying: true, bpm: 68 },
  { id: 'kb-song-3', order: 3, title: 'Every Move I Make', artist: 'Hillsong Kids', duration: '03:15', durationSeconds: 195, isPlaying: false, bpm: 130 },
];

const KB_LESSON: LessonNotesData = {
  title: 'David & Goliath: Bigger Together with God',
  mainScripture: '1 Samuel 17:45-47',
  keyPoint: 'No matter how big the problem looks, our God is always bigger!',
  memoryVerse: '1 Timothy 5:22 (TPT) "Keep yourself pure and holy with your standards high."',
  illustrationGame: 'Giant Ball Challenge (Throw foam balls at cardboard Goliath target)',
  slidesCount: 23,
  notes: [
    'Goliath was over 9 feet tall, but David remembered Gods faithfulness with the lion and the bear.',
    'David did not wear Sauls heavy armor; he trusted in the Name of the Lord.',
    'Ask 3 volunteers from Grade 1, 2, and 3 to recite the verse for prize stickers.',
  ],
};

// -------------------------------------------------------------
// 4. LITTLE ADVENTURES ORANGE (ORANGE CLASS, 5-6 YR OLDS)
// -------------------------------------------------------------
const LA_ORANGE_SEGMENTS: ServiceSegment[] = [
  { id: 'lao-seg-1', order: 1, title: 'Free Play & Hello Circle Song', plannedStartTime: '08:30 AM', durationMinutes: 15, assignedLead: 'Aunty Grace', assignedRole: 'Teacher', status: 'completed', notes: 'Welcome circle: Hello friends song with name stickers' },
  { id: 'lao-seg-2', order: 2, title: 'Little Worshippers Action Praise', plannedStartTime: '08:45 AM', durationMinutes: 12, assignedLead: 'Sarah', assignedRole: 'Worship Lead', status: 'completed', notes: 'Father Abraham & Jesus in My Heart clapping action' },
  { id: 'lao-seg-3', order: 3, title: 'Storybook Theater: Noah & The Great Big Ark', plannedStartTime: '08:57 AM', durationMinutes: 15, assignedLead: 'Aunty Grace', assignedRole: 'Teacher', status: 'in_progress', keyScripture: 'Genesis 6-9', notes: 'Oversized picture book with plush animal pairs' },
  { id: 'lao-seg-4', order: 4, title: 'Animal Sounds Guessing Parade', plannedStartTime: '09:12 AM', durationMinutes: 10, assignedLead: 'Thabo', assignedRole: 'Tech / Sound FX', status: 'upcoming', notes: 'Play roar/quack sound effects; kids mimic animals entering the Ark' },
  { id: 'lao-seg-5', order: 5, title: 'Rainbow Promise Sticker Craft', plannedStartTime: '09:22 AM', durationMinutes: 15, assignedLead: 'Craft Team', assignedRole: '3 Helpers', status: 'upcoming', notes: 'Kids stick rainbow cotton clouds on blue cards' },
  { id: 'lao-seg-6', order: 6, title: 'Juice Box & Healthy Biscuit Break', plannedStartTime: '09:37 AM', durationMinutes: 15, assignedLead: 'Nomsa', assignedRole: 'Comms / Hospitality', status: 'upcoming', notes: 'Allergy check: No peanut snacks, sanitized hands' },
  { id: 'lao-seg-7', order: 7, title: 'Gentle Altar Blessing & Soft Song', plannedStartTime: '09:52 AM', durationMinutes: 10, assignedLead: 'Aunty Grace', assignedRole: 'Teacher', status: 'upcoming', notes: 'Gentle prayer of protection over each child' },
  { id: 'lao-seg-8', order: 8, title: 'Toy Clean-up & Security Tag Exit', plannedStartTime: '10:02 AM', durationMinutes: 15, assignedLead: 'Nomsa', assignedRole: 'Comms', status: 'upcoming', notes: 'Verify guardian photo badge matches child tag' },
];

const LA_ORANGE_CHECKLIST: PreServiceCheckItem[] = [
  { id: 'lao-chk-1', label: 'Safety Gate Latch', statusText: 'Locked & Checked', isChecked: true, category: 'hardware' },
  { id: 'lao-chk-2', label: 'Smart TV / Tablet Mirroring', statusText: 'Connected & Working', isChecked: true, category: 'media' },
  { id: 'lao-chk-3', label: 'Bluetooth Class Speaker', statusText: 'Paired to iPad', isChecked: true, category: 'audio' },
  { id: 'lao-chk-4', label: 'Noah Ark Big Book & Plushies', statusText: 'Cleaned on Stage Rug', isChecked: true, category: 'general' },
  { id: 'lao-chk-5', label: 'Rainbow Sticker Packs (30 ct)', statusText: 'Counted on Tables', isChecked: true, category: 'general' },
  { id: 'lao-chk-6', label: 'Juice Boxes & Hand Wipes', statusText: 'Allergy Safe Checked', isChecked: true, category: 'general' },
  { id: 'lao-chk-7', label: 'First Aid Kit & Ice Pack', statusText: 'Accessible on Wall', isChecked: true, category: 'hardware' },
];

const LA_ORANGE_WORSHIP: WorshipSong[] = [
  { id: 'lao-song-1', order: 1, title: 'Father Abraham Had Many Sons', artist: 'Cedarmont Kids', duration: '02:45', durationSeconds: 165, isPlaying: false, bpm: 120 },
  { id: 'lao-song-2', order: 2, title: 'Deep and Wide (Bubbles Mix)', artist: 'Kingdom Kids Praise', duration: '03:10', durationSeconds: 190, isPlaying: true, bpm: 115 },
  { id: 'lao-song-3', order: 3, title: 'Jesus Loves Me (Acoustic)', artist: 'Hillsong Little Kids', duration: '02:50', durationSeconds: 170, isPlaying: false, bpm: 75 },
];

const LA_ORANGE_LESSON: LessonNotesData = {
  title: 'Noahs Ark: God Always Keeps His Promises',
  mainScripture: 'Genesis 9:13',
  keyPoint: 'God loves us so much, and the rainbow reminds us that God always keeps His word!',
  memoryVerse: 'Genesis 9:13 "I have set my rainbow in the clouds, and it will be a sign of the promise."',
  illustrationGame: 'The March of the Pairs: Kids hold hands in pairs and march like elephants and lions into the Ark cardboard box',
  slidesCount: 14,
  notes: [
    'Use warm expressive voices for different animal sounds.',
    'Hand out rainbow sunglasses props for the memory verse time.',
    'Keep explanations sensory and visual with cotton balls and bright colors.',
  ],
};

// -------------------------------------------------------------
// 5. LITTLE ADVENTURES YELLOW (YELLOW CLASS, 3-4 YR OLDS)
// -------------------------------------------------------------
const LA_YELLOW_SEGMENTS: ServiceSegment[] = [
  { id: 'lay-seg-1', order: 1, title: 'Warm Hugs & Soft Mat Play', plannedStartTime: '08:30 AM', durationMinutes: 15, assignedLead: 'Uncle David', assignedRole: 'Teacher', status: 'completed', notes: 'Soft building blocks, teddy bear hugs, calm nursery music' },
  { id: 'lay-seg-2', order: 2, title: 'Toddler Sing-Along & Fingerplays', plannedStartTime: '08:45 AM', durationMinutes: 10, assignedLead: 'Uncle David', assignedRole: 'Teacher / Music', status: 'completed', notes: 'Open Shut Them, Itsy Bitsy, Praise Ye The Lord' },
  { id: 'lay-seg-3', order: 3, title: 'Big Felt Board Story: God Made the Stars', plannedStartTime: '08:55 AM', durationMinutes: 10, assignedLead: 'Aunty Mary', assignedRole: 'Presenter', status: 'in_progress', keyScripture: 'Genesis 1:16', notes: 'Kids press felt stars and moons onto dark blue felt board' },
  { id: 'lay-seg-4', order: 4, title: 'Star Wand Bubble Celebration', plannedStartTime: '09:05 AM', durationMinutes: 12, assignedLead: 'Thabo', assignedRole: 'Tech / Bubbles', status: 'upcoming', notes: 'Bubble blower machine runs while kids pop bubbles with star wands' },
  { id: 'lay-seg-5', order: 5, title: 'Playdough Star Shapes & Smiles', plannedStartTime: '09:17 AM', durationMinutes: 15, assignedLead: 'Helper Team', assignedRole: '4 Helpers', status: 'upcoming', notes: 'Non-toxic yellow playdough star cookie cutters' },
  { id: 'lay-seg-6', order: 6, title: 'Sippy Cup & Teething Biscuit Break', plannedStartTime: '09:32 AM', durationMinutes: 15, assignedLead: 'Aunty Mary', assignedRole: 'Hospitality', status: 'upcoming', notes: 'Individual labelled bottles and water break' },
  { id: 'lay-seg-7', order: 7, title: 'Lullaby Blessing & Quiet Time Mat', plannedStartTime: '09:47 AM', durationMinutes: 10, assignedLead: 'Uncle David', assignedRole: 'Teacher', status: 'upcoming', notes: 'Dim lights slightly, soft lullaby playing' },
  { id: 'lay-seg-8', order: 8, title: 'Guardian Pickup & Sticker Handoff', plannedStartTime: '09:57 AM', durationMinutes: 15, assignedLead: 'Nomsa', assignedRole: 'Comms', status: 'upcoming', notes: 'Strict pickup tag matching at door gate' },
];

const LA_YELLOW_CHECKLIST: PreServiceCheckItem[] = [
  { id: 'lay-chk-1', label: 'Safety Gate & Double Latch', statusText: 'Securely Bolted', isChecked: true, category: 'hardware' },
  { id: 'lay-chk-2', label: 'Soft EVA Foam Flooring', statusText: 'Sanitized & Clean', isChecked: true, category: 'hardware' },
  { id: 'lay-chk-3', label: 'Automatic Bubble Machine', statusText: 'Fluid Loaded & Tested', isChecked: true, category: 'hardware' },
  { id: 'lay-chk-4', label: 'Felt Storyboard & Star Pieces', statusText: 'Complete (12 pieces)', isChecked: true, category: 'general' },
  { id: 'lay-chk-5', label: 'Bluetooth Lullaby Speaker', statusText: 'Volume Set to 40%', isChecked: true, category: 'audio' },
  { id: 'lay-chk-6', label: 'Diaper Station Stocked', statusText: 'Wipes, Gloves & Liners', isChecked: true, category: 'general' },
  { id: 'lay-chk-7', label: 'Emergency Parent Alert Buzzer', statusText: 'Battery Good', isChecked: true, category: 'audio' },
];

const LA_YELLOW_WORSHIP: WorshipSong[] = [
  { id: 'lay-song-1', order: 1, title: 'This Little Light of Mine', artist: 'Precious Moments Kids', duration: '02:15', durationSeconds: 135, isPlaying: false, bpm: 105 },
  { id: 'lay-song-2', order: 2, title: 'God is So Good (Sweet Lullaby)', artist: 'Cedarmont Baby', duration: '03:00', durationSeconds: 180, isPlaying: true, bpm: 60 },
  { id: 'lay-song-3', order: 3, title: 'Praise Him, Praise Him All Ye Little Children', artist: 'Sunday School Song', duration: '02:20', durationSeconds: 140, isPlaying: false, bpm: 85 },
];

const LA_YELLOW_LESSON: LessonNotesData = {
  title: 'God Made Me Special: You Shine Like a Star!',
  mainScripture: 'Psalm 139:14',
  keyPoint: 'God made your eyes, your smile, and your hands. You are loved!',
  memoryVerse: 'Psalm 139:14 "I praise you because I am fearfully and wonderfully made."',
  illustrationGame: 'Where is Your Nose? Where are Your Hands? Game with hand mirrors and star stickers',
  slidesCount: 8,
  notes: [
    'Keep sentences short, repeating: "Jesus loves you!"',
    'Lots of smiles and clapping for encouragement.',
    'Use the bubble machine as a delightful reward transition.',
  ],
};

// -------------------------------------------------------------
// DEFAULT CLASS HUBS DICTIONARY
// -------------------------------------------------------------
export function createDefaultClassHubData(classId: ClassId): ClassHubData {
  switch (classId) {
    case 'jy':
      return {
        classId: 'jy',
        serviceState: {
          serviceId: 'srv-jy-live',
          serviceName: 'Junior Youth Hub (Blue Class)',
          date: 'Sunday Service / Dream Week',
          theme: 'Identity & Purpose: Anchored in Christ',
          currentSegmentId: 'jy-seg-3',
          targetEndTime: makeInitialTargetEndTime(4 * 60 + 15),
          targetDurationSeconds: 10 * 60,
          isPaused: false,
          lastUpdated: new Date().toISOString(),
          currentSlideIndex: 4,
          totalSlides: 22,
          activeWorshipSongId: 'jy-song-2',
          isEmergencyActive: false,
          activeEmergencyType: null,
        },
        segments: JY_SEGMENTS,
        checklist: JY_CHECKLIST,
        worshipQueue: JY_WORSHIP,
        activeCues: [],
        incidents: [
          { id: 'jy-inc-1', time: '08:42 AM', description: 'Wireless Handheld 3 audio crackle (swapped receiver channel)', status: 'resolved', severity: 'medium', resolvedAt: '08:45 AM', reportedBy: 'Thabo (Tech)' }
        ],
        lessonNotes: JY_LESSON,
        teamMembers: [
          { id: 'jy-tm-1', name: 'Pastor Hope', roleTitle: 'Youth Director', roleType: 'admin', avatarColor: 'from-amber-500 to-orange-600', isOnline: true },
          { id: 'jy-tm-2', name: 'Thabo', roleTitle: 'Tech & AV Lead', roleType: 'tech', avatarColor: 'from-blue-500 to-cyan-600', isOnline: true },
          { id: 'jy-tm-3', name: 'Sarah', roleTitle: 'Worship Lead', roleType: 'tech', avatarColor: 'from-pink-500 to-rose-600', isOnline: true },
          { id: 'jy-tm-4', name: 'Nomsa', roleTitle: 'Comms / MC', roleType: 'comms', avatarColor: 'from-emerald-500 to-teal-600', isOnline: true },
        ],
        reviewData: {
          ratings: { equipment: 5, timing: 4, communication: 5, kidsEngagement: 5, holySpiritFlow: 5, overall: 5 },
          whatWentWell: 'Teens engaged intensely during life group discussions; great acoustic worship response.',
          notes: 'Prepare extra discussion question sheets for next week.',
        },
        prayerRequests: [
          { id: 'jy-pr-1', author: 'Thabo', text: 'Peace and focus for Grade 7s going through mid-year exams', timestamp: '08:10 AM', isAnswered: false, category: 'kids' },
        ],
      };

    case 'tb':
      return {
        classId: 'tb',
        serviceState: {
          serviceId: 'srv-tb-live',
          serviceName: 'TRAILBLAZERS Hub (Pink Class)',
          date: 'Sunday Service / Dream Week',
          theme: 'Courage in the Wild: Armor of God',
          currentSegmentId: 'tb-seg-3',
          targetEndTime: makeInitialTargetEndTime(5 * 60 + 20),
          targetDurationSeconds: 10 * 60,
          isPaused: false,
          lastUpdated: new Date().toISOString(),
          currentSlideIndex: 3,
          totalSlides: 19,
          activeWorshipSongId: 'tb-song-2',
          isEmergencyActive: false,
          activeEmergencyType: null,
        },
        segments: TB_SEGMENTS,
        checklist: TB_CHECKLIST,
        worshipQueue: TB_WORSHIP,
        activeCues: [],
        incidents: [],
        lessonNotes: TB_LESSON,
        teamMembers: [
          { id: 'tb-tm-1', name: 'Lebo', roleTitle: 'Lead Presenter', roleType: 'presenter', avatarColor: 'from-purple-500 to-indigo-600', isOnline: true },
          { id: 'tb-tm-2', name: 'Nomsa', roleTitle: 'Comms Coordinator', roleType: 'comms', avatarColor: 'from-emerald-500 to-teal-600', isOnline: true },
          { id: 'tb-tm-3', name: 'Sarah', roleTitle: 'Praise Captain', roleType: 'tech', avatarColor: 'from-pink-500 to-rose-600', isOnline: true },
        ],
        reviewData: {
          ratings: { equipment: 4, timing: 5, communication: 5, kidsEngagement: 5, holySpiritFlow: 4, overall: 5 },
          whatWentWell: 'Squad cheer competitions brought unbelievable excitement to scripture reading!',
          notes: 'Cardboard armor needs fresh Velcro straps for next service.',
        },
        prayerRequests: [
          { id: 'tb-pr-1', author: 'Nomsa', text: 'Kids to develop daily personal Bible reading habits', timestamp: '08:20 AM', isAnswered: true, category: 'kids' },
        ],
      };

    case 'la-orange':
      return {
        classId: 'la-orange',
        serviceState: {
          serviceId: 'srv-lao-live',
          serviceName: 'Little Adventures Orange Hub',
          date: 'Sunday Service / Dream Week',
          theme: 'Gods Great Big World: Noahs Ark',
          currentSegmentId: 'lao-seg-3',
          targetEndTime: makeInitialTargetEndTime(6 * 60 + 10),
          targetDurationSeconds: 15 * 60,
          isPaused: false,
          lastUpdated: new Date().toISOString(),
          currentSlideIndex: 5,
          totalSlides: 14,
          activeWorshipSongId: 'lao-song-2',
          isEmergencyActive: false,
          activeEmergencyType: null,
        },
        segments: LA_ORANGE_SEGMENTS,
        checklist: LA_ORANGE_CHECKLIST,
        worshipQueue: LA_ORANGE_WORSHIP,
        activeCues: [],
        incidents: [],
        lessonNotes: LA_ORANGE_LESSON,
        teamMembers: [
          { id: 'lao-tm-1', name: 'Aunty Grace', roleTitle: 'Lead Storyteller', roleType: 'presenter', avatarColor: 'from-orange-500 to-amber-600', isOnline: true },
          { id: 'lao-tm-2', name: 'Nomsa', roleTitle: 'Comms & Safety', roleType: 'comms', avatarColor: 'from-emerald-500 to-teal-600', isOnline: true },
        ],
        reviewData: {
          ratings: { equipment: 5, timing: 5, communication: 5, kidsEngagement: 5, holySpiritFlow: 5, overall: 5 },
          whatWentWell: 'Rainbow craft cards were a massive hit with both children and parents!',
          notes: 'Restock apple juice boxes for next Sunday.',
        },
        prayerRequests: [
          { id: 'lao-pr-1', author: 'Aunty Grace', text: 'Protection and joy for all the new 5-year-old first timers', timestamp: '08:15 AM', isAnswered: true, category: 'service' },
        ],
      };

    case 'la-yellow':
      return {
        classId: 'la-yellow',
        serviceState: {
          serviceId: 'srv-lay-live',
          serviceName: 'Little Adventures Yellow Hub',
          date: 'Sunday Service / Dream Week',
          theme: 'God Made Me Special: You Shine Like a Star!',
          currentSegmentId: 'lay-seg-3',
          targetEndTime: makeInitialTargetEndTime(4 * 60 + 40),
          targetDurationSeconds: 10 * 60,
          isPaused: false,
          lastUpdated: new Date().toISOString(),
          currentSlideIndex: 3,
          totalSlides: 8,
          activeWorshipSongId: 'lay-song-2',
          isEmergencyActive: false,
          activeEmergencyType: null,
        },
        segments: LA_YELLOW_SEGMENTS,
        checklist: LA_YELLOW_CHECKLIST,
        worshipQueue: LA_YELLOW_WORSHIP,
        activeCues: [],
        incidents: [],
        lessonNotes: LA_YELLOW_LESSON,
        teamMembers: [
          { id: 'lay-tm-1', name: 'Uncle David', roleTitle: 'Toddler Care & Music', roleType: 'presenter', avatarColor: 'from-yellow-500 to-amber-600', isOnline: true },
          { id: 'lay-tm-2', name: 'Aunty Mary', roleTitle: 'Nursery Lead', roleType: 'admin', avatarColor: 'from-rose-500 to-pink-600', isOnline: true },
        ],
        reviewData: {
          ratings: { equipment: 5, timing: 5, communication: 5, kidsEngagement: 4, holySpiritFlow: 5, overall: 5 },
          whatWentWell: 'Bubble parade brought smiles and stopped all separation crying instantly!',
          notes: 'Order more non-toxic yellow playdough tubs.',
        },
        prayerRequests: [
          { id: 'lay-pr-1', author: 'Uncle David', text: 'Health and peaceful sleep for all our toddlers', timestamp: '08:05 AM', isAnswered: true, category: 'kids' },
        ],
      };

    case 'kb':
    default:
      return {
        classId: 'kb',
        serviceState: {
          serviceId: 'srv-kb-live',
          serviceName: 'Kingdom Builders Hub (Red Class)',
          date: 'Sunday Service / Dream Week',
          theme: 'Bigger Together: David & Goliath',
          currentSegmentId: 'kb-seg-3',
          targetEndTime: makeInitialTargetEndTime(3 * 60 + 42),
          targetDurationSeconds: 15 * 60,
          isPaused: false,
          lastUpdated: new Date().toISOString(),
          currentSlideIndex: 14,
          totalSlides: 23,
          activeWorshipSongId: 'kb-song-2',
          isEmergencyActive: false,
          activeEmergencyType: null,
        },
        segments: KB_SEGMENTS,
        checklist: KB_CHECKLIST,
        worshipQueue: KB_WORSHIP,
        activeCues: [],
        incidents: [
          { id: 'kb-inc-1', time: '08:43 AM', description: 'Mic 2 battery low (< 20%)', status: 'resolved', severity: 'medium', resolvedAt: '08:46 AM', reportedBy: 'Thabo (Tech)' },
          { id: 'kb-inc-2', time: '09:02 AM', description: 'HDMI switched to backup port 2', status: 'resolved', severity: 'low', resolvedAt: '09:03 AM', reportedBy: 'Thabo (Tech)' },
        ],
        lessonNotes: KB_LESSON,
        teamMembers: [
          { id: 'kb-tm-1', name: 'Pastor Hope', roleTitle: 'Kids Ministry Director', roleType: 'admin', avatarColor: 'from-amber-500 to-orange-600', isOnline: true },
          { id: 'kb-tm-2', name: 'Lebo', roleTitle: 'Lesson Presenter', roleType: 'presenter', avatarColor: 'from-purple-500 to-indigo-600', isOnline: true },
          { id: 'kb-tm-3', name: 'Sarah', roleTitle: 'Worship Leader', roleType: 'tech', avatarColor: 'from-pink-500 to-rose-600', isOnline: true },
          { id: 'kb-tm-4', name: 'Nomsa', roleTitle: 'Communications Lead', roleType: 'comms', avatarColor: 'from-emerald-500 to-teal-600', isOnline: true },
          { id: 'kb-tm-5', name: 'Thabo', roleTitle: 'Tech & Systems Master', roleType: 'tech', avatarColor: 'from-blue-500 to-cyan-600', isOnline: true },
        ],
        reviewData: {
          ratings: { equipment: 5, timing: 4, communication: 5, kidsEngagement: 5, holySpiritFlow: 5, overall: 5 },
          whatWentWell: 'The worship time was powerful! Kids recited memory verse with high enthusiasm.',
          notes: 'Recommend charging backup wireless mic batteries on Saturday evening.',
        },
        prayerRequests: [
          { id: 'kb-pr-1', author: 'Pastor Hope', text: 'Wisdom for next session leaders & energy for volunteers', timestamp: '08:15 AM', isAnswered: false, category: 'team' },
          { id: 'kb-pr-2', author: 'Nomsa', text: 'More volunteers for Sunday check-in desks', timestamp: '08:45 AM', isAnswered: false, category: 'service' },
          { id: 'kb-pr-3', author: 'Sarah', text: 'Kids to encounter Jesus deeply during worship today', timestamp: '09:05 AM', isAnswered: true, category: 'kids' },
        ],
      };
  }
}

export function createBlankClassHubData(classId: ClassId): ClassHubData {
  const conf = CLASSES_CONFIG.find((c) => c.id === classId) || CLASSES_CONFIG[0];
  return {
    classId,
    serviceState: {
      serviceId: `srv-${classId}`,
      serviceName: `${conf.name} Hub`,
      date: '',
      theme: '',
      currentSegmentId: null,
      targetEndTime: null,
      targetDurationSeconds: 0,
      isPaused: false,
      lastUpdated: new Date().toISOString(),
      currentSlideIndex: 0,
      totalSlides: 0,
      activeWorshipSongId: null,
      isEmergencyActive: false,
      activeEmergencyType: null,
    },
    segments: [], // Clean blank state: Class Admin creates timeline progress
    checklist: [], // Clean blank state: Class Admin creates tech checklist
    worshipQueue: [],
    activeCues: [],
    incidents: [],
    lessonNotes: {
      title: '',
      mainScripture: '',
      keyPoint: '',
      memoryVerse: '',
      illustrationGame: '',
      slidesCount: 0,
      notes: [],
    },
    teamMembers: [],
    reviewData: {
      ratings: { equipment: 0, timing: 0, communication: 0, kidsEngagement: 0, holySpiritFlow: 0, overall: 0 },
      whatWentWell: '',
      notes: '',
    },
    prayerRequests: [],
  };
}

export function getAllDefaultClassHubs(): Record<ClassId, ClassHubData> {
  return {
    jy: createBlankClassHubData('jy'),
    tb: createBlankClassHubData('tb'),
    kb: createBlankClassHubData('kb'),
    'la-orange': createBlankClassHubData('la-orange'),
    'la-yellow': createBlankClassHubData('la-yellow'),
    all: createBlankClassHubData('kb'), // fallback base
  };
}

