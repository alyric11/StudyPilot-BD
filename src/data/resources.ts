export interface StudyResource {
    name: string;
    description: string;
    url: string;
    logoUrl?: string;
}

export const STUDY_RESOURCES: StudyResource[] = [
    {
        name: "NCTB",
        description: "Official NCTB textbooks and curriculum resources.",
        url: "https://nctb.gov.bd/"
    },
    {
        name: "10 Minute School",
        description: "Bangladesh-focused lessons, practice, and exam preparation.",
        url: "https://10minuteschool.com/",
        logoUrl: "https://10minuteschool.com/favicon.ico"
    },
    {
        name: "Khan Academy",
        description: "Free lessons and practice for concepts in mathematics, science, and more.",
        url: "https://www.khanacademy.org/",
        logoUrl: "https://www.khanacademy.org/favicon.ico"
    },
    {
        name: "Shikho",
        description: "Bangladesh-focused academic learning with classes and study materials.",
        url: "https://shikho.com/",
        logoUrl: "https://shikho.com/favicon.ico"
    }
];