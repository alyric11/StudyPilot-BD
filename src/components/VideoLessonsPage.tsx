import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BookmarkCheck,
  BookmarkPlus,
  Pause,
  Play,
  Plus,
  Trash2,
  Youtube
} from "lucide-react";
import useDialogFocus from "../hooks/useDialogFocus";

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
  viewCount: string;
  duration: string | null;
}

interface SavedRecommendedVideo extends VideoResult {
  savedAt: string;
  lastWatchedAt: string;
}

export default function VideoLessonsPage({
  chapter,
  classLevel,
  onBack
}: VideoLessonsPageProps) {
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savedVideos, setSavedVideos] = useState<string[]>([]);
  const [savedRecommendedVideos, setSavedRecommendedVideos] = useState<
    SavedRecommendedVideo[]
  >([]);
  const [recommendationsEnabled, setRecommendationsEnabled] = useState(true);
  const [loadedRecommendationsKey, setLoadedRecommendationsKey] = useState<
    string | null
  >(null);
  const [savedRecommendationToRemove, setSavedRecommendationToRemove] =
    useState<string | null>(null);
  const savedRecommendationConfirmationRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const savedVideosStorageKey =
    `sp_saved_videos_${chapter.subjectId}_${chapter.chapterId}`;
  const savedRecommendedStorageKey =
    `sp_saved_recommended_videos_${chapter.subjectId}_${chapter.chapterId}`;
  const recommendationsEnabledStorageKey =
    `sp_recommendations_enabled_${chapter.subjectId}_${chapter.chapterId}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(savedVideosStorageKey);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setSavedVideos(parsed.slice(0, 3));
          return;
        }
      }

      setSavedVideos([]);
    } catch {
      setSavedVideos([]);
    }
  }, [savedVideosStorageKey]);

  const sortSavedRecommendedVideos = (items: SavedRecommendedVideo[]) =>
    [...items]
      .sort(
        (first, second) =>
          new Date(second.lastWatchedAt).getTime() -
          new Date(first.lastWatchedAt).getTime()
      )
      .slice(0, 5);

  const updateSavedRecommendedVideos = (items: SavedRecommendedVideo[]) => {
    const orderedItems = sortSavedRecommendedVideos(items);

    setSavedRecommendedVideos(orderedItems);
    localStorage.setItem(
      savedRecommendedStorageKey,
      JSON.stringify(orderedItems)
    );
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(savedRecommendedStorageKey);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setSavedRecommendedVideos(
            sortSavedRecommendedVideos(
              parsed.filter(
                (video): video is SavedRecommendedVideo =>
                  typeof video?.id?.videoId === "string" &&
                  typeof video?.snippet?.title === "string" &&
                  typeof video?.savedAt === "string" &&
                  typeof video?.lastWatchedAt === "string"
              )
            )
          );
          return;
        }
      }

      setSavedRecommendedVideos([]);
    } catch {
      setSavedRecommendedVideos([]);
    }
  }, [savedRecommendedStorageKey]);

  useEffect(() => {
    try {
      setRecommendationsEnabled(
        localStorage.getItem(recommendationsEnabledStorageKey) !== "false"
      );
    } catch {
      setRecommendationsEnabled(true);
    } finally {
      setLoadedRecommendationsKey(recommendationsEnabledStorageKey);
    }
  }, [recommendationsEnabledStorageKey]);

  useDialogFocus(
    !!savedRecommendationToRemove,
    savedRecommendationConfirmationRef,
    () => setSavedRecommendationToRemove(null)
  );

  const handleSaveRecommendedVideo = (video: VideoResult) => {
    if (savedRecommendedVideos.some((item) => item.id.videoId === video.id.videoId)) {
      return;
    }

    const now = new Date().toISOString();

    updateSavedRecommendedVideos([
      ...savedRecommendedVideos,
      {
        ...video,
        savedAt: now,
        lastWatchedAt: now
      }
    ]);
  };

  const handleRemoveRecommendedVideo = (videoId: string) => {
    updateSavedRecommendedVideos(
      savedRecommendedVideos.filter((video) => video.id.videoId !== videoId)
    );
  };

  const handleRecommendationToggle = () => {
    const nextState = !recommendationsEnabled;

    setRecommendationsEnabled(nextState);
    localStorage.setItem(
      recommendationsEnabledStorageKey,
      String(nextState)
    );

    if (!nextState) {
      setVideos([]);
      setError(null);
      setLoading(false);
    }
  };

  const handleWatchRecommendedVideo = (videoId: string) => {
    const now = new Date().toISOString();

    updateSavedRecommendedVideos(
      savedRecommendedVideos.map((video) =>
        video.id.videoId === videoId
          ? { ...video, lastWatchedAt: now }
          : video
      )
    );
  };

  const getYouTubeVideoId = (url: string) => {
    try {
      const parsedUrl = new URL(url.trim());

      if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.slice(1).split("/")[0] || null;
      }

      if (
        parsedUrl.hostname === "youtube.com" ||
        parsedUrl.hostname === "www.youtube.com" ||
        parsedUrl.hostname === "m.youtube.com"
      ) {
        if (parsedUrl.pathname === "/watch") {
          return parsedUrl.searchParams.get("v");
        }

        if (parsedUrl.pathname.startsWith("/shorts/")) {
          return parsedUrl.pathname.split("/")[2] || null;
        }

        if (parsedUrl.pathname.startsWith("/embed/")) {
          return parsedUrl.pathname.split("/")[2] || null;
        }
      }
    } catch {
      return null;
    }

    return null;
  };

  const handleSaveVideo = () => {
    setSaveError(null);

    if (savedVideos.length >= 3) {
      setSaveError("You can save a maximum of 3 videos for this chapter.");
      return;
    }

    const videoId = getYouTubeVideoId(youtubeUrl);

    if (!videoId) {
      setSaveError("Enter a valid YouTube video link.");
      return;
    }

    if (savedVideos.includes(videoId)) {
      setSaveError("This video is already saved.");
      return;
    }

    const updated = [...savedVideos, videoId];

    setSavedVideos(updated);
    localStorage.setItem(savedVideosStorageKey, JSON.stringify(updated));

    setYoutubeUrl("");
    setSaveError(null);
    setShowAddVideo(false);
  };

  const handleRemoveSavedVideo = (videoId: string) => {
    const updated = savedVideos.filter((id) => id !== videoId);

    setSavedVideos(updated);
    localStorage.setItem(savedVideosStorageKey, JSON.stringify(updated));
  };

  useEffect(() => {
    const fetchVideos = async () => {
      if (loadedRecommendationsKey !== recommendationsEnabledStorageKey) return;

      if (!recommendationsEnabled) {
        setVideos([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          classLevel,
          subject: chapter.subjectName,
          chapterBanglaName: chapter.chapterBanglaName,
          chapterName: chapter.chapterName
        });

        const response = await fetch(
          `/api/video-lessons?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to load video lessons.");
        }

        const data = await response.json();
        setVideos(data);
      } catch (err) {
        console.error("Video lessons error:", err);
        setError("Unable to load video lessons right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [
    classLevel,
    chapter.subjectName,
    chapter.chapterBanglaName,
    chapter.chapterName,
    loadedRecommendationsKey,
    recommendationsEnabled
  ]);

  const formatDuration = (duration: string | null) => {
    if (!duration) return "";

    const match = duration.match(
      /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
    );

    if (!match) return "";

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const savedRecommendedIds = new Set(
    savedRecommendedVideos.map((video) => video.id.videoId)
  );
  const availableRecommendationSlots = Math.max(
    0,
    5 - savedRecommendedVideos.length
  );
  const freshRecommendedVideos = videos
    .filter((video) => !savedRecommendedIds.has(video.id.videoId))
    .slice(0, availableRecommendationSlots);
  const displayedVideos = [
    ...savedRecommendedVideos,
    ...(recommendationsEnabled ? freshRecommendedVideos : [])
  ];

  return (
    <>
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

      {/* Video Lessons Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] gap-5 items-start">
        {/* Left Column - Recommended Videos */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">
                Video Lessons
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Relevant educational videos for this chapter.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRecommendationToggle}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                recommendationsEnabled
                  ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
              title={
                recommendationsEnabled
                  ? "Stop new recommendations for this chapter"
                  : "Start new recommendations for this chapter"
              }
            >
              {recommendationsEnabled ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {recommendationsEnabled
                ? "Stop Recommending"
                : "Start Recommending"}
            </button>
          </div>

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

          {!loading && !error && displayedVideos.length === 0 && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
              <Play className="w-8 h-8 text-slate-400 mx-auto mb-3" />

              <p className="text-sm font-medium text-slate-700">
                {recommendationsEnabled
                  ? "No suitable video lessons found for this chapter yet."
                  : "Recommendations are paused for this chapter."}
              </p>
            </div>
          )}

          {!loading && displayedVideos.length > 0 && (
            <div className="mt-5 space-y-4">
              {displayedVideos.map((video) => {
                const isSavedRecommendation = savedRecommendedIds.has(
                  video.id.videoId
                );

                return (
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

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                          <span>
                            {Number(video.viewCount).toLocaleString()} views
                          </span>

                          {video.duration && (
                            <span>{formatDuration(video.duration)}</span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <a
                            href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              handleWatchRecommendedVideo(video.id.videoId)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                          >
                            <Youtube className="w-3.5 h-3.5 text-red-500" />
                            Watch
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              isSavedRecommendation
                                ? setSavedRecommendationToRemove(video.id.videoId)
                                : handleSaveRecommendedVideo(video)
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                              isSavedRecommendation
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
                            }`}
                            title={
                              isSavedRecommendation
                                ? "Remove from saved recommendations"
                                : "Save this recommendation"
                            }
                            aria-pressed={isSavedRecommendation}
                          >
                            {isSavedRecommendation ? (
                              <BookmarkCheck className="w-3.5 h-3.5" />
                            ) : (
                              <BookmarkPlus className="w-3.5 h-3.5" />
                            )}
                            {isSavedRecommendation ? "Saved" : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column - Saved Videos */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">
                My Saved Videos
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Save up to 3 useful YouTube videos for this chapter.
              </p>
            </div>

            <span className="text-xs font-semibold text-slate-400 shrink-0">
              {savedVideos.length} / 3
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowAddVideo(true);
              setSaveError(null);
            }}
            disabled={savedVideos.length >= 3}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add YouTube Video
          </button>

          {showAddVideo && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                YouTube link
              </label>

              <input
                type="url"
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />

              {saveError && (
                <p className="mt-2 text-xs text-red-600">
                  {saveError}
                </p>
              )}

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVideo(false);
                    setYoutubeUrl("");
                    setSaveError(null);
                  }}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveVideo}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Save Video
                </button>
              </div>
            </div>
          )}

          {savedVideos.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <p className="text-sm text-slate-500">
                No saved videos yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {savedVideos.map((videoId) => (
                <div
                  key={videoId}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt=""
                    className="w-full aspect-video object-cover"
                  />

                  <div className="p-3 flex items-center justify-between gap-2">
                    <a
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Watch on YouTube
                    </a>

                    <button
                      type="button"
                      onClick={() => handleRemoveSavedVideo(videoId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Remove saved video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {savedRecommendationToRemove && (
            <motion.div
              className="fixed inset-0 z-[150] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            >
              <button
                type="button"
                aria-label="Keep this video saved"
                onClick={() => setSavedRecommendationToRemove(null)}
                className="absolute inset-0 cursor-default bg-slate-900/30 backdrop-blur-[1px]"
              />

              <motion.div
                ref={savedRecommendationConfirmationRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="remove-saved-recommendation-title"
                aria-describedby="remove-saved-recommendation-description"
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  shouldReduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.98 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.22,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="relative w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="rounded-lg bg-rose-50 p-1.5 text-rose-600">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <h3
                    id="remove-saved-recommendation-title"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Remove saved video?
                  </h3>
                </div>

                <p
                  id="remove-saved-recommendation-description"
                  className="mx-auto mt-2 max-w-[240px] text-center text-xs leading-relaxed text-slate-500"
                >
                  This video will no longer stay at the top of your recommended lessons.
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSavedRecommendationToRemove(null)}
                    className="min-w-24 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Keep saved
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveRecommendedVideo(savedRecommendationToRemove);
                      setSavedRecommendationToRemove(null);
                    }}
                    className="min-w-24 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
