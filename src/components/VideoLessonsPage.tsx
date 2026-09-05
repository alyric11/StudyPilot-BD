import { useEffect, useState } from "react";
import { ArrowLeft, Play } from "lucide-react";

interface VideoLessonsPageProps {
  chapter: {
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
    chapterBanglaName: string;
  };
  classLevel: string;
  onBack: () => void;
}

interface VideoResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails?: {
      medium?: {
        url: string;
      };
    };
  };
}

export default function VideoLessonsPage({
  chapter,
  classLevel,
  onBack
}: VideoLessonsPageProps) {
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          classLevel,
          subject: chapter.subjectName,
          chapterBanglaName: chapter.chapterBanglaName,
          chapterName: chapter.chapterName
        });

        const response = await fetch(`/api/video-lessons?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to load video lessons.");
        }

        const data = await response.json();
        setVideos(data.slice(0, 3));
      } catch (err) {
        console.error("Video lessons error:", err);
        setError("Unable to load video lessons right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [chapter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 md:p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="hidden sm:block w-px h-16 bg-slate-200 shrink-0" />

          <div className="min-w-0">
            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              Video Lessons
            </p>

            <h1 className="text-xl md:text-3xl font-display font-bold text-slate-800 break-words leading-tight mt-1">
              {chapter.chapterBanglaName}
              <span className="text-slate-400 font-normal">
                {" | "}
                {chapter.chapterName}
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Video Lessons */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 md:p-6">
        <h2 className="text-lg font-bold text-slate-800 font-display">
          Video Lessons
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Relevant educational videos for this chapter.
        </p>

        {loading && (
          <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">
              Finding relevant video lessons...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <Play className="w-8 h-8 text-slate-400 mx-auto mb-3" />

            <p className="text-sm font-medium text-slate-700">
              No suitable video lessons found for this chapter yet.
            </p>
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="mt-5 space-y-4">
            {videos.map((video) => (
              <div
                key={video.id.videoId}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white"
              >
                <div className="flex flex-col sm:flex-row">
                  {video.snippet.thumbnails?.medium?.url && (
                    <img
                      src={video.snippet.thumbnails.medium.url}
                      alt=""
                      className="w-full sm:w-48 h-28 object-cover"
                    />
                  )}

                  <div className="p-4 flex-1">
                    <h3 className="text-sm font-bold text-slate-800">
                      {video.snippet.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      {video.snippet.channelTitle}
                    </p>

                    <a
                      href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}