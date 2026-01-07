/**
 * Tipos TypeScript para la base de datos de Supabase
 * 
 * Estos tipos están basados en el esquema definido en supabase/schema.sql
 * Actualiza este archivo si modificas el esquema de la base de datos
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          company_name: string | null
          tax_id: string | null
          avatar_url: string | null
          role: 'customer' | 'admin' | 'staff'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          company_name?: string | null
          tax_id?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'admin' | 'staff'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          company_name?: string | null
          tax_id?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'admin' | 'staff'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          sku: string | null
          name: string
          slug: string
          description: string | null
          short_description: string | null
          category_id: string | null
          price: number
          min_price: number | null
          max_price: number | null
          cost: number | null
          stock_quantity: number
          min_quantity: number
          multiple_of: number
          weight: number | null
          dimensions: Json | null
          attributes: Json | null
          is_active: boolean
          is_featured: boolean
          is_bestseller: boolean
          rating: number
          review_count: number
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku?: string | null
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          price?: number
          min_price?: number | null
          max_price?: number | null
          cost?: number | null
          stock_quantity?: number
          min_quantity?: number
          multiple_of?: number
          weight?: number | null
          dimensions?: Json | null
          attributes?: Json | null
          is_active?: boolean
          is_featured?: boolean
          is_bestseller?: boolean
          rating?: number
          review_count?: number
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string | null
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          price?: number
          min_price?: number | null
          max_price?: number | null
          cost?: number | null
          stock_quantity?: number
          min_quantity?: number
          multiple_of?: number
          weight?: number | null
          dimensions?: Json | null
          attributes?: Json | null
          is_active?: boolean
          is_featured?: boolean
          is_bestseller?: boolean
          rating?: number
          review_count?: number
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_variations: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string | null
          price: number | null
          stock_quantity: number
          attributes: Json | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          sku?: string | null
          price?: number | null
          stock_quantity?: number
          attributes?: Json | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          sku?: string | null
          price?: number | null
          stock_quantity?: number
          attributes?: Json | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          variation_id: string | null
          image_url: string
          alt_text: string | null
          order_index: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          variation_id?: string | null
          image_url: string
          alt_text?: string | null
          order_index?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          variation_id?: string | null
          image_url?: string
          alt_text?: string | null
          order_index?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          type: 'shipping' | 'billing' | 'both'
          contact_name: string
          company_name: string | null
          phone: string
          email: string | null
          address_line1: string
          address_line2: string | null
          neighborhood: string | null
          city: string
          state: string
          postal_code: string
          country: string
          notes: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'shipping' | 'billing' | 'both'
          contact_name: string
          company_name?: string | null
          phone: string
          email?: string | null
          address_line1: string
          address_line2?: string | null
          neighborhood?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          notes?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'shipping' | 'billing' | 'both'
          contact_name?: string
          company_name?: string | null
          phone?: string
          email?: string | null
          address_line1?: string
          address_line2?: string | null
          neighborhood?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          notes?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variation_id: string | null
          quantity: number
          price: number
          customization_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          variation_id?: string | null
          quantity?: number
          price: number
          customization_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          variation_id?: string | null
          quantity?: number
          price?: number
          customization_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          status: 'pending' | 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          type: 'order' | 'quotation'
          subtotal: number
          taxes: number
          shipping_cost: number
          discount: number
          total: number
          currency: string
          payment_status: 'pending' | 'paid' | 'partial' | 'refunded' | 'failed' | null
          payment_method: string | null
          payment_reference: string | null
          contact_info: Json
          shipping_address: Json
          billing_address: Json | null
          notes: string | null
          estimated_delivery_date: string | null
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          user_id?: string | null
          status?: 'pending' | 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          type?: 'order' | 'quotation'
          subtotal?: number
          taxes?: number
          shipping_cost?: number
          discount?: number
          total?: number
          currency?: string
          payment_status?: 'pending' | 'paid' | 'partial' | 'refunded' | 'failed' | null
          payment_method?: string | null
          payment_reference?: string | null
          contact_info: Json
          shipping_address: Json
          billing_address?: Json | null
          notes?: string | null
          estimated_delivery_date?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          status?: 'pending' | 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          type?: 'order' | 'quotation'
          subtotal?: number
          taxes?: number
          shipping_cost?: number
          discount?: number
          total?: number
          currency?: string
          payment_status?: 'pending' | 'paid' | 'partial' | 'refunded' | 'failed' | null
          payment_method?: string | null
          payment_reference?: string | null
          contact_info?: Json
          shipping_address?: Json
          billing_address?: Json | null
          notes?: string | null
          estimated_delivery_date?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variation_id: string | null
          product_name: string
          product_sku: string | null
          variation_label: string | null
          quantity: number
          unit_price: number
          subtotal: number
          customization_data: Json | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variation_id?: string | null
          product_name: string
          product_sku?: string | null
          variation_label?: string | null
          quantity: number
          unit_price: number
          subtotal: number
          customization_data?: Json | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variation_id?: string | null
          product_name?: string
          product_sku?: string | null
          variation_label?: string | null
          quantity?: number
          unit_price?: number
          subtotal?: number
          customization_data?: Json | null
          image_url?: string | null
          created_at?: string
        }
      }
      quotations: {
        Row: {
          id: string
          quotation_number: string
          user_id: string | null
          status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'
          valid_until: string | null
          subtotal: number
          taxes: number
          shipping_cost: number
          discount: number
          total: number
          currency: string
          contact_info: Json
          shipping_address: Json | null
          notes: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          quotation_number?: string
          user_id?: string | null
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'
          valid_until?: string | null
          subtotal?: number
          taxes?: number
          shipping_cost?: number
          discount?: number
          total?: number
          currency?: string
          contact_info: Json
          shipping_address?: Json | null
          notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          quotation_number?: string
          user_id?: string | null
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'
          valid_until?: string | null
          subtotal?: number
          taxes?: number
          shipping_cost?: number
          discount?: number
          total?: number
          currency?: string
          contact_info?: Json
          shipping_address?: Json | null
          notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
      quotation_items: {
        Row: {
          id: string
          quotation_id: string
          product_id: string
          variation_id: string | null
          product_name: string
          product_sku: string | null
          variation_label: string | null
          quantity: number
          unit_price: number
          subtotal: number
          customization_data: Json | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          quotation_id: string
          product_id: string
          variation_id?: string | null
          product_name: string
          product_sku?: string | null
          variation_label?: string | null
          quantity: number
          unit_price: number
          subtotal: number
          customization_data?: Json | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          quotation_id?: string
          product_id?: string
          variation_id?: string | null
          product_name?: string
          product_sku?: string | null
          variation_label?: string | null
          quantity?: number
          unit_price?: number
          subtotal?: number
          customization_data?: Json | null
          image_url?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string | null
          user_id: string | null
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          is_verified_purchase: boolean
          is_approved: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          user_id?: string | null
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          user_id?: string | null
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      customizations: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          variation_id: string | null
          name: string | null
          customization_data: Json
          preview_image_url: string | null
          is_template: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id: string
          variation_id?: string | null
          name?: string | null
          customization_data: Json
          preview_image_url?: string | null
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string
          variation_id?: string | null
          name?: string | null
          customization_data?: Json
          preview_image_url?: string | null
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

