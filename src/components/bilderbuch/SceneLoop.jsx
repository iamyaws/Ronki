import React, { useEffect, useRef, useState } from 'react';
import useReducedMotion from './useReducedMotion';

/** After this long without a tap anywhere, the loop rests on its last frame. */
const IDLE_CUTOFF_MS = 60000;

/**
 * SceneLoop: a full-bleed scene with a poster that is always there and a
 * muted loop that fades in on top only once it really plays.
 *
 * Rules (plan section 7, risks):
 *   - The poster <img> is the base layer, always rendered.
 *   - The <video> is muted, playsInline, loop, autoplay, no controls,
 *     preload metadata. It sits at opacity 0 and fades in after the
 *     'playing' event, so a blocked autoplay never shows a black frame.
 *   - Under prefers-reduced-motion the video is never mounted.
 *   - If play() rejects (iOS Low Power Mode) the poster stays.
 *   - Paused while the document is hidden, while the scene is off
 *     screen, after 60 s without a tap anywhere, and while `paused` is
 *     set (an overlay covers it); any tap or scroll back resumes it.
 *     (Astra review rounds 1 and 2, R8: weight on cheap tablets.)
 *   - object-fit cover, objectPosition from the prop, children layered on top.
 *
 * The component fills its parent (position absolute, inset 0) unless
 * `fill={false}`, in which case it is a relative block and the parent
 * sets the size.
 *
 * Props:
 *   poster          image URL (required)
 *   video           mp4 URL; omit for a still scene
 *   objectPosition  CSS value for both layers (default '50% 50%')
 *   alt             alt text for the poster (default '' = decorative)
 *   fill            absolute full-bleed (default true)
 *   priority        eager poster load for the first screen
 *   paused          stop decoding, e.g. while an overlay covers the scene
 */
export default function SceneLoop({
  poster,
  video,
  objectPosition = '50% 50%',
  alt = '',
  fill = true,
  priority = false,
  paused = false,
  className = '',
  style,
  children,
}) {
  const reduced = useReducedMotion();
  const videoRef = useRef(null);
  const rootRef = useRef(null);
  const [onScreen, setOnScreen] = useState(true);
  const [awake, setAwake] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  const wantVideo = Boolean(video) && !reduced && !videoFailed;
  const resting = paused || !onScreen || !awake;

  // Off screen and idle detection, only while there is a video to rest.
  useEffect(() => {
    if (!wantVideo) return undefined;
    const el = rootRef.current;
    let io;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)));
      io.observe(el);
    }
    let timer = setTimeout(() => setAwake(false), IDLE_CUTOFF_MS);
    const poke = () => {
      setAwake(true);
      clearTimeout(timer);
      timer = setTimeout(() => setAwake(false), IDLE_CUTOFF_MS);
    };
    window.addEventListener('pointerdown', poke, { passive: true });
    return () => {
      io?.disconnect();
      window.removeEventListener('pointerdown', poke);
      clearTimeout(timer);
    };
  }, [wantVideo]);

  useEffect(() => {
    if (!wantVideo) return undefined;
    const v = videoRef.current;
    if (!v) return undefined;
    // React 18 does not reliably reflect `muted` into the DOM attribute;
    // autoplay policy checks the property, so set it by hand.
    v.muted = true;
    v.defaultMuted = true;
    let cancelled = false;

    const tryPlay = () => {
      const p = v.play?.();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Low Power Mode or a blocked autoplay: keep the poster.
          if (!cancelled) setPlaying(false);
        });
      }
    };

    const onVisibility = () => {
      if (document.hidden || resting) v.pause();
      else tryPlay();
    };

    // Resting (covered, off screen or idle): stop decoding; the last
    // frame stays on screen underneath.
    if (resting || document.hidden) v.pause();
    else tryPlay();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      v.pause();
    };
  }, [wantVideo, video, resting]);

  const layer = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition };

  return (
    <div
      ref={rootRef}
      className={`overflow-hidden bg-paper ${className}`}
      style={{ ...(fill ? { position: 'absolute', inset: 0 } : { position: 'relative', width: '100%', height: '100%' }), ...style }}
    >
      {!posterFailed && (
        <img
          src={poster}
          alt={alt}
          draggable={false}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setPosterFailed(true)}
          style={layer}
        />
      )}
      {wantVideo && (
        <video
          ref={videoRef}
          src={video}
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setVideoFailed(true)}
          style={{
            ...layer,
            opacity: playing ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
            pointerEvents: 'none',
          }}
        />
      )}
      {children != null && (
        <div className="absolute inset-0 flex flex-col pointer-events-none [&>*]:pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  );
}
