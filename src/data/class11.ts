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
    banglaName: "বাংলা ১ম পত্র",
    color: "from-emerald-500 to-emerald-600",
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
    chapters: [
      createChapter("ict_11_ch1", "Chapter 1", "Information and Communication Technology: World and Bangladesh Perspective", "তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch2", "Chapter 2", "Communication Systems and Networking", "কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch3", "Chapter 3", "Number Systems and Digital Devices", "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch4", "Chapter 4", "Introduction to Web Design and HTML", "ওয়েব ডিজাইন পরিচিতি এবং HTML", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch5", "Chapter 5", "Programming Language", "প্রোগ্রামিং ভাষা", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book"),
      createChapter("ict_11_ch6", "Chapter 6", "Database Management System", "ডেটাবেজ ম্যানেজমেন্ট সিস্টেম", "", CLASS_NAME, group, "ICT", "NCTB Class 11 ICT Board Book")
    ]
  });

  // Group-Specific Subjects
  if (isScience) {
    // Physics 1st Paper
    subjectsList.push({
      id: "physics1",
      name: "Physics 1st Paper",
      banglaName: "পদার্থবিজ্ঞান ১ম পত্র",
      color: "from-cyan-500 to-blue-600",
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
      chapters: [
        createChapter("c2_11_ch1", "Chapter 1", "Environmental Chemistry", "পরিবেশ রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch2", "Chapter 2", "Organic Chemistry", "জৈব রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch3", "Chapter 3", "Quantitative Chemistry", "পরিমাণগত রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch4", "Chapter 4", "Electrochemistry", "তড়িৎ রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)"),
        createChapter("c2_11_ch5", "Chapter 5", "Economic Chemistry", "অর্থনৈতিক রসায়ন", "", CLASS_NAME, "Science", "Chemistry 2nd Paper", "NCTB Chemistry Second Paper (HSC)")
      ]
    });

    // Higher Math 1st Paper
    subjectsList.push({
      id: "math1",
      name: "Higher Math 1st Paper",
      banglaName: "উচ্চতর গণিত ১ম পত্র",
      color: "from-amber-500 to-orange-600",
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

    // Biology 1st Paper (Botany)
    subjectsList.push({
      id: "biology1",
      name: "Biology 1st Paper",
      banglaName: "জীববিজ্ঞান ১ম পত্র",
      color: "from-green-500 to-emerald-600",
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

  }

  if (isBusiness) {
    // Accounting 1st Paper
    subjectsList.push({
      id: "accounting1",
      name: "Accounting 1st Paper",
      banglaName: "হিসাববিজ্ঞান ১ম পত্র",
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
      banglaName: "হিসাববিজ্ঞান ২য় পত্র",
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
      banglaName: "ইতিহাস ১ম পত্র",
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
