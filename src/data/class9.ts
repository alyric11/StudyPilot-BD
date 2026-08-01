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

const CLASS_NAME = "Class 9";

export const class9Subjects = (group: string): Subject[] => {
  const isScience = group === "Science";
  const isBusiness = group === "Business Studies";
  const isHumanities = group === "Humanities";

  const subjectsList: Subject[] = [];

  // 1. Bangla (Compulsory)
  subjectsList.push({
    id: "bangla_1",
    name: "Bangla 1st Paper",
    banglaName: "বাংলা ১ম পত্র",
    color: "from-emerald-500 to-emerald-600",
    chapters: [
      createChapter("b1_ch1", "Chapter 1", "Contextual Language Use", "প্রয়োগিক বাংলা", "Understanding language context and register in various social and formal settings.", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 9 Bangla Sahitto Book"),
      createChapter("b1_ch2", "Chapter 2", "Standard Bangla Pronunciation", "প্রমিত বাংলা উচ্চারণ", "Rules of standard spoken Bangla (Shuddho Pronunciation) and accents.", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 9 Bangla Sahitto Book"),
      createChapter("b1_ch3", "Chapter 3", "Reading and Understanding Literature", "কবিতা, গল্প ও নাটক", "Comprehensive reading of selected short stories, poems, and dramas under the official syllabus.", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 9 Bangla Sahitto Book")
    ]
  });

  subjectsList.push({
    id: "bangla_2",
    name: "Bangla 2nd Paper",
    banglaName: "বাংলা ২য় পত্র (ব্যাকরণ)",
    color: "from-teal-500 to-emerald-700",
    chapters: [
      createChapter("b2_ch1", "Chapter 1", "Language and Grammar", "ভাষা ও ব্যাকরণ", "The study of language structure, grammar, phonology, and standard syntax.", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 9 Bangla Bhyakoron Book"),
      createChapter("b2_ch2", "Chapter 2", "Bangla Sounds and Letters", "ধ্বনি ও বর্ণ", "Vowels, consonants, pronunciation rules, and phonetic representations of Bangla alphabets.", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 9 Bangla Bhyakoron Book"),
      createChapter("b2_ch3", "Chapter 3", "Sandhi and Word Formations", "সন্ধি ও শব্দ গঠন", "Analyzing rules of Sandhi, prefixes, suffixes, and word derivation.", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 9 Bangla Bhyakoron Book")
    ]
  });

  // 2. English (Compulsory)
  subjectsList.push({
    id: "english_1",
    name: "English 1st Paper",
    banglaName: "ইংরেজি ১ম পত্র",
    color: "from-blue-500 to-indigo-600",
    chapters: [
      createChapter("e1_ch1", "Chapter 1", "Opinion Matters", "Opinion Matters", "Learning to distinguish facts from opinions through structured analytical readings.", CLASS_NAME, group, "English 1st Paper", "NCTB Class 9 English For Today"),
      createChapter("e1_ch2", "Chapter 2", "Nature's Tapestry", "Nature's Tapestry", "Appreciating literature focusing on nature, descriptive writing, and poetic elements.", CLASS_NAME, group, "English 1st Paper", "NCTB Class 9 English For Today"),
      createChapter("e1_ch3", "Chapter 3", "The Sense of Beauty", "The Sense of Beauty", "Investigating aesthetic appreciation, art, music, and how beauty is perceived.", CLASS_NAME, group, "English 1st Paper", "NCTB Class 9 English For Today")
    ]
  });

  subjectsList.push({
    id: "english_2",
    name: "English 2nd Paper",
    banglaName: "ইংরেজি ২য় পত্র",
    color: "from-indigo-600 to-blue-700",
    chapters: [
      createChapter("e2_ch1", "Chapter 1", "Parts of Speech & Noun Clauses", "Parts of Speech & Clauses", "Detailed usage of English parts of speech, verbs, modifiers, and noun/adjective clauses.", CLASS_NAME, group, "English 2nd Paper", "NCTB Class 9 English Grammar and Composition"),
      createChapter("e2_ch2", "Chapter 2", "Right Form of Verbs", "Right Form of Verbs", "Mastering verb subject-agreement, correct tenses, conditionals, and non-finite verbs.", CLASS_NAME, group, "English 2nd Paper", "NCTB Class 9 English Grammar and Composition")
    ]
  });

  // 3. Mathematics (Compulsory)
  subjectsList.push({
    id: "math",
    name: "Mathematics",
    banglaName: "সাধারণ গণিত",
    color: "from-yellow-500 to-amber-600",
    chapters: [
      createChapter("m_ch1", "Chapter 1", "System of Sets", "প্রাত্যহিক জীবনে সেট", "Understanding set notations, subsets, operations of sets, and real-world applications.", CLASS_NAME, group, "Mathematics", "NCTB Class 9 General Mathematics Book"),
      createChapter("m_ch2", "Chapter 2", "Arithmetic Progression & Logarithm", "অনুক্রম ও ধারা", "Arithmetic and geometric sequences, series progression, and logarithmic series.", CLASS_NAME, group, "Mathematics", "NCTB Class 9 General Mathematics Book"),
      createChapter("m_ch3", "Chapter 3", "Logarithm in Daily Life", "লগারিদম", "Applying common and natural logarithms to solve daily exponential equations.", CLASS_NAME, group, "Mathematics", "NCTB Class 9 General Mathematics Book"),
      createChapter("m_ch4", "Chapter 4", "Trigonometric Applications", "ত্রিকোণমিতি", "Trigonometric ratios, heights, distances, and solving right-angled triangles.", CLASS_NAME, group, "Mathematics", "NCTB Class 9 General Mathematics Book")
    ]
  });

  // 4. ICT (Compulsory)
  subjectsList.push({
    id: "ict",
    name: "ICT",
    banglaName: "তথ্য ও যোগাযোগ প্রযুক্তি",
    color: "from-purple-500 to-violet-600",
    chapters: [
      createChapter("ict_ch1", "Chapter 1", "Information Tech and Bangladesh", "তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ", "Introduction to digital revolution, historical figures of ICT, and e-governance in Bangladesh.", CLASS_NAME, group, "ICT", "NCTB Class 9 ICT Board Book"),
      createChapter("ict_ch2", "Chapter 2", "Computer Security", "কম্পিউটার ও কম্পিউটার ব্যবহারকারীর নিরাপত্তা", "Security, malware, password creation, software installation, and ethical rules of computing.", CLASS_NAME, group, "ICT", "NCTB Class 9 ICT Board Book")
    ]
  });

  // 5. Religion (Compulsory)
  subjectsList.push({
    id: "religion",
    name: "Religion",
    banglaName: "ধর্ম ও নৈতিক শিক্ষা",
    color: "from-lime-500 to-green-600",
    chapters: [
      createChapter("r_ch1", "Chapter 1", "Aqaid and Moral Life", "আকাইদ ও নৈতিক জীবন", "Core Islamic or religious belief systems, Tawhid, Risalat, Akhirat, and ethical foundations.", CLASS_NAME, group, "Religion", "NCTB Class 9 Religion and Moral Education Book"),
      createChapter("r_ch2", "Chapter 2", "Sources of Shariah", "শরীয়তের উৎস", "Reading the holy scriptures, Hadith, and general guidance on social and civic behavior.", CLASS_NAME, group, "Religion", "NCTB Class 9 Religion and Moral Education Book")
    ]
  });

  // 6. Bangladesh & Global Studies (Compulsory)
  subjectsList.push({
    id: "bgs",
    name: "Bangladesh & Global Studies",
    banglaName: "বাংলাদেশ ও বিশ্বপরিচয়",
    color: "from-orange-500 to-amber-600",
    chapters: [
      createChapter("bgs_ch1", "Chapter 1", "Nationalist Movements", "পূর্ব বাংলার আন্দোলন ও জাতীয়তাবাদের উত্থান", "The language movement, political transitions, and the socio-political context of East Bengal.", CLASS_NAME, group, "Bangladesh & Global Studies", "NCTB Class 9 BGS Book"),
      createChapter("bgs_ch2", "Chapter 2", "The Emergence of Independent Bangladesh", "স্বাধীন বাংলাদেশ", "The historic Liberation War of 1971, Mujibnagar government, and global diplomacy.", CLASS_NAME, group, "Bangladesh & Global Studies", "NCTB Class 9 BGS Book")
    ]
  });

  // 7. Physical Education, Career Education, and Arts & Crafts (Compulsory / Co-curricular)
  subjectsList.push({
    id: "pe",
    name: "Physical Education",
    banglaName: "শারীরিক শিক্ষা ও স্বাস্থ্য",
    color: "from-amber-400 to-orange-500",
    chapters: [
      createChapter("pe_ch1", "Chapter 1", "Physical Education for Healthy Life", "সুস্থ জীবনের জন্য শারীরিক শিক্ষা", "The science of posture, health habits, team sportsmanship, and mental fitness guidelines.", CLASS_NAME, group, "Physical Education", "NCTB Class 9 Physical Education Book")
    ]
  });

  subjectsList.push({
    id: "career",
    name: "Career Education",
    banglaName: "ক্যারিয়ার শিক্ষা",
    color: "from-sky-400 to-indigo-500",
    chapters: [
      createChapter("car_ch1", "Chapter 1", "Me and My Career", "আমি ও আমার ক্যারিয়ার", "Understanding career growth, vocational choices, and self-assessment techniques in Bangladesh.", CLASS_NAME, group, "Career Education", "NCTB Class 9 Career Education Book")
    ]
  });

  subjectsList.push({
    id: "arts",
    name: "Arts & Crafts",
    banglaName: "চারু ও কারুকলা",
    color: "from-rose-400 to-pink-500",
    chapters: [
      createChapter("art_ch1", "Chapter 1", "Fine Arts History in Bangladesh", "বাংলাদেশের চারুকলার ইতিহাস", "Famous folk art, terracotta, paintings of Zainul Abedin, and craft traditions of Bengal.", CLASS_NAME, group, "Arts & Crafts", "NCTB Class 9 Arts and Crafts Book")
    ]
  });

  // Group Specific Subjects
  if (isScience) {
    // Physics
    subjectsList.push({
      id: "physics",
      name: "Physics",
      banglaName: "পদার্থবিজ্ঞান",
      color: "from-cyan-500 to-blue-600",
      chapters: [
        createChapter("p_ch1", "Chapter 1", "Physical Quantities and Measurements", "ভৌত রাশি ও পরিমাপ", "Scientific notations, units, vernier calipers, screw gauge, and error estimations.", CLASS_NAME, "Science", "Physics", "NCTB Class 9 Physics Board Book"),
        createChapter("p_ch2", "Chapter 2", "Motion", "গতি", "Scalar and vector quantities, velocity, acceleration, and equations of motion for falling bodies.", CLASS_NAME, "Science", "Physics", "NCTB Class 9 Physics Board Book"),
        createChapter("p_ch3", "Chapter 3", "Force", "বল", "Inertia, Newton's laws, friction, impulse, conservation of momentum, and gravity.", CLASS_NAME, "Science", "Physics", "NCTB Class 9 Physics Board Book"),
        createChapter("p_ch4", "Chapter 4", "Work, Power and Energy", "কাজ, ক্ষমতা ও শক্তি", "Kinetic energy, potential energy, law of conservation of energy, power, and efficiency calculations.", CLASS_NAME, "Science", "Physics", "NCTB Class 9 Physics Board Book")
      ]
    });

    // Chemistry
    subjectsList.push({
      id: "chemistry",
      name: "Chemistry",
      banglaName: "রসায়ন",
      color: "from-pink-500 to-rose-600",
      chapters: [
        createChapter("c_ch1", "Chapter 1", "Concept of Chemistry", "রসায়নের ধারণা", "History of chemistry, industrial importance, and standard safety measures in labs.", CLASS_NAME, "Science", "Chemistry", "NCTB Class 9 Chemistry Board Book"),
        createChapter("c_ch2", "Chapter 2", "States of Matter", "পদার্থের অবস্থা", "Kinetic theory of matter, diffusion, effusion, melting points, boiling points, and sublimations.", CLASS_NAME, "Science", "Chemistry", "NCTB Class 9 Chemistry Board Book"),
        createChapter("c_ch3", "Chapter 3", "Structure of Matter", "পদার্থের গঠন", "Atoms, isotopes, Rutherford and Bohr model, quantum shell configuration, and atomic mass.", CLASS_NAME, "Science", "Chemistry", "NCTB Class 9 Chemistry Board Book"),
        createChapter("c_ch4", "Chapter 4", "Periodic Table", "পর্যায় সারণি", "History, periodic trends, properties of alkali, halogens, transition and noble gases.", CLASS_NAME, "Science", "Chemistry", "NCTB Class 9 Chemistry Board Book")
      ]
    });

    // Biology
    subjectsList.push({
      id: "biology",
      name: "Biology",
      banglaName: "জীববিজ্ঞান",
      color: "from-green-500 to-emerald-600",
      chapters: [
        createChapter("bio_ch1", "Chapter 1", "Life Lessons", "জীবন পাঠ", "Taxonomy, classifications, kingdoms, nomenclature, and the importance of biosystematics.", CLASS_NAME, "Science", "Biology", "NCTB Class 9 Biology Board Book"),
        createChapter("bio_ch2", "Chapter 2", "Scientific Organisation of Life", "জীব কোষ ও টিস্যু", "Plant and animal cell organelles, microscope usage, and complex animal tissue structures.", CLASS_NAME, "Science", "Biology", "NCTB Class 9 Biology Board Book"),
        createChapter("bio_ch3", "Chapter 3", "Cell Division", "কোষ বিভাজন", "Amitosis, mitosis (prophase to telophase), and meiosis mechanics and importance.", CLASS_NAME, "Science", "Biology", "NCTB Class 9 Biology Board Book")
      ]
    });

    // Higher Mathematics
    subjectsList.push({
      id: "higher_math",
      name: "Higher Mathematics",
      banglaName: "উচ্চতর গণিত",
      color: "from-orange-500 to-amber-600",
      chapters: [
        createChapter("hm_ch1", "Chapter 1", "Set and Function", "সেট ও ফাংশন", "Power sets, cartesian products, domain, range, one-to-one and onto functions.", CLASS_NAME, "Science", "Higher Mathematics", "NCTB Class 9 Higher Math Book"),
        createChapter("hm_ch2", "Chapter 2", "Algebraic Expressions", "বীজগাণিতিক রাশি", "Polynomials, remainder theorem, factor theorem, and partial fractions.", CLASS_NAME, "Science", "Higher Mathematics", "NCTB Class 9 Higher Math Book")
      ]
    });

    // Agriculture & Home Science (Optional Electives)
    subjectsList.push({
      id: "agriculture",
      name: "Agriculture",
      banglaName: "কৃষিশিক্ষা",
      color: "from-stone-500 to-lime-600",
      chapters: [
        createChapter("ag_ch1", "Chapter 1", "Agricultural Technology", "কৃষি প্রযুক্তি", "Types of soil, soil pH, crop cultivation techniques, and organic compost fertilizer use.", CLASS_NAME, "Science", "Agriculture", "NCTB Class 9 Agriculture Book")
      ]
    });

    subjectsList.push({
      id: "home_science",
      name: "Home Science",
      banglaName: "গার্হস্থ্য বিজ্ঞান",
      color: "from-pink-400 to-purple-500",
      chapters: [
        createChapter("hs_ch1", "Chapter 1", "Home and Family Resource Management", "গৃহ ও গৃহসম্পদ ব্যবস্থাপনা", "Family structures, budget making, resource conservation, and nutritional needs of children.", CLASS_NAME, "Science", "Home Science", "NCTB Class 9 Home Science Book")
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
        createChapter("acc_ch1", "Chapter 1", "Introduction to Accounting", "হিসাববিজ্ঞানের পরিচিতি", "Basic definition, users of accounting, history, and moral duties in business.", CLASS_NAME, "Business Studies", "Accounting", "NCTB Class 9 Accounting Board Book"),
        createChapter("acc_ch2", "Chapter 2", "Transactions", "লেনদেন", "Identifying transactions, business documents, receipts, invoices, and accounting equation.", CLASS_NAME, "Business Studies", "Accounting", "NCTB Class 9 Accounting Board Book"),
        createChapter("acc_ch3", "Chapter 3", "Double Entry System", "দু’তরফা দাখিলা পদ্ধতি", "Debit, credit rules, posting entries, and calculation of capital.", CLASS_NAME, "Business Studies", "Accounting", "NCTB Class 9 Accounting Board Book"),
        createChapter("acc_ch4", "Chapter 4", "Journal", "জাবেদা", "Concept of general journal, special journals, discount types, and basic accounting records.", CLASS_NAME, "Business Studies", "Accounting", "NCTB Class 9 Accounting Board Book")
      ]
    });

    // Business Entrepreneurship
    subjectsList.push({
      id: "business_ent",
      name: "Business Entrepreneurship",
      banglaName: "ব্যবসায় উদ্যোগ",
      color: "from-sky-500 to-cyan-600",
      chapters: [
        createChapter("be_ch1", "Chapter 1", "Introduction to Business", "ব্যবসায়ের পরিচিতি", "Socio-economic history, classifications of business, and local trade environments.", CLASS_NAME, "Business Studies", "Business Entrepreneurship", "NCTB Class 9 Business Entrepreneurship Book"),
        createChapter("be_ch2", "Chapter 2", "Entrepreneurship & Entrepreneur", "উদ্যোগ ও উদ্যোক্তা", "Characteristics of a successful entrepreneur, barriers, and dynamic case studies.", CLASS_NAME, "Business Studies", "Business Entrepreneurship", "NCTB Class 9 Business Entrepreneurship Book")
      ]
    });

    // Finance and Banking
    subjectsList.push({
      id: "finance",
      name: "Finance & Banking",
      banglaName: "ফিন্যান্স ও ব্যাংকিং",
      color: "from-amber-500 to-yellow-600",
      chapters: [
        createChapter("fin_ch1", "Chapter 1", "Finance and Business Finance", "অর্থায়ন ও ব্যবসায় অর্থায়ন", "Concept of financing, business models, rules of investment, and local funding sources.", CLASS_NAME, "Business Studies", "Finance & Banking", "NCTB Class 9 Finance Board Book"),
        createChapter("fin_ch2", "Chapter 2", "Time Value of Money", "অর্থের সময়মূল্য", "Opportunity costs, compounding, present value, and future value equation practice.", CLASS_NAME, "Business Studies", "Finance & Banking", "NCTB Class 9 Finance Board Book")
      ]
    });

    // Economics
    subjectsList.push({
      id: "economics",
      name: "Economics",
      banglaName: "অর্থনীতি",
      color: "from-yellow-600 to-emerald-700",
      chapters: [
        createChapter("eco_ch1", "Chapter 1", "Introduction to Economics", "অর্থনীতির ভূমিকা", "Scarcity, choice, central problems of economy, and macro vs micro economics.", CLASS_NAME, "Business Studies", "Economics", "NCTB Class 9 Economics Book")
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
        createChapter("geo_ch1", "Chapter 1", "Geography and Environment Concept", "ভূগোল ও পরিবেশ", "Understanding geographical scopes, environmental cycles, and ecology basics.", CLASS_NAME, "Humanities", "Geography", "NCTB Class 9 Geography Board Book"),
        createChapter("geo_ch2", "Chapter 2", "The Universe and Our Earth", "মহাবিশ্ব ও আমাদের পৃথিবী", "The solar system, planets, latitude, longitude, and seasons.", CLASS_NAME, "Humanities", "Geography", "NCTB Class 9 Geography Board Book"),
        createChapter("geo_ch3", "Chapter 3", "Map Reading and Use", "মানচিত্র পঠন ও ব্যবহার", "Types of maps, scales, contour lines, GPS, and GIS overview.", CLASS_NAME, "Humanities", "Geography", "NCTB Class 9 Geography Board Book")
      ]
    });

    // History of Bangladesh & World Civ
    subjectsList.push({
      id: "history",
      name: "History",
      banglaName: "বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা",
      color: "from-orange-500 to-red-600",
      chapters: [
        createChapter("his_ch1", "Chapter 1", "Introduction to History", "ইতিহাস পরিচিতি", "Definitions, importance of history, historical artifacts, and historiographical concepts.", CLASS_NAME, "Humanities", "History", "NCTB Class 9 History Board Book"),
        createChapter("his_ch2", "Chapter 2", "World Civilizations", "বিশ্বসভ্যতা", "Fascinating history of Egyptian, Mesopotamian, Indus, Greek, and Roman civilizations.", CLASS_NAME, "Humanities", "History", "NCTB Class 9 History Board Book")
      ]
    });

    // Civics and Citizenship
    subjectsList.push({
      id: "civics",
      name: "Civics",
      banglaName: "পৌরনীতি ও নাগরিকতা",
      color: "from-fuchsia-500 to-pink-600",
      chapters: [
        createChapter("civ_ch1", "Chapter 1", "Civics and Citizen Basics", "পৌরনীতি ও নাগরিকতা পরিচিতি", "Scope of civics, family, society, and state-level organizations.", CLASS_NAME, "Humanities", "Civics", "NCTB Class 9 Civics Board Book"),
        createChapter("civ_ch2", "Chapter 2", "Citizen and State", "নাগরিক ও রাষ্ট্র", "Rights and duties of a citizen, state organs, and executive branches in Bangladesh.", CLASS_NAME, "Humanities", "Civics", "NCTB Class 9 Civics Board Book")
      ]
    });

    // Economics
    subjectsList.push({
      id: "economics",
      name: "Economics",
      banglaName: "অর্থনীতি",
      color: "from-yellow-600 to-emerald-700",
      chapters: [
        createChapter("eco_ch1", "Chapter 1", "Introduction to Economics", "অর্থনীতির ভূমিকা", "Scarcity, choice, central problems of economy, and macro vs micro economics.", CLASS_NAME, "Humanities", "Economics", "NCTB Class 9 Economics Book")
      ]
    });
  }

  return subjectsList;
};
