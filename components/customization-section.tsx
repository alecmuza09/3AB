"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Type, ImageIcon, Layers, Download, Share2, RotateCcw } from "lucide-react"

const customizationOptions = {
  colors: ["#be123c", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
  fonts: ["Arial", "Helvetica", "Times New Roman", "Georgia"],
  positions: ["Centro", "Izquierda", "Derecha", "Arriba", "Abajo"],
}

export function CustomizationSection() {
  const [selectedColor, setSelectedColor] = useState("#be123c")
  const [selectedFont, setSelectedFont] = useState("Arial")
  const [selectedPosition, setSelectedPosition] = useState("Centro")
  const [logoText, setLogoText] = useState("TU MARCA")

  return (
    <section id="personalizar" className="py-20 lg:py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-1.5">Personalización Avanzada</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">
            <span className="text-primary">Personaliza</span> tu producto en tiempo real
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Utiliza nuestro configurador interactivo para visualizar cómo quedará tu logo o diseño en el producto
            seleccionado.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Product Preview */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-background border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="relative bg-white rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                  <div className="relative">
                    <img
                      src="/placeholder.svg?height=300&width=300"
                      alt="Producto para personalizar"
                      className="w-72 h-72 object-contain"
                    />

                    {/* Logo Preview Overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        color: selectedColor,
                        fontFamily: selectedFont,
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      {logoText}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Rotar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Compartir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Variants */}
            <div className="grid grid-cols-4 gap-3">
              {[
                "/placeholder.svg?height=80&width=80",
                "/placeholder.svg?height=80&width=80",
                "/placeholder.svg?height=80&width=80",
                "/placeholder.svg?height=80&width=80",
              ].map((src, index) => (
                <button
                  key={index}
                  className="p-2 border-2 border-transparent hover:border-primary rounded-lg transition-colors"
                >
                  <img
                    src={src || "/placeholder.svg"}
                    alt={`Variante ${index + 1}`}
                    className="w-full h-16 object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Customization Panel */}
          <div className="space-y-6">
            <Card className="border-0 bg-card/50">
              <CardContent className="p-6">
                <Tabs defaultValue="logo" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="logo" className="text-xs">
                      <Type className="h-4 w-4 mr-1" />
                      Logo
                    </TabsTrigger>
                    <TabsTrigger value="colors" className="text-xs">
                      <Palette className="h-4 w-4 mr-1" />
                      Colores
                    </TabsTrigger>
                    <TabsTrigger value="image" className="text-xs">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Imagen
                    </TabsTrigger>
                    <TabsTrigger value="effects" className="text-xs">
                      <Layers className="h-4 w-4 mr-1" />
                      Efectos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="logo" className="space-y-4 mt-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Texto del Logo</label>
                      <input
                        type="text"
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value)}
                        className="w-full p-3 border border-border rounded-lg bg-background"
                        placeholder="Ingresa tu texto"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Fuente</label>
                      <div className="grid grid-cols-2 gap-2">
                        {customizationOptions.fonts.map((font) => (
                          <button
                            key={font}
                            onClick={() => setSelectedFont(font)}
                            className={`p-2 text-sm border rounded-lg transition-colors ${
                              selectedFont === font
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                            style={{ fontFamily: font }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Posición</label>
                      <div className="grid grid-cols-3 gap-2">
                        {customizationOptions.positions.map((position) => (
                          <button
                            key={position}
                            onClick={() => setSelectedPosition(position)}
                            className={`p-2 text-xs border rounded-lg transition-colors ${
                              selectedPosition === position
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {position}
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="colors" className="space-y-4 mt-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Color del Logo</label>
                      <div className="grid grid-cols-6 gap-3">
                        {customizationOptions.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-10 h-10 rounded-lg border-2 transition-all ${
                              selectedColor === color ? "border-primary scale-110" : "border-border hover:scale-105"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Color Personalizado</label>
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full h-12 border border-border rounded-lg cursor-pointer"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4 mt-6">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Arrastra tu logo aquí o haz clic para seleccionar
                      </p>
                      <Button variant="outline">Subir Imagen</Button>
                    </div>

                    <div className="text-xs text-muted-foreground">Formatos soportados: PNG, JPG, SVG (máx. 5MB)</div>
                  </TabsContent>

                  <TabsContent value="effects" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Sombra</label>
                        <input type="checkbox" className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Relieve</label>
                        <input type="checkbox" className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Contorno</label>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Pricing and Actions */}
            <Card className="border-0 bg-primary/5">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Precio por unidad</p>
                      <p className="text-2xl font-bold text-primary">$12.50</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Cantidad mínima</p>
                      <p className="text-lg font-semibold">25 unidades</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full bg-primary hover:bg-primary/90">Agregar al Carrito</Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Solicitar Cotización
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Descuentos por volumen disponibles. Entrega en 7-10 días hábiles.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
