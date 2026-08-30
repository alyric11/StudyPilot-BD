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
  bookName: string,
  section?: string
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
    nctbBookName: bookName,
    section
  };
}

const CLASS_NAME = "Class 11";

const GROUPS = {
  SCIENCE: "Science",
  BUSINESS: "Business Studies",
  HUMANITIES: "Humanities"
} as const;

type AcademicGroup = (typeof GROUPS)[keyof typeof GROUPS];

export const class11Subjects = (group: string): Subject[] => {
  const isScience = group === GROUPS.SCIENCE;
  const isBusiness = group === GROUPS.BUSINESS;
  const isHumanities = group === GROUPS.HUMANITIES;

  const subjectsList: Subject[] = [];

  // Common Subjects
  // Bangla, English and ICT are added for every group.

  // Mandatory Subjects
  // Mandatory subjects are added only to their respective group.

  // Selectable Subjects
  // Selectable subjects are filtered later using their eligibleGroups.
  // A subject may therefore be available to:
  // - one group
  // - two groups
  // - all three groups

  const addSelectableSubject = (
    subject: Subject,
    eligibleGroups: AcademicGroup[]
  ) => {
    if (eligibleGroups.includes(group as AcademicGroup)) {
      subjectsList.push({
        ...subject,
        category: "selectable",
        eligibleGroups
      });
    }
  };

  // Compulsory Subjects
  // Bangla 1st Paper
  subjectsList.push({
    id: "bangla_1",
    name: "Bangla 1st Paper",
    banglaName: "বাংলা ১ম পত্র",
    color: "from-emerald-500 to-emerald-600",
    category: "common",
    chapters: [
      createChapter("b1_11_ch1", "Chapter 1", "Chapter 1", "বাঙ্গালার নব্য লেখকদিগের প্রতি নিবেদন", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch2", "Chapter 2", "Chapter 2", "অপরিচিতা", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch3", "Chapter 3", "Chapter 3", "বিলাসী", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch4", "Chapter 4", "Chapter 4", "সাহিত্যে খেলা", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch5", "Chapter 5", "Chapter 5", "অর্ধাঙ্গী", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch6", "Chapter 6", "Chapter 6", "যৌবনের গান", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch7", "Chapter 7", "Chapter 7", "জীবন ও বৃক্ষ", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch8", "Chapter 8", "Chapter 8", "গন্তব্য কাবুল", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch9", "Chapter 9", "Chapter 9", "মাসি-পিসি", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch10", "Chapter 10", "Chapter 10", "কাপিলদাস মুর্মুর শেষ কাজ", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch11", "Chapter 11", "Chapter 11", "রেইনকোট", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_11_ch12", "Chapter 12", "Chapter 12", "নেকলেস", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),

      createChapter("b1_11_ch13", "Chapter 13", "Chapter 13", "ঋতু বর্ণন", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_11_ch14", "Chapter 14", "Chapter 14", "বিভীষণের প্রতি মেঘনাদ", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_11_ch15", "Chapter 15", "Chapter 15", "সোনার তরী", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_11_ch16", "Chapter 16", "Chapter 16", "বিদ্রোহী", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_11_ch17", "Chapter 17", "Chapter 17", "চেতনা", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_11_ch18", "Chapter 18", "Chapter 18", "প্রতিদান", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_11_ch19", "Chapter 19", "Chapter 19", "তাহারেই পড়ে মনে", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_11_ch20", "Chapter 20", "Chapter 20", "পদ্মা", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_11_ch21", "Chapter 21", "Chapter 21", "আঠারো বছর বয়সে", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_11_ch22", "Chapter 22", "Chapter 22", "আমি কিংবদন্তির কথা বলছি", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_11_ch23", "Chapter 23", "Chapter 23", "ফেব্রুয়ারি ১৯৬৯", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),

      createChapter("b1_11_ch24", "Chapter 24", "Chapter 24", "লালসালু", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "উপন্যাস"),
      createChapter("b1_11_ch25", "Chapter 25", "Chapter 25", "সিরাজউদ্দৌলা", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "নাটক")
    ]
  });

  subjectsList.push({
    id: "bangla_2",
    name: "Bangla 2nd Paper",
    banglaName: "বাংলা ২য় পত্র",
    color: "from-emerald-500 to-emerald-600",
    category: "common",
    chapters: [
      createChapter("b2_11_q1", "Question 1", "Rules of Bangla Pronunciation", "বাংলা উচ্চারণের নিয়ম", "বাংলা উচ্চারণের নিয়ম।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),
      createChapter("b2_11_q2", "Question 2", "Rules of Bangla Spelling", "বাংলা বানানের নিয়ম", "বাংলা বানানের নিয়ম।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),
      createChapter("b2_11_q3", "Question 3", "Grammatical Word Classes", "বাংলা ভাষার ব্যাকরণিক শব্দশ্রেণি", "বাংলা ভাষার ব্যাকরণিক শব্দশ্রেণি।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),
      createChapter("b2_11_q4", "Question 4", "Prefixes, Suffixes and Samasa", "উপসর্গ, প্রত্যয় ও সমাস", "উপসর্গ, প্রত্যয় ও সমাস।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),
      createChapter("b2_11_q5", "Question 5", "Syntax and Sentence Structure", "বাক্যতত্ত্ব / বাক্য প্রকরণ", "বাক্যতত্ত্ব / বাক্য প্রকরণ।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),
      createChapter("b2_11_q6", "Question 6", "Correct and Incorrect Usage", "বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ", "বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),

      createChapter("b2_11_q7", "Question 7", "Technical Terms / English to Bangla Translation", "পারিভাষিক শব্দ / ইংরেজি থেকে বাংলা অনুবাদ", "পারিভাষিক শব্দ / ইংরেজি থেকে বাংলা অনুবাদ।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি"),
      createChapter("b2_11_q8", "Question 8", "Diary / Experience Description / Speech / Report", "দিনলিপি / অভিজ্ঞতা বর্ণনা অথবা ভাষণ / প্রতিবেদন", "দিনলিপি / অভিজ্ঞতা বর্ণনা অথবা ভাষণ / প্রতিবেদন।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি"),
      createChapter("b2_11_q9", "Question 9", "Email / Letter / Application", "বৈদ্যুতিন চিঠি (ই-মেইল) / পত্র / আবেদনপত্র", "বৈদ্যুতিন চিঠি (ই-মেইল) / পত্র / আবেদনপত্র।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি"),
      createChapter("b2_11_q10", "Question 10", "Summary / Main Idea / Summary / Expansion of Ideas", "সারাংশ / সারমর্ম / সারসংক্ষেপ অথবা ভাবসম্প্রসারণ", "সারাংশ / সারমর্ম / সারসংক্ষেপ অথবা ভাবসম্প্রসারণ।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি"),
      createChapter("b2_11_q11", "Question 11", "Dialogue / Short Story", "সংলাপ অথবা ক্ষুদে গল্প", "সংলাপ অথবা ক্ষুদে গল্প।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি"),
      createChapter("b2_11_q12", "Question 12", "Essay Writing", "প্রবন্ধ রচনা", "প্রবন্ধ রচনা।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি")
    ]
  });

  // English 1st Paper
  subjectsList.push({
    id: "english_1",
    name: "English 1st Paper",
    banglaName: "English 1st Paper",
    color: "from-blue-500 to-indigo-600",
    category: "common",
    chapters: [
      createChapter("e1_11_u1_l1", "Lesson 1", "The Parrot's Tale", "The Parrot's Tale", "Unit One: Education and Life", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit One: Education and Life"),
      createChapter("e1_11_u1_l2", "Lesson 2", "Education and Technology", "Education and Technology", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit One: Education and Life"),
      createChapter("e1_11_u1_l3", "Lesson 3", "Children in School", "Children in School", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit One: Education and Life"),
      createChapter("e1_11_u1_l4", "Lesson 4", "Civic Engagement", "Civic Engagement", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit One: Education and Life"),

      createChapter("e1_11_u2_l1", "Lesson 1", "What is Beauty?", "What is Beauty?", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Two: Art and Craft"),
      createChapter("e1_11_u2_l2", "Lesson 2", "Folk Music", "Folk Music", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Two: Art and Craft"),
      createChapter("e1_11_u2_l3", "Lesson 3", "Art", "Art", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Two: Art and Craft"),
      createChapter("e1_11_u2_l4", "Lesson 4", "Craft", "Craft", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Two: Art and Craft"),

      createChapter("e1_11_u3_l1", "Lesson 1", "Myths of Bengal", "Myths of Bengal", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Three: Myths and Literature"),
      createChapter("e1_11_u3_l2", "Lesson 2", "Icarus", "Icarus", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Three: Myths and Literature"),
      createChapter("e1_11_u3_l3", "Lesson 3", "The Legend of Gazi", "The Legend of Gazi", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Three: Myths and Literature"),
      createChapter("e1_11_u3_l4", "Lesson 4", "Khona", "Khona", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Three: Myths and Literature"),

      createChapter("e1_11_u4_l1", "Lesson 1", "July Uprising: A Transformative Movement", "July Uprising: A Transformative Movement", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Four: History"),
      createChapter("e1_11_u4_l2", "Lesson 2", "Transformative Speeches", "Transformative Speeches", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Four: History"),
      createChapter("e1_11_u4_l3", "Lesson 3", "Great Women", "Great Women", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Four: History"),

      createChapter("e1_11_u5_l1", "Lesson 1", "Are We Aware of These Rights-I?", "Are We Aware of These Rights-I?", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Five: Human Rights"),
      createChapter("e1_11_u5_l2", "Lesson 2", "Are We Aware of These Rights-II?", "Are We Aware of These Rights-II?", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Five: Human Rights"),
      createChapter("e1_11_u5_l3", "Lesson 3", "Rights to Health and Education", "Rights to Health and Education", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Five: Human Rights"),
      createChapter("e1_11_u5_l4", "Lesson 4", "Coal Miners", "Coal Miners", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Five: Human Rights"),
      createChapter("e1_11_u5_l5", "Lesson 5", "Frederick Douglass", "Frederick Douglass", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Five: Human Rights"),

      createChapter("e1_11_u6_l1", "Lesson 1", "What is a Dream?", "What is a Dream?", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Six: Dreams"),
      createChapter("e1_11_u6_l2", "Lesson 2", "Dreams in Literature", "Dreams in Literature", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Six: Dreams"),

      createChapter("e1_11_u7_l1", "Lesson 1", "Brojen Das: On Crossing the English Channel", "Brojen Das: On Crossing the English Channel", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Seven: Youthful Achievers"),
      createChapter("e1_11_u7_l2", "Lesson 2", "Scaling a Mountain Peak", "Scaling a Mountain Peak", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Seven: Youthful Achievers"),
      createChapter("e1_11_u7_l3", "Lesson 3", "The Unbeaten Girls", "The Unbeaten Girls", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Seven: Youthful Achievers"),

      createChapter("e1_11_u8_l1", "Lesson 1", "Family Relationship", "Family Relationship", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eight: Relationships"),
      createChapter("e1_11_u8_l2", "Lesson 2", "Warmth in Relationships", "Warmth in Relationships", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eight: Relationships"),
      createChapter("e1_11_u8_l3", "Lesson 3", "A Mother in Manville", "A Mother in Manville", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eight: Relationships"),
      createChapter("e1_11_u8_l4", "Lesson 4", "Love", "Love", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eight: Relationships"),

      createChapter("e1_11_u9_l1", "Lesson 1", "Storm and Stresses of Adolescence", "Storm and Stresses of Adolescence", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Nine: Adolescence"),
      createChapter("e1_11_u9_l2", "Lesson 2", "Adolescence and Some (Related) Problems in Bangladesh", "Adolescence and Some (Related) Problems in Bangladesh", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Nine: Adolescence"),
      createChapter("e1_11_u9_l3", "Lesson 3", "The Story of Shilpi", "The Story of Shilpi", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Nine: Adolescence"),
      createChapter("e1_11_u9_l4", "Lesson 4", "Say 'No' to Bullying", "Say 'No' to Bullying", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Nine: Adolescence"),

      createChapter("e1_11_u10_l1", "Lesson 1", "Manners around the World", "Manners around the World", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Ten: Lifestyle"),
      createChapter("e1_11_u10_l2", "Lesson 2", "Etiquette Netiquette", "Etiquette Netiquette", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Ten: Lifestyle"),
      createChapter("e1_11_u10_l3", "Lesson 3", "Food and Culture", "Food and Culture", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Ten: Lifestyle"),
      createChapter("e1_11_u10_l4", "Lesson 4", "Fitness", "Fitness", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Ten: Lifestyle"),
      createChapter("e1_11_u10_l5", "Lesson 5", "Consumerism", "Consumerism", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Ten: Lifestyle"),

      createChapter("e1_11_u11_l1", "Lesson 1", "Situations of Conflict", "Situations of Conflict", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eleven: Peace and Conflict"),
      createChapter("e1_11_u11_l2", "Lesson 2", "The Old Man at the Bridge by Ernest Hemingway", "The Old Man at the Bridge by Ernest Hemingway", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eleven: Peace and Conflict"),
      createChapter("e1_11_u11_l3", "Lesson 3", "Stories From Gaza", "Stories From Gaza", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eleven: Peace and Conflict"),
      createChapter("e1_11_u11_l4", "Lesson 4", "Peace in Literature", "Peace in Literature", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eleven: Peace and Conflict"),
      createChapter("e1_11_u11_l5", "Lesson 5", "Opinions through images", "Opinions through images", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eleven: Peace and Conflict"),

      createChapter("e1_11_u12_l1", "Lesson 1", "Water, Water Everywhere...", "Water, Water Everywhere...", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Twelve: Environment and Nature"),
      createChapter("e1_11_u12_l2", "Lesson 2", "The Greta Effect", "The Greta Effect", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Twelve: Environment and Nature"),
      createChapter("e1_11_u12_l3", "Lesson 3", "Endangered Species", "Endangered Species", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Twelve: Environment and Nature"),
      createChapter("e1_11_u12_l4", "Lesson 4", "What is Environmental Justice?", "What is Environmental Justice?", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Twelve: Environment and Nature"),
      createChapter("e1_11_u12_l5", "Lesson 5", "Limits of the Scientific Method", "Limits of the Scientific Method", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Twelve: Environment and Nature")
    ]
  });

  // English 2nd Paper
  subjectsList.push({
    id: "english_2",
    name: "English 2nd Paper",
    banglaName: "English 2nd Paper",
    color: "from-blue-500 to-indigo-600",
    category: "common",
    chapters: [
      createChapter("e2_11_q1", "Question 1", "Article", "Article", "Grammar — Article.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q2", "Question 2", "Prepositions", "Prepositions", "Grammar — Prepositions.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q3", "Question 3", "Gap Filling with Clues", "Gap Filling with Clues", "Grammar — Gap filling with clues.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q4", "Question 4", "Completing Sentences", "Completing Sentences", "Grammar — Completing sentences.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q5", "Question 5", "Right Form of Verb", "Right Form of Verb", "Grammar — Right form of verb.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q6", "Question 6", "Pronoun Reference / Agreement", "Pronoun Reference / Agreement", "Grammar — Pronoun reference / agreement.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q7", "Question 7", "Narrative Style", "Narrative Style", "Grammar — Narrative style.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q8", "Question 8", "Transformation / Changing Sentences", "Transformation / Changing Sentences", "Grammar — Transformation / changing sentences.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q9", "Question 9", "Use of Modifiers", "Use of Modifiers", "Grammar — Use of modifiers.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q10", "Question 10", "Sentence Connectors", "Sentence Connectors", "Grammar — Sentence connectors.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q11", "Question 11", "Synonyms and Antonyms", "Synonyms and Antonyms", "Grammar — Synonyms and antonyms.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_11_q12", "Question 12", "Punctuation", "Punctuation", "Grammar — Punctuation.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),

      createChapter("e2_11_q13", "Question 13", "Formal Letter / E-mail", "Formal Letter / E-mail", "Composition — Formal letter / E-mail.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Composition"),
      createChapter("e2_11_q14", "Question 14", "Report Writing", "Report Writing", "Composition — Report writing.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Composition"),
      createChapter("e2_11_q15", "Question 15", "Paragraph Writing", "Paragraph Writing", "Composition — Paragraph writing.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Composition"),
      createChapter("e2_11_q16", "Question 16", "Composition / Free Writing", "Composition / Free Writing", "Composition — Composition / free writing.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Composition")
    ]
  });

  // ICT
  subjectsList.push({
    id: "ict_11",
    name: "ICT",
    banglaName: "তথ্য ও যোগাযোগ প্রযুক্তি",
    color: "from-purple-500 to-violet-600",
    category: "common",
    chapters: [
      createChapter("ict_11_ch1", "Chapter 1", "Information and Communication Technology: World and Bangladesh Perspective", "তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch2", "Chapter 2", "Communication Systems and Networking", "কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch3", "Chapter 3", "Number Systems and Digital Devices", "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch4", "Chapter 4", "Introduction to Web Design and HTML", "ওয়েব ডিজাইন পরিচিতি এবং HTML", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch5", "Chapter 5", "Programming Language", "প্রোগ্রামিং ভাষা", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch6", "Chapter 6", "Database Management System", "ডেটাবেজ ম্যানেজমেন্ট সিস্টেম", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book")
    ]
  });

  // Group-Specific Mandatory Subjects
  if (isScience) {
    // Physics 1st Paper
    subjectsList.push({
      id: "physics1",
      name: "Physics 1st Paper",
      banglaName: "পদার্থবিজ্ঞান ১ম পত্র",
      color: "from-cyan-500 to-blue-600",
      category: "mandatory",
      eligibleGroups: ["Science"],
      chapters: [
        createChapter("p1_11_ch1", "Chapter 1", "Physical World and Measurement", "ভৌতজগৎ ও পরিমাপ", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch2", "Chapter 2", "Vector", "ভেক্টর", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch3", "Chapter 3", "Kinematics", "গতিবিদ্যা", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch4", "Chapter 4", "Newtonian Mechanics", "নিউটনীয় বলবিদ্যা", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch5", "Chapter 5", "Work, Energy and Power", "কাজ, শক্তি ও ক্ষমতা", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch6", "Chapter 6", "Gravitation and Gravity", "মহাকর্ষ ও অভিকর্ষ", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch7", "Chapter 7", "Structural Properties of Matter", "পদার্থের গাঠনিক ধর্ম", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch8", "Chapter 8", "Periodic Motion", "পর্যাবৃত্ত গতি", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch9", "Chapter 9", "Waves", "তরঙ্গ", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_11_ch10", "Chapter 10", "Ideal Gas and Kinetic Theory of Gases", "আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)")
      ]
    });

    // Physics 2nd Paper
    subjectsList.push({
      id: "physics2",
      name: "Physics 2nd Paper",
      banglaName: "পদার্থবিজ্ঞান ২য় পত্র",
      color: "from-cyan-500 to-blue-600",
      category: "mandatory",
      eligibleGroups: ["Science"],
      chapters: [
        createChapter("p2_11_ch1", "Chapter 1", "Thermodynamics", "তাপগতিবিদ্যা", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch2", "Chapter 2", "Static Electricity", "স্থির তড়িৎ", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch3", "Chapter 3", "Current Electricity", "চল তড়িৎ", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch4", "Chapter 4", "Magnetic Effects of Electric Current and Magnetism", "তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch5", "Chapter 5", "Electromagnetic Induction and Alternating Current", "তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch6", "Chapter 6", "Geometrical Optics", "জ্যামিতিক আলোকবিজ্ঞান", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch7", "Chapter 7", "Physical Optics", "ভৌত আলোকবিজ্ঞান", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch8", "Chapter 8", "Introduction to Modern Physics", "আধুনিক পদার্থবিজ্ঞানের সূচনা", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch9", "Chapter 9", "Atomic Model and Nuclear Physics", "পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch10", "Chapter 10", "Semiconductor and Electronics", "সেমিকন্ডাক্টর ও ইলেকট্রনিক্স", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_11_ch11", "Chapter 11", "Astronomy", "জ্যোতির্বিজ্ঞান", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)")
      ]
    });

    // Chemistry 1st Paper
    subjectsList.push({
      id: "chemistry1",
      name: "Chemistry 1st Paper",
      banglaName: "রসায়ন ১ম পত্র",
      color: "from-pink-500 to-rose-600",
      category: "mandatory",
      eligibleGroups: ["Science"],
      chapters: [
        createChapter("c1_11_ch1", "Chapter 1", "Safe Laboratory Use", "ল্যাবরেটরির নিরাপদ ব্যবহার", "", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_11_ch2", "Chapter 2", "Qualitative Chemistry", "গুণগত রসায়ন", "", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_11_ch3", "Chapter 3", "Periodic Properties of Elements and Chemical Bonding", "মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন", "", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_11_ch4", "Chapter 4", "Chemical Changes", "রাসায়নিক পরিবর্তন", "", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_11_ch5", "Chapter 5", "Applied Chemistry", "কর্মমুখী রসায়ন", "", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)")
      ]
    });

    // Chemistry 2nd Paper
    subjectsList.push({
      id: "chemistry2",
      name: "Chemistry 2nd Paper",
      banglaName: "রসায়ন ২য় পত্র",
      color: "from-pink-500 to-rose-600",
      category: "mandatory",
      eligibleGroups: ["Science"],
      chapters: [
        createChapter("c2_11_ch1", "Chapter 1", "Environmental Chemistry", "পরিবেশ রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch2", "Chapter 2", "Organic Chemistry", "জৈব রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch3", "Chapter 3", "Quantitative Chemistry", "পরিমাণগত রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch4", "Chapter 4", "Electrochemistry", "তড়িৎ রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch5", "Chapter 5", "Economic Chemistry", "অর্থনৈতিক রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)")
      ]
    });

    // Biology 1st Paper (Botany)
    subjectsList.push({
      id: "biology1",
      name: "Biology 1st Paper",
      banglaName: "জীববিজ্ঞান ১ম পত্র",
      color: "from-green-500 to-emerald-600",
      category: "selectable",
      eligibleGroups: ["Science"],
      chapters: [
        createChapter("bio1_11_ch1", "Chapter 1", "Cell and its Structure", "কোষ ও এর গঠন", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch2", "Chapter 2", "Cell Division", "কোষ বিভাজন", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch3", "Chapter 3", "Cell Chemistry", "কোষ রসায়ন", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch4", "Chapter 4", "Microorganisms", "অণুজীব", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch5", "Chapter 5", "Algae and Fungi", "শৈবাল ও ছত্রাক", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch6", "Chapter 6", "Bryophyta and Pteridophyta", "ব্রায়োফাইটা ও টেরিডোফাইটা", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch7", "Chapter 7", "Gymnosperms and Angiosperms", "নগ্নবীজী ও আবৃতবীজী উদ্ভিদ", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch8", "Chapter 8", "Tissue and Tissue Systems", "টিস্যু ও টিস্যুতন্ত্র", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch9", "Chapter 9", "Plant Physiology", "উদ্ভিদ শারীরতত্ত্ব", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch10", "Chapter 10", "Plant Reproduction", "উদ্ভিদ প্রজনন", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch11", "Chapter 11", "Biotechnology", "জীবপ্রযুক্তি", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_11_ch12", "Chapter 12", "Environment, Distribution and Conservation of Organisms", "জীবের পরিবেশ, বিস্তার ও সংরক্ষণ", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper")
      ]
    });

    // Biology 2nd Paper (Zoology)
    subjectsList.push({
      id: "biology2",
      name: "Biology 2nd Paper",
      banglaName: "জীববিজ্ঞান ২য় পত্র",
      color: "from-green-500 to-emerald-600",
      category: "selectable",
      eligibleGroups: ["Science"],
      chapters: [
        createChapter("bio2_11_ch1", "Chapter 1", "Animal Diversity and Classification", "প্রাণীর বিভিন্নতা ও শ্রেণীবিন্যাস", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch2", "Chapter 2", "Introduction to Animals", "প্রাণীর পরিচিতি", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch3", "Chapter 3", "Human Physiology: Digestion and Absorption", "মানব শারীরতত্ত্ব: পরিপাক ও শোষণ", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch4", "Chapter 4", "Human Physiology: Blood and Circulation", "মানব শারীরতত্ত্ব: রক্ত ও সংবহন", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch5", "Chapter 5", "Human Physiology: Respiration", "মানব শারীরতত্ত্ব: শ্বসন ও শ্বাসক্রিয়া", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch6", "Chapter 6", "Human Physiology: Excretion", "মানব শারীরতত্ত্ব: বর্জ্য ও নিষ্কাশন", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch7", "Chapter 7", "Human Physiology: Locomotion", "মানব শারীরতত্ত্ব: চলন ও অঙ্গচালনা", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch8", "Chapter 8", "Human Physiology: Coordination and Control", "মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch9", "Chapter 9", "Continuity of Human Life", "মানব জীবনের ধারাবাহিকতা", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch10", "Chapter 10", "Defense of the Human Body", "মানবদেহের প্রতিরক্ষা", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch11", "Chapter 11", "Genetics and Evolution", "জিনতত্ত্ব ও বিবর্তন", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_11_ch12", "Chapter 12", "Animal Behaviour", "প্রাণীর আচরণ", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper")
      ]
    });

    // Soil Science 1st Paper
    subjectsList.push({
      id: "soil_science1",
      name: "Soil Science 1st Paper",
      banglaName: "মৃত্তিকাবিজ্ঞান ১ম পত্র",
      color: "from-amber-500 to-orange-600",
      category: "selectable",
      eligibleGroups: ["Science"],
      chapters: []
    });

    // Soil Science 2nd Paper
    subjectsList.push({
      id: "soil_science2",
      name: "Soil Science 2nd Paper",
      banglaName: "মৃত্তিকাবিজ্ঞান ২য় পত্র",
      color: "from-amber-500 to-orange-600",
      category: "selectable",
      eligibleGroups: ["Science"],
      chapters: []
    });

  }

  if (isBusiness) {
    // Accounting 1st Paper
    subjectsList.push({
      id: "accounting1",
      name: "Accounting 1st Paper",
      banglaName: "হিসাববিজ্ঞান ১ম পত্র",
      color: "from-indigo-500 to-violet-600",
      category: "mandatory",
      eligibleGroups: ["Business Studies"],
      chapters: [
        createChapter("acc1_11_ch1", "Chapter 1", "Introduction to Accounting", "হিসাববিজ্ঞান পরিচিতি", "Introduction to accounting concepts, objectives, users of accounting information, transactions, accounting equation, and double-entry principles.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_11_ch2", "Chapter 2", "Books of Accounts", "হিসাবের বইসমূহ", "Primary books of accounts, journal, ledger, cash book, and the recording process of business transactions.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_11_ch3", "Chapter 3", "Bank Reconciliation Statement", "ব্যাংক সমন্বয় বিবরণী", "Preparation and understanding of bank reconciliation statements and the causes of differences between cash book and bank statement.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_11_ch4", "Chapter 4", "Trial Balance", "রেওয়ামিল", "Preparation of trial balance, classification of accounts, and checking the arithmetical accuracy of accounting records.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_11_ch5", "Chapter 5", "Principles of Accounting", "হিসাববিজ্ঞানের নীতিমালা", "Fundamental accounting principles, concepts, conventions, and their application in preparing reliable accounting information.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_11_ch6", "Chapter 6", "Accounting for Receivables", "প্রাপ্য হিসাবসমূহের হিসাবরক্ষণ", "Accounting treatment of receivables, bad debts, doubtful debts, and related adjustments.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_11_ch7", "Chapter 7", "Worksheet", "কার্যপত্র", "Preparation and use of accounting worksheets for organizing adjustments and preparing financial statements.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_11_ch8", "Chapter 8", "Accounting for Tangible and Intangible Assets", "দৃশ্যমান ও অদৃশ্যমান সম্পদের হিসাবরক্ষণ", "Accounting treatment of tangible and intangible assets, depreciation, amortization, and related adjustments.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_11_ch9", "Chapter 9", "Financial Statements", "আর্থিক বিবরণী", "Preparation and presentation of financial statements and understanding the financial position and performance of a business.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_11_ch10", "Chapter 10", "Single Entry System", "একতরফা দাখিলা পদ্ধতি", "Understanding the single entry system and determining profit or loss and financial position from incomplete accounting records.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper")
      ]
    });

    // Accounting 2nd Paper
    subjectsList.push({
      id: "accounting2",
      name: "Accounting 2nd Paper",
      banglaName: "হিসাববিজ্ঞান ২য় পত্র",
      color: "from-indigo-500 to-violet-600",
      category: "mandatory",
      eligibleGroups: ["Business Studies"],
      chapters: [
        createChapter("acc2_11_ch1", "Chapter 1", "Accounting for Non-Profit Organizations", "অব্যবসায়ী প্রতিষ্ঠানের হিসাব", "Accounting procedures and financial statements of non-profit organizations.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_11_ch2", "Chapter 2", "Accounting for Partnership Businesses", "অংশীদারি ব্যবসায়ের হিসাব", "Accounting for partnership formation, profit distribution, capital, interest, and changes among partners.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_11_ch3", "Chapter 3", "Cash Flow Statement", "নগদ প্রবাহ বিবরণী", "Preparation and analysis of cash flow statements and classification of cash flows.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_11_ch4", "Chapter 4", "Capital of Joint Stock Companies", "যৌথমূলধনী কোম্পানির মূলধন", "Accounting for share capital, issue of shares, and related transactions of joint stock companies.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_11_ch5", "Chapter 5", "Financial Statements of Joint Stock Companies", "যৌথমূলধনী কোম্পানির আর্থিক বিবরণী", "Preparation and presentation of financial statements of joint stock companies.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_11_ch6", "Chapter 6", "Financial Statement Analysis", "আর্থিক বিবরণী বিশ্লেষণ", "Analysis of financial statements using accounting ratios and related measures.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_11_ch7", "Chapter 7", "Production Cost Accounting", "উৎপাদন ব্যয় হিসাব", "Accounting for production costs and preparation and analysis of production cost statements.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_11_ch8", "Chapter 8", "Inventory Accounting Methods", "মজুদ পণ্যের হিসাবরক্ষণ পদ্ধতি", "Accounting methods for inventory and calculation of inventory costs.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_11_ch9", "Chapter 9", "Costs and Classification of Costs", "ব্যয় ও ব্যয়ের শ্রেণিবিভাগ", "Concepts of cost and classification of costs according to different business purposes.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_11_ch10", "Chapter 10", "Introduction to Management Accounting", "ব্যবস্থাপনা হিসাববিজ্ঞান পরিচিতি", "Basic concepts, objectives, and applications of management accounting.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper")
      ]
    });

    // Business Organization & Management 1st Paper
    subjectsList.push({
      id: "bus_org1",
      name: "Business Org 1st Paper",
      banglaName: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র",
      color: "from-sky-500 to-cyan-600",
      category: "mandatory",
      eligibleGroups: ["Business Studies"],
      chapters: [
        createChapter("bom1_11_ch1", "Chapter 1", "Fundamental Concepts of Business", "ব্যবসায়ের মৌলিক ধারণা", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch2", "Chapter 2", "Business Environment", "ব্যবসায় পরিবেশ", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch3", "Chapter 3", "Sole Proprietorship Business", "একমালিকানা ব্যবসায়", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch4", "Chapter 4", "Partnership Business", "অংশীদারি ব্যবসায়", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch5", "Chapter 5", "Joint Stock Business", "যৌথমূলধনী ব্যবসায়", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch6", "Chapter 6", "Cooperative Society", "সমবায় সমিতি", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch7", "Chapter 7", "State-Owned Business", "রাষ্ট্রীয় ব্যবসায়", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch8", "Chapter 8", "Legal Aspects of Business", "ব্যবসায়ের আইনগত দিক", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch9", "Chapter 9", "Auxiliary Services to Business", "ব্যবসায়ে সহায়ক সেবা", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch10", "Chapter 10", "Business Entrepreneurship", "ব্যবসায় উদ্যোগ", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch11", "Chapter 11", "Use of Information and Communication Technology in Business", "ব্যবসায়ে তথ্য ও যোগাযোগ প্রযুক্তির ব্যবহার", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_11_ch12", "Chapter 12", "Business Ethics and Social Responsibility", "ব্যবসায়ে নৈতিকতা ও সামাজিক দায়বদ্ধতা", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper")
      ]
    });

    // Business Organization & Management 2nd Paper
    subjectsList.push({
      id: "bus_org2",
      name: "Business Org 2nd Paper",
      banglaName: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র",
      color: "from-sky-500 to-cyan-600",
      category: "mandatory",
      eligibleGroups: ["Business Studies"],
      chapters: [
        createChapter("bo2_11_ch1", "Chapter 1", "Management Concepts", "ব্যবস্থাপনার ধারণা", "Concept, characteristics, importance, functions, levels, management cycle, and universality of management.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_11_ch2", "Chapter 2", "Principles of Management", "ব্যবস্থাপনা নীতি", "Concept and principles of management, contributions of Taylor and Fayol, and qualities and roles of an ideal manager.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_11_ch3", "Chapter 3", "Planning & Decision Making", "পরিকল্পনা প্রণয়ন ও সিদ্ধান্ত গ্রহণ", "Concept, importance and process of planning, types of plans, and the decision-making process.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_11_ch4", "Chapter 4", "Organizing", "সংগঠিতকরণ", "Concept, importance, principles and process of organizing, organizational structure, authority, responsibility, and delegation.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_11_ch5", "Chapter 5", "Staffing", "কর্মীসংস্থান", "Concept, importance and process of staffing, recruitment, selection, promotion, training, and employee development.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_11_ch6", "Chapter 6", "Leadership", "নেতৃত্ব", "Concept, importance, types and theories of leadership, qualities of an ideal leader, and leadership functions.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_11_ch7", "Chapter 7", "Motivation", "প্রেষণা", "Concept, characteristics, importance, techniques and major theories of employee motivation.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_11_ch8", "Chapter 8", "Communication", "যোগাযোগ", "Concept, process, importance, types, barriers, and use of information and communication technology in business communication.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_11_ch9", "Chapter 9", "Coordination", "সমন্বয়সাধন", "Concept, characteristics, types, principles, importance, and methods of achieving effective coordination.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_11_ch10", "Chapter 10", "Controlling", "নিয়ন্ত্রণ", "Concept, characteristics, importance, principles, steps, techniques, and types of control in business organizations.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper")
      ]
    });

    // Finance, Banking & Insurance 1st Paper
    subjectsList.push({
      id: "finance1",
      name: "Finance 1st Paper",
      banglaName: "ফিন্যান্স ও ব্যাংকিং ১ম পত্র",
      color: "from-amber-500 to-yellow-600",
      category: "selectable",
      eligibleGroups: ["Business Studies"],


      chapters: [
        createChapter("fin1_11_ch1", "Chapter 1", "Introduction to Finance", "অর্থায়নের সূচনা", "The concept, evolution, nature, functions, principles, and objectives of finance.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_11_ch2", "Chapter 2", "Legal Aspects of Financial Markets", "আর্থিক বাজারের আইনগত দিকসমূহ", "Legal and regulatory aspects related to financial markets and financial transactions.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_11_ch3", "Chapter 3", "Time Value of Money", "অর্থের সময় মূল্য", "The time value of money, present value, future value, and related financial calculations.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_11_ch4", "Chapter 4", "Financial Analysis", "আর্থিক বিশ্লেষণ", "Analysis of financial information and financial statements for decision-making.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_11_ch5", "Chapter 5", "Short and Medium-Term Financing", "স্বল্প ও মধ্যমেয়াদি অর্থায়ন", "Sources, methods, and costs of short-term and medium-term business financing.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_11_ch6", "Chapter 6", "Long-Term Financing", "দীর্ঘমেয়াদি অর্থায়ন", "Long-term sources of finance and methods of raising long-term business funds.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_11_ch7", "Chapter 7", "Cost of Capital", "মূলধন ব্যয়", "Concept, components, and calculation of the cost of different sources of capital.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_11_ch8", "Chapter 8", "Capital Budgeting and Investment Decisions", "মূলধন বাজেটিং ও বিনিয়োগ সিদ্ধান্ত", "Capital budgeting techniques and financial evaluation of investment decisions.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_11_ch9", "Chapter 9", "Risk and Rate of Return", "ঝুঁকি এবং মুনাফার হার", "Relationship between financial risk, investment risk, and expected rate of return.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper")
      ]
    });

    // Finance, Banking & Insurance 2nd Paper
    subjectsList.push({
      id: "finance2",
      name: "Finance 2nd Paper",
      banglaName: "ফিন্যান্স ও ব্যাংকিং ২য় পত্র",
      color: "from-amber-500 to-yellow-600",
      category: "selectable",
      eligibleGroups: ["Business Studies"],
      chapters: [
        createChapter("fbi2_11_ch1", "Chapter 1", "Primary Concept of Banking", "ব্যাংক ব্যবস্থার প্রাথমিক ধারণা", "Concept, functions, history, and basic structure of the banking system.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch2", "Chapter 2", "Central Bank", "কেন্দ্রীয় ব্যাংক", "Concept, functions, organization, and monetary responsibilities of a central bank.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch3", "Chapter 3", "Commercial Bank", "বাণিজ্যিক ব্যাংক", "Concept, functions, services, and operations of commercial banks.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch4", "Chapter 4", "Bank Accounts", "ব্যাংক হিসাব", "Types of bank accounts, account opening, deposits, and related banking procedures.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch5", "Chapter 5", "Negotiable Instruments", "হস্তান্তরযোগ্য ঋণের দলিল", "Concept and characteristics of negotiable instruments used in banking and finance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch6", "Chapter 6", "Cheque, Bill of Exchange & Promissory Note", "চেক, বিনিময় বিল ও প্রতিশ্রুতিপত্র", "Features, parties, types, and uses of cheques, bills of exchange, and promissory notes.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch7", "Chapter 7", "Sources and Uses of Bank Funds", "ব্যাংক তহবিলের উৎস ও ব্যবহার", "Sources of bank funds and their major uses in banking operations.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch8", "Chapter 8", "Foreign Exchange and Foreign Currency", "বৈদেশিক বিনিময় ও বৈদেশিক মুদ্রা", "Foreign exchange, foreign currency, exchange rates, and related banking activities.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch9", "Chapter 9", "Electronic and Modern Banking", "ইলেকট্রনিক ও আধুনিক ব্যাংকিং", "Electronic banking services, digital banking, and modern banking technologies.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch10", "Chapter 10", "Basic Concept of Insurance", "বিমা সম্পর্কে মৌলিক ধারণা", "Concept, principles, importance, and basic classifications of insurance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch11", "Chapter 11", "Life Insurance", "জীবন বিমা", "Concept, characteristics, types, and principles of life insurance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch12", "Chapter 12", "Marine Insurance", "নৌ-বিমা", "Concept, characteristics, risks, and coverage associated with marine insurance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch13", "Chapter 13", "Fire Insurance", "অগ্নি বিমা", "Concept, principles, risks, and coverage associated with fire insurance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_11_ch14", "Chapter 14", "Miscellaneous Insurance", "বিবিধ বিমা", "Different forms and applications of insurance other than life, marine, and fire insurance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper")
      ]
    });

    // Production Management & Marketing 1st Paper
    subjectsList.push({
      id: "production_marketing1",
      name: "Production Management & Marketing 1st Paper",
      banglaName: "উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম পত্র",
      color: "from-violet-500 to-purple-600",
      category: "selectable",
      eligibleGroups: ["Business Studies"],
      chapters: []
    });

    // Production Management & Marketing 2nd Paper
    subjectsList.push({
      id: "production_marketing2",
      name: "Production Management & Marketing 2nd Paper",
      banglaName: "উৎপাদন ব্যবস্থাপনা ও বিপণন ২য় পত্র",
      color: "from-violet-500 to-purple-600",
      category: "selectable",
      eligibleGroups: ["Business Studies"],
      chapters: []
    });

    // Tourism & Hospitality 1st Paper
    subjectsList.push({
      id: "tourism_hospitality1",
      name: "Tourism & Hospitality 1st Paper",
      banglaName: "ট্যুরিজম অ্যান্ড হসপিটালিটি ১ম পত্র",
      color: "from-teal-500 to-cyan-600",
      category: "selectable",
      eligibleGroups: ["Business Studies"],
      chapters: []
    });

    // Tourism & Hospitality 2nd Paper
    subjectsList.push({
      id: "tourism_hospitality2",
      name: "Tourism & Hospitality 2nd Paper",
      banglaName: "ট্যুরিজম অ্যান্ড হসপিটালিটি ২য় পত্র",
      color: "from-teal-500 to-cyan-600",
      category: "selectable",
      eligibleGroups: ["Business Studies"],
      chapters: []
    });
  }

  if (isHumanities) {
    // History 1st Paper
    subjectsList.push({
      id: "history1",
      name: "History 1st Paper",
      banglaName: "ইতিহাস ১ম পত্র",
      color: "from-orange-500 to-red-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // History 2nd Paper
    subjectsList.push({
      id: "history2",
      name: "History 2nd Paper",
      banglaName: "ইতিহাস ২য় পত্র",
      color: "from-orange-500 to-red-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Islamic History & Culture 1st Paper
    subjectsList.push({
      id: "islamic_history1",
      name: "Islamic History & Culture 1st Paper",
      banglaName: "ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র",
      color: "from-emerald-500 to-green-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Islamic History & Culture 2nd Paper
    subjectsList.push({
      id: "islamic_history2",
      name: "Islamic History & Culture 2nd Paper",
      banglaName: "ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র",
      color: "from-emerald-500 to-green-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Civics & Good Governance 1st Paper
    subjectsList.push({
      id: "civics1",
      name: "Civics & Good Governance 1st Paper",
      banglaName: "পৌরনীতি ও সুশাসন ১ম পত্র",
      color: "from-fuchsia-500 to-pink-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Civics & Good Governance 2nd Paper
    subjectsList.push({
      id: "civics2",
      name: "Civics & Good Governance 2nd Paper",
      banglaName: "পৌরনীতি ও সুশাসন ২য় পত্র",
      color: "from-fuchsia-500 to-pink-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Sociology 1st Paper
    subjectsList.push({
      id: "sociology1",
      name: "Sociology 1st Paper",
      banglaName: "সমাজবিজ্ঞান ১ম পত্র",
      color: "from-indigo-500 to-blue-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Sociology 2nd Paper
    subjectsList.push({
      id: "sociology2",
      name: "Sociology 2nd Paper",
      banglaName: "সমাজবিজ্ঞান ২য় পত্র",
      color: "from-indigo-500 to-blue-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Social Work 1st Paper
    subjectsList.push({
      id: "social_work1",
      name: "Social Work 1st Paper",
      banglaName: "সমাজকর্ম ১ম পত্র",
      color: "from-rose-500 to-pink-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Social Work 2nd Paper
    subjectsList.push({
      id: "social_work2",
      name: "Social Work 2nd Paper",
      banglaName: "সমাজকর্ম ২য় পত্র",
      color: "from-rose-500 to-pink-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Logic 1st Paper
    subjectsList.push({
      id: "logic1",
      name: "Logic 1st Paper",
      banglaName: "যুক্তিবিদ্যা ১ম পত্র",
      color: "from-violet-500 to-indigo-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Logic 2nd Paper
    subjectsList.push({
      id: "logic2",
      name: "Logic 2nd Paper",
      banglaName: "যুক্তিবিদ্যা ২য় পত্র",
      color: "from-violet-500 to-indigo-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Islamic Studies 1st Paper
    subjectsList.push({
      id: "islamic_studies1",
      name: "Islamic Studies 1st Paper",
      banglaName: "ইসলাম শিক্ষা ১ম পত্র",
      color: "from-lime-500 to-green-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });

    // Islamic Studies 2nd Paper
    subjectsList.push({
      id: "islamic_studies2",
      name: "Islamic Studies 2nd Paper",
      banglaName: "ইসলাম শিক্ষা ২য় পত্র",
      color: "from-lime-500 to-green-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: []
    });


    // Subjects common to Science and Humanities groups
    if (isScience || isHumanities) {
      // Higher Math 1st Paper
      subjectsList.push({
        id: "math1",
        name: "Higher Math 1st Paper",
        banglaName: "উচ্চতর গণিত ১ম পত্র",
        color: "from-amber-500 to-orange-600",
        category: "selectable",
        eligibleGroups: ["Science", "Humanities"],
        chapters: [
          createChapter("hm1_11_ch1", "Chapter 1", "Matrix and Determinants", "ম্যাট্রিক্স ও নির্ণায়ক", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
          createChapter("hm1_11_ch2", "Chapter 2", "Vector", "ভেক্টর", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
          createChapter("hm1_11_ch3", "Chapter 3", "Straight Line", "সরলরেখা", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
          createChapter("hm1_11_ch4", "Chapter 4", "Circle", "বৃত্ত", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
          createChapter("hm1_11_ch5", "Chapter 5", "Permutation and Combination", "বিন্যাস ও সমাবেশ", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
          createChapter("hm1_11_ch6", "Chapter 6", "Trigonometric Ratios", "ত্রিকোণমিতিক অনুপাত", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
          createChapter("hm1_11_ch7", "Chapter 7", "Trigonometric Ratios of Compound Angles", "সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
          createChapter("hm1_11_ch8", "Chapter 8", "Functions and Graphs of Functions", "ফাংশন ও ফাংশনের লেখচিত্র", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
          createChapter("hm1_11_ch9", "Chapter 9", "Differentiation", "অন্তরীকরণ", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
          createChapter("hm1_11_ch10", "Chapter 10", "Integration", "যোগজীকরণ", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper")
        ]
      });

      // Higher Math 2nd Paper
      subjectsList.push({
        id: "math2",
        name: "Higher Math 2nd Paper",
        banglaName: "উচ্চতর গণিত ২য় পত্র",
        color: "from-amber-500 to-orange-600",
        category: "selectable",
        eligibleGroups: ["Science", "Humanities"],
        chapters: [
          createChapter("hm2_11_ch1", "Chapter 1", "Real Numbers and Inequalities", "বাস্তব সংখ্যা ও অসমতা", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
          createChapter("hm2_11_ch2", "Chapter 2", "Linear Programming", "যোগাশ্রয়ী প্রোগ্রাম", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
          createChapter("hm2_11_ch3", "Chapter 3", "Complex Numbers", "জটিল সংখ্যা", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
          createChapter("hm2_11_ch4", "Chapter 4", "Polynomials and Polynomial Equations", "বহুপদী ও বহুপদী সমীকরণ", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
          createChapter("hm2_11_ch5", "Chapter 5", "Binomial Expansion", "দ্বিপদী বিস্তৃতি", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
          createChapter("hm2_11_ch6", "Chapter 6", "Conics", "কণিক", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
          createChapter("hm2_11_ch7", "Chapter 7", "Inverse Trigonometric Functions and Trigonometric Equations", "বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
          createChapter("hm2_11_ch8", "Chapter 8", "Statics", "স্থিতিবিদ্যা", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
          createChapter("hm2_11_ch9", "Chapter 9", "Motion of Particles in a Plane", "সমতলে বস্তুকণার গতি", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
          createChapter("hm2_11_ch10", "Chapter 10", "Measures of Dispersion and Probability", "বিস্তার পরিমাপ ও সম্ভাবনা", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper")
        ]
      });

      // Psychology 1st Paper
      subjectsList.push({
        id: "psychology1",
        name: "Psychology 1st Paper",
        banglaName: "মনোবিজ্ঞান ১ম পত্র",
        color: "from-pink-500 to-rose-600",
        category: "selectable",
        eligibleGroups: ["Science", "Humanities"],
        chapters: []
      });

      // Psychology 2nd Paper
      subjectsList.push({
        id: "psychology2",
        name: "Psychology 2nd Paper",
        banglaName: "মনোবিজ্ঞান ২য় পত্র",
        color: "from-pink-500 to-rose-600",
        category: "selectable",
        eligibleGroups: ["Science", "Humanities"],
        chapters: []
      });
    }

    // Subjects common to Business Studies and Humanities groups 
    if (isBusiness || isHumanities) {
      // Economics 1st Paper
      subjectsList.push({
        id: "economics1",
        name: "Economics 1st Paper",
        banglaName: "অর্থনীতি ১ম পত্র",
        color: "from-blue-500 to-indigo-600",
        category: "selectable",
        eligibleGroups: ["Business Studies", "Humanities"],
        chapters: []
      });

      // Economics 2nd Paper
      subjectsList.push({
        id: "economics2",
        name: "Economics 2nd Paper",
        banglaName: "অর্থনীতি ২য় পত্র",
        color: "from-blue-500 to-indigo-600",
        category: "selectable",
        eligibleGroups: ["Business Studies", "Humanities"],
        chapters: []
      });

      // Home Science 1st Paper
      subjectsList.push({
        id: "home_science1",
        name: "Home Science 1st Paper",
        banglaName: "গার্হস্থ্য বিজ্ঞান ১ম পত্র",
        color: "from-rose-500 to-pink-600",
        category: "selectable",
        eligibleGroups: ["Business Studies", "Humanities"],
        chapters: []
      });

      // Home Science 2nd Paper
      subjectsList.push({
        id: "home_science2",
        name: "Home Science 2nd Paper",
        banglaName: "গার্হস্থ্য বিজ্ঞান ২য় পত্র",
        color: "from-rose-500 to-pink-600",
        category: "selectable",
        eligibleGroups: ["Business Studies", "Humanities"],
        chapters: []
      });
    }

    // Subjects selectable by all three groups
    if (isScience || isBusiness || isHumanities) {
      // Agriculture Studies 1st Paper
      subjectsList.push({
        id: "agriculture1",
        name: "Agriculture Studies 1st Paper",
        banglaName: "কৃষিশিক্ষা ১ম পত্র",
        color: "from-green-500 to-emerald-600",
        category: "selectable",
        eligibleGroups: ["Science", "Business Studies", "Humanities"],
        chapters: []
      });

      // Agriculture Studies 2nd Paper
      subjectsList.push({
        id: "agriculture2",
        name: "Agriculture Studies 2nd Paper",
        banglaName: "কৃষিশিক্ষা ২য় পত্র",
        color: "from-green-500 to-emerald-600",
        category: "selectable",
        eligibleGroups: ["Science", "Business Studies", "Humanities"],
        chapters: []
      });

      // Geography 1st Paper
      subjectsList.push({
        id: "geography1",
        name: "Geography 1st Paper",
        banglaName: "ভূগোল ১ম পত্র",
        color: "from-teal-500 to-cyan-600",
        category: "selectable",
        eligibleGroups: ["Science", "Business Studies", "Humanities"],
        chapters: []
      });

      // Geography 2nd Paper
      subjectsList.push({
        id: "geography2",
        name: "Geography 2nd Paper",
        banglaName: "ভূগোল ২য় পত্র",
        color: "from-teal-500 to-cyan-600",
        category: "selectable",
        eligibleGroups: ["Science", "Business Studies", "Humanities"],
        chapters: []
      });

      // Statistics 1st Paper
      subjectsList.push({
        id: "statistics1",
        name: "Statistics 1st Paper",
        banglaName: "পরিসংখ্যান ১ম পত্র",
        color: "from-indigo-500 to-violet-600",
        category: "selectable",
        eligibleGroups: ["Science", "Business Studies", "Humanities"],
        chapters: []
      });

      // Statistics 2nd Paper
      subjectsList.push({
        id: "statistics2",
        name: "Statistics 2nd Paper",
        banglaName: "পরিসংখ্যান ২য় পত্র",
        color: "from-indigo-500 to-violet-600",
        category: "selectable",
        eligibleGroups: ["Science", "Business Studies", "Humanities"],
        chapters: []
      });
    }
  }

  return subjectsList;
};
