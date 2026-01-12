'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';

interface CarouselItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

interface GradientCarouselProps {
  items: CarouselItem[];
}

export default function GradientCarousel({ items }: GradientCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 md:flex-[0_0_80%] lg:flex-[0_0_60%] px-4"
            >
              <motion.div
                className={`relative rounded-2xl p-8 h-[300px] flex flex-col items-center justify-center text-center bg-gradient-to-br ${item.gradient} overflow-hidden`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                {/* Icon */}
                <motion.div
                  className="relative w-14 h-14 mb-4 flex items-center justify-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {item.icon}
                </motion.div>

                {/* Title */}
                <h3 className="relative text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-headline)' }}>
                  {item.title}
                </h3>

                {/* Description */}
                <p className="relative text-base text-white/90 max-w-md font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                  {item.description}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-8">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'bg-purple-600 w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow buttons - Desktop only */}
      <div className="hidden md:block">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next slide"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
