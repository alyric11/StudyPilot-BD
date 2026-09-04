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

const CLASS_NAME = "Class 12";

const GROUPS = {
  SCIENCE: "Science",
  BUSINESS: "Business Studies",
  HUMANITIES: "Humanities"
} as const;

type AcademicGroup = (typeof GROUPS)[keyof typeof GROUPS];

export const class12Subjects = (group: string): Subject[] => {
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
      createChapter("b1_12_ch1", "Chapter 1", "Chapter 1", "বাঙ্গালার নব্য লেখকদিগের প্রতি নিবেদন", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch2", "Chapter 2", "Chapter 2", "অপরিচিতা", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch3", "Chapter 3", "Chapter 3", "বিলাসী", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch4", "Chapter 4", "Chapter 4", "সাহিত্যে খেলা", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch5", "Chapter 5", "Chapter 5", "অর্ধাঙ্গী", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch6", "Chapter 6", "Chapter 6", "যৌবনের গান", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch7", "Chapter 7", "Chapter 7", "জীবন ও বৃক্ষ", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch8", "Chapter 8", "Chapter 8", "গন্তব্য কাবুল", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch9", "Chapter 9", "Chapter 9", "মাসি-পিসি", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch10", "Chapter 10", "Chapter 10", "কাপিলদাস মুর্মুর শেষ কাজ", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch11", "Chapter 11", "Chapter 11", "রেইনকোট", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),
      createChapter("b1_12_ch12", "Chapter 12", "Chapter 12", "নেকলেস", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "গদ্য"),

      createChapter("b1_12_ch13", "Chapter 13", "Chapter 13", "ঋতু বর্ণন", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_12_ch14", "Chapter 14", "Chapter 14", "বিভীষণের প্রতি মেঘনাদ", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_12_ch15", "Chapter 15", "Chapter 15", "সোনার তরী", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_12_ch16", "Chapter 16", "Chapter 16", "বিদ্রোহী", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_12_ch17", "Chapter 17", "Chapter 17", "চেতনা", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_12_ch18", "Chapter 18", "Chapter 18", "প্রতিদান", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_12_ch19", "Chapter 19", "Chapter 19", "তাহারেই পড়ে মনে", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_12_ch20", "Chapter 20", "Chapter 20", "পদ্মা", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_12_ch21", "Chapter 21", "Chapter 21", "আঠারো বছর বয়সে", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_12_ch22", "Chapter 22", "Chapter 22", "আমি কিংবদন্তির কথা বলছি", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),
      createChapter("b1_12_ch23", "Chapter 23", "Chapter 23", "ফেব্রুয়ারি ১৯৬৯", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "কবিতা"),

      createChapter("b1_12_ch24", "Chapter 24", "Chapter 24", "লালসালু", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "উপন্যাস"),
      createChapter("b1_12_ch25", "Chapter 25", "Chapter 25", "সিরাজউদ্দৌলা", "", CLASS_NAME, group, "Bangla 1st Paper", "NCTB Class 11 Sahitto Path", "নাটক")
    ]
  });

  subjectsList.push({
    id: "bangla_2",
    name: "Bangla 2nd Paper",
    banglaName: "বাংলা ২য় পত্র",
    color: "from-emerald-500 to-emerald-600",
    category: "common",
    chapters: [
      createChapter("b2_12_q1", "Question 1", "Rules of Bangla Pronunciation", "বাংলা উচ্চারণের নিয়ম", "বাংলা উচ্চারণের নিয়ম।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),
      createChapter("b2_12_q2", "Question 2", "Rules of Bangla Spelling", "বাংলা বানানের নিয়ম", "বাংলা বানানের নিয়ম।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),
      createChapter("b2_12_q3", "Question 3", "Grammatical Word Classes", "বাংলা ভাষার ব্যাকরণিক শব্দশ্রেণি", "বাংলা ভাষার ব্যাকরণিক শব্দশ্রেণি।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),
      createChapter("b2_12_q4", "Question 4", "Prefixes, Suffixes and Samasa", "উপসর্গ, প্রত্যয় ও সমাস", "উপসর্গ, প্রত্যয় ও সমাস।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),
      createChapter("b2_12_q5", "Question 5", "Syntax and Sentence Structure", "বাক্যতত্ত্ব / বাক্য প্রকরণ", "বাক্যতত্ত্ব / বাক্য প্রকরণ।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),
      createChapter("b2_12_q6", "Question 6", "Correct and Incorrect Usage", "বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ", "বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "ব্যাকরণ"),

      createChapter("b2_12_q7", "Question 7", "Technical Terms / English to Bangla Translation", "পারিভাষিক শব্দ / ইংরেজি থেকে বাংলা অনুবাদ", "পারিভাষিক শব্দ / ইংরেজি থেকে বাংলা অনুবাদ।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি"),
      createChapter("b2_12_q8", "Question 8", "Diary / Experience Description / Speech / Report", "দিনলিপি / অভিজ্ঞতা বর্ণনা অথবা ভাষণ / প্রতিবেদন", "দিনলিপি / অভিজ্ঞতা বর্ণনা অথবা ভাষণ / প্রতিবেদন।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি"),
      createChapter("b2_12_q9", "Question 9", "Email / Letter / Application", "বৈদ্যুতিন চিঠি (ই-মেইল) / পত্র / আবেদনপত্র", "বৈদ্যুতিন চিঠি (ই-মেইল) / পত্র / আবেদনপত্র।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি"),
      createChapter("b2_12_q10", "Question 10", "Summary / Main Idea / Summary / Expansion of Ideas", "সারাংশ / সারমর্ম / সারসংক্ষেপ অথবা ভাবসম্প্রসারণ", "সারাংশ / সারমর্ম / সারসংক্ষেপ অথবা ভাবসম্প্রসারণ।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি"),
      createChapter("b2_12_q11", "Question 11", "Dialogue / Short Story", "সংলাপ অথবা ক্ষুদে গল্প", "সংলাপ অথবা ক্ষুদে গল্প।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি"),
      createChapter("b2_12_q12", "Question 12", "Essay Writing", "প্রবন্ধ রচনা", "প্রবন্ধ রচনা।", CLASS_NAME, group, "Bangla 2nd Paper", "HSC Bangla 2nd Paper", "নির্মিতি")
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
      createChapter("e1_12_u1_l1", "Lesson 1", "The Parrot's Tale", "The Parrot's Tale", "Unit One: Education and Life", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit One: Education and Life"),
      createChapter("e1_12_u1_l2", "Lesson 2", "Education and Technology", "Education and Technology", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit One: Education and Life"),
      createChapter("e1_12_u1_l3", "Lesson 3", "Children in School", "Children in School", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit One: Education and Life"),
      createChapter("e1_12_u1_l4", "Lesson 4", "Civic Engagement", "Civic Engagement", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit One: Education and Life"),

      createChapter("e1_12_u2_l1", "Lesson 1", "What is Beauty?", "What is Beauty?", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Two: Art and Craft"),
      createChapter("e1_12_u2_l2", "Lesson 2", "Folk Music", "Folk Music", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Two: Art and Craft"),
      createChapter("e1_12_u2_l3", "Lesson 3", "Art", "Art", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Two: Art and Craft"),
      createChapter("e1_12_u2_l4", "Lesson 4", "Craft", "Craft", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Two: Art and Craft"),

      createChapter("e1_12_u3_l1", "Lesson 1", "Myths of Bengal", "Myths of Bengal", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Three: Myths and Literature"),
      createChapter("e1_12_u3_l2", "Lesson 2", "Icarus", "Icarus", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Three: Myths and Literature"),
      createChapter("e1_12_u3_l3", "Lesson 3", "The Legend of Gazi", "The Legend of Gazi", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Three: Myths and Literature"),
      createChapter("e1_12_u3_l4", "Lesson 4", "Khona", "Khona", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Three: Myths and Literature"),

      createChapter("e1_12_u4_l1", "Lesson 1", "July Uprising: A Transformative Movement", "July Uprising: A Transformative Movement", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Four: History"),
      createChapter("e1_12_u4_l2", "Lesson 2", "Transformative Speeches", "Transformative Speeches", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Four: History"),
      createChapter("e1_12_u4_l3", "Lesson 3", "Great Women", "Great Women", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Four: History"),

      createChapter("e1_12_u5_l1", "Lesson 1", "Are We Aware of These Rights-I?", "Are We Aware of These Rights-I?", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Five: Human Rights"),
      createChapter("e1_12_u5_l2", "Lesson 2", "Are We Aware of These Rights-II?", "Are We Aware of These Rights-II?", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Five: Human Rights"),
      createChapter("e1_12_u5_l3", "Lesson 3", "Rights to Health and Education", "Rights to Health and Education", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Five: Human Rights"),
      createChapter("e1_12_u5_l4", "Lesson 4", "Coal Miners", "Coal Miners", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Five: Human Rights"),
      createChapter("e1_12_u5_l5", "Lesson 5", "Frederick Douglass", "Frederick Douglass", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Five: Human Rights"),

      createChapter("e1_12_u6_l1", "Lesson 1", "What is a Dream?", "What is a Dream?", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Six: Dreams"),
      createChapter("e1_12_u6_l2", "Lesson 2", "Dreams in Literature", "Dreams in Literature", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Six: Dreams"),

      createChapter("e1_12_u7_l1", "Lesson 1", "Brojen Das: On Crossing the English Channel", "Brojen Das: On Crossing the English Channel", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Seven: Youthful Achievers"),
      createChapter("e1_12_u7_l2", "Lesson 2", "Scaling a Mountain Peak", "Scaling a Mountain Peak", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Seven: Youthful Achievers"),
      createChapter("e1_12_u7_l3", "Lesson 3", "The Unbeaten Girls", "The Unbeaten Girls", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Seven: Youthful Achievers"),

      createChapter("e1_12_u8_l1", "Lesson 1", "Family Relationship", "Family Relationship", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eight: Relationships"),
      createChapter("e1_12_u8_l2", "Lesson 2", "Warmth in Relationships", "Warmth in Relationships", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eight: Relationships"),
      createChapter("e1_12_u8_l3", "Lesson 3", "A Mother in Manville", "A Mother in Manville", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eight: Relationships"),
      createChapter("e1_12_u8_l4", "Lesson 4", "Love", "Love", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eight: Relationships"),

      createChapter("e1_12_u9_l1", "Lesson 1", "Storm and Stresses of Adolescence", "Storm and Stresses of Adolescence", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Nine: Adolescence"),
      createChapter("e1_12_u9_l2", "Lesson 2", "Adolescence and Some (Related) Problems in Bangladesh", "Adolescence and Some (Related) Problems in Bangladesh", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Nine: Adolescence"),
      createChapter("e1_12_u9_l3", "Lesson 3", "The Story of Shilpi", "The Story of Shilpi", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Nine: Adolescence"),
      createChapter("e1_12_u9_l4", "Lesson 4", "Say 'No' to Bullying", "Say 'No' to Bullying", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Nine: Adolescence"),

      createChapter("e1_12_u10_l1", "Lesson 1", "Manners around the World", "Manners around the World", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Ten: Lifestyle"),
      createChapter("e1_12_u10_l2", "Lesson 2", "Etiquette Netiquette", "Etiquette Netiquette", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Ten: Lifestyle"),
      createChapter("e1_12_u10_l3", "Lesson 3", "Food and Culture", "Food and Culture", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Ten: Lifestyle"),
      createChapter("e1_12_u10_l4", "Lesson 4", "Fitness", "Fitness", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Ten: Lifestyle"),
      createChapter("e1_12_u10_l5", "Lesson 5", "Consumerism", "Consumerism", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Ten: Lifestyle"),

      createChapter("e1_12_u11_l1", "Lesson 1", "Situations of Conflict", "Situations of Conflict", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eleven: Peace and Conflict"),
      createChapter("e1_12_u11_l2", "Lesson 2", "The Old Man at the Bridge by Ernest Hemingway", "The Old Man at the Bridge by Ernest Hemingway", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eleven: Peace and Conflict"),
      createChapter("e1_12_u11_l3", "Lesson 3", "Stories From Gaza", "Stories From Gaza", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eleven: Peace and Conflict"),
      createChapter("e1_12_u11_l4", "Lesson 4", "Peace in Literature", "Peace in Literature", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eleven: Peace and Conflict"),
      createChapter("e1_12_u11_l5", "Lesson 5", "Opinions through images", "Opinions through images", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Eleven: Peace and Conflict"),

      createChapter("e1_12_u12_l1", "Lesson 1", "Water, Water Everywhere...", "Water, Water Everywhere...", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Twelve: Environment and Nature"),
      createChapter("e1_12_u12_l2", "Lesson 2", "The Greta Effect", "The Greta Effect", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Twelve: Environment and Nature"),
      createChapter("e1_12_u12_l3", "Lesson 3", "Endangered Species", "Endangered Species", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Twelve: Environment and Nature"),
      createChapter("e1_12_u12_l4", "Lesson 4", "What is Environmental Justice?", "What is Environmental Justice?", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Twelve: Environment and Nature"),
      createChapter("e1_12_u12_l5", "Lesson 5", "Limits of the Scientific Method", "Limits of the Scientific Method", "", CLASS_NAME, group, "English 1st Paper", "NCTB Class 11 English For Today", "Unit Twelve: Environment and Nature")
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
      createChapter("e2_12_q1", "Question 1", "Article", "Article", "Grammar — Article.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q2", "Question 2", "Prepositions", "Prepositions", "Grammar — Prepositions.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q3", "Question 3", "Gap Filling with Clues", "Gap Filling with Clues", "Grammar — Gap filling with clues.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q4", "Question 4", "Completing Sentences", "Completing Sentences", "Grammar — Completing sentences.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q5", "Question 5", "Right Form of Verb", "Right Form of Verb", "Grammar — Right form of verb.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q6", "Question 6", "Pronoun Reference / Agreement", "Pronoun Reference / Agreement", "Grammar — Pronoun reference / agreement.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q7", "Question 7", "Narrative Style", "Narrative Style", "Grammar — Narrative style.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q8", "Question 8", "Transformation / Changing Sentences", "Transformation / Changing Sentences", "Grammar — Transformation / changing sentences.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q9", "Question 9", "Use of Modifiers", "Use of Modifiers", "Grammar — Use of modifiers.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q10", "Question 10", "Sentence Connectors", "Sentence Connectors", "Grammar — Sentence connectors.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q11", "Question 11", "Synonyms and Antonyms", "Synonyms and Antonyms", "Grammar — Synonyms and antonyms.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),
      createChapter("e2_12_q12", "Question 12", "Punctuation", "Punctuation", "Grammar — Punctuation.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Grammar"),

      createChapter("e2_12_q13", "Question 13", "Formal Letter / E-mail", "Formal Letter / E-mail", "Composition — Formal letter / E-mail.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Composition"),
      createChapter("e2_12_q14", "Question 14", "Report Writing", "Report Writing", "Composition — Report writing.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Composition"),
      createChapter("e2_12_q15", "Question 15", "Paragraph Writing", "Paragraph Writing", "Composition — Paragraph writing.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Composition"),
      createChapter("e2_12_q16", "Question 16", "Composition / Free Writing", "Composition / Free Writing", "Composition — Composition / free writing.", CLASS_NAME, group, "English 2nd Paper", "HSC English 2nd Paper", "Composition")
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
      createChapter("ict_12_ch1", "Chapter 1", "Information and Communication Technology: World and Bangladesh Perspective", "তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_12_ch2", "Chapter 2", "Communication Systems and Networking", "কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_12_ch3", "Chapter 3", "Number Systems and Digital Devices", "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_12_ch4", "Chapter 4", "Introduction to Web Design and HTML", "ওয়েব ডিজাইন পরিচিতি এবং HTML", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_12_ch5", "Chapter 5", "Programming Language", "প্রোগ্রামিং ভাষা", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_12_ch6", "Chapter 6", "Database Management System", "ডেটাবেজ ম্যানেজমেন্ট সিস্টেম", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book")
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
        createChapter("p1_12_ch1", "Chapter 1", "Physical World and Measurement", "ভৌতজগৎ ও পরিমাপ", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_12_ch2", "Chapter 2", "Vector", "ভেক্টর", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_12_ch3", "Chapter 3", "Kinematics", "গতিবিদ্যা", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_12_ch4", "Chapter 4", "Newtonian Mechanics", "নিউটনীয় বলবিদ্যা", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_12_ch5", "Chapter 5", "Work, Energy and Power", "কাজ, শক্তি ও ক্ষমতা", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_12_ch6", "Chapter 6", "Gravitation and Gravity", "মহাকর্ষ ও অভিকর্ষ", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_12_ch7", "Chapter 7", "Structural Properties of Matter", "পদার্থের গাঠনিক ধর্ম", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_12_ch8", "Chapter 8", "Periodic Motion", "পর্যাবৃত্ত গতি", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_12_ch9", "Chapter 9", "Waves", "তরঙ্গ", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)"),
        createChapter("p1_12_ch10", "Chapter 10", "Ideal Gas and Kinetic Theory of Gases", "আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব", "", CLASS_NAME, "Science", "Physics 1st Paper", "NCTB Physics First Paper (HSC)")
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
        createChapter("p2_12_ch1", "Chapter 1", "Thermodynamics", "তাপগতিবিদ্যা", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch2", "Chapter 2", "Static Electricity", "স্থির তড়িৎ", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch3", "Chapter 3", "Current Electricity", "চল তড়িৎ", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch4", "Chapter 4", "Magnetic Effects of Electric Current and Magnetism", "তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch5", "Chapter 5", "Electromagnetic Induction and Alternating Current", "তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch6", "Chapter 6", "Geometrical Optics", "জ্যামিতিক আলোকবিজ্ঞান", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch7", "Chapter 7", "Physical Optics", "ভৌত আলোকবিজ্ঞান", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch8", "Chapter 8", "Introduction to Modern Physics", "আধুনিক পদার্থবিজ্ঞানের সূচনা", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch9", "Chapter 9", "Atomic Model and Nuclear Physics", "পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch10", "Chapter 10", "Semiconductor and Electronics", "সেমিকন্ডাক্টর ও ইলেকট্রনিক্স", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)"),
        createChapter("p2_12_ch11", "Chapter 11", "Astronomy", "জ্যোতির্বিজ্ঞান", "", CLASS_NAME, "Science", "Physics 2nd Paper", "NCTB Physics Second Paper (HSC)")
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
        createChapter("c1_12_ch1", "Chapter 1", "Safe Laboratory Use", "ল্যাবরেটরির নিরাপদ ব্যবহার", "", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_12_ch2", "Chapter 2", "Qualitative Chemistry", "গুণগত রসায়ন", "", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_12_ch3", "Chapter 3", "Periodic Properties of Elements and Chemical Bonding", "মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন", "", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_12_ch4", "Chapter 4", "Chemical Changes", "রাসায়নিক পরিবর্তন", "", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)"),
        createChapter("c1_12_ch5", "Chapter 5", "Applied Chemistry", "কর্মমুখী রসায়ন", "", CLASS_NAME, "Science", "Chemistry 1st Paper", "NCTB Chemistry First Paper (HSC)")
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
        createChapter("c2_12_ch1", "Chapter 1", "Environmental Chemistry", "পরিবেশ রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_12_ch2", "Chapter 2", "Organic Chemistry", "জৈব রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_12_ch3", "Chapter 3", "Quantitative Chemistry", "পরিমাণগত রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_12_ch4", "Chapter 4", "Electrochemistry", "তড়িৎ রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_12_ch5", "Chapter 5", "Economic Chemistry", "অর্থনৈতিক রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)")
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
        createChapter("bio1_12_ch1", "Chapter 1", "Cell and its Structure", "কোষ ও এর গঠন", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch2", "Chapter 2", "Cell Division", "কোষ বিভাজন", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch3", "Chapter 3", "Cell Chemistry", "কোষ রসায়ন", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch4", "Chapter 4", "Microorganisms", "অণুজীব", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch5", "Chapter 5", "Algae and Fungi", "শৈবাল ও ছত্রাক", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch6", "Chapter 6", "Bryophyta and Pteridophyta", "ব্রায়োফাইটা ও টেরিডোফাইটা", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch7", "Chapter 7", "Gymnosperms and Angiosperms", "নগ্নবীজী ও আবৃতবীজী উদ্ভিদ", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch8", "Chapter 8", "Tissue and Tissue Systems", "টিস্যু ও টিস্যুতন্ত্র", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch9", "Chapter 9", "Plant Physiology", "উদ্ভিদ শারীরতত্ত্ব", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch10", "Chapter 10", "Plant Reproduction", "উদ্ভিদ প্রজনন", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch11", "Chapter 11", "Biotechnology", "জীবপ্রযুক্তি", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper"),
        createChapter("bio1_12_ch12", "Chapter 12", "Environment, Distribution and Conservation of Organisms", "জীবের পরিবেশ, বিস্তার ও সংরক্ষণ", "", CLASS_NAME, "Science", "Biology 1st Paper", "NCTB Biology First Paper")
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
        createChapter("bio2_12_ch1", "Chapter 1", "Animal Diversity and Classification", "প্রাণীর বিভিন্নতা ও শ্রেণীবিন্যাস", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch2", "Chapter 2", "Introduction to Animals", "প্রাণীর পরিচিতি", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch3", "Chapter 3", "Human Physiology: Digestion and Absorption", "মানব শারীরতত্ত্ব: পরিপাক ও শোষণ", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch4", "Chapter 4", "Human Physiology: Blood and Circulation", "মানব শারীরতত্ত্ব: রক্ত ও সংবহন", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch5", "Chapter 5", "Human Physiology: Respiration", "মানব শারীরতত্ত্ব: শ্বসন ও শ্বাসক্রিয়া", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch6", "Chapter 6", "Human Physiology: Excretion", "মানব শারীরতত্ত্ব: বর্জ্য ও নিষ্কাশন", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch7", "Chapter 7", "Human Physiology: Locomotion", "মানব শারীরতত্ত্ব: চলন ও অঙ্গচালনা", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch8", "Chapter 8", "Human Physiology: Coordination and Control", "মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch9", "Chapter 9", "Continuity of Human Life", "মানব জীবনের ধারাবাহিকতা", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch10", "Chapter 10", "Defense of the Human Body", "মানবদেহের প্রতিরক্ষা", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch11", "Chapter 11", "Genetics and Evolution", "জিনতত্ত্ব ও বিবর্তন", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper"),
        createChapter("bio2_12_ch12", "Chapter 12", "Animal Behaviour", "প্রাণীর আচরণ", "", CLASS_NAME, "Science", "Biology 2nd Paper", "NCTB Biology Second Paper")
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
      chapters: [
        createChapter("soil1_12_ch1", "Chapter 1", "Parent Material of Soil", "মৃত্তিকার উৎস বস্তু", "Concept of soil, soil components, parent materials, rocks, minerals, their classification and characteristics.", CLASS_NAME, "Science", "Soil Science 1st Paper", "NCTB Soil Science 1st Paper"),
        createChapter("soil1_12_ch2", "Chapter 2", "Weathering", "বিচূর্ণীভবন", "Concept, classification, physical, chemical and biological weathering, and the effects of weathering on soil formation.", CLASS_NAME, "Science", "Soil Science 1st Paper", "NCTB Soil Science 1st Paper"),
        createChapter("soil1_12_ch3", "Chapter 3", "Soil Formation", "মৃত্তিকা গঠন", "Soil-forming factors, Jenny's equation, soil-forming processes, and soil profile development.", CLASS_NAME, "Science", "Soil Science 1st Paper", "NCTB Soil Science 1st Paper"),
        createChapter("soil1_12_ch4", "Chapter 4", "Physical Properties of Soil", "মৃত্তিকার ভৌত বৈশিষ্ট্য", "Soil texture, structure, pore space, density, consistency, water, air, colour, and temperature.", CLASS_NAME, "Science", "Soil Science 1st Paper", "NCTB Soil Science 1st Paper"),
        createChapter("soil1_12_ch5", "Chapter 5", "Chemical Properties of Soil", "মৃত্তিকার রাসায়নিক বৈশিষ্ট্য", "Soil solution, ion exchange, soil reaction, acidity, alkalinity, soil pH, and buffering.", CLASS_NAME, "Science", "Soil Science 1st Paper", "NCTB Soil Science 1st Paper")
      ]
    });

    // Soil Science 2nd Paper
    subjectsList.push({
      id: "soil_science2",
      name: "Soil Science 2nd Paper",
      banglaName: "মৃত্তিকাবিজ্ঞান ২য় পত্র",
      color: "from-amber-500 to-orange-600",
      category: "selectable",
      eligibleGroups: ["Science"],
      chapters: [
        createChapter("soil2_12_ch1", "Chapter 1", "Soil Fertility and Productivity", "মৃত্তিকার উর্বরতা ও উৎপাদনশীলতা", "Soil fertility and productivity, plant nutrients, their sources and forms, classification, functions, deficiency symptoms, and nutrient status of soils in Bangladesh.", CLASS_NAME, "Science", "Soil Science 2nd Paper", "NCTB Soil Science 2nd Paper"),
        createChapter("soil2_12_ch2", "Chapter 2", "Organic and Inorganic Fertilizers", "জৈব ও অজৈব সার", "Importance, classification, preparation, preservation, characteristics, use, and integrated management of organic, inorganic, and microbial fertilizers.", CLASS_NAME, "Science", "Soil Science 2nd Paper", "NCTB Soil Science 2nd Paper"),
        createChapter("soil2_12_ch3", "Chapter 3", "Soil Organisms and Microorganisms", "মৃত্তিকা জীব ও অণুজীব", "Soil organisms and microorganisms, their identification, activities, roles, and importance in soil structure and fertility.", CLASS_NAME, "Science", "Soil Science 2nd Paper", "NCTB Soil Science 2nd Paper"),
        createChapter("soil2_12_ch6", "Chapter 6", "Soil Erosion and Conservation", "মৃত্তিকার ক্ষয় ও সংরক্ষণ", "Concept, causes, classification, harmful effects, and conservation methods of soil erosion, including soil erosion in Bangladesh.", CLASS_NAME, "Science", "Soil Science 2nd Paper", "NCTB Soil Science 2nd Paper"),
        createChapter("soil2_12_ch7", "Chapter 7", "Soil Management and Problematic Soils", "মৃত্তিকা ব্যবস্থাপনা এবং সমস্যাযুক্ত মৃত্তিকা", "Soil management, soil pollution, climate change effects, problematic soils of Bangladesh, and methods of improving problematic soils.", CLASS_NAME, "Science", "Soil Science 2nd Paper", "NCTB Soil Science 2nd Paper")
      ]
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
        createChapter("acc1_12_ch1", "Chapter 1", "Introduction to Accounting", "হিসাববিজ্ঞান পরিচিতি", "Introduction to accounting concepts, objectives, users of accounting information, transactions, accounting equation, and double-entry principles.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_12_ch2", "Chapter 2", "Books of Accounts", "হিসাবের বইসমূহ", "Primary books of accounts, journal, ledger, cash book, and the recording process of business transactions.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_12_ch3", "Chapter 3", "Bank Reconciliation Statement", "ব্যাংক সমন্বয় বিবরণী", "Preparation and understanding of bank reconciliation statements and the causes of differences between cash book and bank statement.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_12_ch4", "Chapter 4", "Trial Balance", "রেওয়ামিল", "Preparation of trial balance, classification of accounts, and checking the arithmetical accuracy of accounting records.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_12_ch5", "Chapter 5", "Principles of Accounting", "হিসাববিজ্ঞানের নীতিমালা", "Fundamental accounting principles, concepts, conventions, and their application in preparing reliable accounting information.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_12_ch6", "Chapter 6", "Accounting for Receivables", "প্রাপ্য হিসাবসমূহের হিসাবরক্ষণ", "Accounting treatment of receivables, bad debts, doubtful debts, and related adjustments.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_12_ch7", "Chapter 7", "Worksheet", "কার্যপত্র", "Preparation and use of accounting worksheets for organizing adjustments and preparing financial statements.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_12_ch8", "Chapter 8", "Accounting for Tangible and Intangible Assets", "দৃশ্যমান ও অদৃশ্যমান সম্পদের হিসাবরক্ষণ", "Accounting treatment of tangible and intangible assets, depreciation, amortization, and related adjustments.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_12_ch9", "Chapter 9", "Financial Statements", "আর্থিক বিবরণী", "Preparation and presentation of financial statements and understanding the financial position and performance of a business.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper"),
        createChapter("acc1_12_ch10", "Chapter 10", "Single Entry System", "একতরফা দাখিলা পদ্ধতি", "Understanding the single entry system and determining profit or loss and financial position from incomplete accounting records.", CLASS_NAME, group, "Accounting 1st Paper", "NCTB Class 11 Accounting 1st Paper")
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
        createChapter("acc2_12_ch1", "Chapter 1", "Accounting for Non-Profit Organizations", "অব্যবসায়ী প্রতিষ্ঠানের হিসাব", "Accounting procedures and financial statements of non-profit organizations.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_12_ch2", "Chapter 2", "Accounting for Partnership Businesses", "অংশীদারি ব্যবসায়ের হিসাব", "Accounting for partnership formation, profit distribution, capital, interest, and changes among partners.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_12_ch3", "Chapter 3", "Cash Flow Statement", "নগদ প্রবাহ বিবরণী", "Preparation and analysis of cash flow statements and classification of cash flows.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_12_ch4", "Chapter 4", "Capital of Joint Stock Companies", "যৌথমূলধনী কোম্পানির মূলধন", "Accounting for share capital, issue of shares, and related transactions of joint stock companies.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_12_ch5", "Chapter 5", "Financial Statements of Joint Stock Companies", "যৌথমূলধনী কোম্পানির আর্থিক বিবরণী", "Preparation and presentation of financial statements of joint stock companies.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_12_ch6", "Chapter 6", "Financial Statement Analysis", "আর্থিক বিবরণী বিশ্লেষণ", "Analysis of financial statements using accounting ratios and related measures.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_12_ch7", "Chapter 7", "Production Cost Accounting", "উৎপাদন ব্যয় হিসাব", "Accounting for production costs and preparation and analysis of production cost statements.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_12_ch8", "Chapter 8", "Inventory Accounting Methods", "মজুদ পণ্যের হিসাবরক্ষণ পদ্ধতি", "Accounting methods for inventory and calculation of inventory costs.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_12_ch9", "Chapter 9", "Costs and Classification of Costs", "ব্যয় ও ব্যয়ের শ্রেণিবিভাগ", "Concepts of cost and classification of costs according to different business purposes.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper"),
        createChapter("acc2_12_ch10", "Chapter 10", "Introduction to Management Accounting", "ব্যবস্থাপনা হিসাববিজ্ঞান পরিচিতি", "Basic concepts, objectives, and applications of management accounting.", CLASS_NAME, group, "Accounting 2nd Paper", "NCTB Class 11-12 Accounting 2nd Paper")
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
        createChapter("bom1_12_ch1", "Chapter 1", "Fundamental Concepts of Business", "ব্যবসায়ের মৌলিক ধারণা", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch2", "Chapter 2", "Business Environment", "ব্যবসায় পরিবেশ", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch3", "Chapter 3", "Sole Proprietorship Business", "একমালিকানা ব্যবসায়", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch4", "Chapter 4", "Partnership Business", "অংশীদারি ব্যবসায়", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch5", "Chapter 5", "Joint Stock Business", "যৌথমূলধনী ব্যবসায়", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch6", "Chapter 6", "Cooperative Society", "সমবায় সমিতি", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch7", "Chapter 7", "State-Owned Business", "রাষ্ট্রীয় ব্যবসায়", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch8", "Chapter 8", "Legal Aspects of Business", "ব্যবসায়ের আইনগত দিক", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch9", "Chapter 9", "Auxiliary Services to Business", "ব্যবসায়ে সহায়ক সেবা", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch10", "Chapter 10", "Business Entrepreneurship", "ব্যবসায় উদ্যোগ", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch11", "Chapter 11", "Use of Information and Communication Technology in Business", "ব্যবসায়ে তথ্য ও যোগাযোগ প্রযুক্তির ব্যবহার", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper"),
        createChapter("bom1_12_ch12", "Chapter 12", "Business Ethics and Social Responsibility", "ব্যবসায়ে নৈতিকতা ও সামাজিক দায়বদ্ধতা", "", CLASS_NAME, group, "Business Organization & Management 1st Paper", "NCTB Business Organization & Management First Paper")
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
        createChapter("bo2_12_ch1", "Chapter 1", "Management Concepts", "ব্যবস্থাপনার ধারণা", "Concept, characteristics, importance, functions, levels, management cycle, and universality of management.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_12_ch2", "Chapter 2", "Principles of Management", "ব্যবস্থাপনা নীতি", "Concept and principles of management, contributions of Taylor and Fayol, and qualities and roles of an ideal manager.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_12_ch3", "Chapter 3", "Planning & Decision Making", "পরিকল্পনা প্রণয়ন ও সিদ্ধান্ত গ্রহণ", "Concept, importance and process of planning, types of plans, and the decision-making process.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_12_ch4", "Chapter 4", "Organizing", "সংগঠিতকরণ", "Concept, importance, principles and process of organizing, organizational structure, authority, responsibility, and delegation.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_12_ch5", "Chapter 5", "Staffing", "কর্মীসংস্থান", "Concept, importance and process of staffing, recruitment, selection, promotion, training, and employee development.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_12_ch6", "Chapter 6", "Leadership", "নেতৃত্ব", "Concept, importance, types and theories of leadership, qualities of an ideal leader, and leadership functions.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_12_ch7", "Chapter 7", "Motivation", "প্রেষণা", "Concept, characteristics, importance, techniques and major theories of employee motivation.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_12_ch8", "Chapter 8", "Communication", "যোগাযোগ", "Concept, process, importance, types, barriers, and use of information and communication technology in business communication.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_12_ch9", "Chapter 9", "Coordination", "সমন্বয়সাধন", "Concept, characteristics, types, principles, importance, and methods of achieving effective coordination.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper"),
        createChapter("bo2_12_ch10", "Chapter 10", "Controlling", "নিয়ন্ত্রণ", "Concept, characteristics, importance, principles, steps, techniques, and types of control in business organizations.", CLASS_NAME, "Business Studies", "Business Org 2nd Paper", "NCTB HSC Management Second Paper")
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
        createChapter("fin1_12_ch1", "Chapter 1", "Introduction to Finance", "অর্থায়নের সূচনা", "The concept, evolution, nature, functions, principles, and objectives of finance.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_12_ch2", "Chapter 2", "Legal Aspects of Financial Markets", "আর্থিক বাজারের আইনগত দিকসমূহ", "Legal and regulatory aspects related to financial markets and financial transactions.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_12_ch3", "Chapter 3", "Time Value of Money", "অর্থের সময় মূল্য", "The time value of money, present value, future value, and related financial calculations.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_12_ch4", "Chapter 4", "Financial Analysis", "আর্থিক বিশ্লেষণ", "Analysis of financial information and financial statements for decision-making.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_12_ch5", "Chapter 5", "Short and Medium-Term Financing", "স্বল্প ও মধ্যমেয়াদি অর্থায়ন", "Sources, methods, and costs of short-term and medium-term business financing.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_12_ch6", "Chapter 6", "Long-Term Financing", "দীর্ঘমেয়াদি অর্থায়ন", "Long-term sources of finance and methods of raising long-term business funds.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_12_ch7", "Chapter 7", "Cost of Capital", "মূলধন ব্যয়", "Concept, components, and calculation of the cost of different sources of capital.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_12_ch8", "Chapter 8", "Capital Budgeting and Investment Decisions", "মূলধন বাজেটিং ও বিনিয়োগ সিদ্ধান্ত", "Capital budgeting techniques and financial evaluation of investment decisions.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper"),
        createChapter("fin1_12_ch9", "Chapter 9", "Risk and Rate of Return", "ঝুঁকি এবং মুনাফার হার", "Relationship between financial risk, investment risk, and expected rate of return.", CLASS_NAME, group, "Finance, Banking & Insurance 1st Paper", "NCTB Finance, Banking & Insurance First Paper")
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
        createChapter("fbi2_12_ch1", "Chapter 1", "Primary Concept of Banking", "ব্যাংক ব্যবস্থার প্রাথমিক ধারণা", "Concept, functions, history, and basic structure of the banking system.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch2", "Chapter 2", "Central Bank", "কেন্দ্রীয় ব্যাংক", "Concept, functions, organization, and monetary responsibilities of a central bank.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch3", "Chapter 3", "Commercial Bank", "বাণিজ্যিক ব্যাংক", "Concept, functions, services, and operations of commercial banks.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch4", "Chapter 4", "Bank Accounts", "ব্যাংক হিসাব", "Types of bank accounts, account opening, deposits, and related banking procedures.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch5", "Chapter 5", "Negotiable Instruments", "হস্তান্তরযোগ্য ঋণের দলিল", "Concept and characteristics of negotiable instruments used in banking and finance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch6", "Chapter 6", "Cheque, Bill of Exchange & Promissory Note", "চেক, বিনিময় বিল ও প্রতিশ্রুতিপত্র", "Features, parties, types, and uses of cheques, bills of exchange, and promissory notes.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch7", "Chapter 7", "Sources and Uses of Bank Funds", "ব্যাংক তহবিলের উৎস ও ব্যবহার", "Sources of bank funds and their major uses in banking operations.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch8", "Chapter 8", "Foreign Exchange and Foreign Currency", "বৈদেশিক বিনিময় ও বৈদেশিক মুদ্রা", "Foreign exchange, foreign currency, exchange rates, and related banking activities.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch9", "Chapter 9", "Electronic and Modern Banking", "ইলেকট্রনিক ও আধুনিক ব্যাংকিং", "Electronic banking services, digital banking, and modern banking technologies.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch10", "Chapter 10", "Basic Concept of Insurance", "বিমা সম্পর্কে মৌলিক ধারণা", "Concept, principles, importance, and basic classifications of insurance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch11", "Chapter 11", "Life Insurance", "জীবন বিমা", "Concept, characteristics, types, and principles of life insurance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch12", "Chapter 12", "Marine Insurance", "নৌ-বিমা", "Concept, characteristics, risks, and coverage associated with marine insurance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch13", "Chapter 13", "Fire Insurance", "অগ্নি বিমা", "Concept, principles, risks, and coverage associated with fire insurance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper"),
        createChapter("fbi2_12_ch14", "Chapter 14", "Miscellaneous Insurance", "বিবিধ বিমা", "Different forms and applications of insurance other than life, marine, and fire insurance.", CLASS_NAME, "Business Studies", "Finance, Banking & Insurance 2nd Paper", "NCTB Finance, Banking & Insurance 2nd Paper")
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
      chapters: [
        createChapter("pmm1_12_ch1", "Chapter 1", "Production", "উৎপাদন", "Concept, importance, scope, and productivity of production.", CLASS_NAME, "Business Studies", "Production Management and Marketing 1st Paper", "NCTB Production Management and Marketing 1st Paper"),
        createChapter("pmm1_12_ch2", "Chapter 2", "Factors of Production", "উৎপাদনের উপকরণ", "Land, labor, capital, organization, and their characteristics, importance, and roles in production.", CLASS_NAME, "Business Studies", "Production Management and Marketing 1st Paper", "NCTB Production Management and Marketing 1st Paper"),
        createChapter("pmm1_12_ch3", "Chapter 3", "Scale of Production", "উৎপাদনের মাত্রা", "Concept and importance of scale of production, economies of scale, and optimum scale of production.", CLASS_NAME, "Business Studies", "Production Management and Marketing 1st Paper", "NCTB Production Management and Marketing 1st Paper"),
        createChapter("pmm1_12_ch4", "Chapter 4", "Production at the Macro Level", "সামষ্টিক পর্যায়ে উৎপাদন", "Concept and measurement of GDP, GNP, NNP, national income, and per capita income.", CLASS_NAME, "Business Studies", "Production Management and Marketing 1st Paper", "NCTB Production Management and Marketing 1st Paper"),
        createChapter("pmm1_12_ch5", "Chapter 5", "Production Management", "উৎপাদন ব্যবস্থাপনা", "Concept, importance, historical development, and modern trends of production management.", CLASS_NAME, "Business Studies", "Production Management and Marketing 1st Paper", "NCTB Production Management and Marketing 1st Paper"),
        createChapter("pmm1_12_ch6", "Chapter 6", "Product Design", "পণ্য ডিজাইন", "Concept, importance, stages, and application of product design.", CLASS_NAME, "Business Studies", "Production Management and Marketing 1st Paper", "NCTB Production Management and Marketing 1st Paper"),
        createChapter("pmm1_12_ch7", "Chapter 7", "Quality Management", "মান ব্যবস্থাপনা", "Concept, importance, quality costs, quality control, quality assurance, total quality management, and quality standards.", CLASS_NAME, "Business Studies", "Production Management and Marketing 1st Paper", "NCTB Production Management and Marketing 1st Paper"),
        createChapter("pmm1_12_ch8", "Chapter 8", "Production Capacity", "উৎপাদন ক্ষমতা", "Concept, types, measurement, and utilization of production capacity.", CLASS_NAME, "Business Studies", "Production Management and Marketing 1st Paper", "NCTB Production Management and Marketing 1st Paper"),
        createChapter("pmm1_12_ch9", "Chapter 9", "Business Location", "ব্যবসায়ের অবস্থান", "Concept, importance, and factors influencing the location of a business.", CLASS_NAME, "Business Studies", "Production Management and Marketing 1st Paper", "NCTB Production Management and Marketing 1st Paper"),
        createChapter("pmm1_12_ch10", "Chapter 10", "Layout", "লে-আউট/বিন্যাস", "Concept, importance, and types of layout including factory, process, fixed-position, product, service, retail, office, and warehouse layouts.", CLASS_NAME, "Business Studies", "Production Management and Marketing 1st Paper", "NCTB Production Management and Marketing 1st Paper")
      ]
    });

    // Production Management & Marketing 2nd Paper
    subjectsList.push({
      id: "production_marketing2",
      name: "Production Management & Marketing 2nd Paper",
      banglaName: "উৎপাদন ব্যবস্থাপনা ও বিপণন ২য় পত্র",
      color: "from-violet-500 to-purple-600",
      category: "selectable",
      eligibleGroups: ["Business Studies"],
      chapters: [
        createChapter("pmm2_12_ch1", "Chapter 1", "Introduction to Marketing", "বিপণন পরিচিতি", "Concept, definition, importance, objectives, functions, and development of marketing.", CLASS_NAME, "Business Studies", "Production Management and Marketing 2nd Paper", "NCTB Production Management and Marketing 2nd Paper"),
        createChapter("pmm2_12_ch2", "Chapter 2", "Marketing Environment", "বিপণন পরিবেশ", "Concept, types, components, and influence of the marketing environment on business activities.", CLASS_NAME, "Business Studies", "Production Management and Marketing 2nd Paper", "NCTB Production Management and Marketing 2nd Paper"),
        createChapter("pmm2_12_ch3", "Chapter 3", "Marketing Functions", "বিপণন কার্যাবলি", "Major marketing functions and activities involved in bringing products and services to consumers.", CLASS_NAME, "Business Studies", "Production Management and Marketing 2nd Paper", "NCTB Production Management and Marketing 2nd Paper"),
        createChapter("pmm2_12_ch4", "Chapter 4", "Market Segmentation and Marketing Mix", "বাজার বিভক্তিকরণ এবং বিপণন মিশ্রণ", "Concept and bases of market segmentation, effective segmentation, and the components of the marketing mix.", CLASS_NAME, "Business Studies", "Production Management and Marketing 2nd Paper", "NCTB Production Management and Marketing 2nd Paper"),
        createChapter("pmm2_12_ch5", "Chapter 5", "Product and Product Pricing", "পণ্য ও পণ্যের মূল্য নির্ধারণ", "Concept, classification, product decisions, product life cycle, and principles and methods of product pricing.", CLASS_NAME, "Business Studies", "Production Management and Marketing 2nd Paper", "NCTB Production Management and Marketing 2nd Paper"),
        createChapter("pmm2_12_ch6", "Chapter 6", "Product Distribution Channel", "পণ্য বণ্টন প্রণালি", "Concept, importance, types, functions, and selection of distribution channels.", CLASS_NAME, "Business Studies", "Production Management and Marketing 2nd Paper", "NCTB Production Management and Marketing 2nd Paper"),
        createChapter("pmm2_12_ch7", "Chapter 7", "Wholesaling and Retailing", "পাইকারি ব্যবসা ও খুচরা ব্যবসা", "Concept, characteristics, types, functions, and importance of wholesaling and retailing.", CLASS_NAME, "Business Studies", "Production Management and Marketing 2nd Paper", "NCTB Production Management and Marketing 2nd Paper"),
        createChapter("pmm2_12_ch8", "Chapter 8", "Sales Promotion and Advertising", "বিক্রয় প্রসার ও বিজ্ঞাপন", "Concept, objectives, methods, and importance of sales promotion and advertising.", CLASS_NAME, "Business Studies", "Production Management and Marketing 2nd Paper", "NCTB Production Management and Marketing 2nd Paper"),
        createChapter("pmm2_12_ch9", "Chapter 9", "Personal Selling and Salesmanship", "ব্যক্তিক বিক্রয় ও বিক্রয়িকতা", "Concept, characteristics, importance, process, and techniques of personal selling and salesmanship.", CLASS_NAME, "Business Studies", "Production Management and Marketing 2nd Paper", "NCTB Production Management and Marketing 2nd Paper"),
        createChapter("pmm2_12_ch10", "Chapter 10", "Contemporary Aspects of Marketing", "বিপণনের সমসাময়িক বিষয়াবলি", "Modern developments, challenges, practices, and contemporary issues in marketing.", CLASS_NAME, "Business Studies", "Production Management and Marketing 2nd Paper", "NCTB Production Management and Marketing 2nd Paper")
      ]

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
      chapters: [
        createChapter("hist1_12_ch1", "Chapter 1", "European Arrival in India: Establishment of British Supremacy", "ভারতবর্ষে ইউরোপীয়দের আগমন: ইংরেজ আধিপত্য প্রতিষ্ঠা", "Arrival of European trading companies in India, the rise of the English East India Company, the Nawabi rule of Bengal, the Battles of Plassey and Buxar, acquisition of Diwani, and the establishment of British supremacy.", CLASS_NAME, "Humanities", "History 1st Paper", "NCTB History 1st Paper"),
        createChapter("hist1_12_ch2", "Chapter 2", "English Colonial Rule: Company Rule", "ইংরেজ ঔপনিবেশিক শাসন: কোম্পানি আমল", "Company rule in India, Warren Hastings, the Regulating Act, Anglo-Mysore Wars, Lord Cornwallis, Permanent Settlement, and Lord Wellesley's Subsidiary Alliance policy.", CLASS_NAME, "Humanities", "History 1st Paper", "NCTB History 1st Paper"),
        createChapter("hist1_12_ch3", "Chapter 3", "English Colonial Rule: British Rule", "ইংরেজ ঔপনিবেশিক শাসন: ব্রিটিশ আমল", "Direct British rule in India, administrative reforms, Lord Ripon, Lord Curzon, the partition of Bengal, Swadeshi and Boycott movements, revolutionary movements, and the development of Indian nationalism.", CLASS_NAME, "Humanities", "History 1st Paper", "NCTB History 1st Paper"),
        createChapter("hist1_12_ch4", "Chapter 4", "Bengal During the Pakistan Period: Language Movement and Its Course", "পাকিস্তানি আমলে বাংলা: ভাষা আন্দোলন ও এর গতিপ্রকৃতি", "Political, economic, and administrative conditions of East Bengal, the background and course of the Language Movement of 1952, the role of students and people, women, regional movements, and the internationalization of the Bengali language.", CLASS_NAME, "Humanities", "History 1st Paper", "NCTB History 1st Paper"),
        createChapter("hist1_12_ch5", "Chapter 5", "Autonomy and Self-Determination Movement of East Bengal", "পূর্ব বাংলার স্বায়ত্তশাসন ও স্বাধিকার আন্দোলন", "The United Front election of 1954, the education movement, political developments, economic discrimination, the Six-Point Movement, the Agartala Case, the Mass Upsurge of 1969, the 1970 election, the Non-Cooperation Movement, and the historic 7 March speech.", CLASS_NAME, "Humanities", "History 1st Paper", "NCTB History 1st Paper"),
        createChapter("hist1_12_ch6", "Chapter 6", "Declaration of Independence of Bangladesh and the Liberation War", "বাংলাদেশের স্বাধীনতা ঘোষণা ও মুক্তিযুদ্ধ", "The background and declaration of independence, the arrest of Bangabandhu, genocide and repression in 1971, resistance by the Bengali people, and the formation of the Provisional Bangladesh Government and Mujibnagar Government.", CLASS_NAME, "Humanities", "History 1st Paper", "NCTB History 1st Paper"),
        createChapter("hist1_12_ch7", "Chapter 7", "Activities of the Bangladesh Government (Mujibnagar Government) During the Liberation War", "মুক্তিযুদ্ধে বাংলাদেশ সরকারের (মুজিবনগর) কার্যক্রম", "The ministries and departments of the Mujibnagar Government, formation of the Liberation Forces, sector management, conduct of the Liberation War, mass media, diplomatic activities, anti-independence activities, and the surrender of the Pakistani forces.", CLASS_NAME, "Humanities", "History 1st Paper", "NCTB History 1st Paper"),
        createChapter("hist1_12_ch8", "Chapter 8", "Expatriate Bengalis and the Outside World in the Liberation War", "মুক্তিযুদ্ধে প্রবাসী বাঙালি ও বহির্বিশ্ব", "The roles of the Indian government, people and media, major world powers, other countries, the United Nations and international organizations, expatriate Bengalis, foreign individuals, and recognition of foreign friends during the Liberation War.", CLASS_NAME, "Humanities", "History 1st Paper", "NCTB History 1st Paper")]
    });

    // History 2nd Paper
    subjectsList.push({
      id: "history2",
      name: "History 2nd Paper",
      banglaName: "ইতিহাস ২য় পত্র",
      color: "from-orange-500 to-red-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("hist2_12_ch1", "Chapter 1", "Industrial Revolution", "শিল্প বিপ্লব", "The background, causes, major inventions, development, effects, and consequences of the Industrial Revolution.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB History 2nd Paper"),
        createChapter("hist2_12_ch2", "Chapter 2", "French Revolution", "ফরাসি বিপ্লব", "The condition of pre-revolutionary France, causes, philosophers, major events, results, effects, and Napoleon Bonaparte.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB History 2nd Paper"),
        createChapter("hist2_12_ch3", "Chapter 3", "First World War and Treaty of Versailles", "প্রথম বিশ্বযুদ্ধ এবং ভার্সাই সন্ধি", "The background, alliances, events, results and effects of the First World War, followed by the Treaty of Versailles and its significance.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB History 2nd Paper"),
        createChapter("hist2_12_ch4", "Chapter 4", "Bolshevik Revolution", "বলশেভিক বিপ্লব", "Pre-revolutionary Russia, revolutionary ideas, Lenin, the Bolshevik Revolution, and its results.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB History 2nd Paper"),
        createChapter("hist2_12_ch5", "Chapter 5", "Rise of Hitler and Mussolini and the Second World War", "হিটলার ও মুসোলিনির উত্থান এবং দ্বিতীয় বিশ্বযুদ্ধ", "The rise and activities of Hitler and Mussolini, Fascism and Nazism, their comparative characteristics, and the background, events, results, and effects of the Second World War.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB History 2nd Paper"),
        createChapter("hist2_12_ch6", "Chapter 6", "United Nations and World Peace", "জাতিসংঘ এবং বিশ্বশান্তি", "The background of the formation of the United Nations, the role of major powers, and the role of the United Nations in establishing world peace and maintaining security.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB History 2nd Paper"),
        createChapter("hist2_12_ch7", "Chapter 7", "Cold War: Conflict Between the Capitalist and Socialist Worlds", "স্নায়ুযুদ্ধ - পুঁজিবাদ ও সমাজতান্ত্রিক বিশ্বের দ্বন্দ্ব", "The concept and emergence of the Cold War, international politics during the Cold War, peaceful coexistence, and the end of the Cold War.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB History 2nd Paper"),
        createChapter("hist2_12_ch8", "Chapter 8", "Post-Cold War World", "স্নায়ুযুদ্ধ পরবর্তী বিশ্ব", "The dissolution of the Soviet Union, emergence of independent states, its effects on the world, and the fall of socialist states in Eastern Europe.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB History 2nd Paper"),
        createChapter("hist2_12_ch9", "Chapter 9", "Anti-Racism Movement", "বর্ণবাদবিরোধী আন্দোলন", "The concept of racism, major anti-racism leaders and movements, and the success of anti-racism movements.", CLASS_NAME, "Humanities", "History 2nd Paper", "NCTB History 2nd Paper")
      ]
    });

    // Islamic History & Culture 1st Paper
    subjectsList.push({
      id: "islamic_history1",
      name: "Islamic History & Culture 1st Paper",
      banglaName: "ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র",
      color: "from-emerald-500 to-green-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("ihc1_12_ch1", "Chapter 1", "Pre-Islamic Arabia", "প্রাক-ইসলামি আরব", "Geographical condition, people, political, social, religious, economic, and cultural conditions of pre-Islamic Arabia.", CLASS_NAME, "Humanities", "Islamic History and Culture 1st Paper", "NCTB Islamic History and Culture 1st Paper"),
        createChapter("ihc1_12_ch2", "Chapter 2", "Arabia in the Age of Jahiliyyah", "জাহিলিয়া যুগে আরব", "The political, social, religious, economic, and cultural condition of Arabia during the Jahiliyyah period.", CLASS_NAME, "Humanities", "Islamic History and Culture 1st Paper", "NCTB Islamic History and Culture 1st Paper"),
        createChapter("ihc1_12_ch3", "Chapter 3", "Prophet Muhammad (PBUH): Life in Makkah", "হযরত মুহাম্মদ (সাঃ)-এর মক্কা জীবন", "The birth, early life, character, prophethood, preaching, opposition, and major events of Prophet Muhammad's life in Makkah.", CLASS_NAME, "Humanities", "Islamic History and Culture 1st Paper", "NCTB Islamic History and Culture 1st Paper"),
        createChapter("ihc1_12_ch4", "Chapter 4", "Prophet Muhammad (PBUH): Life in Madinah", "হযরত মুহাম্মদ (সাঃ)-এর মদিনা জীবন", "Hijrah, the Constitution of Madinah, establishment of the Islamic state, major battles, treaties, conquest of Makkah, and farewell Hajj.", CLASS_NAME, "Humanities", "Islamic History and Culture 1st Paper", "NCTB Islamic History and Culture 1st Paper"),
        createChapter("ihc1_12_ch5", "Chapter 5", "Prophet Muhammad (PBUH): Character, Achievements and Reforms", "হযরত মুহাম্মদ (সাঃ)-এর চরিত্র-কৃতিত্ব ও সংস্কারসমূহ", "The character, achievements, social, religious, cultural, political, economic, and judicial reforms of Prophet Muhammad (PBUH).", CLASS_NAME, "Humanities", "Islamic History and Culture 1st Paper", "NCTB Islamic History and Culture 1st Paper"),
        createChapter("ihc1_12_ch6", "Chapter 6", "The Rightly Guided Caliphs (632-661 CE)", "খুলাফায়ে রাশিদীন (৬৩২-৬৬১ খ্রি:)", "The election, administration, achievements, conquests, and major events during the caliphates of Abu Bakr, Umar, Uthman, and Ali (RA).", CLASS_NAME, "Humanities", "Islamic History and Culture 1st Paper", "NCTB Islamic History and Culture 1st Paper"),
        createChapter("ihc1_12_ch7", "Chapter 7", "Umayyad Caliphate (661-750 CE)", "উমাইয়া খিলাফত (৬৬১-৭৫০ খ্রি:)", "Establishment, administration, expansion, achievements, cultural development, and decline of the Umayyad Caliphate.", CLASS_NAME, "Humanities", "Islamic History and Culture 1st Paper", "NCTB Islamic History and Culture 1st Paper"),
        createChapter("ihc1_12_ch8", "Chapter 8", "Abbasid Caliphate (750-1258 CE)", "আব্বাসীয় খিলাফত (৭৫০-১২৫৮ খ্রি:)", "Establishment, administration, political development, intellectual achievements, cultural contributions, and decline of the Abbasid Caliphate.", CLASS_NAME, "Humanities", "Islamic History and Culture 1st Paper", "NCTB Islamic History and Culture 1st Paper"),
        createChapter("ihc1_12_ch9", "Chapter 9", "Muslim Rule in Spain (711-1492 CE)", "স্পেনে মুসলিম শাসন (৭১১-১৪৯২ খ্রি:)", "Muslim conquest of Spain, major dynasties, administration, cultural and intellectual achievements, and the decline of Muslim rule in Spain.", CLASS_NAME, "Humanities", "Islamic History and Culture 1st Paper", "NCTB Islamic History and Culture 1st Paper"),
        createChapter("ihc1_12_ch10", "Chapter 10", "Fatimid Caliphate and Ayyubid Dynasty (909-1250 CE)", "ফাতিমি খিলাফত ও আইয়ুবী বংশ (৯০৯-১২৫০ খ্রি:)", "Establishment and development of the Fatimid Caliphate, its administration and achievements, and the rise and achievements of the Ayyubid dynasty.", CLASS_NAME, "Humanities", "Islamic History and Culture 1st Paper", "NCTB Islamic History and Culture 1st Paper")
      ]
    });

    // Islamic History & Culture 2nd Paper
    subjectsList.push({
      id: "islamic_history2",
      name: "Islamic History & Culture 2nd Paper",
      banglaName: "ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র",
      color: "from-emerald-500 to-green-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("ihc2_12_ch1", "Chapter 1", "Establishment of Muslim Rule in India", "ভারতে মুসলিম শাসন প্রতিষ্ঠা", "The geographical and historical background of India, the arrival of Muslims, major invasions, and the establishment of Muslim rule in India.", CLASS_NAME, "Humanities", "Islamic History and Culture 2nd Paper", "NCTB Islamic History and Culture 2nd Paper"),
        createChapter("ihc2_12_ch2", "Chapter 2", "Delhi Sultanate Period (1206-1526 CE)", "দিল্লি সালতানাত যুগ (১২০৬-১৫২৬ খ্রি.)", "The establishment, major dynasties, administration, achievements, and decline of the Delhi Sultanate.", CLASS_NAME, "Humanities", "Islamic History and Culture 2nd Paper", "NCTB Islamic History and Culture 2nd Paper"),
        createChapter("ihc2_12_ch3", "Chapter 3", "Mughal Rule in the Indian Subcontinent (1526-1858 CE)", "ভারত উপমহাদেশে মুঘল শাসন (১৫২৬-১৮৫৮ খ্রি.)", "The establishment, administration, expansion, achievements, cultural contributions, and decline of Mughal rule in the Indian subcontinent.", CLASS_NAME, "Humanities", "Islamic History and Culture 2nd Paper", "NCTB Islamic History and Culture 2nd Paper"),
        createChapter("ihc2_12_ch4", "Chapter 4", "Company and Colonial Rule in Bengal", "বাংলায় কোম্পানি ও ঔপনিবেশিক শাসন", "The establishment and expansion of British East India Company rule, colonial administration, resistance movements, and major developments in Bengal.", CLASS_NAME, "Humanities", "Islamic History and Culture 2nd Paper", "NCTB Islamic History and Culture 2nd Paper"),
        createChapter("ihc2_12_ch5", "Chapter 5", "History of Bengal (Pakistan Period)", "বাংলার ইতিহাস (পাকিস্তান আমল)", "The political, economic, social, and cultural developments of Bengal during the Pakistan period and the growth of Bengali nationalism.", CLASS_NAME, "Humanities", "Islamic History and Culture 2nd Paper", "NCTB Islamic History and Culture 2nd Paper"),
        createChapter("ihc2_12_ch6", "Chapter 6", "Emergence of Independent and Sovereign Bangladesh", "স্বাধীন ও সার্বভৌম বাংলাদেশের অভ্যুদয়", "The Language Movement, political developments, the Liberation War, independence, and the emergence of independent and sovereign Bangladesh.", CLASS_NAME, "Humanities", "Islamic History and Culture 2nd Paper", "NCTB Islamic History and Culture 2nd Paper")
      ]
    });

    // Civics & Good Governance 1st Paper
    subjectsList.push({
      id: "civics1",
      name: "Civics & Good Governance 1st Paper",
      banglaName: "পৌরনীতি ও সুশাসন ১ম পত্র",
      color: "from-fuchsia-500 to-pink-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("civ1_12_ch1", "Chapter 1", "Introduction to Civics and Good Governance", "পৌরনীতি ও সুশাসন পরিচিতি", "Concept, nature, scope, development, importance, and relationship of civics and good governance with other social sciences.", CLASS_NAME, "Humanities", "Civics & Good Governance 1st Paper", "NCTB Civics & Good Governance 1st Paper"),
        createChapter("civ1_12_ch2", "Chapter 2", "Good Governance", "সুশাসন", "Concept, characteristics, elements, importance, and requirements of good governance.", CLASS_NAME, "Humanities", "Civics & Good Governance 1st Paper", "NCTB Civics & Good Governance 1st Paper"),
        createChapter("civ1_12_ch3", "Chapter 3", "Values, Law, Liberty and Equality", "মূল্যবোধ, আইন, স্বাধীনতা ও সাম্য", "Concept, characteristics, types, importance, and relationship of values, law, liberty, and equality.", CLASS_NAME, "Humanities", "Civics & Good Governance 1st Paper", "NCTB Civics & Good Governance 1st Paper"),
        createChapter("civ1_12_ch4", "Chapter 4", "E-Governance and Good Governance", "ই-গভর্নেন্স ও সুশাসন", "Concept, objectives, features, applications, advantages, challenges, and role of e-governance in establishing good governance.", CLASS_NAME, "Humanities", "Civics & Good Governance 1st Paper", "NCTB Civics & Good Governance 1st Paper"),
        createChapter("civ1_12_ch5", "Chapter 5", "Citizen Rights, Duties and Human Rights", "নাগরিক অধিকার, কর্তব্য ও মানবাধিকার", "Concept, types, importance, and relationship of citizen rights and duties, along with the concept and protection of human rights.", CLASS_NAME, "Humanities", "Civics & Good Governance 1st Paper", "NCTB Civics & Good Governance 1st Paper"),
        createChapter("civ1_12_ch6", "Chapter 6", "Political Parties, Leadership and Good Governance", "রাজনৈতিক দল, নেতৃত্ব ও সুশাসন", "Concept, characteristics, functions, importance of political parties and leadership, and their relationship with good governance.", CLASS_NAME, "Humanities", "Civics & Good Governance 1st Paper", "NCTB Civics & Good Governance 1st Paper"),
        createChapter("civ1_12_ch7", "Chapter 7", "Government Structure and Organs of Government", "সরকার কাঠামো ও সরকারের অঙ্গসমূহ", "Government structure, legislature, executive, judiciary, their powers and functions, and the principle of separation of powers.", CLASS_NAME, "Humanities", "Civics & Good Governance 1st Paper", "NCTB Civics & Good Governance 1st Paper"),
        createChapter("civ1_12_ch8", "Chapter 8", "Public Opinion and Political Culture", "জনমত ও রাজনৈতিক সংস্কৃতি", "Concept, characteristics, formation and importance of public opinion, and the concept, characteristics, and relationship of political culture.", CLASS_NAME, "Humanities", "Civics & Good Governance 1st Paper", "NCTB Civics & Good Governance 1st Paper"),
        createChapter("civ1_12_ch9", "Chapter 9", "Public Service and Bureaucracy", "জনসেবা ও আমলাতন্ত্র", "Concept, characteristics, functions, recruitment, training, and role of bureaucracy and public service in democratic governance.", CLASS_NAME, "Humanities", "Civics & Good Governance 1st Paper", "NCTB Civics & Good Governance 1st Paper"),
        createChapter("civ1_12_ch10", "Chapter 10", "Patriotism and Nationalism", "দেশপ্রেম ও জাতীয়তা", "Concept, characteristics, importance, development, and relationship between patriotism, nationalism, citizenship, and the state.", CLASS_NAME, "Humanities", "Civics & Good Governance 1st Paper", "NCTB Civics & Good Governance 1st Paper")
      ]
    });

    // Civics & Good Governance 2nd Paper
    subjectsList.push({
      id: "civics2",
      name: "Civics & Good Governance 2nd Paper",
      banglaName: "পৌরনীতি ও সুশাসন ২য় পত্র",
      color: "from-fuchsia-500 to-pink-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("civ2_12_ch1", "Chapter 1", "Development of Representative Government in British India", "ব্রিটিশ ভারতে প্রতিনিধিত্বশীল সরকারের বিকাশ", "The development of representative government, constitutional reforms, and political developments during British rule in India.", CLASS_NAME, "Humanities", "Civics & Good Governance 2nd Paper", "NCTB Civics & Good Governance 2nd Paper"),
        createChapter("civ2_12_ch2", "Chapter 2", "Pakistan to Bangladesh (1947–1971)", "পাকিস্তান থেকে বাংলাদেশ (১৯৪৭–১৯৭১)", "Political, constitutional, economic, and social developments from the creation of Pakistan to the emergence of Bangladesh.", CLASS_NAME, "Humanities", "Civics & Good Governance 2nd Paper", "NCTB Civics & Good Governance 2nd Paper"),
        createChapter("civ2_12_ch3", "Chapter 3", "Political Leaders: The Achievement of Bangladesh's Independence", "রাজনৈতিক ব্যক্তিত্ব: বাংলাদেশের স্বাধীনতা লাভ", "The contributions of major political leaders and their roles in the movement for Bangladesh's independence.", CLASS_NAME, "Humanities", "Civics & Good Governance 2nd Paper", "NCTB Civics & Good Governance 2nd Paper"),
        createChapter("civ2_12_ch4", "Chapter 4", "The Constitution of Bangladesh", "বাংলাদেশের সংবিধান", "The origin, characteristics, fundamental principles, fundamental rights, and major provisions of the Constitution of Bangladesh.", CLASS_NAME, "Humanities", "Civics & Good Governance 2nd Paper", "NCTB Civics & Good Governance 2nd Paper"),
        createChapter("civ2_12_ch5", "Chapter 5", "Government and Administrative Structure", "সরকার ও প্রশাসনিক কাঠামো", "The structure of government and administration of Bangladesh, including the major organs and administrative arrangements.", CLASS_NAME, "Humanities", "Civics & Good Governance 2nd Paper", "NCTB Civics & Good Governance 2nd Paper"),
        createChapter("civ2_12_ch6", "Chapter 6", "Local Government", "স্থানীয় শাসন", "Concept, structure, functions, importance, and major institutions of local government in Bangladesh.", CLASS_NAME, "Humanities", "Civics & Good Governance 2nd Paper", "NCTB Civics & Good Governance 2nd Paper"),
        createChapter("civ2_12_ch7", "Chapter 7", "Constitutional Institutions", "সাংবিধানিক প্রতিষ্ঠান", "Major constitutional institutions of Bangladesh, their structure, functions, powers, and constitutional responsibilities.", CLASS_NAME, "Humanities", "Civics & Good Governance 2nd Paper", "NCTB Civics & Good Governance 2nd Paper"),
        createChapter("civ2_12_ch8", "Chapter 8", "Electoral System of Bangladesh", "বাংলাদেশের নির্বাচন ব্যবস্থা", "The electoral system, election administration, voting, electoral institutions, and major features of elections in Bangladesh.", CLASS_NAME, "Humanities", "Civics & Good Governance 2nd Paper", "NCTB Civics & Good Governance 2nd Paper"),
        createChapter("civ2_12_ch9", "Chapter 9", "Foreign Policy of Bangladesh", "বাংলাদেশের বৈদেশিক নীতি", "The principles, objectives, determinants, and major features of Bangladesh's foreign policy and international relations.", CLASS_NAME, "Humanities", "Civics & Good Governance 2nd Paper", "NCTB Civics & Good Governance 2nd Paper"),
        createChapter("civ2_12_ch10", "Chapter 10", "Civic Problems and Our Responsibilities", "নাগরিক সমস্যা ও আমাদের করণীয়", "Major civic problems of Bangladesh and the responsibilities of citizens in addressing and resolving them.", CLASS_NAME, "Humanities", "Civics & Good Governance 2nd Paper", "NCTB Civics & Good Governance 2nd Paper")
      ]
    });

    // Sociology 1st Paper
    subjectsList.push({
      id: "sociology1",
      name: "Sociology 1st Paper",
      banglaName: "সমাজবিজ্ঞান ১ম পত্র",
      color: "from-indigo-500 to-blue-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("soc1_12_ch1", "Chapter 1", "Origin and Development of Sociology", "সমাজবিজ্ঞানের উৎপত্তি ও বিকাশ", "The origin, development, nature, scope, and importance of sociology as a social science.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper"),
        createChapter("soc1_12_ch2", "Chapter 2", "Scientific Status of Sociology", "সমাজবিজ্ঞানের বৈজ্ঞানিক মর্যাদা", "The scientific nature of sociology, scientific methods, objectivity, and the status of sociology as a science.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper"),
        createChapter("soc1_12_ch3", "Chapter 3", "Theories and Contributions of Sociologists", "সমাজবিজ্ঞানীদের মতবাদ ও অবদান", "Major sociological thinkers, their theories, perspectives, and contributions to the development of sociology.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper"),
        createChapter("soc1_12_ch4", "Chapter 4", "Basic Concepts of Sociology", "সমাজবিজ্ঞানের মৌল প্রত্যয়", "Fundamental sociological concepts including society, community, social structure, social relationship, status, role, and social groups.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper"),
        createChapter("soc1_12_ch5", "Chapter 5", "Social Institutions", "সামাজিক প্রতিষ্ঠান", "Concept, characteristics, functions, and major forms of social institutions including family, marriage, religion, education, and the state.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper"),
        createChapter("soc1_12_ch6", "Chapter 6", "Factors Influencing Social Life", "সমাজজীবনে প্রভাববিস্তারকারী উপাদান", "Major biological, geographical, economic, political, cultural, and technological factors influencing social life.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper"),
        createChapter("soc1_12_ch7", "Chapter 7", "Socialization Process", "সামাজিকীকরণ প্রক্রিয়া", "Concept, characteristics, stages, agencies, and importance of socialization in the development of individual and social behavior.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper"),
        createChapter("soc1_12_ch8", "Chapter 8", "Social Stratification and Inequality", "সামাজিক স্তরবিন্যাস ও অসমতা", "Concept, forms, bases, characteristics, and consequences of social stratification and social inequality.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper"),
        createChapter("soc1_12_ch9", "Chapter 9", "Social System", "সামাজিক ব্যবস্থা", "Concept, elements, characteristics, structure, functions, and processes of social systems.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper"),
        createChapter("soc1_12_ch10", "Chapter 10", "Deviant Behavior and Crime", "বিচ্যুতিমূলক আচরণ এবং অপরাধ", "Concept, causes, forms, theories, and social consequences of deviant behavior and crime.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper"),
        createChapter("soc1_12_ch11", "Chapter 11", "Social Change", "সামাজিক পরিবর্তন", "Concept, characteristics, causes, patterns, and effects of social change and factors influencing social transformation.", CLASS_NAME, "Humanities", "Sociology 1st Paper", "NCTB Sociology 1st Paper")
      ]
    });

    // Sociology 2nd Paper
    subjectsList.push({
      id: "sociology2",
      name: "Sociology 2nd Paper",
      banglaName: "সমাজবিজ্ঞান ২য় পত্র",
      color: "from-indigo-500 to-blue-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("soc2_12_ch1", "Chapter 1", "Development of Sociology in Bangladesh", "বাংলাদেশে সমাজবিজ্ঞান চর্চার বিকাশ", "The background, beginning, development, and importance of sociology as an academic discipline in Bangladesh.", CLASS_NAME, "Humanities", "Sociology 2nd Paper", "NCTB Sociology 2nd Paper"),
        createChapter("soc2_12_ch2", "Chapter 2", "Society and Culture of Bangladesh", "বাংলাদেশের সমাজ ও সংস্কৃতি", "The characteristics, structure, diversity, traditions, values, and cultural features of Bangladeshi society.", CLASS_NAME, "Humanities", "Sociology 2nd Paper", "NCTB Sociology 2nd Paper"),
        createChapter("soc2_12_ch3", "Chapter 3", "Society and Civilization of Bangladesh Based on Archaeology", "প্রত্নতত্ত্বের ভিত্তিতে বাংলাদেশের সমাজ ও সভ্যতা", "The development of society and civilization in Bangladesh as understood through archaeological evidence and historical remains.", CLASS_NAME, "Humanities", "Sociology 2nd Paper", "NCTB Sociology 2nd Paper"),
        createChapter("soc2_12_ch4", "Chapter 4", "Lifestyle of Ethnic Communities in Bangladesh", "বাংলাদেশের ক্ষুদ্র নৃগোষ্ঠীর জীবনধারা", "The identity, social organization, culture, traditions, and lifestyles of major ethnic communities living in Bangladesh.", CLASS_NAME, "Humanities", "Sociology 2nd Paper", "NCTB Sociology 2nd Paper"),
        createChapter("soc2_12_ch5", "Chapter 5", "Social Background of the Emergence of Bangladesh", "বাংলাদেশের অভ্যুদয়ের সামাজিক প্রেক্ষাপট", "The major social, cultural, economic, and political conditions that contributed to the emergence of Bangladesh.", CLASS_NAME, "Humanities", "Sociology 2nd Paper", "NCTB Sociology 2nd Paper"),
        createChapter("soc2_12_ch6", "Chapter 6", "Rural and Urban Society of Bangladesh", "বাংলাদেশের গ্রামীণ ও শহুরে সমাজ", "The characteristics, structure, social relationships, stratification, power structure, and changing patterns of rural and urban society in Bangladesh.", CLASS_NAME, "Humanities", "Sociology 2nd Paper", "NCTB Sociology 2nd Paper"),
        createChapter("soc2_12_ch7", "Chapter 7", "Marriage, Family and Kinship in Bangladesh", "বাংলাদেশে বিবাহ, পরিবার ও জ্ঞাতিসম্পর্ক", "Types, characteristics, functions, and changing patterns of marriage, family, and kinship relationships in Bangladeshi society.", CLASS_NAME, "Humanities", "Sociology 2nd Paper", "NCTB Sociology 2nd Paper"),
        createChapter("soc2_12_ch8", "Chapter 8", "Social Change in Bangladesh", "বাংলাদেশের সামাজিক পরিবর্তন", "The nature, causes, patterns, and major factors influencing contemporary social change in Bangladesh.", CLASS_NAME, "Humanities", "Sociology 2nd Paper", "NCTB Sociology 2nd Paper"),
        createChapter("soc2_12_ch9", "Chapter 9", "Social Problems of Bangladesh and Their Remedies", "বাংলাদেশের সামাজিক সমস্যা ও প্রতিকারের উপায়", "Major social problems of Bangladesh, their causes and effects, and possible measures for prevention and remedy.", CLASS_NAME, "Humanities", "Sociology 2nd Paper", "NCTB Sociology 2nd Paper"),
        createChapter("soc2_12_ch10", "Chapter 10", "Social Development of Bangladesh", "বাংলাদেশের সামাজিক উন্নয়ন", "The concept of social development and the roles of government and non-government organizations in Bangladesh's social development.", CLASS_NAME, "Humanities", "Sociology 2nd Paper", "NCTB Sociology 2nd Paper")
      ]
    });

    // Social Work 1st Paper
    subjectsList.push({
      id: "social_work1",
      name: "Social Work 1st Paper",
      banglaName: "সমাজকর্ম ১ম পত্র",
      color: "from-rose-500 to-pink-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("sw1_12_ch1", "Chapter 1", "Nature and Scope of Social Work", "সমাজকর্মের প্রকৃতি ও পরিধি", "Concept, nature, characteristics, objectives, scope, importance, and need for social work education.", CLASS_NAME, "Humanities", "Social Work 1st Paper", "NCTB Social Work 1st Paper"),
        createChapter("sw1_12_ch2", "Chapter 2", "Historical Background of the Social Work Profession", "সমাজকর্ম পেশার ঐতিহাসিক প্রেক্ষাপট", "Historical development of social work, including the Poor Laws, social reform, industrial revolution, and development of the profession.", CLASS_NAME, "Humanities", "Social Work 1st Paper", "NCTB Social Work 1st Paper"),
        createChapter("sw1_12_ch3", "Chapter 3", "Values and Principles of the Social Work Profession", "সমাজকর্ম পেশার মূল্যবোধ ও নীতিমালা", "Concept of values, professional values, principles, ethical standards, and their importance in social work practice.", CLASS_NAME, "Humanities", "Social Work 1st Paper", "NCTB Social Work 1st Paper"),
        createChapter("sw1_12_ch4", "Chapter 4", "Related Concepts of Social Work", "সমাজকর্মের সাথে সম্পর্কিত প্রত্যয়সমূহ", "Concepts related to social work, including social welfare, social service, social security, social change, social development, social control, and social movements.", CLASS_NAME, "Humanities", "Social Work 1st Paper", "NCTB Social Work 1st Paper"),
        createChapter("sw1_12_ch5", "Chapter 5", "Traditional Social Welfare Institutions", "ঐতিহ্যগত সমাজকল্যাণ প্রতিষ্ঠানসমূহ", "Traditional social welfare institutions and practices and their role in providing assistance and promoting social welfare.", CLASS_NAME, "Humanities", "Social Work 1st Paper", "NCTB Social Work 1st Paper"),
        createChapter("sw1_12_ch6", "Chapter 6", "Relationship of Social Work with Various Branches of Knowledge and Professions", "সমাজকর্মের সাথে জ্ঞানের বিভিন্ন শাখা এবং পেশার সম্পর্ক", "Relationship of social work with anthropology, psychology, civics and good governance, economics, population science, law, journalism, and other professions.", CLASS_NAME, "Humanities", "Social Work 1st Paper", "NCTB Social Work 1st Paper"),
        createChapter("sw1_12_ch7", "Chapter 7", "Social Work Methods: Social Casework", "সমাজকর্ম পদ্ধতি: ব্যক্তি সমাজকর্ম", "Concept, principles, professional relationship, problem-solving process, and fields of application of social casework.", CLASS_NAME, "Humanities", "Social Work 1st Paper", "NCTB Social Work 1st Paper"),
        createChapter("sw1_12_ch8", "Chapter 8", "Social Work Methods: Group and Community Organization and Community Development", "সমাজকর্ম পদ্ধতি: দল ও সমষ্টি সংগঠন এবং সমষ্টি উন্নয়ন", "Concept, processes, principles, elements, applications, and interrelationships of social group work, community organization, and community development.", CLASS_NAME, "Humanities", "Social Work 1st Paper", "NCTB Social Work 1st Paper")
      ]
    });

    // Social Work 2nd Paper
    subjectsList.push({
      id: "social_work2",
      name: "Social Work 2nd Paper",
      banglaName: "সমাজকর্ম ২য় পত্র",
      color: "from-rose-500 to-pink-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("sw2_12_ch1", "Chapter 1", "Basic Human Needs in Bangladesh", "বাংলাদেশে মৌলিক মানবিক চাহিদা", "Concept, types, present situation, problems arising from unmet basic human needs, barriers, and measures for meeting basic human needs in Bangladesh.", CLASS_NAME, "Humanities", "Social Work 2nd Paper", "NCTB Social Work 2nd Paper"),
        createChapter("sw2_12_ch2", "Chapter 2", "Branches of Social Work", "সমাজকর্মের শাখা", "Major branches of social work and their relationship with human problems, including medical, school, psychiatric, industrial, and gerontological social work.", CLASS_NAME, "Humanities", "Social Work 2nd Paper", "NCTB Social Work 2nd Paper"),
        createChapter("sw2_12_ch3", "Chapter 3", "Social Work Practice in Solving Social Problems", "সামাজিক সমস্যা সমাধানে সমাজকর্মের অনুশীলন", "Concept, characteristics, causes, and interrelationships of social problems and the application of social work in addressing population, autism, climate change, and HIV/AIDS-related problems.", CLASS_NAME, "Humanities", "Social Work 2nd Paper", "NCTB Social Work 2nd Paper"),
        createChapter("sw2_12_ch4", "Chapter 4", "Prevention of Social Problems and Social Institutions and Organizations", "সামাজিক সমস্যা প্রতিরোধ এবং সামাজিক প্রতিষ্ঠান ও সংস্থা", "Concept and characteristics of social institutions and organizations and their role in preventing social problems, including marriage and family as social institutions.", CLASS_NAME, "Humanities", "Social Work 2nd Paper", "NCTB Social Work 2nd Paper"),
        createChapter("sw2_12_ch5", "Chapter 5", "Social Laws and Social Work", "সামাজিক আইন ও সমাজকর্ম", "Concept, objectives, importance, and application of social laws and the role of social workers in their formulation and implementation.", CLASS_NAME, "Humanities", "Social Work 2nd Paper", "NCTB Social Work 2nd Paper"),
        createChapter("sw2_12_ch6", "Chapter 6", "Government Social Development Activities in Bangladesh", "বাংলাদেশে সরকারি সমাজ উন্নয়ন কার্যক্রম", "Government social development and social welfare programmes in Bangladesh and the application of social work methods in rural, urban, youth, disaster management, and human rights programmes.", CLASS_NAME, "Humanities", "Social Work 2nd Paper", "NCTB Social Work 2nd Paper"),
        createChapter("sw2_12_ch7", "Chapter 7", "Non-Government Social Development Activities in Bangladesh", "বাংলাদেশে বেসরকারি সমাজ উন্নয়ন কার্যক্রম", "Social development activities of non-government organizations in Bangladesh and the application of social work methods in their programmes.", CLASS_NAME, "Humanities", "Social Work 2nd Paper", "NCTB Social Work 2nd Paper"),
        createChapter("sw2_12_ch8", "Chapter 8", "International Social Development Activities in Bangladesh", "বাংলাদেশে আন্তর্জাতিক সমাজ উন্নয়ন কার্যক্রম", "Social development activities of international organizations in Bangladesh and their contribution to social welfare and development.", CLASS_NAME, "Humanities", "Social Work 2nd Paper", "NCTB Social Work 2nd Paper"),
        createChapter("sw2_12_ch9", "Chapter 9", "Fieldwork and Practice in Social Work Education", "সমাজকর্ম শিক্ষায় মাঠকর্ম ও অনুশীলন", "Concept, objectives, principles, importance, case management, group management, social work techniques, and preparation of fieldwork reports.", CLASS_NAME, "Humanities", "Social Work 2nd Paper", "NCTB Social Work 2nd Paper")
      ]
    });

    // Logic 1st Paper
    subjectsList.push({
      id: "logic1",
      name: "Logic 1st Paper",
      banglaName: "যুক্তিবিদ্যা ১ম পত্র",
      color: "from-violet-500 to-indigo-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("log1_12_ch1", "Chapter 1", "Introduction to Logic", "যুক্তিবিদ্যার পরিচিতি", "Origin, development, concept, nature, scope, importance, and characteristics of logic as a science and art.", CLASS_NAME, "Humanities", "Logic 1st Paper", "NCTB Logic 1st Paper"),
        createChapter("log1_12_ch2", "Chapter 2", "Practical Aspects of Logic", "যুক্তিবিদ্যার প্রায়োগিক দিক", "Practical applications of logic and its relationship with philosophy, mathematics, aesthetics, and other fields.", CLASS_NAME, "Humanities", "Logic 1st Paper", "NCTB Logic 1st Paper"),
        createChapter("log1_12_ch3", "Chapter 3", "Elements of Reasoning", "যুক্তির উপাদান", "Words, terms, propositions, judgments, their classification, structure, meaning, and fundamental elements of reasoning.", CLASS_NAME, "Humanities", "Logic 1st Paper", "NCTB Logic 1st Paper"),
        createChapter("log1_12_ch4", "Chapter 4", "Predicate", "বিধেয়ক", "Concept of predicate, its characteristics, classification, genus, species, different types of predicates, and related logical concepts.", CLASS_NAME, "Humanities", "Logic 1st Paper", "NCTB Logic 1st Paper"),
        createChapter("log1_12_ch5", "Chapter 5", "Inference", "অনুমান", "Concept, nature, characteristics, classification, and fundamental principles of inference.", CLASS_NAME, "Humanities", "Logic 1st Paper", "NCTB Logic 1st Paper"),
        createChapter("log1_12_ch6", "Chapter 6", "Deductive Inference", "অবরোহ অনুমান", "Concept, characteristics, classification, immediate and mediate inference, conversion, contraposition, and syllogistic reasoning.", CLASS_NAME, "Humanities", "Logic 1st Paper", "NCTB Logic 1st Paper"),
        createChapter("log1_12_ch7", "Chapter 7", "Inductive Inference and the Basis of Induction", "আরোহ অনুমান ও আরোহ অনুমানের ভিত্তি", "Nature, characteristics, scope, validity, importance, and basis of inductive inference.", CLASS_NAME, "Humanities", "Logic 1st Paper", "NCTB Logic 1st Paper"),
        createChapter("log1_12_ch8", "Chapter 8", "Symbolic Logic", "প্রতীকী যুক্তিবিদ্যা", "Symbols, propositions, logical connectives, truth tables, and basic methods of symbolic logical analysis.", CLASS_NAME, "Humanities", "Logic 1st Paper", "NCTB Logic 1st Paper")
      ]
    });

    // Logic 2nd Paper
    subjectsList.push({
      id: "logic2",
      name: "Logic 2nd Paper",
      banglaName: "যুক্তিবিদ্যা ২য় পত্র",
      color: "from-violet-500 to-indigo-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("logic2_12_ch1", "Chapter 1", "Logical Definition", "যৌক্তিক সংজ্ঞা", "Concept, characteristics, rules, types, and fallacies of logical definition.", CLASS_NAME, "Humanities", "Logic 2nd Paper", "NCTB Logic 2nd Paper"),
        createChapter("logic2_12_ch2", "Chapter 2", "Logical Division", "যৌক্তিক বিভাগ", "Concept, types, rules, and fallacies of logical division.", CLASS_NAME, "Humanities", "Logic 2nd Paper", "NCTB Logic 2nd Paper"),
        createChapter("logic2_12_ch3", "Chapter 3", "Classification of Induction", "আরোহের প্রকারভেদ", "Concept, characteristics, types, and classification of induction.", CLASS_NAME, "Humanities", "Logic 2nd Paper", "NCTB Logic 2nd Paper"),
        createChapter("logic2_12_ch4", "Chapter 4", "Hypothesis", "প্রকল্প", "Concept, characteristics, types, formation, verification, and importance of hypothesis.", CLASS_NAME, "Humanities", "Logic 2nd Paper", "NCTB Logic 2nd Paper"),
        createChapter("logic2_12_ch5", "Chapter 5", "Methods of Establishing Causal Relations", "কার্যকারণ সম্পর্ক প্রমাণ পদ্ধতি", "Methods of determining and establishing causal relationships, including the experimental methods of induction.", CLASS_NAME, "Humanities", "Logic 2nd Paper", "NCTB Logic 2nd Paper"),
        createChapter("logic2_12_ch6", "Chapter 6", "Explanation", "ব্যাখ্যা", "Concept, characteristics, types, and methods of scientific explanation.", CLASS_NAME, "Humanities", "Logic 2nd Paper", "NCTB Logic 2nd Paper"),
        createChapter("logic2_12_ch7", "Chapter 7", "Classification", "শ্রেণীকরণ", "Concept, characteristics, types, principles, and importance of classification.", CLASS_NAME, "Humanities", "Logic 2nd Paper", "NCTB Logic 2nd Paper"),
        createChapter("logic2_12_ch8", "Chapter 8", "Probability", "সম্ভাবনা", "Concept, types, laws, calculation, and applications of probability.", CLASS_NAME, "Humanities", "Logic 2nd Paper", "NCTB Logic 2nd Paper")
      ]
    });

    // Islamic Studies 1st Paper
    subjectsList.push({
      id: "islamic_studies1",
      name: "Islamic Studies 1st Paper",
      banglaName: "ইসলাম শিক্ষা ১ম পত্র",
      color: "from-lime-500 to-green-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("isl1_12_ch1", "Chapter 1", "Islamic Education and Culture", "ইসলামি শিক্ষা ও সংস্কৃতি", "Concept, objectives, importance, sources, characteristics, and major aspects of Islamic education and culture.", CLASS_NAME, "Humanities", "Islamic Studies 1st Paper", "NCTB Islamic Studies 1st Paper"),
        createChapter("isl1_12_ch2", "Chapter 2", "Islam and Personal Life", "ইসলাম ও ব্যক্তিজীবন", "Islamic guidance, principles, duties, morality, and practices related to individual life.", CLASS_NAME, "Humanities", "Islamic Studies 1st Paper", "NCTB Islamic Studies 1st Paper"),
        createChapter("isl1_12_ch3", "Chapter 3", "Islam and Family Life", "ইসলাম ও পারিবারিক জীবন", "Islamic principles concerning marriage, family responsibilities, rights, duties, and family relationships.", CLASS_NAME, "Humanities", "Islamic Studies 1st Paper", "NCTB Islamic Studies 1st Paper"),
        createChapter("isl1_12_ch4", "Chapter 4", "Islam and Social Life", "ইসলাম ও সমাজজীবন", "Islamic principles of social relationships, rights, responsibilities, justice, cooperation, and social welfare.", CLASS_NAME, "Humanities", "Islamic Studies 1st Paper", "NCTB Islamic Studies 1st Paper"),
        createChapter("isl1_12_ch5", "Chapter 5", "Economic System of Islam", "ইসলামের অর্থব্যবস্থা", "Basic principles, sources, distribution, ownership, lawful earning, and major features of the Islamic economic system.", CLASS_NAME, "Humanities", "Islamic Studies 1st Paper", "NCTB Islamic Studies 1st Paper"),
        createChapter("isl1_12_ch6", "Chapter 6", "Islamic State System", "ইসলামি রাষ্ট্রব্যবস্থা", "Principles, objectives, characteristics, governance, justice, rights, and responsibilities within the Islamic state system.", CLASS_NAME, "Humanities", "Islamic Studies 1st Paper", "NCTB Islamic Studies 1st Paper"),
        createChapter("isl1_12_ch7", "Chapter 7", "Islamic International System", "ইসলামের আন্তর্জাতিক ব্যবস্থা", "Islamic principles governing international relations, peace, justice, cooperation, treaties, and relations among nations.", CLASS_NAME, "Humanities", "Islamic Studies 1st Paper", "NCTB Islamic Studies 1st Paper")
      ]
    });

    // Islamic Studies 2nd Paper
    subjectsList.push({
      id: "islamic_studies2",
      name: "Islamic Studies 2nd Paper",
      banglaName: "ইসলাম শিক্ষা ২য় পত্র",
      color: "from-lime-500 to-green-600",
      category: "selectable",
      eligibleGroups: ["Humanities"],
      chapters: [
        createChapter("isl2_12_ch1", "Chapter 1", "Al-Quran", "আল-কুরআন", "Introduction, characteristics, revelation, preservation, compilation, recitation, and teachings of the Holy Quran.", CLASS_NAME, "Humanities", "Islamic Studies 2nd Paper", "NCTB Islamic Studies 2nd Paper"),
        createChapter("isl2_12_ch2", "Chapter 2", "Al-Hadith", "আল-হাদিস", "Introduction, importance, classification, preservation, and selected Hadith with their meanings and teachings.", CLASS_NAME, "Humanities", "Islamic Studies 2nd Paper", "NCTB Islamic Studies 2nd Paper"),
        createChapter("isl2_12_ch3", "Chapter 3", "Al-Ijma", "আল-ইজমা", "Concept, importance, conditions, types, and role of Ijma as a source of Islamic law.", CLASS_NAME, "Humanities", "Islamic Studies 2nd Paper", "NCTB Islamic Studies 2nd Paper"),
        createChapter("isl2_12_ch4", "Chapter 4", "Al-Qiyas", "আল-কিয়াস", "Concept, importance, conditions, elements, and application of Qiyas in Islamic jurisprudence.", CLASS_NAME, "Humanities", "Islamic Studies 2nd Paper", "NCTB Islamic Studies 2nd Paper"),
        createChapter("isl2_12_ch5", "Chapter 5", "Fiqh", "ফিকহশাস্ত্র", "Concept, sources, development, principles, and major areas of Islamic jurisprudence.", CLASS_NAME, "Humanities", "Islamic Studies 2nd Paper", "NCTB Islamic Studies 2nd Paper"),
        createChapter("isl2_12_ch6", "Chapter 6", "Fundamental Acts of Worship", "মৌলিক ইবাদত", "Concept, importance, principles, and practices of the fundamental acts of worship in Islam.", CLASS_NAME, "Humanities", "Islamic Studies 2nd Paper", "NCTB Islamic Studies 2nd Paper"),
        createChapter("isl2_12_ch7", "Chapter 7", "Tasawwuf", "তাসাউফ", "Concept, objectives, principles, development, and importance of Tasawwuf in Islamic life.", CLASS_NAME, "Humanities", "Islamic Studies 2nd Paper", "NCTB Islamic Studies 2nd Paper")
      ]
    });
  }
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
        createChapter("hm1_12_ch1", "Chapter 1", "Matrix and Determinants", "ম্যাট্রিক্স ও নির্ণায়ক", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_12_ch2", "Chapter 2", "Vector", "ভেক্টর", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_12_ch3", "Chapter 3", "Straight Line", "সরলরেখা", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_12_ch4", "Chapter 4", "Circle", "বৃত্ত", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_12_ch5", "Chapter 5", "Permutation and Combination", "বিন্যাস ও সমাবেশ", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_12_ch6", "Chapter 6", "Trigonometric Ratios", "ত্রিকোণমিতিক অনুপাত", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_12_ch7", "Chapter 7", "Trigonometric Ratios of Compound Angles", "সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_12_ch8", "Chapter 8", "Functions and Graphs of Functions", "ফাংশন ও ফাংশনের লেখচিত্র", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_12_ch9", "Chapter 9", "Differentiation", "অন্তরীকরণ", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper"),
        createChapter("hm1_12_ch10", "Chapter 10", "Integration", "যোগজীকরণ", "", CLASS_NAME, "Science", "Higher Math 1st Paper", "NCTB Higher Math First Paper")
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
        createChapter("hm2_12_ch1", "Chapter 1", "Real Numbers and Inequalities", "বাস্তব সংখ্যা ও অসমতা", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch2", "Chapter 2", "Linear Programming", "যোগাশ্রয়ী প্রোগ্রাম", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch3", "Chapter 3", "Complex Numbers", "জটিল সংখ্যা", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch4", "Chapter 4", "Polynomials and Polynomial Equations", "বহুপদী ও বহুপদী সমীকরণ", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch5", "Chapter 5", "Binomial Expansion", "দ্বিপদী বিস্তৃতি", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch6", "Chapter 6", "Conics", "কণিক", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch7", "Chapter 7", "Inverse Trigonometric Functions and Trigonometric Equations", "বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch8", "Chapter 8", "Statics", "স্থিতিবিদ্যা", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch9", "Chapter 9", "Motion of Particles in a Plane", "সমতলে বস্তুকণার গতি", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper"),
        createChapter("hm2_12_ch10", "Chapter 10", "Measures of Dispersion and Probability", "বিস্তার পরিমাপ ও সম্ভাবনা", "", CLASS_NAME, "Science", "Higher Math 2nd Paper", "NCTB Higher Math Second Paper")
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
      chapters: [
        createChapter("psy1_12_ch1", "Chapter 1", "Introduction to Psychology", "মনোবিজ্ঞানের পরিচিতি", "Concept, nature, scope, objectives, and branches of psychology.", CLASS_NAME, "Science", "Psychology 1st Paper", "NCTB Psychology 1st Paper"),
        createChapter("psy1_12_ch2", "Chapter 2", "Behavior and Development of Behavior", "আচরণ ও আচরণের বিকাশ", "Concept of behavior and the factors involved in the development of human behavior.", CLASS_NAME, "Science", "Psychology 1st Paper", "NCTB Psychology 1st Paper"),
        createChapter("psy1_12_ch3", "Chapter 3", "Biological Basis of Behavior", "আচরণের জৈবিক ভিত্তি", "The role of the nervous system, brain, endocrine system, and other biological factors in behavior.", CLASS_NAME, "Science", "Psychology 1st Paper", "NCTB Psychology 1st Paper"),
        createChapter("psy1_12_ch4", "Chapter 4", "Motivation and Emotion", "প্রেষণা ও আবেগ", "Concept, types, theories, and role of motivation and emotion in human behavior.", CLASS_NAME, "Science", "Psychology 1st Paper", "NCTB Psychology 1st Paper"),
        createChapter("psy1_12_ch5", "Chapter 5", "Learning and Memory", "শিক্ষণ ও স্মৃতি", "Concept, types, principles, theories of learning, and processes of memory.", CLASS_NAME, "Science", "Psychology 1st Paper", "NCTB Psychology 1st Paper"),
        createChapter("psy1_12_ch6", "Chapter 6", "Sensation and Perception", "সংবেদন ও প্রত্যক্ষণ", "Concept, characteristics, types, processes, and factors influencing sensation and perception.", CLASS_NAME, "Science", "Psychology 1st Paper", "NCTB Psychology 1st Paper"),
        createChapter("psy1_12_ch7", "Chapter 7", "Adolescence and Mental Health", "বয়ঃসন্ধিকাল ও মানসিক স্বাস্থ্য", "Physical, emotional, social, and psychological development during adolescence and concepts of mental health.", CLASS_NAME, "Science", "Psychology 1st Paper", "NCTB Psychology 1st Paper"),
        createChapter("psy1_12_ch8", "Chapter 8", "Introduction to Statistics", "পরিসংখ্যান পরিচিতি", "Basic concepts of statistics and its applications in psychological research.", CLASS_NAME, "Science", "Psychology 1st Paper", "NCTB Psychology 1st Paper")
      ]
    });

    // Psychology 2nd Paper
    subjectsList.push({
      id: "psychology2",
      name: "Psychology 2nd Paper",
      banglaName: "মনোবিজ্ঞান ২য় পত্র",
      color: "from-pink-500 to-rose-600",
      category: "selectable",
      eligibleGroups: ["Science", "Humanities"],
      chapters: [
        createChapter("psy2_12_ch1", "Chapter 1", "Intelligence", "বুদ্ধি", "Concept, nature, measurement, individual and group differences, and factors influencing intelligence.", CLASS_NAME, "Science", "Psychology 2nd Paper", "NCTB Psychology 2nd Paper"),
        createChapter("psy2_12_ch2", "Chapter 2", "Personality", "ব্যক্তিত্ব", "Concept, types, characteristics, development, and major approaches to understanding personality.", CLASS_NAME, "Science", "Psychology 2nd Paper", "NCTB Psychology 2nd Paper"),
        createChapter("psy2_12_ch3", "Chapter 3", "Attitude", "মনোভাব", "Nature, characteristics, components, measurement, formation, and change of attitudes.", CLASS_NAME, "Science", "Psychology 2nd Paper", "NCTB Psychology 2nd Paper"),
        createChapter("psy2_12_ch4", "Chapter 4", "Influence of Environment on Behavior", "আচরণের উপর পরিবেশের প্রভাব", "Socialization, culture, aggression, adjustment, conformity, and environmental influences on human behavior.", CLASS_NAME, "Science", "Psychology 2nd Paper", "NCTB Psychology 2nd Paper"),
        createChapter("psy2_12_ch5", "Chapter 5", "Stress and Coping with Stress", "মানসিক চাপ এবং চাপ মোকাবেলা", "Concept, causes, characteristics, stressful situations, effects of stress, and methods of coping with stress.", CLASS_NAME, "Science", "Psychology 2nd Paper", "NCTB Psychology 2nd Paper"),
        createChapter("psy2_12_ch6", "Chapter 6", "Values", "মূল্যবোধ", "Concept, types, development, sources, and influence of values on human behavior.", CLASS_NAME, "Science", "Psychology 2nd Paper", "NCTB Psychology 2nd Paper"),
        createChapter("psy2_12_ch7", "Chapter 7", "Research Methods in Psychology", "মনোবিজ্ঞানে গবেষণার পদ্ধতিসমূহ", "Scientific research methods, variables, hypotheses, research design, data collection, and control of variables in psychological research.", CLASS_NAME, "Science", "Psychology 2nd Paper", "NCTB Psychology 2nd Paper"),
        createChapter("psy2_12_ch8", "Chapter 8", "Statistics", "পরিসংখ্যান", "Basic statistical concepts, data organization, measures of central tendency, dispersion, and statistical analysis in psychology.", CLASS_NAME, "Science", "Psychology 2nd Paper", "NCTB Psychology 2nd Paper")
      ]
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
      chapters: [
        createChapter("eco1_12_ch1", "Chapter 1", "Basic Economic Problems", "মৌলিক অর্থনৈতিক সমস্যা", "Scarcity, choice, opportunity cost, basic economic problems, economic systems, and microeconomics and macroeconomics.", CLASS_NAME, "Humanities", "Economics 1st Paper", "NCTB Economics 1st Paper"),
        createChapter("eco1_12_ch2", "Chapter 2", "Consumer and Producer Behavior", "ভোক্তা ও উৎপাদকের আচরণ", "Utility, consumer behavior, demand, supply, elasticity, and the behavior of consumers and producers.", CLASS_NAME, "Humanities", "Economics 1st Paper", "NCTB Economics 1st Paper"),
        createChapter("eco1_12_ch3", "Chapter 3", "Production, Production Cost and Revenue", "উৎপাদন, উৎপাদন ব্যয় ও আয়", "Factors of production, production functions, production costs, revenue, and profit maximization.", CLASS_NAME, "Humanities", "Economics 1st Paper", "NCTB Economics 1st Paper"),
        createChapter("eco1_12_ch4", "Chapter 4", "Market", "বাজার", "Market concepts, market structures, perfect competition, monopoly, oligopoly, and market equilibrium.", CLASS_NAME, "Humanities", "Economics 1st Paper", "NCTB Economics 1st Paper"),
        createChapter("eco1_12_ch5", "Chapter 5", "Labour Market", "শ্রমবাজার", "Demand and supply of labour, wage determination, real and money wages, and labour mobility.", CLASS_NAME, "Humanities", "Economics 1st Paper", "NCTB Economics 1st Paper"),
        createChapter("eco1_12_ch6", "Chapter 6", "Capital", "মূলধন", "Concept, characteristics, classification, importance, mobility, and supply of capital.", CLASS_NAME, "Humanities", "Economics 1st Paper", "NCTB Economics 1st Paper"),
        createChapter("eco1_12_ch7", "Chapter 7", "Organization", "সংগঠন", "Concept and functions of organization, role of the organizer, types of organizations, and business organizations.", CLASS_NAME, "Humanities", "Economics 1st Paper", "NCTB Economics 1st Paper"),
        createChapter("eco1_12_ch8", "Chapter 8", "Rent", "খাজনা", "Concept of rent, economic rent, Ricardo's theory of rent, criticisms, and modern theory of rent.", CLASS_NAME, "Humanities", "Economics 1st Paper", "NCTB Economics 1st Paper"),
        createChapter("eco1_12_ch9", "Chapter 9", "Aggregate Income and Expenditure", "সামগ্রিক আয় ও ব্যয়", "National income, GDP, GNP, consumption, saving, investment, aggregate income and expenditure, and equilibrium.", CLASS_NAME, "Humanities", "Economics 1st Paper", "NCTB Economics 1st Paper"),
        createChapter("eco1_12_ch10", "Chapter 10", "Money and Banking", "মুদ্রা ও ব্যাংক", "Functions and value of money, demand and supply of money, quantity theory of money, and banking and credit control.", CLASS_NAME, "Humanities", "Economics 1st Paper", "NCTB Economics 1st Paper")
      ]
    });

    // Economics 2nd Paper
    subjectsList.push({
      id: "economics2",
      name: "Economics 2nd Paper",
      banglaName: "অর্থনীতি ২য় পত্র",
      color: "from-blue-500 to-indigo-600",
      category: "selectable",
      eligibleGroups: ["Business Studies", "Humanities"],
      chapters: [
        createChapter("eco2_12_ch1", "Chapter 1", "Introduction to the Economy of Bangladesh", "বাংলাদেশের অর্থনীতি পরিচয়", "Historical background, structure, characteristics, sectors, and major features of the economy of Bangladesh.", CLASS_NAME, "Humanities", "Economics 2nd Paper", "NCTB Economics 2nd Paper"),
        createChapter("eco2_12_ch2", "Chapter 2", "Agriculture of Bangladesh", "বাংলাদেশের কৃষি", "Structure, importance, production, problems, development, and modernization of agriculture in Bangladesh.", CLASS_NAME, "Humanities", "Economics 2nd Paper", "NCTB Economics 2nd Paper"),
        createChapter("eco2_12_ch3", "Chapter 3", "Industry of Bangladesh", "বাংলাদেশের শিল্প", "Industrial structure, importance, major industries, problems, prospects, and industrial development in Bangladesh.", CLASS_NAME, "Humanities", "Economics 2nd Paper", "NCTB Economics 2nd Paper"),
        createChapter("eco2_12_ch4", "Chapter 4", "Population, Human Resources and Self-Employment", "জনসংখ্যা, মানবসম্পদ এবং আত্মকর্মসংস্থান", "Population characteristics, human resource development, employment, unemployment, and self-employment opportunities in Bangladesh.", CLASS_NAME, "Humanities", "Economics 2nd Paper", "NCTB Economics 2nd Paper"),
        createChapter("eco2_12_ch5", "Chapter 5", "Food Security", "খাদ্য নিরাপত্তা", "Concept, importance, dimensions, problems, and measures for ensuring food security in Bangladesh.", CLASS_NAME, "Humanities", "Economics 2nd Paper", "NCTB Economics 2nd Paper"),
        createChapter("eco2_12_ch6", "Chapter 6", "Financing", "অর্থায়ন", "Concept, sources, methods, and importance of financing in economic activities and development.", CLASS_NAME, "Humanities", "Economics 2nd Paper", "NCTB Economics 2nd Paper"),
        createChapter("eco2_12_ch7", "Chapter 7", "Inflation", "মুদ্রাস্ফীতি", "Concept, types, causes, effects, measurement, and measures for controlling inflation.", CLASS_NAME, "Humanities", "Economics 2nd Paper", "NCTB Economics 2nd Paper"),
        createChapter("eco2_12_ch8", "Chapter 8", "International Trade", "আন্তর্জাতিক বাণিজ্য", "Concept, importance, theories, terms, balance of trade, and international trade of Bangladesh.", CLASS_NAME, "Humanities", "Economics 2nd Paper", "NCTB Economics 2nd Paper"),
        createChapter("eco2_12_ch9", "Chapter 9", "Public Finance", "সরকারি অর্থব্যবস্থা", "Government revenue, expenditure, public borrowing, budget, taxation, and public financial management.", CLASS_NAME, "Humanities", "Economics 2nd Paper", "NCTB Economics 2nd Paper"),
        createChapter("eco2_12_ch10", "Chapter 10", "Development Planning", "উন্নয়ন পরিকল্পনা", "Economic development, development planning, planning processes, strategies, and development plans of Bangladesh.", CLASS_NAME, "Humanities", "Economics 2nd Paper", "NCTB Economics 2nd Paper")
      ]
    });

    // Home Science 1st Paper
    subjectsList.push({
      id: "home_science1",
      name: "Home Science 1st Paper",
      banglaName: "গার্হস্থ্য বিজ্ঞান ১ম পত্র",
      color: "from-rose-500 to-pink-600",
      category: "selectable",
      eligibleGroups: ["Business Studies", "Humanities"],
      chapters: [
        createChapter("hsc1_12_ch1", "Chapter 1", "Home Management", "গৃহ ব্যবস্থাপনা", "Concept, principles, objectives, and importance of home management.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch2", "Chapter 2", "Steps of Home Management", "গৃহ ব্যবস্থাপনার ধাপ", "The major steps and processes involved in effective home management.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch3", "Chapter 3", "Home Resource Management", "গৃহ সম্পদ ব্যবস্থাপনা", "Types of family resources and their effective management and utilization.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch4", "Chapter 4", "Time and Energy Management", "সময় ও শক্তি ব্যবস্থাপনা", "Principles and methods of managing household time and energy efficiently.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch5", "Chapter 5", "Saving, Investment and Loan", "সঞ্চয়, বিনিয়োগ ও ঋণ", "Concepts, methods, importance, and management of saving, investment, and loans.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch6", "Chapter 6", "Housing Planning", "আবাসস্থান পরিকল্পনা", "Principles of housing planning, functional requirements, and factors affecting housing decisions.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch7", "Chapter 7", "Building Materials and Related Matters", "গৃহ নির্মাণসামগ্রী ও আনুষঙ্গিক বিষয়", "Types, characteristics, selection, and uses of household and building materials.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch8", "Chapter 8", "Selection and Arrangement of Furniture and Home Decoration", "আসবাবপত্র নির্বাচন, বিন্যাস ও গৃহসজ্জা", "Principles of furniture selection, arrangement, interior decoration, and aesthetic design of the home.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch9", "Chapter 9", "Use of Home Grounds, Roof and Veranda", "গৃহ প্রাঙ্গণ, ছাদ ও বারান্দার ব্যবহার", "Effective, functional, and aesthetic use of home grounds, roofs, and verandas.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch10", "Chapter 10", "Environmental Conservation and Disaster Management", "পরিবেশ সংরক্ষণ ও দুর্যোগ ব্যবস্থাপনা", "Environmental conservation, household environmental practices, disaster preparedness, and management.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch11", "Chapter 11", "Traditional Textiles of Bangladesh", "বাংলাদেশের ঐতিহ্যবাহী বস্ত্র", "Traditional textiles of Bangladesh, their characteristics, production, cultural significance, and preservation.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch12", "Chapter 12", "Fashion, Style and Design", "ফ্যাশন, স্টাইল ও ডিজাইন", "Concepts of fashion, style, design, fashion trends, and principles of clothing design.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch13", "Chapter 13", "Colour and Printing in Textiles", "বস্ত্রে রঙ ও ছাপা", "Colour concepts, colour application, textile printing methods, and decorative textile design.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch14", "Chapter 14", "Principles and Elements of Art in Clothing", "পোশাকে শিল্পকলার নীতি ও উপাদান", "Principles and elements of art and their application in clothing and dress design.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch15", "Chapter 15", "Garment Cutting and Sewing", "পোশাকের ছাঁট ও সেলাই", "Principles and techniques of garment cutting, pattern preparation, and sewing.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper"),
        createChapter("hsc1_12_ch16", "Chapter 16", "Stain Removal and Clothing Repair", "বস্ত্রের দাগ অপসারণ ও সংস্করণ", "Methods of removing stains, repairing clothing, and maintaining textile products.", CLASS_NAME, "Humanities", "Home Science 1st Paper", "NCTB Home Science 1st Paper")
      ]
    });

    // Home Science 2nd Paper
    subjectsList.push({
      id: "home_science2",
      name: "Home Science 2nd Paper",
      banglaName: "গার্হস্থ্য বিজ্ঞান ২য় পত্র",
      color: "from-rose-500 to-pink-600",
      category: "selectable",
      eligibleGroups: ["Business Studies", "Humanities"],
      chapters: [
        createChapter("hsc2_12_ch1", "Chapter 1", "Present Family Structure of Bangladesh", "বাংলাদেশের বর্তমান পরিবার কাঠামো", "Concept, classification, characteristics, functions, changing social influences, family bonding, and planned family.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch2", "Chapter 2", "Reproductive System, Growth of the Child in the Womb and Environmental Influences", "প্রজননতন্ত্র, মাতৃগর্ভে শিশুর বৃদ্ধি ও পারিপার্শ্বিক প্রভাব", "The reproductive system, fertilization, development of the child in the womb, and the influence of surrounding environmental conditions.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch3", "Chapter 3", "Care of Pregnant Mother and Safe Motherhood", "গর্ভবতী মায়ের যত্ন ও নিরাপদ মাতৃত্ব", "Physical and mental care of pregnant mothers, health examinations, safe motherhood, childbirth complications, and risks of early pregnancy.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch4", "Chapter 4", "Care of Newborn and Postpartum Mother and Child Vaccination", "নবজাতক, প্রসূতি মায়ের যত্ন ও শিশুর টিকা", "Care of newborns and postpartum mothers, newborn characteristics, and childhood immunization.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch5", "Chapter 5", "Child Growth and Development", "শিশুর ক্রমবিকাশ", "Physical, mental, social, emotional, and language development of children and principles of development.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch6", "Chapter 6", "Children with Special Needs", "বিশেষ চাহিদাসম্পন্ন শিশু", "Types, characteristics, development, care, education, and social responsibilities toward children with special needs.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch7", "Chapter 7", "Youth Development and Prevention of Problems", "তারুণ্যের বিকাশ ও বিপর্যয়রোধ", "Physical, mental, emotional, and social development during youth and prevention of related problems.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch8", "Chapter 8", "Mental Health and Reproductive Health", "মানসিক স্বাস্থ্য ও প্রজনন স্বাস্থ্য", "Mental health, reproductive health, HIV/AIDS, prevention, and family and social responsibilities.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch9", "Chapter 9", "Food and Nutrients", "খাদ্য ও খাদ্যের উপাদান", "Food, nutrition, food requirements, nutrients, their sources, functions, deficiency conditions, and prevention.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch10", "Chapter 10", "Digestive System, Digestion and Absorption", "পরিপাকতন্ত্র, পরিপাক ও শোষণ", "Structure and functions of the digestive system, digestion of nutrients, and absorption of digested food.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch11", "Chapter 11", "Energy Requirement", "শক্তির চাহিদা", "Concept of energy, energy measurement, factors affecting energy requirements, and determination of individual energy needs.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch12", "Chapter 12", "Basic Food Groups, Balanced Diet and Menu Planning", "মৌলিক খাদ্য গোষ্ঠী, সুষম খাদ্য ও মেনু পরিকল্পনা", "Basic food groups, balanced diet, principles of menu planning, and preparation of suitable menus.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch13", "Chapter 13", "Diseases and Diet Management", "রোগ ও পথ্য ব্যবস্থাপনা", "Dietary management for diseases, therapeutic diets, and selection of appropriate foods during illness.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch14", "Chapter 14", "Food Preservation and Cooking", "খাদ্য সংরক্ষণ ও রন্ধন", "Principles and methods of food preservation, cooking methods, and effects of cooking on food nutrients.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper"),
        createChapter("hsc2_12_ch15", "Chapter 15", "Public Health Problems", "জনস্বাস্থ্য সমস্যা", "Major public health problems, their causes, effects, prevention, and measures for maintaining community health.", CLASS_NAME, "Humanities", "Home Science 2nd Paper", "NCTB Home Science 2nd Paper")
      ]
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
      chapters: [
        createChapter("agr1_12_ch1", "Chapter 1", "Agriculture of Bangladesh", "বাংলাদেশের কৃষি", "Agriculture in Bangladesh, its major sectors, importance, agricultural resources, and development.", CLASS_NAME, "Science", "Agriculture 1st Paper", "NCTB Agriculture 1st Paper"),
        createChapter("agr1_12_ch2", "Chapter 2", "Land Resource and Agricultural Technology", "ভূমি সম্পদ ও কৃষি প্রযুক্তি", "Land resources, soil-related factors, land use, and agricultural technologies for improved production.", CLASS_NAME, "Science", "Agriculture 1st Paper", "NCTB Agriculture 1st Paper"),
        createChapter("agr1_12_ch3", "Chapter 3", "Special Production Related Agricultural Technology", "বিশেষ উৎপাদন সম্পৃক্ত কৃষি প্রযুক্তি", "Agricultural technologies related to special production systems including poultry, fisheries, livestock, and social forestry.", CLASS_NAME, "Science", "Agriculture 1st Paper", "NCTB Agriculture 1st Paper"),
        createChapter("agr1_12_ch4", "Chapter 4", "Agriculture and Climate", "কৃষি ও জলবায়ু", "Relationship between agriculture and climate, climatic factors, climate effects on production, and climate-related agricultural practices.", CLASS_NAME, "Science", "Agriculture 1st Paper", "NCTB Agriculture 1st Paper"),
        createChapter("agr1_12_ch5", "Chapter 5", "Field and Horticultural Crop Production", "মাঠ ও উদ্যান ফসল উৎপাদন", "Production practices, cultivation, management, and characteristics of major field and horticultural crops.", CLASS_NAME, "Science", "Agriculture 1st Paper", "NCTB Agriculture 1st Paper"),
        createChapter("agr1_12_ch6", "Chapter 6", "Processing and Preservation of Fruits and Vegetables", "ফল ও শাকসবজি প্রক্রিয়াজাতকরণ ও সংরক্ষণ", "Methods, principles, importance, and techniques of processing and preserving fruits and vegetables.", CLASS_NAME, "Science", "Agriculture 1st Paper", "NCTB Agriculture 1st Paper")
      ]
    });

    // Agriculture Studies 2nd Paper
    subjectsList.push({
      id: "agriculture2",
      name: "Agriculture Studies 2nd Paper",
      banglaName: "কৃষিশিক্ষা ২য় পত্র",
      color: "from-green-500 to-emerald-600",
      category: "selectable",
      eligibleGroups: ["Science", "Business Studies", "Humanities"],
      chapters: [
        createChapter("agr2_12_ch1", "Chapter 1", "Fish Farming", "মৎস্য চাষ", "Fish farming, pond preparation, fish species, stocking, feeding, breeding, disease management, and fish production.", CLASS_NAME, "Science", "Agriculture 2nd Paper", "NCTB Agriculture 2nd Paper"),
        createChapter("agr2_12_ch2", "Chapter 2", "Poultry Farming", "পোল্ট্রি পালন", "Poultry breeds, housing, feeding, breeding, management, disease prevention, and commercial poultry production.", CLASS_NAME, "Science", "Agriculture 2nd Paper", "NCTB Agriculture 2nd Paper"),
        createChapter("agr2_12_ch3", "Chapter 3", "Livestock Farming", "পশু পালন", "Livestock breeds, housing, feeding, breeding, management, disease prevention, and livestock production.", CLASS_NAME, "Science", "Agriculture 2nd Paper", "NCTB Agriculture 2nd Paper"),
        createChapter("agr2_12_ch4", "Chapter 4", "Forestry", "বনায়ন", "Forests, forest resources, afforestation, social forestry, forest management, and the importance of forestry.", CLASS_NAME, "Science", "Agriculture 2nd Paper", "NCTB Agriculture 2nd Paper"),
        createChapter("agr2_12_ch5", "Chapter 5", "Agricultural Economics and Cooperatives", "কৃষি অর্থনীতি ও সমবায়", "Basic concepts of agricultural economics, agricultural production and marketing, farm management, and agricultural cooperatives.", CLASS_NAME, "Science", "Agriculture 2nd Paper", "NCTB Agriculture 2nd Paper")
      ]
    });

    // Geography 1st Paper
    subjectsList.push({
      id: "geography1",
      name: "Geography 1st Paper",
      banglaName: "ভূগোল ১ম পত্র",
      color: "from-teal-500 to-cyan-600",
      category: "selectable",
      eligibleGroups: ["Science", "Business Studies", "Humanities"],
      chapters: [
        createChapter("geo1_12_ch1", "Chapter 1", "Physical Geography", "প্রাকৃতিক ভূগোল", "Concept, nature, scope, elements, and importance of physical geography.", CLASS_NAME, "Humanities", "Geography 1st Paper", "NCTB Geography 1st Paper"),
        createChapter("geo1_12_ch2", "Chapter 2", "Structure of the Earth", "পৃথিবীর গঠন", "Internal structure of the Earth, rocks, landforms, mountains, plains, plateaus, and related geographical features.", CLASS_NAME, "Humanities", "Geography 1st Paper", "NCTB Geography 1st Paper"),
        createChapter("geo1_12_ch3", "Chapter 3", "Changes in Landforms", "ভূমিরূপ পরিবর্তন", "Sudden and gradual changes of the Earth's surface, plate movement, earthquakes, volcanoes, weathering, erosion, rivers, and related landforms.", CLASS_NAME, "Humanities", "Geography 1st Paper", "NCTB Geography 1st Paper"),
        createChapter("geo1_12_ch4", "Chapter 4", "Atmosphere and Air Pollution", "বায়ুমণ্ডল ও বায়ু দূষণ", "Composition and layers of the atmosphere, air pollution, its sources, effects, prevention, and control.", CLASS_NAME, "Humanities", "Geography 1st Paper", "NCTB Geography 1st Paper"),
        createChapter("geo1_12_ch5", "Chapter 5", "Elements and Controls of Climate", "জলবায়ুর উপাদান ও নিয়ামক", "Climate, climatic elements and controls, temperature, pressure, wind, humidity, condensation, clouds, and precipitation.", CLASS_NAME, "Humanities", "Geography 1st Paper", "NCTB Geography 1st Paper"),
        createChapter("geo1_12_ch6", "Chapter 6", "Climatic Regions and Climate Change", "জলবায়ু অঞ্চল ও জলবায়ু পরিবর্তন", "Climatic regions, major climate types, climate variability, greenhouse effect, global warming, and climate change in Bangladesh.", CLASS_NAME, "Humanities", "Geography 1st Paper", "NCTB Geography 1st Paper"),
        createChapter("geo1_12_ch7", "Chapter 7", "Hydrosphere", "বারিমণ্ডল", "Distribution of water, seas and oceans, ocean-floor landforms, and major physical features of the hydrosphere.", CLASS_NAME, "Humanities", "Geography 1st Paper", "NCTB Geography 1st Paper"),
        createChapter("geo1_12_ch8", "Chapter 8", "Ocean Currents and Tides", "সমুদ্রস্রোত ও জোয়ার-ভাটা", "Major ocean currents, their causes and effects, tides, their causes, types, effects, and coastal significance.", CLASS_NAME, "Humanities", "Geography 1st Paper", "NCTB Geography 1st Paper"),
        createChapter("geo1_12_ch9", "Chapter 9", "Biosphere", "জীবমণ্ডল", "Biodiversity, ecosystems, biomes, forests, environmental balance, and natural environmental pollution.", CLASS_NAME, "Humanities", "Geography 1st Paper", "NCTB Geography 1st Paper"),
        createChapter("geo1_12_ch10", "Chapter 10", "Maps and Scale", "মানচিত্র ও স্কেল", "Concept and uses of maps, types and expression of scale, distance measurement, scale construction, and map enlargement and reduction.", CLASS_NAME, "Humanities", "Geography 1st Paper", "NCTB Geography 1st Paper")
      ]
    });

    // Geography 2nd Paper
    subjectsList.push({
      id: "geography2",
      name: "Geography 2nd Paper",
      banglaName: "ভূগোল ২য় পত্র",
      color: "from-teal-500 to-cyan-600",
      category: "selectable",
      eligibleGroups: ["Science", "Business Studies", "Humanities"],
      chapters: [
        createChapter("geo2_12_ch1", "Chapter 1", "Human Geography", "মানব ভূগোল", "Concept, scope, branches, importance, and major aspects of human geography.", CLASS_NAME, "Humanities", "Geography 2nd Paper", "NCTB Geography 2nd Paper"),
        createChapter("geo2_12_ch2", "Chapter 2", "Population", "জনসংখ্যা", "Population distribution, growth, density, composition, migration, and factors affecting population.", CLASS_NAME, "Humanities", "Geography 2nd Paper", "NCTB Geography 2nd Paper"),
        createChapter("geo2_12_ch3", "Chapter 3", "Settlement", "বসতি", "Concept, classification, distribution, patterns, development, and geographical characteristics of rural and urban settlements.", CLASS_NAME, "Humanities", "Geography 2nd Paper", "NCTB Geography 2nd Paper"),
        createChapter("geo2_12_ch4", "Chapter 4", "Agriculture", "কৃষি", "Agricultural activities, geographical factors, major crops, farming systems, and agricultural production.", CLASS_NAME, "Humanities", "Geography 2nd Paper", "NCTB Geography 2nd Paper"),
        createChapter("geo2_12_ch5", "Chapter 5", "Mineral and Energy Resources", "খনিজ ও শক্তি সম্পদ", "Distribution, extraction, uses, and economic importance of mineral and energy resources.", CLASS_NAME, "Humanities", "Geography 2nd Paper", "NCTB Geography 2nd Paper"),
        createChapter("geo2_12_ch6", "Chapter 6", "Industry", "শিল্প", "Industrial activities, classification, location factors, distribution, and major industrial regions.", CLASS_NAME, "Humanities", "Geography 2nd Paper", "NCTB Geography 2nd Paper"),
        createChapter("geo2_12_ch7", "Chapter 7", "Transport and Communication", "পরিবহন ও যোগাযোগ", "Types, development, distribution, importance, and geographical significance of transport and communication systems.", CLASS_NAME, "Humanities", "Geography 2nd Paper", "NCTB Geography 2nd Paper"),
        createChapter("geo2_12_ch8", "Chapter 8", "Trade", "বাণিজ্য", "Concept, types, factors, routes, patterns, and geographical importance of domestic and international trade.", CLASS_NAME, "Humanities", "Geography 2nd Paper", "NCTB Geography 2nd Paper"),
        createChapter("geo2_12_ch9", "Chapter 9", "Pollution and Disasters", "দূষণ ও দুর্যোগ", "Types, causes, effects, prevention, and management of environmental pollution and natural and human-made disasters.", CLASS_NAME, "Humanities", "Geography 2nd Paper", "NCTB Geography 2nd Paper"),
        createChapter("geo2_12_ch10", "Chapter 10", "Map Projection", "মানচিত্র অভিক্ষেপ", "Concept, classification, properties, construction, uses, and practical applications of map projections.", CLASS_NAME, "Humanities", "Geography 2nd Paper", "NCTB Geography 2nd Paper")
      ]
    });

    // Statistics 1st Paper
    subjectsList.push({
      id: "statistics1",
      name: "Statistics 1st Paper",
      banglaName: "পরিসংখ্যান ১ম পত্র",
      color: "from-indigo-500 to-violet-600",
      category: "selectable",
      eligibleGroups: ["Science", "Business Studies", "Humanities"],
      chapters: [
        createChapter("stat1_12_ch1", "Chapter 1", "Statistics, Variables and Symbols", "পরিসংখ্যান, চলক ও বিভিন্ন প্রতীকের ধারণা", "Basic concepts of statistics, variables, and statistical symbols.", CLASS_NAME, "Science", "Statistics 1st Paper", "NCTB Statistics 1st Paper"),
        createChapter("stat1_12_ch2", "Chapter 2", "Data Collection, Summarization and Presentation", "তথ্য সংগ্রহ, সংক্ষিপ্তকরণ ও উপস্থাপন", "Methods of data collection, summarization, classification, tabulation, and presentation.", CLASS_NAME, "Science", "Statistics 1st Paper", "NCTB Statistics 1st Paper"),
        createChapter("stat1_12_ch3", "Chapter 3", "Measures of Central Tendency", "কেন্দ্রীয় প্রবণতার পরিমাপ", "Concept and calculation of measures of central tendency.", CLASS_NAME, "Science", "Statistics 1st Paper", "NCTB Statistics 1st Paper"),
        createChapter("stat1_12_ch4", "Chapter 4", "Measures of Dispersion", "বিস্তার পরিমাপ", "Concept and calculation of measures of dispersion.", CLASS_NAME, "Science", "Statistics 1st Paper", "NCTB Statistics 1st Paper"),
        createChapter("stat1_12_ch5", "Chapter 5", "Moments, Skewness and Kurtosis", "পরিঘাত, বঙ্কিমতা ও সূঁচালতা", "Concept and calculation of moments, skewness, and kurtosis.", CLASS_NAME, "Science", "Statistics 1st Paper", "NCTB Statistics 1st Paper"),
        createChapter("stat1_12_ch6", "Chapter 6", "Correlation and Regression", "সংশ্লেষ ও নির্ভরণ", "Concept, measurement, and analysis of correlation and regression.", CLASS_NAME, "Science", "Statistics 1st Paper", "NCTB Statistics 1st Paper"),
        createChapter("stat1_12_ch7", "Chapter 7", "Time Series", "কালীন সারি", "Concept, components, and analysis of time series.", CLASS_NAME, "Science", "Statistics 1st Paper", "NCTB Statistics 1st Paper"),
        createChapter("stat1_12_ch8", "Chapter 8", "Published Statistics of Bangladesh", "বাংলাদেশের প্রকাশিত পরিসংখ্যান", "Sources, types, and uses of published statistics of Bangladesh.", CLASS_NAME, "Science", "Statistics 1st Paper", "NCTB Statistics 1st Paper")
      ]
    });

    // Statistics 2nd Paper
    subjectsList.push({
      id: "statistics2",
      name: "Statistics 2nd Paper",
      banglaName: "পরিসংখ্যান ২য় পত্র",
      color: "from-indigo-500 to-violet-600",
      category: "selectable",
      eligibleGroups: ["Science", "Business Studies", "Humanities"],
      chapters: [
        createChapter("stat2_12_ch1", "Chapter 1", "Probability", "সম্ভাবনা", "Basic concepts of probability, sample space, events, probability definitions, probability rules, conditional probability, and independent events.", CLASS_NAME, "Science", "Statistics 2nd Paper", "NCTB Statistics 2nd Paper"),
        createChapter("stat2_12_ch2", "Chapter 2", "Random Variable and Probability Distribution", "দৈব চলক ও সম্ভাবনা বিন্যাস", "Random variables, discrete and continuous variables, probability functions, probability density functions, and probability distributions.", CLASS_NAME, "Science", "Statistics 2nd Paper", "NCTB Statistics 2nd Paper"),
        createChapter("stat2_12_ch3", "Chapter 3", "Mathematical Expectation", "গাণিতিক প্রত্যাশা", "Mathematical expectation, mean, variance, and related properties of random variables.", CLASS_NAME, "Science", "Statistics 2nd Paper", "NCTB Statistics 2nd Paper"),
        createChapter("stat2_12_ch4", "Chapter 4", "Binomial Distribution", "দ্বিপদী বিন্যাস", "Binomial random variable, probability function, mean, variance, properties, and applications of binomial distribution.", CLASS_NAME, "Science", "Statistics 2nd Paper", "NCTB Statistics 2nd Paper"),
        createChapter("stat2_12_ch5", "Chapter 5", "Poisson Distribution", "পৈঁসু বিন্যাস", "Poisson random variable, probability function, mean, variance, properties, and applications of Poisson distribution.", CLASS_NAME, "Science", "Statistics 2nd Paper", "NCTB Statistics 2nd Paper"),
        createChapter("stat2_12_ch6", "Chapter 6", "Normal Distribution", "পরিমিত বিন্যাস", "Normal distribution, probability density function, standard normal distribution, properties, and applications.", CLASS_NAME, "Science", "Statistics 2nd Paper", "NCTB Statistics 2nd Paper"),
        createChapter("stat2_12_ch7", "Chapter 7", "Index Number", "সূচক সংখ্যা", "Concept, types, construction, calculation, properties, and applications of index numbers.", CLASS_NAME, "Science", "Statistics 2nd Paper", "NCTB Statistics 2nd Paper"),
        createChapter("stat2_12_ch8", "Chapter 8", "Sampling", "নমুনায়ন", "Population and sample, sampling methods, sampling techniques, sampling distribution, and principles of sampling.", CLASS_NAME, "Science", "Statistics 2nd Paper", "NCTB Statistics 2nd Paper"),
        createChapter("stat2_12_ch9", "Chapter 9", "Vital Statistics", "জীব পরিসংখ্যান", "Vital statistics, sources of population data, birth rate, death rate, fertility, population growth, and related measures.", CLASS_NAME, "Science", "Statistics 2nd Paper", "NCTB Statistics 2nd Paper")
      ]
    });
  }

  return subjectsList;
};