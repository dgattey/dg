import type { RenderableBook } from '../contentful/renderables/books';

const thumb = (path: string, width: number, height: number) => ({
  height,
  url: `https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/${path}`,
  width,
});

/** Curated fallback book shelf from Goodreads export (2023–2026 finished reads). */
export const FALLBACK_BOOKS: ReadonlyArray<RenderableBook> = [
  {
    author: 'Oprah Winfrey',
    id: 'goodreads-0',
    rating: 4,
    readDateFinished: '2026-09-16T00:00:00Z',
    readingStatus: 'read',
    review:
      'My gut reaction was negativity - too much religion, too much God, too much woo woo. But I stepped back and thought more deeply about the message and not the medium. Oprah pulled together some diverse, intelligent people and crafted a simple yet profound statement of compassion and positivity. The quotes and her thoughts wove a beautiful statement to life and living it righteously. Loved the read. Be happy, be positive, and be the best you can be. It’s all in your hands!',
    thumbnail: thumb('1534271483l/40607235.jpg', 318, 393),
    title: "The Path Made Clear: Discovering Your Life's Direction and Purpose",
  },
  {
    author: 'Allen Levi',
    id: 'goodreads-3',
    rating: 4,
    readDateFinished: '2026-09-05T00:00:00Z',
    readingStatus: 'read',
    review:
      'Inspiring and heartwarming. Theo was a lovely human, full of care for others and giving to the world around him. Love the twist at the end but kinda saw it coming. I loved the vignettes of each life he touched. Only downside was being able to tell that a male author was writing some of the female descriptors but not a significant detractor.',
    thumbnail: thumb('1761744192l/242376245.jpg', 579, 900),
    title: 'Theo of Golden',
  },
  {
    author: 'Ben Wilson',
    id: 'goodreads-1',
    rating: 4,
    readDateFinished: '2026-07-15T00:00:00Z',
    readingStatus: 'read',
    review:
      'A lovely read about nature and the city and urban development over time. Quite fascinating to read about how parks came to be, how Victorians thought about nature, why Bangalore is so green, etc. I’d highly recommend, despite a lack of clear thesis beyond all the snapshots of urban greenery.',
    thumbnail: thumb('1660050948l/61285361.jpg', 263, 400),
    title: 'Urban Jungle: The History and Future of Nature in the City',
  },
  {
    author: 'Amanda Montell',
    id: 'goodreads-2',
    rating: 3,
    readDateFinished: '2026-02-10T00:00:00Z',
    readingStatus: 'read',
    review:
      'Too much like a podcast transcription to enjoy this incredibly. The concept was intriguing and examples informative but the arguments throughout kept returning to the same tropes and themes without adding much new. Enjoyed the read but felt myself wanting it to be over before I reached the end. Simplistic language didn’t help.',
    thumbnail: thumb('1762247387l/55338982.jpg', 1000, 1500),
    title: 'Cultish: The Language of Fanaticism',
  },
  {
    author: 'Min Jin Lee',
    id: 'goodreads-4',
    rating: 5,
    readDateFinished: '2025-12-26T00:00:00Z',
    readingStatus: 'read',
    review: null,
    thumbnail: thumb('1766879949l/34051011.jpg', 987, 1500),
    title: 'Pachinko',
  },
  {
    author: 'Frank Herbert',
    id: 'goodreads-5',
    rating: 5,
    readDateFinished: '2025-01-04T00:00:00Z',
    readingStatus: 'read',
    review:
      'Wow, what an epic. The scale of the universe Frank Herbert crafted into one novel is incredible. Couldn’t put it down. Rich with meaning, metaphor, and complexities of being human, I loved the dialogue and descriptions of how people noticed those around them, picked up hidden meanings, and communicated through more than just their words. Ready to read the next one.',
    thumbnail: thumb('1555447414l/44767458.jpg', 316, 475),
    title: 'Dune',
  },
  {
    author: 'Shehan Karunatilaka',
    id: 'goodreads-24',
    rating: 4,
    readDateFinished: '2024-09-14T00:00:00Z',
    readingStatus: 'read',
    review:
      "Entertaining, colorful in description and character development, and quite funny. I loved the underworld metaphors, learning about Maali and his flaws and deep passion for lifting up the unseen. And I learned far more than I ever thought I would about Sri Lanka and the wars its endured. A clever, easy-to-read book, I'd recommend.",
    thumbnail: thumb('1658847734l/57224204.jpg', 500, 804),
    title: 'The Seven Moons of Maali Almeida',
  },
  {
    author: 'Hanya Yanagihara',
    id: 'goodreads-25',
    rating: 2,
    readDateFinished: '2024-03-05T00:00:00Z',
    readingStatus: 'read',
    review:
      "This was a slog. I'd heard such great things about Yanagihara's writing but it was impossible to get interested in the characters, the writing, or the plot. The three separate sections spanning lifetimes and alternate worlds held minimal connections beyond the confusingly, similarly-named characters. The dialogue was complex and uninteresting. I'm not sure why people like this book.",
    thumbnail: thumb('1628100349l/57739876.jpg', 879, 1349),
    title: 'To Paradise',
  },
  {
    author: 'Andy Weir',
    id: 'goodreads-13',
    rating: 2,
    readDateFinished: '2024-01-28T00:00:00Z',
    readingStatus: 'read',
    review:
      'Entertaining story, but wow was it over-sexualized. The internal dialogue and conversations were as stereotypical as you can get with an awkward dude writing what he thinks women are thinking. Cringey as it gets. Unfortunately, it detracted from an interesting premise and somewhat engaging if implausible plot. Much of the writing and dialogue felt childish and basic too. The jokes in the Martian were at least thematic with the geekiness of Watney, but here they didn’t match Jazz’s personality at all. You also had all the standard tropes - tough Marine, hard on his daughter but loving immigrant father, awkward budding love interest, etc. And Jazz was the town tramp. Really? So unimaginative and sexist.\n\nOverall, entertaining, but shockingly poorly written. Weir should stick to writing men’s internal dialogues, not women’s.',
    thumbnail: thumb('1776234222l/34928122.jpg', 987, 1500),
    title: 'Artemis',
  },
  {
    author: 'Eleanor Catton',
    id: 'goodreads-26',
    rating: 4,
    readDateFinished: '2024-01-28T00:00:00Z',
    readingStatus: 'read',
    review:
      'What a page turner! I love the concept, the way the characters interact, multiple stories becoming one, and the lush detail. There’s something about how the mundane details (like “he grabbed the mug, wiping the rivulets of morning dew off the slick wall”) paint a very conceivable picture. I couldn’t put it down. Very up on current events, how tech takes over our lives in this decade, and knowledgeable about cultivation and horticulture. And yet there was always something surface level - I don’t feel like we knew the characters on a deep level. And the ending was meh compared to the creative beginnings.',
    thumbnail: thumb('1653578326l/60784757.jpg', 333, 499),
    title: 'Birnam Wood',
  },
  {
    author: 'Ayanna Lloyd Banwo',
    id: 'goodreads-17',
    rating: 5,
    readDateFinished: '2024-01-26T00:00:00Z',
    readingStatus: 'read',
    review:
      'I don’t know what to write about this fascinating novel. I so enjoyed the magical realism, the way the story wove and ran throughout the world, the darkness threatening all that was good, life and death as the currents of the world. Just a magical experience. A very enjoyable read with a satisfying albeit predictable conclusion.',
    thumbnail: thumb('1629822465l/58065031.jpg', 265, 400),
    title: 'When We Were Birds',
  },
  {
    author: 'Alice Walker',
    id: 'goodreads-27',
    rating: 5,
    readDateFinished: '2024-01-25T00:00:00Z',
    readingStatus: 'read',
    review:
      'Cellie’s resilience and grace against the vast abuse she suffered from pretty much every man in her life (and quite a few women too) made me tear up. Poor Cellie. But she didn’t need pity. Her strength was incredible to bear. And Shug, her sister, the missionaries, all developed in such deep detail. I won’t spoil it but I’m glad she became the person she became. I was rooting for her so hard. Beautifully written.',
    thumbnail: thumb('1703084419l/52892857.jpg', 3188, 4800),
    title: 'The Color Purple',
  },
  {
    author: 'Liu Cixin',
    id: 'goodreads-28',
    rating: 3,
    readDateFinished: '2023-12-26T00:00:00Z',
    readingStatus: 'read',
    review:
      "I walked away a little disappointed with the depth of this book compared to the fascinating premise. There just wasn’t much there, and every detail there was just focused on war outside the awesome virtual world bit. It was great disconnected ideas that didn’t mesh up into a satisfying ending. There’s also a clear bias towards China, Europe/US is painted in an overly negative light (but honestly might be accurate in the situation) and nary a mention of Africa. There's also only two female characters and one of them is described as Shirley-Temple-like. Stick to the Three Body Problem instead.",
    thumbnail: thumb('1546439094l/43263225.jpg', 313, 475),
    title: 'Supernova Era',
  },
  {
    author: 'Sara Gruen',
    id: 'goodreads-34',
    rating: 4,
    readDateFinished: '2023-12-20T00:00:00Z',
    readingStatus: 'read',
    review:
      'Pretty great! The dialogue was cheesy but otherwise a creative epic about a life well remembered, from the nursing home. Elephants, mystery, circus life, all of it well described and vivid in imagination. A fun read, and I wanted more.',
    thumbnail: thumb('1667708346l/43641.jpg', 314, 475),
    title: 'Water for Elephants',
  },
  {
    author: 'Isabel Allende',
    id: 'goodreads-35',
    rating: 4,
    readDateFinished: '2023-12-03T00:00:00Z',
    readingStatus: 'read',
    review:
      'I’m glad I read this as a followup to Eva Luna before the context escaped me. It was a bit befuddling to jump around in time and place, but the same characters and similar themes grounded the reader. Absolutely loved El Benefactor’s Summer Palace getting swallowed by the jungle. Amazing imagery and wording, as is par for the course with Isabelle Allende. Great read.',
    thumbnail: thumb('1439782373l/3291.jpg', 309, 475),
    title: 'The Stories of Eva Luna',
  },
  {
    author: 'Isabel Allende',
    id: 'goodreads-36',
    rating: 4,
    readDateFinished: '2023-10-11T00:00:00Z',
    readingStatus: 'read',
    review:
      'Put this down for awhile between August and October, but for no real good reason. It was a great read! Very vivid vignettes weaved together through Eva’s childhood into her teens and beyond, full of embellished fantasies and above all, good stories. It was an author writing about writing in all the best ways. One star off for not enough magical realism and too muddy a story with Rolf but overall a great read.',
    thumbnail: thumb('1478631242l/149196.jpg', 289, 475),
    title: 'Eva Luna',
  },
  {
    author: 'Mosab Abu Toha',
    id: 'goodreads-33',
    rating: 3,
    readDateFinished: '2023-10-06T00:00:00Z',
    readingStatus: 'read',
    review:
      'I’m not one to read poetry often but it was a beautiful and heart wrenching view into life in a war zone and how much you try to keep it together any way you can. More of a collection of vignettes than anything but insightful and vivid. I don’t think I have the patience for poetry.',
    thumbnail: thumb('1634722531l/59418414.jpg', 1600, 2240),
    title: 'Things You May Find Hidden in My Ear: Poems from Gaza',
  },
  {
    author: 'Robin DiAngelo',
    id: 'goodreads-37',
    rating: 4,
    readDateFinished: '2023-09-12T00:00:00Z',
    readingStatus: 'read',
    review: 'I learned a ton - but it’s a very deep learning, hard to read a ton in one sitting.',
    thumbnail: thumb('1614966481l/43708708.jpg', 750, 750),
    title: "White Fragility: Why It's So Hard for White People to Talk About Racism",
  },
  {
    author: 'E.M. Forster',
    id: 'goodreads-32',
    rating: 2,
    readDateFinished: '2023-07-18T00:00:00Z',
    readingStatus: 'read',
    review:
      'I’m left dissatisfied with this book, despite feeling like it was an Important Read. The dialogue and philosophy was what mattered, not the exact plot, but the conclusion felt too much like “India is uncivilized and savage” for my taste. Too much imperialism, even in its overt critique of it. Maybe it was more nuanced in 1924 when written, but it felt vaguely off the whole time and was a slog of a read. Lacking energy and anything captivating. Still worthwhile somehow, but I was disappointed by the overall message. And poor Aziz, I’m glad he kept his dignity in the end.',
    thumbnail: thumb('1421883612l/45195.jpg', 311, 475),
    title: 'A Passage to India',
  },
  {
    author: 'Miguel Ángel Asturias',
    id: 'goodreads-31',
    rating: 2,
    readDateFinished: '2023-07-16T00:00:00Z',
    readingStatus: 'read',
    review:
      'Arcane language and tone made this super tough to get through. It felt like a strong satire of machismo government in Latin America for sure, but it was bleak and cold. I found it hard to follow individual characters, and the narration was exceedingly muddy. But maybe that’s the point. The machine of corruption and bureaucracy grinds up everyone into nothingness in service of the strongman. I think this book would be much better if read for a class/in a setting to fully dissect it. But it reads like it was written in 1924. Which it was.',
    thumbnail: thumb('1565038089l/73723.jpg', 300, 475),
    title: 'The President',
  },
  {
    author: 'Douglas Adams',
    id: 'goodreads-52',
    rating: 4,
    readDateFinished: '2023-07-05T00:00:00Z',
    readingStatus: 'read',
    review:
      'Entertaining and wildly weird but it reads like a radio show, as it was originally written. Funny but trying a bit too hard. I was hoping for a bit more complexity than the simple descriptions and plots given. Looking forward to reading more of these.',
    thumbnail: thumb('1531891848l/11.jpg', 283, 475),
    title: "The Hitchhiker's Guide to the Galaxy",
  },
  {
    author: 'Susanna Clarke',
    id: 'goodreads-68',
    rating: 4,
    readDateFinished: '2023-07-04T00:00:00Z',
    readingStatus: 'read',
    review:
      'Beautiful, mystical, and mysterious. I’m left not really knowing what to conclude, but it was a delight to plunge into the depths of the Halls and see the Statues in their magnificence. A read for a cozy, whimsical day.',
    thumbnail: thumb('1773750050l/50202953.jpg', 318, 480),
    title: 'Piranesi',
  },
  {
    author: 'Chimamanda Ngozi Adichie',
    id: 'goodreads-18',
    rating: 5,
    readDateFinished: '2023-07-02T00:00:00Z',
    readingStatus: 'read',
    review:
      'Writing anything myself about this incredible novel will fall short, failing to capture the majesty, the emotion, the snapshot of life present in its pages. Simply put, one of the best books I’ve ever read. Impossible to put down. I felt like I was part of the crowd myself, on the streets of Nigeria, New York, New Haven, part of Ifem’s life. Adichie writes like she’s letting you in on a secret the whole time, allowing you to peek into the laid-bare minds of Ifemelu or Dike or Obinze. She makes me wish I could describe and artfully weave in dialogue half as well as her.\n\nThere’s so much said, hidden behind simile and vignettes about race in America, living without belonging 100% to any culture. Characters are flawed and Ifem isn’t always likable. It just leaves me liking the story even more.\n\nRead it. It’s beautiful.',
    thumbnail: thumb('1356654499l/15796700.jpg', 318, 472),
    title: 'Americanah',
  },
];
