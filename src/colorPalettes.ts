export const getSubjectCardStyles = (color: string) => {
    if (color.includes("blue")) {
        return {
            card: "bg-blue-50/45 border-blue-100/70 hover:border-blue-200",
            progress: "bg-blue-500",
            chapter:
                "bg-blue-50/40 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border-blue-100/60",
            mastery: "text-blue-600",
            icon: "bg-blue-100 text-blue-600",
        };
    }

    if (color.includes("purple")) {
        return {
            card: "bg-purple-50/45 border-purple-100/70 hover:border-purple-200",
            progress: "bg-purple-500",
            chapter:
                "bg-purple-50/40 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border-purple-100/60",
            mastery: "text-purple-600",
            icon: "bg-purple-100 text-purple-600",
        };
    }

    if (color.includes("cyan")) {
        return {
            card: "bg-cyan-50/45 border-cyan-100/70 hover:border-cyan-200",
            progress: "bg-cyan-500",
            chapter:
                "bg-cyan-50/40 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 border-cyan-100/60",
            mastery: "text-cyan-600",
            icon: "bg-cyan-100 text-cyan-600",
        };
    }

    if (color.includes("amber")) {
        return {
            card: "bg-amber-50/45 border-amber-100/70 hover:border-amber-200",
            progress: "bg-amber-500",
            chapter:
                "bg-amber-50/40 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-amber-100/60",
            mastery: "text-amber-600",
            icon: "bg-amber-100 text-amber-600",
        };
    }

    if (color.includes("teal")) {
        return {
            card: "bg-teal-50/45 border-teal-100/70 hover:border-teal-200",
            progress: "bg-teal-500",
            chapter:
                "bg-teal-50/40 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border-teal-100/60",
            mastery: "text-teal-600",
            icon: "bg-teal-100 text-teal-600",
        };
    }


    if (color.includes("rose")) {
        return {
            card: "bg-rose-50/45 border-rose-100/70 hover:border-rose-200",
            progress: "bg-rose-500",
            chapter:
                "bg-rose-50/40 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-rose-100/60",
            mastery: "text-rose-600",
            icon: "bg-rose-100 text-rose-600",
        };
    }


    if (color.includes("indigo")) {
        return {
            card: "bg-indigo-50/45 border-indigo-100/70 hover:border-indigo-200",
            progress: "bg-indigo-500",
            chapter:
                "bg-indigo-50/40 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border-indigo-100/60",
            mastery: "text-indigo-600",
            icon: "bg-indigo-100 text-indigo-600",
        };
    }

    if (color.includes("pink")) {
        return {
            card: "bg-pink-50/45 border-pink-100/70 hover:border-pink-200",
            progress: "bg-pink-500",
            chapter:
                "bg-pink-50/40 hover:bg-pink-50 text-slate-600 hover:text-pink-700 border-pink-100/60",
            mastery: "text-pink-600",
            icon: "bg-pink-100 text-pink-600",
        };
    }

    if (color.includes("orange")) {
        return {
            card: "bg-orange-50/45 border-orange-100/70 hover:border-orange-200",
            progress: "bg-orange-500",
            chapter:
                "bg-orange-50/40 hover:bg-orange-50 text-slate-600 hover:text-orange-700 border-orange-100/60",
            mastery: "text-orange-600",
            icon: "bg-orange-100 text-orange-600",
        };
    }


    if (color.includes("green")) {
        return {
            card: "bg-green-50/45 border-green-100/70 hover:border-green-200",
            progress: "bg-green-500",
            chapter:
                "bg-green-50/40 hover:bg-green-50 text-slate-600 hover:text-green-700 border-green-100/60",
            mastery: "text-green-600",
            icon: "bg-green-100 text-green-600",
        };
    }

    if (color.includes("sky")) {
        return {
            card: "bg-sky-50/45 border-sky-100/70 hover:border-sky-200",
            progress: "bg-sky-500",
            chapter:
                "bg-sky-50/40 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border-sky-100/60",
            mastery: "text-sky-600",
            icon: "bg-sky-100 text-sky-600",
        };
    }

    if (color.includes("violet")) {
        return {
            card: "bg-violet-50/45 border-violet-100/70 hover:border-violet-200",
            progress: "bg-violet-500",
            chapter:
                "bg-violet-50/40 hover:bg-violet-50 text-slate-600 hover:text-violet-700 border-violet-100/60",
            mastery: "text-violet-600",
            icon: "bg-violet-100 text-violet-600",
        };
    }

    if (color.includes("yellow")) {
        return {
            card: "bg-yellow-50/45 border-yellow-100/70 hover:border-yellow-200",
            progress: "bg-yellow-500",
            chapter:
                "bg-yellow-50/40 hover:bg-yellow-50 text-slate-600 hover:text-yellow-700 border-yellow-100/60",
            mastery: "text-yellow-600",
            icon: "bg-yellow-100 text-yellow-600",
        };
    }

    if (color.includes("red")) {
        return {
            card: "bg-red-50/45 border-red-100/70 hover:border-red-200",
            progress: "bg-red-500",
            chapter:
                "bg-red-50/40 hover:bg-red-50 text-slate-600 hover:text-red-700 border-red-100/60",
            mastery: "text-red-600",
            icon: "bg-red-100 text-red-600",
        };
    }

    if (color.includes("slate")) {
        return {
            card: "bg-slate-50/45 border-slate-200/70 hover:border-slate-300",
            progress: "bg-slate-500",
            chapter:
                "bg-slate-50/40 hover:bg-slate-50 text-slate-600 hover:text-slate-800 border-slate-200/60",
            mastery: "text-slate-600",
            icon: "bg-slate-100 text-slate-600",
        };
    }

    if (color.includes("stone")) {
        return {
            card: "bg-stone-50/45 border-stone-200/70 hover:border-stone-300",
            progress: "bg-stone-500",
            chapter:
                "bg-stone-50/40 hover:bg-stone-50 text-slate-600 hover:text-stone-800 border-stone-200/60",
            mastery: "text-stone-600",
            icon: "bg-stone-100 text-stone-600",
        };
    }


    if (color.includes("gray")) {
        return {
            card: "bg-gray-50/45 border-gray-200/70 hover:border-gray-300",
            progress: "bg-gray-500",
            chapter:
                "bg-gray-50/40 hover:bg-gray-50 text-slate-600 hover:text-gray-800 border-gray-200/60",
            mastery: "text-gray-600",
            icon: "bg-gray-100 text-gray-600",
        };
    }


    if (color.includes("mint")) {
        return {
            card: "bg-emerald-50/60 border-emerald-200/70 hover:border-emerald-300",
            progress: "bg-emerald-400",
            chapter:
                "bg-emerald-50/50 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 border-emerald-200/60",
            mastery: "text-emerald-600",
            icon: "bg-emerald-100 text-emerald-600",
        };
    }

    if (color.includes("lavender")) {
        return {
            card: "bg-purple-50/60 border-purple-200/70 hover:border-purple-300",
            progress: "bg-purple-400",
            chapter:
                "bg-purple-50/50 hover:bg-purple-100 text-slate-600 hover:text-purple-800 border-purple-200/60",
            mastery: "text-purple-600",
            icon: "bg-purple-100 text-purple-600",
        };
    }

    if (color.includes("periwinkle")) {
        return {
            card: "bg-indigo-50/60 border-indigo-200/70 hover:border-indigo-300",
            progress: "bg-indigo-400",
            chapter:
                "bg-indigo-50/50 hover:bg-indigo-100 text-slate-600 hover:text-indigo-800 border-indigo-200/60",
            mastery: "text-indigo-600",
            icon: "bg-indigo-100 text-indigo-600",
        };
    }

    return {
        card: "bg-slate-50/60 border-slate-200/70 hover:border-slate-300",
        progress: "bg-slate-500",
        chapter:
            "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-700 border-slate-150",
        mastery: "text-slate-600",
        icon: "bg-slate-100 text-slate-600",
    };
};

// Use this for a routine block that belongs to a curriculum subject.
// It guarantees the routine card uses the same card palette as the landing page.
export const getSubjectRoutineStyles = (color: string) => {
    const subjectStyles = getSubjectCardStyles(color);

    return {
        card: subjectStyles.card,
        time: subjectStyles.mastery,
    };
};

// Accent values for popovers and small interactive details that need to match a subject card.
export const getSubjectAccentColor = (color: string) => {
    if (color.includes("blue")) return "#2563eb";
    if (color.includes("purple")) return "#7c3aed";
    if (color.includes("cyan")) return "#0891b2";
    if (color.includes("amber")) return "#d97706";
    if (color.includes("teal")) return "#0f766e";
    if (color.includes("rose")) return "#e11d48";
    if (color.includes("indigo")) return "#4f46e5";
    if (color.includes("pink")) return "#db2777";
    if (color.includes("orange")) return "#ea580c";
    if (color.includes("green")) return "#16a34a";
    if (color.includes("sky")) return "#0284c7";
    if (color.includes("violet")) return "#7c3aed";
    if (color.includes("yellow")) return "#ca8a04";
    if (color.includes("red")) return "#dc2626";
    if (color.includes("mint")) return "#059669";
    if (color.includes("lavender")) return "#7c3aed";
    if (color.includes("periwinkle")) return "#4f46e5";

    return "#64748b";
};
