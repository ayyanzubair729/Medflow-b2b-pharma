import { useState } from "react";
import { getApiBaseUrl } from "../../api/client.js";

const API_BASE = getApiBaseUrl();

const SIZES = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
  xl: "h-20 w-20 text-lg",
};

function resolveSrc(src) {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads")) return `${API_BASE}${src}`;
  return src;
}

export default function Avatar({ src, name, size = "md", className = "" }) {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "?").slice(0, 2).toUpperCase();
  const imgSrc = resolveSrc(src);

  if (imgSrc && !imgError) {
    return (
      <img
        src={imgSrc}
        alt={name || "Avatar"}
        onError={() => setImgError(true)}
        className={`shrink-0 rounded-full object-cover ${SIZES[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`shrink-0 flex items-center justify-center rounded-full bg-slate-800 font-semibold text-slate-200 ${SIZES[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
