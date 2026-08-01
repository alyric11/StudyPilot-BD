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

const CLASS_NAME = "Class 12";

export const class12Subjects = (group: string): Subject[] => {
  const isScience = group === "Science";
  const isBusiness = group === "Business Studies";
  const isHumanities = group === "Humanities";

  const subjectsList: Subject[] = [];

  // Compulsory Subjects
  subjectsList.push({
    id: "bangla_12",
    name: "Bangla 2nd Paper",
    banglaName: "বাংলা ২য় পত্র (ব্যাকরণ)",
    color: "from-emerald-500 to-emerald-600",
    chapters: [
      createChapter("b2_12_ch1", "Chapter 1", "Pronunciation and Spelling Rules", "উচ্চারণ ও বানান বিধি", "Standard spoken pronunciation and Bangla Academy Spelling rules (বানান নিয়ম).", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 12 Bangla Bhyakoron"),
      createChapter("b2_12_ch2", "Chapter 2", "Syntax and Sentences", "বাক্য তত্ত্ব", "Sentence transformation, classification, active-passive voice changes in Bangla.", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 12 Bangla Bhyakoron"),
      createChapter("b2_12_ch3", "Chapter 3", "Official Letters & Essays", "আবেদনপত্র ও প্রবন্ধ রচনা", "Formatting official complaints, job application covers, and writing critical socio-economic essays.", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 12 Bangla Bhyakoron")
    ]
  });

  subjectsList.push({
    id: "english_12",
    name: "English 2nd Paper",
    banglaName: "English 2nd Paper",
    color: "from-blue-500 to-indigo-600",
    chapters: [
      createChapter("e2_12_ch1", "Chapter 1", "HSC Grammar Essentials", "English Grammar Practice", "Prepositions, gap fillers, modifiers, connector words, synonym/antonym, and punctuation.", CLASS_NAME, group, "English 2nd Paper", "NCTB Class 12 English Grammar"),
      createChapter("e2_12_ch2", "Chapter 2", "Sentence Connectors & Pronoun Reference", "Pronoun & Connectors", "Fixing faulty pronoun references and mastering coherent transitional connectors.", CLASS_NAME, group, "English 2nd Paper", "NCTB Class 12 English Grammar"),
      createChapter("e2_12_ch3", "Chapter 3", "Academic Composition & Report Writing", "Academic Composition", "Drafting newspaper reports, paragraphs, formal argument essays, and email layouts.", CLASS_NAME, group, "English 2nd Paper", "NCTB Class 12 English Grammar")
    ]
  });

  subjectsList.push({
    id: "ict_12",
    name: "ICT",
    banglaName: "তথ্য ও যোগাযোগ প্রযুক্তি",
    color: "from-purple-500 to-violet-600",
    chapters: [
      createChapter("ict_12_ch1", "Chapter 4", "Web Page Design and HTML", "ওয়েব ডিজাইন পরিচিতি এবং এইচটিএমএল", "Web architecture, domains, hosting, basic HTML tags (lists, tables, anchors, and forms).", CLASS_NAME, group, "ICT", "NCTB Class 12 ICT Board Book"),
      createChapter("ict_12_ch2", "Chapter 5", "Programming Language (C Language)", "প্রোগ্রামিং ভাষা (সি প্রোগ্রামিং)", "Algorithms, flowcharts, data types, loops (for, while, do-while), arrays, and functions.", CLASS_NAME, group, "ICT", "NCTB Class 12 ICT Board Book"),
      createChapter("ict_12_ch3", "Chapter 6", "Database Management System (DBMS)", "ডাটাবেজ ম্যানেজমেন্ট সিস্টেম", "Relational databases, SQL queries (SELECT, INSERT, UPDATE, DELETE), and key index constraints.", CLASS_NAME, group, "ICT", "NCTB Class 12 ICT Board Book")
    ]
  });

  // Group-Specific Subjects
  if (isScience) {
    // Physics 2nd Paper
    subjectsList.push({
      id: "physics2",
      name: "Physics 2nd Paper",
      banglaName: "পদার্থবিজ্ঞান ২য় পত্র (এইচএসসি)",
      color: "from-cyan-500 to-blue-600",
      chapters: [
        createChapter("p2_12_ch1", "Chapter 1", "Thermodynamics", "তাপগতিবিদ্যা", "Thermal equilibrium, Zeroth, 1st and 2nd laws, Carnot engine, entropy, and heat death.", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch2", "Chapter 2", "Static Electricity", "স্থির তড়িৎ", "Coulomb's law, electric field, potential, Gauss's law, capacitance, and capacitor combinations.", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch3", "Chapter 3", "Current Electricity", "চল তড়িৎ", "Ohm's law, shunt, wheatstone bridge, Kirchhoff's laws, potentiometer, and Joule heating.", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch4", "Chapter 6", "Physical Optics", "ভৌত আলোকবিজ্ঞান", "Wave theory, Huygens' principle, interference, Young's double-slit experiment, polarization.", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch5", "Chapter 10", "Semiconductor & Electronics", "সেমিকন্ডাক্টর ও ইলেকট্রনিক্স", "p-n junction, diodes, rectifiers, transistors (NPN, PNP), and digital logic gates.", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)")
      ]
    });

    // Chemistry 2nd Paper
    subjectsList.push({
      id: "chemistry2",
      name: "Chemistry 2nd Paper",
      banglaName: "রসায়ন ২য় পত্র (এইচএসসি)",
      color: "from-pink-500 to-rose-600",
      chapters: [
        createChapter("c2_12_ch1", "Chapter 1", "Environmental Chemistry", "পরিবেশ রসায়ন", "Gas laws (Boyle, Charles, Dalton), greenhouse effect, acid rain, and BOD/COD standards.", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_12_ch2", "Chapter 2", "Organic Chemistry", "জৈব রসায়ন", "Classification, IUPAC naming, aliphatic vs aromatic hydrocarbons, reaction mechanisms, and polymers.", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_12_ch3", "Chapter 3", "Quantitative Chemistry", "পরিমাণগত রসায়ন", "Acid-base titrations, redox titrations, oxidation numbers, molality, molarity, and ppm conversions.", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_12_ch4", "Chapter 4", "Electrochemistry", "তড়িৎ রসায়ন", "Electrolysis, Faraday's laws, galvanic cell, Nernst equation, and fuel cells.", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)")
      ]
    });

    // Higher Math 2nd Paper
    subjectsList.push({
      id: "math2",
      name: "Higher Math 2nd Paper",
      banglaName: "উচ্চতর গণিত ২য় পত্র",
      color: "from-amber-500 to-orange-600",
      chapters: [
        createChapter("hm2_12_ch1", "Chapter 1", "Real Numbers & Inequalities", "বাস্তব সংখ্যা ও অসমতা", "Syllabus properties of real numbers, proving intervals, and solving quadratic inequalities.", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch2", "Chapter 3", "Complex Numbers", "জटिल সংখ্যা", "Imaginary unit 'i', modulus, argument, polar representation, and square roots of complex sums.", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch3", "Chapter 4", "Polynomials and Polynomial Equations", "বহুপদী ও বহুপদী সমীকরণ", "Roots of quadratic and cubic equations, symmetric functions of roots, and nature of roots.", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch4", "Chapter 6", "Conics", "কনিক", "Standard equations, focus, directrix, eccentricity of Parabola, Ellipse, and Hyperbola.", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch5", "Chapter 7", "Inverse Trigonometric Functions & Equations", "বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ", "Formulas of inverse sine/cosine, and solving general trigonometric equations inside bounds.", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper")
      ]
    });

    // Biology 2nd Paper (Zoology)
    subjectsList.push({
      id: "biology2",
      name: "Biology 2nd Paper",
      banglaName: "জীববিজ্ঞান ২য় পত্র (প্রাণীবিজ্ঞান)",
      color: "from-green-500 to-emerald-600",
      chapters: [
        createChapter("bio2_12_ch1", "Chapter 1", "Animal Diversity & Classification", "প্রাণীর বিভিন্নতা ও শ্রেণীবিন্যাস", "Non-chordates (Phylum Porifera to Echinodermata) and Chordata classification.", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch2", "Chapter 2", "Animal Physiology: Digestion", "প্রাণীর শরীরবৃত্ত: পরিপাক", "Digestive system of human, enzyme actions, and absorption of carbohydrates/proteins/fats.", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch3", "Chapter 4", "Human Circulation", "রক্ত সঞ্চালন", "Cardiac cycle, ECG, pacemaker, double circulation, and standard coronary block treatments.", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper")
      ]
    });
  }

  if (isBusiness) {
    // Accounting 2nd Paper
    subjectsList.push({
      id: "accounting2",
      name: "Accounting 2nd Paper",
      banglaName: "হিসাববিজ্ঞান ২য় পত্র (এইচএসসি)",
      color: "from-indigo-500 to-violet-600",
      chapters: [
        createChapter("acc2_12_ch1", "Chapter 2", "Partnership Accounting", "অংশীদারি কারবারের হিসাব", "Profit-loss appropriation accounts, capital accounts of partners, and goodwill valuation.", CLASS_NAME, "Business Studies", "Accounting 2nd Paper", "NCTB HSC Accounting Second Paper"),
        createChapter("acc2_12_ch2", "Chapter 4", "Joint Stock Company Capital", "যৌথ মূলধনী কোম্পানির মূলধন", "Issuing shares, premium, discount, journal entries, and statement of financial position.", CLASS_NAME, "Business Studies", "Accounting 2nd Paper", "NCTB HSC Accounting Second Paper"),
        createChapter("acc2_12_ch3", "Chapter 5", "Financial Statement Analysis", "আর্থিক বিবরণী বিশ্লেষণ", "Ratio analysis, liquid ratios, profitability ratios, and working capital ratios.", CLASS_NAME, "Business Studies", "Accounting 2nd Paper", "NCTB HSC Accounting Second Paper")
      ]
    });

    // Finance, Banking & Insurance 2nd Paper
    subjectsList.push({
      id: "finance2",
      name: "Finance 2nd Paper",
      banglaName: "ফিন্যান্স ও ব্যাংকিং ২য় পত্র",
      color: "from-amber-500 to-yellow-600",
      chapters: [
        createChapter("fin2_12_ch1", "Chapter 1", "Introduction to Banking", "ব্যাংক ব্যবস্থার প্রাথমিক ধারণা", "Definitions, origin, classification of banks, and banking structures in Bangladesh.", CLASS_NAME, "Business Studies", "Finance 2nd Paper", "NCTB HSC Finance Second Paper"),
        createChapter("fin2_12_ch2", "Chapter 2", "Central Banking", "কেন্দ্রীয় ব্যাংক", "Bangladesh Bank, currency control, credit regulation, and clearinghouse operations.", CLASS_NAME, "Business Studies", "Finance 2nd Paper", "NCTB HSC Finance Second Paper")
      ]
    });

    // Business Organization & Management 2nd Paper
    subjectsList.push({
      id: "bus_org2",
      name: "Business Org 2nd Paper",
      banglaName: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র",
      color: "from-sky-500 to-cyan-600",
      chapters: [
        createChapter("bo2_12_ch1", "Chapter 1", "Management Concepts", "ব্যবস্থাপনার ধারণা", "Principles of management, functions (Planning, Organizing, Staffing, Directing, Controlling).", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_12_ch2", "Chapter 2", "Planning & Decision Making", "পরিকল্পনা প্রণয়ন ও সিদ্ধান্ত গ্রহণ", "Types of plans, steps in plan design, and standard corporate decision models.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper")
      ]
    });
  }

  if (isHumanities) {
    // Civics & Good Governance 2nd Paper
    subjectsList.push({
      id: "civics2",
      name: "Civics & Good Governance 2nd Paper",
      banglaName: "পৌরনীতি ও সুশাসন ২য় পত্র",
      color: "from-fuchsia-500 to-pink-600",
      chapters: [
        createChapter("civ2_12_ch1", "Chapter 1", "Political Development in British India", "ব্রিটিশ ভারতে রাজনৈতিক উন্নয়ন", "Partition of Bengal, Muslim League setup, Lucknow pact, and Lahore resolution.", CLASS_NAME, "Humanities", "Civics 2nd Paper", "NCTB HSC Civics Second Paper"),
        createChapter("civ2_12_ch2", "Chapter 2", "From Pakistan to Bangladesh", "پاکستان থেকে বাংলাদেশ", "Language movement, 1954 elections, 6-point movement, and the war of independence.", CLASS_NAME, "Humanities", "Civics 2nd Paper", "NCTB HSC Civics Second Paper")
      ]
    });

    // History 2nd Paper
    subjectsList.push({
      id: "history2",
      name: "History 2nd Paper",
      banglaName: "ইতিহাস ২য় পত্র (এইচএসসি)",
      color: "from-orange-500 to-red-600",
      chapters: [
        createChapter("his2_12_ch1", "Chapter 1", "Industrial Revolution", "শিল্প বিপ্লব", "Origins in Britain, impact on society, technology growth, and rise of imperialism.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB HSC History Second Paper"),
        createChapter("his2_12_ch2", "Chapter 2", "French Revolution 1789", "ফরাসি বিপ্লব", "Social hierarchy, fall of Bastille, Napoleon Bonaparte, and core ideals of liberty.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB HSC History Second Paper")
      ]
    });

    // Logic 2nd Paper
    subjectsList.push({
      id: "logic2",
      name: "Logic 2nd Paper",
      banglaName: "যুক্তিবিদ্যা ২য় পত্র",
      color: "from-violet-500 to-indigo-600",
      chapters: [
        createChapter("log2_12_ch1", "Chapter 1", "Scientific Explanation", "বৈজ্ঞানিক ব্যাখ্যা", "Hypothesis testing, forms of explanations, and differences from popular beliefs.", CLASS_NAME, "Humanities", "Logic 2nd Paper", "NCTB HSC Logic Second Paper"),
        createChapter("log2_12_ch2", "Chapter 2", "Methods of Induction", "আরোহ পদ্ধতি", "Analogy, simple enumeration, scientific induction, and causal connections.", CLASS_NAME, "Humanities", "Logic 2nd Paper", "NCTB HSC Logic Second Paper")
      ]
    });
  }

  return subjectsList;
};
