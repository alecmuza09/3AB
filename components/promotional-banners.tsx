"use client"

import Image from "next/image"
import Link from "next/link"

export function PromotionalBanners() {
  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <Link
          href="/productos"
          className="block group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/50"
        >
          <div className="relative w-full aspect-[16/9] md:aspect-[16/9]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x1080_home-oToT7svMrE6AfsQVeTiTbgZ0cs0LNK.png"
              alt="Tu marca en todas partes - Productos promocionales personalizados con el logo 3A Branding"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
            />
          </div>
        </Link>

        {/* Banner 2 - Obsequios empresariales personalizados */}
        <Link
          href="/productos"
          className="block group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/50"
        >
          <div className="relative w-full aspect-[3/1] md:aspect-[4/1]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banner_articulos_promocionales-8RM2KZLQ6ERPhdMS8A7lI9HuNv5nEK.jpg"
              alt="Obsequios empresariales personalizados al mejor precio - Bolígrafos y libretas"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </Link>
      </div>
    </section>
  )
}
