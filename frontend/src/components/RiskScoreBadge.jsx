export default function RiskScoreBadge({ score, label }) {
  const getColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getEmoji = (score) => {
    if (score >= 80) return "✅";
    if (score >= 60) return "⚠️";
    return "❌";
  };

  return (
    <div className={`border rounded-lg p-2 text-center ${getColor(score)}`}>
      <div className="text-xs font-medium mb-1">{label}</div>
      <div className="text-xl font-bold">{getEmoji(score)} {score}</div>
    </div>
  );
}