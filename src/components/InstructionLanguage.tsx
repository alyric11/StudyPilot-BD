import { createContext, useContext } from 'react';

export const InstructionLanguage = createContext<'en' | 'bn'>('en');
export function useInstruction() {
  const language = useContext(InstructionLanguage);
  return (english: string, bangla?: string) => language === 'bn' ? bangla || instructions[english] || english : english;
}
export function Guidance({ children }: { children: string }) {
  const language = useContext(InstructionLanguage);
  const t = useInstruction();
  return <span lang={language}>{t(children)}</span>;
}
export const instructions: Record<string, string> = {
  'Changes saved on this device. Check “Saved online” before using another device.': 'পরিবর্তন এই ডিভাইসে রাখা হয়েছে। অন্য ডিভাইসে যাওয়ার আগে “Saved online” দেখো।',
  'Choose a subject first.': 'আগে একটি বিষয় বেছে নাও।',
  'Choose at least 30 minutes.': 'অন্তত ৩০ মিনিট সময় বেছে নাও।',
  "Your password does not meet the project's password requirements. Try a longer password with uppercase and lowercase letters, a number, and a symbol.": 'আরও শক্তিশালী পাসওয়ার্ড দাও। বড় ও ছোট ইংরেজি অক্ষর, সংখ্যা এবং বিশেষ চিহ্ন ব্যবহার করো।',
  'No routine planned for today.': 'আজকের জন্য কোনো রুটিন রাখা হয়নি।',
  'Subjects common to all students.': 'সব শিক্ষার্থীর জন্য আবশ্যিক বিষয়গুলো।',
  'Mandatory and selected subjects for your group.': 'তোমার বিভাগের আবশ্যিক ও নির্বাচিত বিষয়গুলো।',
  'No chapter data is available for this subject yet.': 'এই বিষয়ের অধ্যায়ের তথ্য এখনও যোগ করা হয়নি।',
  'Choose the subjects you want to study.': 'যে বিষয়গুলো পড়তে চাও সেগুলো বেছে নাও।',
  'Select a chapter to continue studying.': 'পড়া চালিয়ে যেতে একটি অধ্যায় বেছে নাও।',
  'Expand a section and select an item to continue studying.': 'একটি বিভাগ খুলে পড়ার বিষয় বেছে নাও।',
  'Keep up to 3 useful videos for this chapter.': 'এই অধ্যায়ের জন্য সর্বোচ্চ ৩টি দরকারি ভিডিও রাখতে পারো।',
  'Find more lessons. Videos already saved in either panel are excluded.': 'আরও ভিডিও খুঁজে নাও। আগে সংরক্ষিত ভিডিও আবার দেখানো হবে না।',
  'No additional matching videos found.': 'মিলে যায় এমন আর কোনো ভিডিও পাওয়া যায়নি।',
  'No personal videos saved yet.': 'এখনও ব্যক্তিগত ভিডিও সংরক্ষণ করা হয়নি।',
  'This video will be removed from your personal saved list.': 'এই ভিডিওটি তোমার ব্যক্তিগত সংরক্ষিত তালিকা থেকে সরানো হবে।',
  'This lesson will be removed from the shared list for students.': 'এই ভিডিওটি শিক্ষার্থীদের জন্য রাখা তালিকা থেকে সরানো হবে।',
  'Your saved videos could not be read. Download your backup before changing them.': 'সংরক্ষিত ভিডিও পড়া যায়নি। পরিবর্তনের আগে Backup ডাউনলোড করো।',
  'Video titles could not be loaded. Your saved links remain available.': 'ভিডিওর নাম লোড হয়নি। সংরক্ষিত লিংকগুলো আছে।',
  'Could not save. Your previous videos have been kept.': 'সংরক্ষণ হয়নি। আগের ভিডিওগুলো রাখা আছে।',
  'You can save up to three personal videos.': 'সর্বোচ্চ তিনটি ব্যক্তিগত ভিডিও রাখতে পারো।',
  'This video is already in a saved panel.': 'এই ভিডিওটি আগে থেকেই সংরক্ষিত আছে।',
  'Could not remove this video. Please retry.': 'ভিডিওটি সরানো যায়নি। আবার চেষ্টা করো।',
  'Its chapter and homework for this date will be removed.': 'এই তারিখের অধ্যায় ও Homework সরানো হবে।',
  'This study time will no longer repeat. Saved homework records stay in your study log.': 'এই পড়ার সময় আর প্রতি সপ্তাহে আসবে না। সংরক্ষিত Homework পড়ার রেকর্ডে থাকবে।',
  'This overlaps an existing routine. Choose another time.': 'এই সময়ে আরেকটি রুটিন আছে। অন্য সময় বেছে নাও।',
  'Homework cleared for this date.': 'এই তারিখের Homework সরানো হয়েছে।',
  'Weekly time deleted. Saved homework kept.': 'সাপ্তাহিক সময় মুছে ফেলা হয়েছে। সংরক্ষিত Homework রাখা আছে।',
  'Could not save this homework. Please try again.': 'এই Homework সংরক্ষণ হয়নি। আবার চেষ্টা করো।',
  'Are you sure you want to delete this assignment from your study board? This task progress will be permanently lost.': 'এই কাজটি Homework Board থেকে মুছে ফেলবে? কাজটির অগ্রগতি আর থাকবে না।',
  'Are you sure you want to delete this entry from your Study Diary & Formula Notebook? This action cannot be undone.': 'এই লেখাটি Notebook থেকে মুছে ফেলবে? পরে ফিরিয়ে আনা যাবে না।',
  'Your saved cloud records will be available when you sign in on another device. Wait for “Saved online” before logging out. Pending changes remain in this browser until you sign in here again.': 'অন্য ডিভাইসে লগইন করলে সংরক্ষিত রেকর্ড পাবে। Log out করার আগে “Saved online” দেখো। বাকি পরিবর্তন এই ব্রাউজারে থাকবে, এখানে আবার লগইন করলে সংরক্ষণ হবে।',
  'A little space for your own learning.': 'নিজের পছন্দের বিষয় শেখার ছোট্ট জায়গা।',
  'Learning something outside your textbooks? Add it here.': 'পাঠ্যবইয়ের বাইরে কিছু শিখছ? এখানে বিষয়টি যোগ করো।',
  'Helpful places to continue learning.': 'আরও শেখার জন্য কিছু সহায়ক ওয়েবসাইট।',
  'Select a subject to explore its chapters, study guides and tutor chat.': 'অধ্যায়, পড়ার নির্দেশনা ও Tutor Chat দেখতে একটি বিষয় বেছে নাও।',
  'Weekly times repeat. Homework belongs to one date.': 'সাপ্তাহিক রুটিনের সময় প্রতি সপ্তাহে ফিরে আসে। Homework নির্দিষ্ট একটি তারিখের জন্য থাকে।',
  'Keep searchable notebooks of formulas, vocabulary, and active reflections.': 'সূত্র, শব্দার্থ ও নিজের ভাবনা লিখে রাখো; পরে খুঁজে পাবে।',
  'Organize your syllabus homework deadlines and class assignments.': 'ক্লাসের Homework ও জমা দেওয়ার তারিখ এক জায়গায় রাখো।',
  'This chapter overview is not ready yet. You can use the Study Plan and video lessons while it is being prepared.': 'এই অধ্যায়ের Overview এখনও তৈরি হয়নি। এর মধ্যে Study Plan ও Video Lessons ব্যবহার করতে পারো।',
  'Generating your chapter overview...': 'অধ্যায়ের Overview তৈরি হচ্ছে…',
  'Could not complete this action. Please try again.': 'কাজটি সম্পন্ন হয়নি। আবার চেষ্টা করো।',
  'Email or password is incorrect.': 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।',
  'Too many attempts. Please wait a few minutes and try again.': 'অনেকবার চেষ্টা হয়েছে। কয়েক মিনিট পরে আবার চেষ্টা করো।',
  'Could not connect. Check your internet and try again.': 'সংযোগ হয়নি। ইন্টারনেট পরীক্ষা করে আবার চেষ্টা করো।',
  'Choose a stronger password with at least 8 characters.': 'অন্তত ৮ অক্ষরের একটি শক্তিশালী পাসওয়ার্ড দাও।',
  'Enter a name of 1–80 characters.': '১ থেকে ৮০ অক্ষরের মধ্যে নাম লেখো।',
  'Keep your username within 40 characters.': 'Username সর্বোচ্চ ৪০ অক্ষরের মধ্যে রাখো।',
  'Enter a valid birthdate that is not in the future.': 'সঠিক জন্মতারিখ দাও; ভবিষ্যতের তারিখ দেওয়া যাবে না।',
};
