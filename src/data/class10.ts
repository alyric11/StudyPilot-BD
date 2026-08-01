import { Subject, Chapter } from "./curriculum";

// Helper to construct Chapter objects consistently
function createChapter(
  id: string,
  chapterNumber: string,
  name: string,
  banglaName: string,
  shortDescription: string,
  classLevel: string,
  group: string,
  subject: string,
  bookName: string
): Chapter {
  return {
    id,
    chapterNumber,
    name,
    banglaName,
    shortDescription,
    class: classLevel,
    group,
    subject,
    nctbBookName: bookName
  };
}

const CLASS_NAME = "Class 10";

export const class10Subjects = (group: string): Subject[] => {
  const isScience = group === "Science";
  const isBusiness = group === "Business Studies";
  const isHumanities = group === "Humanities";

  const subjectsList: Subject[] = [];

  // 1. Bangla (Compulsory / SSC Prep)
  subjectsList.push({
    id: "bangla_1",
    name: "Bangla 1st Paper",
    banglaName: "বাংলা ১ম পত্র (এসএসসি)",
    color: "from-emerald-500 to-emerald-600",
    chapters: [
      createChapter("b1_10_ch1", "Chapter 1", "Sohag and Kobir", "শোভা ও কপোতাক্ষ নদ", "Reading classic literature and modern poetic blocks including Michael Madhusudan Dutt's sonnets.", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 10 Bangla Board Book"),
      createChapter("b1_10_ch2", "Chapter 2", "Manusher Golpo", "মানুষের গল্প ও নাটক", "Comprehensive revision of humanistic essays, stories, and the main book drama Kaktarua.", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 10 Bangla Board Book")
    ]
  });

  subjectsList.push({
    id: "bangla_2",
    name: "Bangla 2nd Paper",
    banglaName: "বাংলা ২য় পত্র (ব্যাকরণ)",
    color: "from-teal-500 to-emerald-700",
    chapters: [
      createChapter("b2_10_ch1", "Chapter 4", "Parts of Speech in Bangla", "পদ প্রকরণ", "Classification of nouns, adjectives, pronouns, verbs, and indeclinables in Bangla.", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 10 Bangla Bhyakoron"),
      createChapter("b2_10_ch2", "Chapter 5", "Sentences and Idioms", "বাক্য ও প্রবাদ-প্রবচন", "Types of sentences, voice changes, syntax layout, and key Bengali idioms for board exams.", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 10 Bangla Bhyakoron")
    ]
  });

  // 2. English (Compulsory / SSC Prep)
  subjectsList.push({
    id: "english_1",
    name: "English 1st Paper",
    banglaName: "ইংরেজি ১ম পত্র",
    color: "from-blue-500 to-indigo-600",
    chapters: [
      createChapter("e1_10_ch1", "Chapter 4", "Words in Action", "Words in Action", "Using context clues and figurative language to decipher text themes.", CLASS_NAME, group, "English 1st Paper", "NCTB Class 10 English For Today"),
      createChapter("e1_10_ch2", "Chapter 5", "SSC Mock Practice & Writing", "SSC Writing & Practice", "Constructing formal emails, cover letters, essays, and summarizing visual graphs.", CLASS_NAME, group, "English 1st Paper", "NCTB Class 10 English For Today")
    ]
  });

  subjectsList.push({
    id: "english_2",
    name: "English 2nd Paper",
    banglaName: "ইংরেজি ২য় পত্র",
    color: "from-indigo-600 to-blue-700",
    chapters: [
      createChapter("e2_10_ch1", "Chapter 3", "Sentence Transformation & Voice", "Sentence Transformation", "Converting active to passive, changing degrees, and transforming affirmative to negative.", CLASS_NAME, group, "English 2nd Paper", "NCTB Class 10 English Grammar and Composition"),
      createChapter("e2_10_ch2", "Chapter 4", "Narration & Tag Questions", "Narration & Tags", "Direct and indirect narration rules, tag questions, and proper punctuation usage.", CLASS_NAME, group, "English 2nd Paper", "NCTB Class 10 English Grammar and Composition")
    ]
  });

  // 3. Mathematics (Compulsory / SSC Prep)
  subjectsList.push({
    id: "math",
    name: "Mathematics",
    banglaName: "সাধারণ গণিত (এসএসসি)",
    color: "from-yellow-500 to-amber-600",
    chapters: [
      createChapter("m_10_ch1", "Chapter 3", "Algebraic Formulas", "বীজগাণিতিক রাশি", "Expanding square and cubic equations, factorizations, and proving algebraic fractions.", CLASS_NAME, group, "Mathematics", "NCTB Class 10 General Mathematics"),
      createChapter("m_10_ch2", "Chapter 8", "Geometry Theorems", "ব্যবহারিক জ্যামিতি ও উপপাদ্য", "Circles, tangents, inscribed angles, and essential geometric theorems tested in board CQs.", CLASS_NAME, group, "Mathematics", "NCTB Class 10 General Mathematics"),
      createChapter("m_10_ch3", "Chapter 16", "Mensuration", "পরিমিতি", "Surface areas, volume calculations of prisms, spheres, cylinders, and cones.", CLASS_NAME, group, "Mathematics", "NCTB Class 10 General Mathematics"),
      createChapter("m_10_ch4", "Chapter 17", "Statistics", "পরিসংখ্যান", "Cumulative frequency, calculating mean, median, mode, and plotting histograms and ogives.", CLASS_NAME, group, "Mathematics", "NCTB Class 10 General Mathematics")
    ]
  });

  // 4. ICT (Compulsory / SSC Prep)
  subjectsList.push({
    id: "ict",
    name: "ICT",
    banglaName: "তথ্য ও যোগাযোগ প্রযুক্তি",
    color: "from-purple-500 to-violet-600",
    chapters: [
      createChapter("ict_10_ch1", "Chapter 3", "Internet in My Education", "আমার শিক্ষায় ইন্টারনেট", "How internet resources, e-books, e-learning models, and online classrooms empower students.", CLASS_NAME, group, "ICT", "NCTB Class 10 ICT Book"),
      createChapter("ict_10_ch2", "Chapter 4", "My Word Processor and Excel", "আমার লেখালেখি ও হিসাব", "Basic guides on MS Word, formatting text, insert operations, and formula operations in Excel.", CLASS_NAME, group, "ICT", "NCTB Class 10 ICT Book")
    ]
  });

  // 5. Religion (Compulsory)
  subjectsList.push({
    id: "religion",
    name: "Religion",
    banglaName: "ধর্ম ও নৈতিক শিক্ষা",
    color: "from-lime-500 to-green-600",
    chapters: [
      createChapter("r_10_ch1", "Chapter 3", "Ibadat", "ইবাদত", "Understanding Salah, Sawm, Zakat, Hajj, and their spiritual and social aspects.", CLASS_NAME, group, "Religion", "NCTB Class 10 Religion Book"),
      createChapter("r_10_ch2", "Chapter 4", "Akhlaq", "আখলাক", "Character building, moral excellence, and treating parents, neighbors, and citizens with duty.", CLASS_NAME, group, "Religion", "NCTB Class 10 Religion Book")
    ]
  });

  // 6. Bangladesh & Global Studies (Compulsory)
  subjectsList.push({
    id: "bgs",
    name: "Bangladesh & Global Studies",
    banglaName: "বাংলাদেশ ও বিশ্বপরিচয়",
    color: "from-orange-500 to-amber-600",
    chapters: [
      createChapter("bgs_10_ch1", "Chapter 3", "Solar System and Earth", "সৌরজগৎ ও আমাদের পৃথিবী", "Motions of earth, seasons, coordinates, international time zones, and tidal actions.", CLASS_NAME, group, "Bangladesh & Global Studies", "NCTB Class 10 BGS Book"),
      createChapter("bgs_10_ch2", "Chapter 4", "The Constitution of Bangladesh", "বাংলাদেশের সংবিধান ও রাষ্ট্রযন্ত্র", "History of the Bangladesh constitution, core organs of state, and democratic rights.", CLASS_NAME, group, "Bangladesh & Global Studies", "NCTB Class 10 BGS Book")
    ]
  });

  // 7. Physical Education, Career Education, and Arts & Crafts (Compulsory / Co-curricular)
  subjectsList.push({
    id: "pe",
    name: "Physical Education",
    banglaName: "শারীরিক শিক্ষা ও স্বাস্থ্য",
    color: "from-amber-400 to-orange-500",
    chapters: [
      createChapter("pe_10_ch1", "Chapter 2", "First Aid and Safety Rules", "প্রাথমিক চিকিৎসা ও নিরাপত্তা", "Handling sports fractures, burns, snakes bites, drowning, and safety precautions.", CLASS_NAME, group, "Physical Education", "NCTB Class 10 Physical Education")
    ]
  });

  subjectsList.push({
    id: "career",
    name: "Career Education",
    banglaName: "ক্যারিয়ার শিক্ষা",
    color: "from-sky-400 to-indigo-500",
    chapters: [
      createChapter("car_10_ch1", "Chapter 2", "Professional Ethics & Values", "পেশাদারী নীতি ও মূল্যবোধ", "Integrity, honesty, professionalism, and civic responsibility in future careers.", CLASS_NAME, group, "Career Education", "NCTB Class 10 Career Education")
    ]
  });

  subjectsList.push({
    id: "arts",
    name: "Arts & Crafts",
    banglaName: "চারু ও কারুকলা",
    color: "from-rose-400 to-pink-500",
    chapters: [
      createChapter("art_10_ch1", "Chapter 2", "Folk Art and Handicrafts", "লোকশিল্প ও হস্তশিল্প", "Pottery, Jamdani, Nakshi Kantha, wood carvings, and cottage industry craft history.", CLASS_NAME, group, "Arts & Crafts", "NCTB Class 10 Arts and Crafts")
    ]
  });

  // Group Specific Subjects
  if (isScience) {
    // Physics
    subjectsList.push({
      id: "physics",
      name: "Physics",
      banglaName: "পদার্থবিজ্ঞান (এসএসসি)",
      color: "from-cyan-500 to-blue-600",
      chapters: [
        createChapter("p_10_ch1", "Chapter 5", "Pressure & State of Matter", "পদার্থের অবস্থা ও চাপ", "Density, pressure in liquid, Archimedes' principle, atmospheric pressure, and elasticity.", CLASS_NAME, "Science", "Physics", "NCTB Class 10 Physics Book"),
        createChapter("p_10_ch2", "Chapter 7", "Waves and Sound", "তরঙ্গ ও শব্দ", "Simple harmonic motion, wave velocity, frequency, reflection of sound, and echoes.", CLASS_NAME, "Science", "Physics", "NCTB Class 10 Physics Book"),
        createChapter("p_10_ch3", "Chapter 8", "Reflection of Light", "আলোর প্রতিফলন", "Spherical mirrors, focal length, image formation rules, and real vs virtual images.", CLASS_NAME, "Science", "Physics", "NCTB Class 10 Physics Book"),
        createChapter("p_10_ch4", "Chapter 11", "Current Electricity", "চলতড়িৎ", "Ohm's law, electric circuit series/parallel, resistance, specific resistance, electrical power, and fuses.", CLASS_NAME, "Science", "Physics", "NCTB Class 10 Physics Book")
      ]
    });

    // Chemistry
    subjectsList.push({
      id: "chemistry",
      name: "Chemistry",
      banglaName: "রসায়ন (এসএসসি)",
      color: "from-pink-500 to-rose-600",
      chapters: [
        createChapter("c_10_ch1", "Chapter 5", "Chemical Bonds", "রাসায়নিক বন্ধন", "Valence electrons, ionic vs covalent bonds, octet rules, polar compounds, and crystal structures.", CLASS_NAME, "Science", "Chemistry", "NCTB Class 10 Chemistry Book"),
        createChapter("c_10_ch2", "Chapter 6", "Concept of Mole & Counting", "মোলের ধারণা ও রাসায়নিক গণনা", "Molar volumes, stoichiometric calculations, concentration, and limiting reactants.", CLASS_NAME, "Science", "Chemistry", "NCTB Class 10 Chemistry Book"),
        createChapter("c_10_ch3", "Chapter 7", "Chemical Reactions", "রাসায়নিক বিক্রিয়া", "Oxidation-reduction (redox), Le Chatelier's principle, and rates of reactions.", CLASS_NAME, "Science", "Chemistry", "NCTB Class 10 Chemistry Book"),
        createChapter("c_10_ch4", "Chapter 11", "Mineral Resources: Fossils", "খনিজ সম্পদ: জীবাশ্ম", "Alkanes, alkenes, alkynes, alcohols, organic acids, polymers, and synthetic plastics.", CLASS_NAME, "Science", "Chemistry", "NCTB Class 10 Chemistry Book")
      ]
    });

    // Biology
    subjectsList.push({
      id: "biology",
      name: "Biology",
      banglaName: "জীববিজ্ঞান (এসএসসি)",
      color: "from-green-500 to-emerald-600",
      chapters: [
        createChapter("bio_10_ch1", "Chapter 4", "Bioenergetics", "জীবনীশক্তি", "Photosynthesis (light-dependent and independent stages) and cellular respiration mechanics.", CLASS_NAME, "Science", "Biology", "NCTB Class 10 Biology Book"),
        createChapter("bio_10_ch2", "Chapter 5", "Food, Nutrition and Digestion", "খাদ্য, পুষ্টি এবং পরিপাক", "Human digestive system, mineral deficiencies in plants, BMI, and calorie needs.", CLASS_NAME, "Science", "Biology", "NCTB Class 10 Biology Book"),
        createChapter("bio_10_ch3", "Chapter 6", "Transport in Organisms", "জীবে পরিবহন", "Water absorption, transpiration, human circulatory system, blood group matching, and heart disease.", CLASS_NAME, "Science", "Biology", "NCTB Class 10 Biology Book")
      ]
    });

    // Higher Mathematics
    subjectsList.push({
      id: "higher_math",
      name: "Higher Mathematics",
      banglaName: "উচ্চতর গণিত (এসএসসি)",
      color: "from-orange-500 to-amber-600",
      chapters: [
        createChapter("hm_10_ch1", "Chapter 8", "Trigonometry", "ত্রিকোণমিতি", "Radian measures, sector area, trigonometric values, and general equations for board exams.", CLASS_NAME, "Science", "Higher Mathematics", "NCTB Class 10 Higher Math Book"),
        createChapter("hm_10_ch2", "Chapter 14", "Probability", "সম্ভাবনা", "Sample space, probability trees, coin tosses, card selection, and real-life statistics.", CLASS_NAME, "Science", "Higher Mathematics", "NCTB Class 10 Higher Math Book")
      ]
    });

    // Agriculture & Home Science (Optional Electives)
    subjectsList.push({
      id: "agriculture",
      name: "Agriculture",
      banglaName: "কৃষিশিক্ষা",
      color: "from-stone-500 to-lime-600",
      chapters: [
        createChapter("ag_10_ch1", "Chapter 3", "Agricultural Climate and Crop Seasons", "কৃষি জলবায়ু ও ফসলের মৌসুম", "Climate impacts, seasonal crops, drought management, and hydroponics.", CLASS_NAME, "Science", "Agriculture", "NCTB Class 10 Agriculture Book")
      ]
    });

    subjectsList.push({
      id: "home_science",
      name: "Home Science",
      banglaName: "গার্হস্থ্য বিজ্ঞান",
      color: "from-pink-400 to-purple-500",
      chapters: [
        createChapter("hs_10_ch1", "Chapter 4", "Home Decoration and Aesthetics", "গৃহ অলঙ্করণ ও নান্দনিকতা", "Principles of art in interior decoration, color combinations, and flower arrangements.", CLASS_NAME, "Science", "Home Science", "NCTB Class 10 Home Science Book")
      ]
    });
  }

  if (isBusiness) {
    // Accounting
    subjectsList.push({
      id: "accounting",
      name: "Accounting",
      banglaName: "হিসাববিজ্ঞান",
      color: "from-indigo-500 to-violet-600",
      chapters: [
        createChapter("acc_10_ch1", "Chapter 5", "Ledger", "খতিয়ান", "Concept of ledger, ledger accounts format (T-table vs continuous balance), and posting entries.", CLASS_NAME, "Business Studies", "Accounting", "NCTB Class 10 Accounting Book"),
        createChapter("acc_10_ch2", "Chapter 6", "Trial Balance", "রেওয়ামিল", "Rules of trial balance preparation, errors not detected by trial balance, and suspense accounts.", CLASS_NAME, "Business Studies", "Accounting", "NCTB Class 10 Accounting Book"),
        createChapter("acc_10_ch3", "Chapter 7", "Financial Statements", "আর্থিক বিবরণী", "Income statement, statement of financial position, cost of goods sold, and gross profit margins.", CLASS_NAME, "Business Studies", "Accounting", "NCTB Class 10 Accounting Book")
      ]
    });

    // Business Entrepreneurship
    subjectsList.push({
      id: "business_ent",
      name: "Business Entrepreneurship",
      banglaName: "ব্যবসায় উদ্যোগ",
      color: "from-sky-500 to-cyan-600",
      chapters: [
        createChapter("be_10_ch1", "Chapter 3", "Self-Employment", "আত্মকর্মসংস্থান", "Socio-economic value, scope in Bangladesh, training institutes, and micro-credits.", CLASS_NAME, "Business Studies", "Business Entrepreneurship", "NCTB Class 10 Business Entrepreneurship Book"),
        createChapter("be_10_ch2", "Chapter 4", "Ownership Forms of Business", "মালিকানার ভিত্তিতে ব্যবসায়", "Sole proprietorship, partnership, joint-stock, cooperatives, and state-owned enterprises.", CLASS_NAME, "Business Studies", "Business Entrepreneurship", "NCTB Class 10 Business Entrepreneurship Book")
      ]
    });

    // Finance and Banking
    subjectsList.push({
      id: "finance",
      name: "Finance & Banking",
      banglaName: "ফিন্যান্স ও ব্যাংকিং",
      color: "from-amber-500 to-yellow-600",
      chapters: [
        createChapter("fin_10_ch1", "Chapter 3", "Risk and Uncertainty", "ঝুঁকি ও অনিশ্চয়তা", "Standard deviation calculations, diversifications of risks, and capital budgeting factors.", CLASS_NAME, "Business Studies", "Finance & Banking", "NCTB Class 10 Finance Book"),
        createChapter("fin_10_ch2", "Chapter 4", "Commercial Banking", "বাণিজ্যিক ব্যাংক ও তার পরিচিতি", "Primary functions, credit creation, central bank relationships, and standard accounts.", CLASS_NAME, "Business Studies", "Finance & Banking", "NCTB Class 10 Finance Book")
      ]
    });

    // Economics
    subjectsList.push({
      id: "economics",
      name: "Economics",
      banglaName: "অর্থনীতি",
      color: "from-yellow-600 to-emerald-700",
      chapters: [
        createChapter("eco_10_ch1", "Chapter 3", "Utility, Demand, Supply and Equilibrium", "উপযোগ, চাহিদা, যোগান ও ভারসাম্য", "Law of diminishing marginal utility, demand and supply curves, and equilibrium price.", CLASS_NAME, "Business Studies", "Economics", "NCTB Class 10 Economics Book")
      ]
    });
  }

  if (isHumanities) {
    // Geography and Environment
    subjectsList.push({
      id: "geography",
      name: "Geography",
      banglaName: "ভূগোল ও পরিবেশ",
      color: "from-sky-500 to-teal-600",
      chapters: [
        createChapter("geo_10_ch1", "Chapter 4", "Internal and External Structure of Earth", "পৃথিবীর অভ্যন্তরীণ ও বাহ্যিক গঠন", "Layers of earth, rocks types, crust movements, earthquakes, and volcanic eruptions.", CLASS_NAME, "Humanities", "Geography", "NCTB Class 10 Geography Book"),
        createChapter("geo_10_ch2", "Chapter 5", "Atmosphere", "বায়ুমণ্ডল", "Structure of atmosphere, wind patterns, precipitation, humidity, and global warming impacts.", CLASS_NAME, "Humanities", "Geography", "NCTB Class 10 Geography Book")
      ]
    });

    // History of Bangladesh & World Civ
    subjectsList.push({
      id: "history",
      name: "History",
      banglaName: "বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা",
      color: "from-orange-500 to-red-600",
      chapters: [
        createChapter("his_10_ch1", "Chapter 4", "Bangla in Ancient Times", "প্রাচীন বাংলার ইতিহাস", "Dynasties of Bengal: Pala, Sena, Khadga, and ancient administrative systems.", CLASS_NAME, "Humanities", "History", "NCTB Class 10 History Book"),
        createChapter("his_10_ch2", "Chapter 11", "Language Movement 1952", "ভাষা আন্দোলন ও পরবর্তী ঘটনাপ্রবাহ", "Historic protests, state language movement, state response, and international recognitions.", CLASS_NAME, "Humanities", "History", "NCTB Class 10 History Book"),
        createChapter("his_10_ch3", "Chapter 14", "Liberation War of 1971", "বাংলাদেশের মুক্তিযুদ্ধ", "Socio-political context, operation searchlight, war strategies, and independent victory.", CLASS_NAME, "Humanities", "History", "NCTB Class 10 History Book")
      ]
    });

    // Civics and Citizenship
    subjectsList.push({
      id: "civics",
      name: "Civics",
      banglaName: "পৌরনীতি ও নাগরিকতা",
      color: "from-fuchsia-500 to-pink-600",
      chapters: [
        createChapter("civ_10_ch1", "Chapter 3", "Law, Liberty and Equality", "আইন, স্বাধীনতা ও সাম্য", "Defining law, sources of law, liberty classification, and equality coordinates.", CLASS_NAME, "Humanities", "Civics", "NCTB Class 10 Civics Book"),
        createChapter("civ_10_ch2", "Chapter 4", "Government Organs of Bangladesh", "বাংলাদেশের সরকারের বিভিন্ন অঙ্গ", "Executive power, legislature, judiciary power, and local government frameworks.", CLASS_NAME, "Humanities", "Civics", "NCTB Class 10 Civics Book")
      ]
    });

    // Economics
    subjectsList.push({
      id: "economics",
      name: "Economics",
      banglaName: "অর্থনীতি",
      color: "from-yellow-600 to-emerald-700",
      chapters: [
        createChapter("eco_10_ch1", "Chapter 3", "Utility, Demand, Supply and Equilibrium", "উপযোগ, চাহিদা, যোগান ও ভারসাম্য", "Law of diminishing marginal utility, demand and supply curves, and equilibrium price.", CLASS_NAME, "Humanities", "Economics", "NCTB Class 10 Economics Book")
      ]
    });
  }

  return subjectsList;
};
