interface ReadingProgressProps {
  progress: number;
}

export function ReadingProgress({ progress }: ReadingProgressProps) {
  return (
    <div className="reading-progress" aria-label={`阅读进度 ${Math.round(progress)}%`}>
      <span style={{ width: `${progress}%` }} />
    </div>
  );
}
