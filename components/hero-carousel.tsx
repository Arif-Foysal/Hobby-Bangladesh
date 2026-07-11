"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { IconArrowRight } from "@tabler/icons-react";

interface HeroSlide {
  image_url: string;
  title: string | null;
  link: string | null;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  return (
    <Carousel className="w-full" opts={{ loop: true }} plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}>
      <CarouselContent>
        {slides.map((slide, i) => (
          <CarouselItem key={i}>
            <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden md:h-[60vh]">
              <Image
                src={slide.image_url}
                alt={slide.title ?? `Slide ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-end">
                <div className="mx-auto w-full max-w-7xl px-4 pb-12 lg:px-6">
                  {slide.title && (
                    <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                      {slide.title}
                    </h1>
                  )}
                  <div className="mt-4 flex gap-3">
                    {slide.link ? (
                      <Button asChild size="lg">
                        <Link href={slide.link}>
                          Shop Now <IconArrowRight />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg">
                        <Link href="/products">
                          Browse Products <IconArrowRight />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
