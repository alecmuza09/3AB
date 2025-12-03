"use client"

import Image from "next/image"
import Link from "next/link"

export function PromotionalBanners() {
  return (
    <section className="py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link
          href="/productos"
          className="block group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative w-full aspect-[16/9] md:aspect-[16/9]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x1080_home-oToT7svMrE6AfsQVeTiTbgZ0cs0LNK.png"
              alt="Tu marca en todas partes - Productos promocionales personalizados con el logo 3A Branding"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
        </Link>

        {/* Banner 2 - Obsequios empresariales personalizados */}
        <Link
          href="/productos"
          className="block group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative w-full aspect-[3/1] md:aspect-[4/1]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banner_articulos_promocionales-8RM2KZLQ6ERPhdMS8A7lI9HuNv5nEK.jpg"
              alt="Obsequios empresariales personalizados al mejor precio - Bolígrafos y libretas"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      </div>
    </section>
  )
}
