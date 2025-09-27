"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

type HeroCarouselProps = {
  images: { src: string; alt?: string }[]
  intervalMs?: number
  className?: string
}

export default function HeroCarousel({ images, intervalMs = 4000, className }: HeroCarouselProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [images.length, intervalMs])

  const goTo = (i: number) => setIndex(((i % images.length) + images.length) % images.length)
  const next = () => goTo(index + 1)
  const prev = () => goTo(index - 1)

  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      {/* Slides */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[3/2] max-h-[480px]">
        {images.map((img, i) => (
          <div
            key={img.src + i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={img.src}
              alt={img.alt || ""}
              fill
              className="object-cover rounded-lg shadow-2xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              priority={i === index}
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      {images.length > 1 && (
        <>
          <button
            aria-label="Précédent"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center"
          >
            ‹
          </button>
          <button
            aria-label="Suivant"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Aller à l'image ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}


