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

const CLASS_NAME = "Class 11";

export const class11Subjects = (group: string): Subject[] => {
  const isScience = group === "Science";
  const isBusiness = group === "Business Studies";
  const isHumanities = group === "Humanities";

  const subjectsList: Subject[] = [];

  // Compulsory Subjects
  // Bangla 1st Paper
  subjectsList.push({
    id: "bangla_1",
    name: "Bangla 1st Paper",
    banglaName: "বাংলা ১ম পত্র (এইচএসসি)",
    color: "from-emerald-500 to-emerald-600",
    chapters: [
      createChapter("b1_11_ch1", "Chapter 1", "Chorok", "বিড়াল ও চাষার দুক্ষু", "Analytical studying of Bankimchandra's social satires and Rokeya Sakhawat Hossain's critical essays.", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path"),
      createChapter("b1_11_ch2", "Chapter 2", "Ahban and Sonar Tori", "আহ্বান ও সোনার তরী", "Studying Rabindranath Tagore's Sonar Tori poem and Bibhutibhushan's storytelling masterclass.", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path"),
      createChapter("b1_11_ch3", "Chapter 3", "Lalshalu and Sirajuddaula", "লালসালু ও সিরাজউদ্দৌলা", "In-depth review of Syed Waliullah's 'Lalshalu' novel and Sikandar Abu Zafar's 'Sirajuddaula' play.", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path")
    ]
  });

  subjectsList.push({
    id: "bangla_2",
    name: "Bangla 2nd Paper",
    banglaName: "বাংলা ২য় পত্র (ব্যাকরণ)",
    color: "from-emerald-500 to-emerald-600",
    chapters: [
      createChapter("b2_11_ch1", "Chapter 1", "Pronunciation and Spelling Rules", "উচ্চারণ ও বানান বিধি", "Standard spoken pronunciation and Bangla Academy Spelling rules (বানান নিয়ম).", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 12 Bangla Bhyakoron"),
      createChapter("b2_11_ch2", "Chapter 2", "Syntax and Sentences", "বাক্য তত্ত্ব", "Sentence transformation, classification, active-passive voice changes in Bangla.", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 12 Bangla Bhyakoron"),
      createChapter("b2_11_ch3", "Chapter 3", "Official Letters & Essays", "আবেদনপত্র ও প্রবন্ধ রচনা", "Formatting official complaints, job application covers, and writing critical socio-economic essays.", CLASS_NAME, group, "Bangla 2nd Paper", "NCTB Class 12 Bangla Bhyakoron")
    ]
  });

   // English 1st Paper
  subjectsList.push({
    id: "english_1",
    name: "English 1st Paper",
    banglaName: "English 1st Paper",
    color: "from-blue-500 to-indigo-600",
    chapters: [
      createChapter("e1_11_ch1", "Chapter 1", "People or Institutions Making History", "People or Institutions Making History", "Nelson Mandela, Sheikh Mujibur Rahman's historic 7th March Speech, and world-changing leaders.", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today"),
      createChapter("e1_11_ch2", "Chapter 2", "Dreams and Dreamers", "Dreams", "Dream poetry analysis (Langston Hughes, D.H. Lawrence) and psychological aspects of dreaming.", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today"),
      createChapter("e1_11_ch3", "Chapter 3", "Human Relationship and Etiquette", "Human Relationships", "Understanding family manners, core communication, and societal codes of conduct.", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today")
    ]
  });

  subjectsList.push({
    id: "english_2",
    name: "English 2nd Paper",
    banglaName: "English 2nd Paper",
    color: "from-blue-500 to-indigo-600",
    chapters: [
      createChapter("e2_11_ch1", "Chapter 1", "HSC Grammar Essentials", "English Grammar Practice", "Prepositions, gap fillers, modifiers, connector words, synonym/antonym, and punctuation.", CLASS_NAME, group, "English 2nd Paper", "NCTB Class 12 English Grammar"),
      createChapter("e2_11_ch2", "Chapter 2", "Sentence Connectors & Pronoun Reference", "Pronoun & Connectors", "Fixing faulty pronoun references and mastering coherent transitional connectors.", CLASS_NAME, group, "English 2nd Paper", "NCTB Class 12 English Grammar"),
      createChapter("e2_11_ch3", "Chapter 3", "Academic Composition & Report Writing", "Academic Composition", "Drafting newspaper reports, paragraphs, formal argument essays, and email layouts.", CLASS_NAME, group, "English 2nd Paper", "NCTB Class 12 English Grammar")
    ]
  });

  // ICT
  subjectsList.push({
    id: "ict_11",
    name: "ICT",
    banglaName: "তথ্য ও যোগাযোগ প্রযুক্তি",
    color: "from-purple-500 to-violet-600",
    chapters: [
      createChapter("ict_11_ch1", "Chapter 1", "Information & Communication Technology: World & BD Profile", "তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত", "Virtual reality, artificial intelligence, robotics, biometrics, nanotechnology, and cyber security.", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch2", "Chapter 2", "Communication Systems & Networking", "কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং", "Data transmission modes, fiber optics, wireless, mobile generations (1G to 5G), and network topologies.", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch3", "Chapter 3", "Number Systems & Digital Device", "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস", "Binary, octal, hex conversion, 2's complement, logic gates (AND, OR, NOT, NAND, NOR), and flip-flops.", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book")
    ]
  });

  // Group-Specific Subjects
  if (isScience) {
    // Physics 1st Paper
    subjectsList.push({
      id: "physics1",
      name: "Physics 1st Paper",
      banglaName: "পদার্থবিজ্ঞান ১ম পত্র (এইচএসসি)",
      color: "from-cyan-500 to-blue-600",
      chapters: [
        createChapter("p1_11_ch1", "Chapter 2", "Vector", "ভেক্টর", "Vector addition, triangle law, resolution of vectors, dot product, cross product, and river-boat velocity vectors.", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch2", "Chapter 4", "Newtonian Mechanics", "নিউটনীয় বলবিদ্যা", "Newton's laws, linear momentum, friction, torque, moment of inertia, angular momentum, and road banking.", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch3", "Chapter 5", "Work, Energy and Power", "কাজ, শক্তি ও ক্ষমতা", "Work done by constant/variable force, potential & kinetic energy, conservation of mechanical energy, and spring force.", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch4", "Chapter 6", "Gravitation and Gravity", "মহাকর্ষ ও অভিকর্ষ", "Kepler's laws, Newton's law of gravitation, variation of 'g' with height/depth, escape velocity, and satellites.", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch5", "Chapter 10", "Ideal Gas and Kinetics of Gas", "আদর্শ গ্যাস ও গ্যাসের গতিতত্ব", "Boyle's law, Charles' law, ideal gas equation, root mean square (RMS) velocity, humidity, and dew point.", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)")
      ]
    });

    // Physics 2nd Paper
    subjectsList.push({
      id: "physics2",
      name: "Physics 2nd Paper",
      banglaName: "পদার্থবিজ্ঞান ২য় পত্র (এইচএসসি)",
      color: "from-cyan-500 to-blue-600",
      chapters: [
        createChapter("p2_11_ch1", "Chapter 1", "Thermodynamics", "তাপগতিবিদ্যা", "Thermal equilibrium, Zeroth, 1st and 2nd laws, Carnot engine, entropy, and heat death.", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch2", "Chapter 2", "Static Electricity", "স্থির তড়িৎ", "Coulomb's law, electric field, potential, Gauss's law, capacitance, and capacitor combinations.", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch3", "Chapter 3", "Current Electricity", "চল তড়িৎ", "Ohm's law, shunt, wheatstone bridge, Kirchhoff's laws, potentiometer, and Joule heating.", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch4", "Chapter 6", "Physical Optics", "ভৌত আলোকবিজ্ঞান", "Wave theory, Huygens' principle, interference, Young's double-slit experiment, polarization.", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch5", "Chapter 10", "Semiconductor & Electronics", "সেমিকন্ডাক্টর ও ইলেকট্রনিক্স", "p-n junction, diodes, rectifiers, transistors (NPN, PNP), and digital logic gates.", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)")
      ]
    });

    // Chemistry 1st Paper
    subjectsList.push({
      id: "chemistry1",
      name: "Chemistry 1st Paper",
      banglaName: "রসায়ন ১ম পত্র (এইচএসসি)",
      color: "from-pink-500 to-rose-600",
      chapters: [
        createChapter("c1_11_ch1", "Chapter 1", "Safe Laboratory Use", "ল্যাবরেটরির নিরাপদ ব্যবহার", "Safety goggles, chemical handling, cleaning glasswares, and disposing of laboratory hazards safely.", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_11_ch2", "Chapter 2", "Qualitative Chemistry", "গুণগত রসায়ন", "Rutherford/Bohr models, quantum numbers, Aufbau/Hund/Pauli rules, solubility product (Ksp), and chromatography.", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_11_ch3", "Chapter 3", "Periodic Properties of Elements", "মৌলের পর্যায়বৃত্ত ধর্ম", "s, p, d, f blocks, atomic radius, ionization energy, electronegativity, hybridization, and hydrogen bonds.", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_11_ch4", "Chapter 4", "Chemical Changes", "রাসায়নিক পরিবর্তন", "Reversible reactions, rate law, Kc and Kp derivations, pH scale, buffer solutions, and Born-Haber cycle.", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)")
      ]
    });

    // Chemistry 2nd Paper
    subjectsList.push({
      id: "chemistry2",
      name: "Chemistry 2nd Paper",
      banglaName: "রসায়ন ২য় পত্র (এইচএসসি)",
      color: "from-pink-500 to-rose-600",
      chapters: [
        createChapter("c2_11_ch1", "Chapter 1", "Environmental Chemistry", "পরিবেশ রসায়ন", "Gas laws (Boyle, Charles, Dalton), greenhouse effect, acid rain, and BOD/COD standards.", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch2", "Chapter 2", "Organic Chemistry", "জৈব রসায়ন", "Classification, IUPAC naming, aliphatic vs aromatic hydrocarbons, reaction mechanisms, and polymers.", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch3", "Chapter 3", "Quantitative Chemistry", "পরিমাণগত রসায়ন", "Acid-base titrations, redox titrations, oxidation numbers, molality, molarity, and ppm conversions.", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch4", "Chapter 4", "Electrochemistry", "তড়িৎ রসায়ন", "Electrolysis, Faraday's laws, galvanic cell, Nernst equation, and fuel cells.", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)")
      ]
    });

    // Higher Math 1st Paper
    subjectsList.push({
      id: "math1",
      name: "Higher Math 1st Paper",
      banglaName: "উচ্চতর গণিত ১ম পত্র",
      color: "from-amber-500 to-orange-600",
      chapters: [
        createChapter("hm1_11_ch1", "Chapter 1", "Matrix and Determinants", "ম্যাট্রিক্স ও নির্ণায়ক", "Types of matrices, matrix addition/multiplication, determinants properties, Cramer's rule, and inverse matrix.", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_11_ch2", "Chapter 3", "Straight Line", "সরলরেখা", "Cartesian/polar coordinates, distance between points, division of segments, slope, and intercept equations.", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_11_ch3", "Chapter 4", "Circle", "বৃত্ত", "Standard equation of circle, finding center/radius, tangents, orthogonal circles, and chord equations.", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_11_ch4", "Chapter 7", "Trigonometry Basics", "ত্রিকোণমিতি", "Trigonometric ratios of compound angles, multiple/sub-multiple angles, and proving standard identities.", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_11_ch5", "Chapter 9", "Differentiation", "অন্তরীকরণ", "Limits, continuity, differentiation from first principles, chain rule, tangents, and maxima/minima.", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_11_ch6", "Chapter 10", "Integration", "যোগজীকরণ", "Indefinite integration, integration by parts, substitution method, definite integrals, and area under curves.", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper")
      ]
    });

    // Higher Math 2nd Paper
    subjectsList.push({
      id: "math2",
      name: "Higher Math 2nd Paper",
      banglaName: "উচ্চতর গণিত ২য় পত্র",
      color: "from-amber-500 to-orange-600",
      chapters: [
        createChapter("hm2_11_ch1", "Chapter 1", "Real Numbers & Inequalities", "বাস্তব সংখ্যা ও অসমতা", "Syllabus properties of real numbers, proving intervals, and solving quadratic inequalities.", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_11_ch2", "Chapter 3", "Complex Numbers", "জटिल সংখ্যা", "Imaginary unit 'i', modulus, argument, polar representation, and square roots of complex sums.", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_11_ch3", "Chapter 4", "Polynomials and Polynomial Equations", "বহুপদী ও বহুপদী সমীকরণ", "Roots of quadratic and cubic equations, symmetric functions of roots, and nature of roots.", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_11_ch4", "Chapter 6", "Conics", "কনিক", "Standard equations, focus, directrix, eccentricity of Parabola, Ellipse, and Hyperbola.", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_11_ch5", "Chapter 7", "Inverse Trigonometric Functions & Equations", "বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ", "Formulas of inverse sine/cosine, and solving general trigonometric equations inside bounds.", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper")
      ]
    });

    // Biology 1st Paper (Botany)
    subjectsList.push({
      id: "biology1",
      name: "Biology 1st Paper",
      banglaName: "জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)",
      color: "from-green-500 to-emerald-600",
      chapters: [
        createChapter("bio1_11_ch1", "Chapter 1", "Cell and its Structure", "কোষ ও এর গঠন", "Ultrastructure of plant cell, fluid mosaic model, DNA double helix, transcription, and translation.", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch2", "Chapter 2", "Cell Division", "কোষ বিভাজন", "Amitosis, Mitosis phases, crossing over, Meiosis-I and II significance.", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch3", "Chapter 4", "Microorganisms", "অণুজীব", "Virus replication, bacteriophage, bacteria structures, Malaria parasite life cycle.", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper")
      ]
    });

    // Biology 2nd Paper (Zoology)
    subjectsList.push({
      id: "biology2",
      name: "Biology 2nd Paper",
      banglaName: "জীববিজ্ঞান ২য় পত্র (প্রাণীবিজ্ঞান)",
      color: "from-green-500 to-emerald-600",
      chapters: [
        createChapter("bio2_11_ch1", "Chapter 1", "Animal Diversity & Classification", "প্রাণীর বিভিন্নতা ও শ্রেণীবিন্যাস", "Non-chordates (Phylum Porifera to Echinodermata) and Chordata classification.", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch2", "Chapter 2", "Animal Physiology: Digestion", "প্রাণীর শরীরবৃত্ত: পরিপাক", "Digestive system of human, enzyme actions, and absorption of carbohydrates/proteins/fats.", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch3", "Chapter 4", "Human Circulation", "রক্ত সঞ্চালন", "Cardiac cycle, ECG, pacemaker, double circulation, and standard coronary block treatments.", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper")
      ]
    });

  }

  if (isBusiness) {
    // Accounting 1st Paper
    subjectsList.push({
      id: "accounting1",
      name: "Accounting 1st Paper",
      banglaName: "হিসাববিজ্ঞান ১ম পত্র (এইচএসসি)",
      color: "from-indigo-500 to-violet-600",
      chapters: [
        createChapter("acc1_11_ch1", "Chapter 1", "Accounting Process", "হিসাববিজ্ঞান পরিচিতি", "Basic definitions, transactions, dual aspects, accounting equation, and history.", CLASS_NAME, "Business Studies", "Accounting 1st Paper", "NCTB HSC Accounting First Paper"),
        createChapter("acc1_11_ch2", "Chapter 2", "Ledgers & Books of Accounts", "হিসাবের বইসমূহ", "Cash books, single/double/triple-column cash books, petty cash, and bank reconciliation statements.", CLASS_NAME, "Business Studies", "Accounting 1st Paper", "NCTB HSC Accounting First Paper"),
        createChapter("acc1_11_ch3", "Chapter 4", "Work Sheet", "কার্যপত্র", "Adjusting entries, prepaying assets, accrued liabilities, and preparing a standard worksheet.", CLASS_NAME, "Business Studies", "Accounting 1st Paper", "NCTB HSC Accounting First Paper")
      ]
    });

    // Accounting 2nd Paper
    subjectsList.push({
      id: "accounting2",
      name: "Accounting 2nd Paper",
      banglaName: "হিসাববিজ্ঞান ২য় পত্র (এইচএসসি)",
      color: "from-indigo-500 to-violet-600",
      chapters: [
        createChapter("acc2_11_ch1", "Chapter 2", "Partnership Accounting", "অংশীদারি কারবারের হিসাব", "Profit-loss appropriation accounts, capital accounts of partners, and goodwill valuation.", CLASS_NAME, "Business Studies", "Accounting 2nd Paper", "NCTB HSC Accounting Second Paper"),
        createChapter("acc2_11_ch2", "Chapter 4", "Joint Stock Company Capital", "যৌথ মূলধনী কোম্পানির মূলধন", "Issuing shares, premium, discount, journal entries, and statement of financial position.", CLASS_NAME, "Business Studies", "Accounting 2nd Paper", "NCTB HSC Accounting Second Paper"),
        createChapter("acc2_11_ch3", "Chapter 5", "Financial Statement Analysis", "আর্থিক বিবরণী বিশ্লেষণ", "Ratio analysis, liquid ratios, profitability ratios, and working capital ratios.", CLASS_NAME, "Business Studies", "Accounting 2nd Paper", "NCTB HSC Accounting Second Paper")
      ]
    });

    // Finance, Banking & Insurance 1st Paper
    subjectsList.push({
      id: "finance1",
      name: "Finance 1st Paper",
      banglaName: "ফিন্যান্স ও ব্যাংকিং ১ম পত্র",
      color: "from-amber-500 to-yellow-600",
      chapters: [
        createChapter("fin1_11_ch1", "Chapter 1", "Introduction to Finance", "অর্থায়নের সূচনা", "Goals of finance, profit maximization vs wealth maximization, and financial principles.", CLASS_NAME, "Business Studies", "Finance 1st Paper", "NCTB HSC Finance First Paper"),
        createChapter("fin1_11_ch2", "Chapter 3", "Time Value of Money", "অর্থের সময়মূল্য", "Compounding, discounting, annuity calculations, and amortization schedule.", CLASS_NAME, "Business Studies", "Finance 1st Paper", "NCTB HSC Finance First Paper")
      ]
    });

    // Finance, Banking & Insurance 2nd Paper
    subjectsList.push({
      id: "finance2",
      name: "Finance 2nd Paper",
      banglaName: "ফিন্যান্স ও ব্যাংকিং ২য় পত্র",
      color: "from-amber-500 to-yellow-600",
      chapters: [
        createChapter("fin2_11_ch1", "Chapter 1", "Introduction to Banking", "ব্যাংক ব্যবস্থার প্রাথমিক ধারণা", "Definitions, origin, classification of banks, and banking structures in Bangladesh.", CLASS_NAME, "Business Studies", "Finance 2nd Paper", "NCTB HSC Finance Second Paper"),
        createChapter("fin2_11_ch2", "Chapter 2", "Central Banking", "কেন্দ্রীয় ব্যাংক", "Bangladesh Bank, currency control, credit regulation, and clearinghouse operations.", CLASS_NAME, "Business Studies", "Finance 2nd Paper", "NCTB HSC Finance Second Paper")
      ]
    });

    // Business Organization & Management 1st Paper
    subjectsList.push({
      id: "bus_org1",
      name: "Business Org 1st Paper",
      banglaName: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র",
      color: "from-sky-500 to-cyan-600",
      chapters: [
        createChapter("bo1_11_ch1", "Chapter 1", "Basic Concepts of Business", "ব্যবসায়ের মৌলিক ধারণা", "Definitions, industry, commerce, direct service, and economic significance.", CLASS_NAME, "Business Studies", "Business Org 1st Paper", "NCTB HSC Business Organization Book"),
        createChapter("bo1_11_ch2", "Chapter 2", "Sole Proprietorship Business", "একমালিকানা ব্যবসায়", "Definition, advantages, limitations, and scope of sole proprietorship in Bangladesh.", CLASS_NAME, "Business Studies", "Business Org 1st Paper", "NCTB HSC Business Organization Book")
      ]
    });

      // Business Organization & Management 2nd Paper
    subjectsList.push({
      id: "bus_org2",
      name: "Business Org 2nd Paper",
      banglaName: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র",
      color: "from-sky-500 to-cyan-600",
      chapters: [
        createChapter("bo2_11_ch1", "Chapter 1", "Management Concepts", "ব্যবস্থাপনার ধারণা", "Principles of management, functions (Planning, Organizing, Staffing, Directing, Controlling).", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_11_ch2", "Chapter 2", "Planning & Decision Making", "পরিকল্পনা প্রণয়ন ও সিদ্ধান্ত গ্রহণ", "Types of plans, steps in plan design, and standard corporate decision models.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper")
      ]
    });
  }

  if (isHumanities) {
    // Civics & Good Governance 1st Paper
    subjectsList.push({
      id: "civics1",
      name: "Civics & Good Governance 1st Paper",
      banglaName: "পৌরনীতি ও সুশাসন ১ম পত্র",
      color: "from-fuchsia-500 to-pink-600",
      chapters: [
        createChapter("civ1_11_ch1", "Chapter 1", "Civics & Good Governance Intro", "পৌরনীতি ও সুশাসন পরিচিতি", "Definitions, relationship with other social sciences, and benefits of studying good governance.", CLASS_NAME, "Humanities", "Civics 1st Paper", "NCTB HSC Civics First Paper"),
        createChapter("civ1_11_ch2", "Chapter 2", "Values, Law, Liberty & Equality", "মূল্যবোধ, আইন, স্বাধীনতা ও সাম্য", "Defining civic values, sources of law, liberty classifications, and socio-economic equality.", CLASS_NAME, "Humanities", "Civics 1st Paper", "NCTB HSC Civics First Paper")
      ]
    });

    // History 1st Paper
    subjectsList.push({
      id: "history1",
      name: "History 1st Paper",
      banglaName: "ইতিহাস ১ম পত্র (এইচএসসি)",
      color: "from-orange-500 to-red-600",
      chapters: [
        createChapter("his1_11_ch1", "Chapter 1", "Arrival of Europeans in Bengal", "ইউরোপীয়দের বাংলায় আগমন", "The Portuguese, Dutch, French, and British traders, and setting up East India company.", CLASS_NAME, "Humanities", "History 1st Paper", "NCTB HSC History First Paper"),
        createChapter("his1_11_ch2", "Chapter 2", "Battle of Palashi and Buxar", "পলাশী ও বক্সারের যুদ্ধ", "Decline of Nawab Sirajuddaula, Battle of Palashi, and establish of British rule.", CLASS_NAME, "Humanities", "History 1st Paper", "NCTB HSC History First Paper")
      ]
    });

    // Logic 1st Paper
    subjectsList.push({
      id: "logic1",
      name: "Logic 1st Paper",
      banglaName: "যুক্তিবিদ্যা ১ম পত্র",
      color: "from-violet-500 to-indigo-600",
      chapters: [
        createChapter("log1_11_ch1", "Chapter 1", "Introduction to Logic", "যুক্তিবিদ্যা পরিচিতি", "Definition, historical development (Aristotle, Mill, Copi), and scientific nature of logic.", CLASS_NAME, "Humanities", "Logic 1st Paper", "NCTB HSC Logic First Paper"),
        createChapter("log1_11_ch2", "Chapter 2", "Terms and Propositions", "যুক্তির উপাদান", "Difference between terms and words, logical propositions, and simple vs compound terms.", CLASS_NAME, "Humanities", "Logic 1st Paper", "NCTB HSC Logic First Paper")
      ]
    });
  }

  return subjectsList;
};
