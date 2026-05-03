export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          checkout_step: string | null
          converted: boolean | null
          converted_order_id: string | null
          coupon_code: string | null
          created_at: string | null
          customer_cpf: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          d1_sent_at: string | null
          d2_sent_at: string | null
          d3_sent_at: string | null
          id: string
          items: Json | null
          last_step_reached: string | null
          recovered_at: string | null
          recovery_disparo: number | null
          reminder_count: number | null
          reminder_sent_at: string | null
          session_id: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          checkout_step?: string | null
          converted?: boolean | null
          converted_order_id?: string | null
          coupon_code?: string | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          d1_sent_at?: string | null
          d2_sent_at?: string | null
          d3_sent_at?: string | null
          id?: string
          items?: Json | null
          last_step_reached?: string | null
          recovered_at?: string | null
          recovery_disparo?: number | null
          reminder_count?: number | null
          reminder_sent_at?: string | null
          session_id?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          checkout_step?: string | null
          converted?: boolean | null
          converted_order_id?: string | null
          coupon_code?: string | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          d1_sent_at?: string | null
          d2_sent_at?: string | null
          d3_sent_at?: string | null
          id?: string
          items?: Json | null
          last_step_reached?: string | null
          recovered_at?: string | null
          recovery_disparo?: number | null
          reminder_count?: number | null
          reminder_sent_at?: string | null
          session_id?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          ativo: boolean
          created_at: string | null
          email: string | null
          id: string
          modulos: string[] | null
          name: string | null
          papeis: string[] | null
          papel: string
          role: string | null
          status: string | null
          trocar_senha: boolean | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          email?: string | null
          id?: string
          modulos?: string[] | null
          name?: string | null
          papeis?: string[] | null
          papel?: string
          role?: string | null
          status?: string | null
          trocar_senha?: boolean | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          email?: string | null
          id?: string
          modulos?: string[] | null
          name?: string | null
          papeis?: string[] | null
          papel?: string
          role?: string | null
          status?: string | null
          trocar_senha?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          acao: string
          created_at: string | null
          detalhe: string | null
          entidade: string
          executed_by: string | null
          id: string
          user_email: string
          valor_antes: Json | null
          valor_depois: Json | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          detalhe?: string | null
          entidade: string
          executed_by?: string | null
          id?: string
          user_email: string
          valor_antes?: Json | null
          valor_depois?: Json | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          detalhe?: string | null
          entidade?: string
          executed_by?: string | null
          id?: string
          user_email?: string
          valor_antes?: Json | null
          valor_depois?: Json | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          active: boolean
          ativo: boolean
          bg_color: string
          color_bg: string
          color_border: string
          color_text: string
          created_at: string
          id: string
          label: string
          slug: string
          sort_order: number
          text_color: string
        }
        Insert: {
          active?: boolean
          ativo?: boolean
          bg_color?: string
          color_bg?: string
          color_border?: string
          color_text?: string
          created_at?: string
          id?: string
          label: string
          slug: string
          sort_order?: number
          text_color?: string
        }
        Update: {
          active?: boolean
          ativo?: boolean
          bg_color?: string
          color_bg?: string
          color_border?: string
          color_text?: string
          created_at?: string
          id?: string
          label?: string
          slug?: string
          sort_order?: number
          text_color?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean | null
          badge: string | null
          banner_type: string | null
          bg_color: string | null
          btn1_href: string | null
          btn1_label: string | null
          btn2_href: string | null
          btn2_label: string | null
          created_at: string | null
          ends_at: string | null
          id: string
          image_desktop_url: string | null
          image_mobile_url: string | null
          image_url: string | null
          link_href: string | null
          link_url: string | null
          placement: string | null
          position: number | null
          sort_order: number | null
          starts_at: string | null
          subtitle: string | null
          title: string
        }
        Insert: {
          active?: boolean | null
          badge?: string | null
          banner_type?: string | null
          bg_color?: string | null
          btn1_href?: string | null
          btn1_label?: string | null
          btn2_href?: string | null
          btn2_label?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          image_desktop_url?: string | null
          image_mobile_url?: string | null
          image_url?: string | null
          link_href?: string | null
          link_url?: string | null
          placement?: string | null
          position?: number | null
          sort_order?: number | null
          starts_at?: string | null
          subtitle?: string | null
          title: string
        }
        Update: {
          active?: boolean | null
          badge?: string | null
          banner_type?: string | null
          bg_color?: string | null
          btn1_href?: string | null
          btn1_label?: string | null
          btn2_href?: string | null
          btn2_label?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          image_desktop_url?: string | null
          image_mobile_url?: string | null
          image_url?: string | null
          link_href?: string | null
          link_url?: string | null
          placement?: string | null
          position?: number | null
          sort_order?: number | null
          starts_at?: string | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      benefit_bar: {
        Row: {
          ativo: boolean
          created_at: string
          icone: string
          id: string
          sort_order: number
          texto: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          icone?: string
          id?: string
          sort_order?: number
          texto: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          icone?: string
          id?: string
          sort_order?: number
          texto?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
          slug: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          slug: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      cancel_reasons: {
        Row: {
          ativo: boolean
          id: string
          motivo: string
          sort_order: number
        }
        Insert: {
          ativo?: boolean
          id?: string
          motivo: string
          sort_order?: number
        }
        Update: {
          ativo?: boolean
          id?: string
          motivo?: string
          sort_order?: number
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string | null
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_recovery_settings: {
        Row: {
          created_at: string
          d1_body: string
          d1_coupon_code: string | null
          d1_delay_hours: number
          d1_enabled: boolean
          d1_subject: string
          d1_template: string
          d2_body: string
          d2_coupon_code: string | null
          d2_delay_hours: number
          d2_enabled: boolean
          d2_subject: string
          d2_template: string
          d3_body: string
          d3_coupon_code: string | null
          d3_delay_hours: number
          d3_enabled: boolean
          d3_subject: string
          d3_template: string
          id: string
          mode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          d1_body?: string
          d1_coupon_code?: string | null
          d1_delay_hours?: number
          d1_enabled?: boolean
          d1_subject?: string
          d1_template?: string
          d2_body?: string
          d2_coupon_code?: string | null
          d2_delay_hours?: number
          d2_enabled?: boolean
          d2_subject?: string
          d2_template?: string
          d3_body?: string
          d3_coupon_code?: string | null
          d3_delay_hours?: number
          d3_enabled?: boolean
          d3_subject?: string
          d3_template?: string
          id?: string
          mode?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          d1_body?: string
          d1_coupon_code?: string | null
          d1_delay_hours?: number
          d1_enabled?: boolean
          d1_subject?: string
          d1_template?: string
          d2_body?: string
          d2_coupon_code?: string | null
          d2_delay_hours?: number
          d2_enabled?: boolean
          d2_subject?: string
          d2_template?: string
          d3_body?: string
          d3_coupon_code?: string | null
          d3_delay_hours?: number
          d3_enabled?: boolean
          d3_subject?: string
          d3_template?: string
          id?: string
          mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      carts: {
        Row: {
          coupon_code: string | null
          created_at: string | null
          customer_id: string | null
          discount_total: number | null
          id: string
          session_id: string | null
          shipping_total: number | null
          status: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_total?: number | null
          id?: string
          session_id?: string | null
          shipping_total?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          coupon_code?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_total?: number | null
          id?: string
          session_id?: string | null
          shipping_total?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          icon_svg: string | null
          id: string
          image_url: string | null
          name: string
          panel_bg_color: string | null
          panel_image_url: string | null
          panel_tagline: string | null
          panel_title: string | null
          parent_id: string | null
          seo_description: string | null
          seo_title: string | null
          show_in_menu: boolean | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          icon_svg?: string | null
          id?: string
          image_url?: string | null
          name: string
          panel_bg_color?: string | null
          panel_image_url?: string | null
          panel_tagline?: string | null
          panel_title?: string | null
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_in_menu?: boolean | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          icon_svg?: string | null
          id?: string
          image_url?: string | null
          name?: string
          panel_bg_color?: string | null
          panel_image_url?: string | null
          panel_tagline?: string | null
          panel_title?: string | null
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_in_menu?: boolean | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_subcategories: {
        Row: {
          category_slug: string
          id: string
          label: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          category_slug: string
          id?: string
          label: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          category_slug?: string
          id?: string
          label?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          conteudo: string | null
          id: string
          publicado: boolean | null
          slug: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          conteudo?: string | null
          id?: string
          publicado?: boolean | null
          slug: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          conteudo?: string | null
          id?: string
          publicado?: boolean | null
          slug?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      color_library: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          hex: string
          id: string
          nome: string
          sort_order: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          hex: string
          id?: string
          nome: string
          sort_order?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          hex?: string
          id?: string
          nome?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      company_info: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string | null
          descricao: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          slogan: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          slogan?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          slogan?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          cnpj: string | null
          email_contato: string | null
          endereco: string | null
          id: string
          inscricao_estadual: string | null
          nome_fantasia: string | null
          razao_social: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cnpj?: string | null
          email_contato?: string | null
          endereco?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          razao_social?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cnpj?: string | null
          email_contato?: string | null
          endereco?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          razao_social?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      complement_rules: {
        Row: {
          id: string
          label: string
          sort_order: number | null
          source_slug: string
          target_slug: string
        }
        Insert: {
          id?: string
          label: string
          sort_order?: number | null
          source_slug: string
          target_slug: string
        }
        Update: {
          id?: string
          label?: string
          sort_order?: number | null
          source_slug?: string
          target_slug?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          name: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cookie_consents: {
        Row: {
          analiticos: boolean | null
          created_at: string | null
          essenciais: boolean | null
          id: string
          ip: string | null
          marketing: boolean | null
          session_id: string
          versao_politica: string | null
        }
        Insert: {
          analiticos?: boolean | null
          created_at?: string | null
          essenciais?: boolean | null
          id?: string
          ip?: string | null
          marketing?: boolean | null
          session_id: string
          versao_politica?: string | null
        }
        Update: {
          analiticos?: boolean | null
          created_at?: string | null
          essenciais?: boolean | null
          id?: string
          ip?: string | null
          marketing?: boolean | null
          session_id?: string
          versao_politica?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean | null
          channel: string | null
          code: string
          created_at: string | null
          description: string | null
          discount_progressive: Json | null
          discount_type: string
          discount_value: number
          ends_at: string | null
          first_order_only: boolean | null
          free_shipping: boolean | null
          id: string
          max_discount_value: number | null
          min_order_value: number | null
          scope: string | null
          scope_ids: string[] | null
          starts_at: string | null
          usage_limit: number | null
          usage_limit_per_customer: number | null
          used_count: number | null
        }
        Insert: {
          active?: boolean | null
          channel?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_progressive?: Json | null
          discount_type: string
          discount_value: number
          ends_at?: string | null
          first_order_only?: boolean | null
          free_shipping?: boolean | null
          id?: string
          max_discount_value?: number | null
          min_order_value?: number | null
          scope?: string | null
          scope_ids?: string[] | null
          starts_at?: string | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          used_count?: number | null
        }
        Update: {
          active?: boolean | null
          channel?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_progressive?: Json | null
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          first_order_only?: boolean | null
          free_shipping?: boolean | null
          id?: string
          max_discount_value?: number | null
          min_order_value?: number | null
          scope?: string | null
          scope_ids?: string[] | null
          starts_at?: string | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string | null
          customer_id: string | null
          district: string | null
          id: string
          is_default: boolean | null
          label: string | null
          number: string
          recipient_name: string | null
          state: string
          street: string
          zipcode: string
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string | null
          customer_id?: string | null
          district?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          number: string
          recipient_name?: string | null
          state: string
          street: string
          zipcode: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string | null
          customer_id?: string | null
          district?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          number?: string
          recipient_name?: string | null
          state?: string
          street?: string
          zipcode?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_cards: {
        Row: {
          brand: string | null
          created_at: string | null
          customer_id: string | null
          exp_month: number | null
          exp_year: number | null
          holder_name: string | null
          id: string
          is_default: boolean | null
          last_four: string | null
          pagarme_card_id: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          customer_id?: string | null
          exp_month?: number | null
          exp_year?: number | null
          holder_name?: string | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          pagarme_card_id?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          customer_id?: string | null
          exp_month?: number | null
          exp_year?: number | null
          holder_name?: string | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          pagarme_card_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_cards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          accepts_marketing: boolean | null
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          accepts_marketing?: boolean | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          accepts_marketing?: boolean | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      direct_billing: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          max_parcelas: number | null
          nome: string
          ordem: number | null
          padrao: boolean | null
          valor_minimo: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          max_parcelas?: number | null
          nome: string
          ordem?: number | null
          padrao?: boolean | null
          valor_minimo?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          max_parcelas?: number | null
          nome?: string
          ordem?: number | null
          padrao?: boolean | null
          valor_minimo?: number | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string | null
          available: boolean | null
          created_at: string | null
          id: string
          question: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          available?: boolean | null
          created_at?: string | null
          id?: string
          question: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          available?: boolean | null
          created_at?: string | null
          id?: string
          question?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      free_shipping_rules: {
        Row: {
          active: boolean
          cep_from: string
          cep_to: string
          created_at: string | null
          delivery_days: number
          id: string
          min_order_value: number
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          cep_from: string
          cep_to: string
          created_at?: string | null
          delivery_days?: number
          id?: string
          min_order_value?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          cep_from?: string
          cep_to?: string
          created_at?: string | null
          delivery_days?: number
          id?: string
          min_order_value?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      image_gallery: {
        Row: {
          ativo: boolean | null
          badge: string | null
          bg_color: string | null
          btn_href: string | null
          btn_label: string | null
          created_at: string | null
          ends_at: string | null
          id: string
          modo: string | null
          ordem: number | null
          starts_at: string | null
          subtitulo: string | null
          titulo: string
          updated_at: string | null
          url_imagem: string | null
          url_link: string | null
        }
        Insert: {
          ativo?: boolean | null
          badge?: string | null
          bg_color?: string | null
          btn_href?: string | null
          btn_label?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          modo?: string | null
          ordem?: number | null
          starts_at?: string | null
          subtitulo?: string | null
          titulo: string
          updated_at?: string | null
          url_imagem?: string | null
          url_link?: string | null
        }
        Update: {
          ativo?: boolean | null
          badge?: string | null
          bg_color?: string | null
          btn_href?: string | null
          btn_label?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          modo?: string | null
          ordem?: number | null
          starts_at?: string | null
          subtitulo?: string | null
          titulo?: string
          updated_at?: string | null
          url_imagem?: string | null
          url_link?: string | null
        }
        Relationships: []
      }
      market_ai_analyses: {
        Row: {
          ai_model: string | null
          analysis: string
          created_at: string | null
          custo_estimado: number | null
          id: string
          product_name: string | null
          prompt: string | null
          recommendation: string | null
          sku: string
        }
        Insert: {
          ai_model?: string | null
          analysis: string
          created_at?: string | null
          custo_estimado?: number | null
          id?: string
          product_name?: string | null
          prompt?: string | null
          recommendation?: string | null
          sku: string
        }
        Update: {
          ai_model?: string | null
          analysis?: string
          created_at?: string | null
          custo_estimado?: number | null
          id?: string
          product_name?: string | null
          prompt?: string | null
          recommendation?: string | null
          sku?: string
        }
        Relationships: []
      }
      market_alerts: {
        Row: {
          active: boolean
          created_at: string
          email_notificar: string | null
          id: string
          sku: string
          source: string | null
          threshold: number | null
          tipo: string
          ultimo_disparo: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email_notificar?: string | null
          id?: string
          sku: string
          source?: string | null
          threshold?: number | null
          tipo: string
          ultimo_disparo?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email_notificar?: string | null
          id?: string
          sku?: string
          source?: string | null
          threshold?: number | null
          tipo?: string
          ultimo_disparo?: string | null
        }
        Relationships: []
      }
      market_api_credentials: {
        Row: {
          app_id: string | null
          app_secret: string | null
          ativo: boolean | null
          canal: string
          created_at: string | null
          extra_config: Json | null
          id: string
          label: string
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          app_id?: string | null
          app_secret?: string | null
          ativo?: boolean | null
          canal: string
          created_at?: string | null
          extra_config?: Json | null
          id?: string
          label: string
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          app_id?: string | null
          app_secret?: string | null
          ativo?: boolean | null
          canal?: string
          created_at?: string | null
          extra_config?: Json | null
          id?: string
          label?: string
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      market_competitors: {
        Row: {
          active: boolean
          created_at: string
          id: string
          map_price: number | null
          notas: string | null
          product_name: string | null
          search_term: string
          sku: string
          source: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          map_price?: number | null
          notas?: string | null
          product_name?: string | null
          search_term: string
          sku: string
          source: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          map_price?: number | null
          notas?: string | null
          product_name?: string | null
          search_term?: string
          sku?: string
          source?: string
        }
        Relationships: []
      }
      market_price_snapshots: {
        Row: {
          captured_at: string
          condition: string | null
          id: string
          listing_id: string | null
          original_price: number | null
          price: number
          product_id: string | null
          seller: string | null
          sku: string
          source: string
          title: string | null
          url: string | null
        }
        Insert: {
          captured_at?: string
          condition?: string | null
          id?: string
          listing_id?: string | null
          original_price?: number | null
          price: number
          product_id?: string | null
          seller?: string | null
          sku: string
          source: string
          title?: string | null
          url?: string | null
        }
        Update: {
          captured_at?: string
          condition?: string | null
          id?: string
          listing_id?: string | null
          original_price?: number | null
          price?: number
          product_id?: string | null
          seller?: string | null
          sku?: string
          source?: string
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_price_snapshots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          name_snapshot: string | null
          order_id: string | null
          product_id: string | null
          quantity: number
          sku: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name_snapshot?: string | null
          order_id?: string | null
          product_id?: string | null
          quantity: number
          sku?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name_snapshot?: string | null
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          sku?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          note: string
          order_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          note: string
          order_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          note?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          order_id: string
          previous_status: string | null
          reason: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          order_id: string
          previous_status?: string | null
          reason?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          order_id?: string
          previous_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          clearsales_score: number | null
          clearsales_status: string | null
          coupon_code: string | null
          created_at: string | null
          cte_key: string | null
          cte_url: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          discount_total: number | null
          erp_integrated: boolean | null
          fulfillment_status: string | null
          id: string
          notes: string | null
          order_number: string
          pagarme_transaction_id: string | null
          payment_status: string | null
          refund_reason: string | null
          sapiens_order_id: string | null
          shipping_address: Json | null
          shipping_method: string | null
          shipping_total: number | null
          status: string | null
          subtotal: number
          total: number
          tracking_code: string | null
          updated_at: string | null
        }
        Insert: {
          clearsales_score?: number | null
          clearsales_status?: string | null
          coupon_code?: string | null
          created_at?: string | null
          cte_key?: string | null
          cte_url?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          discount_total?: number | null
          erp_integrated?: boolean | null
          fulfillment_status?: string | null
          id?: string
          notes?: string | null
          order_number: string
          pagarme_transaction_id?: string | null
          payment_status?: string | null
          refund_reason?: string | null
          sapiens_order_id?: string | null
          shipping_address?: Json | null
          shipping_method?: string | null
          shipping_total?: number | null
          status?: string | null
          subtotal: number
          total: number
          tracking_code?: string | null
          updated_at?: string | null
        }
        Update: {
          clearsales_score?: number | null
          clearsales_status?: string | null
          coupon_code?: string | null
          created_at?: string | null
          cte_key?: string | null
          cte_url?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          discount_total?: number | null
          erp_integrated?: boolean | null
          fulfillment_status?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          pagarme_transaction_id?: string | null
          payment_status?: string | null
          refund_reason?: string | null
          sapiens_order_id?: string | null
          shipping_address?: Json | null
          shipping_method?: string | null
          shipping_total?: number | null
          status?: string | null
          subtotal?: number
          total?: number
          tracking_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_boleto_settings: {
        Row: {
          aplicar_desconto_em: string | null
          desconto_percentual: number | null
          dias_vencimento: number | null
          id: string
          updated_at: string | null
          valor_minimo: number | null
        }
        Insert: {
          aplicar_desconto_em?: string | null
          desconto_percentual?: number | null
          dias_vencimento?: number | null
          id?: string
          updated_at?: string | null
          valor_minimo?: number | null
        }
        Update: {
          aplicar_desconto_em?: string | null
          desconto_percentual?: number | null
          dias_vencimento?: number | null
          id?: string
          updated_at?: string | null
          valor_minimo?: number | null
        }
        Relationships: []
      }
      payment_card_settings: {
        Row: {
          id: string
          juros_por_parcela: number | null
          max_parcelas: number | null
          parcelas_sem_juros: number | null
          updated_at: string | null
          valor_minimo_parcela: number | null
        }
        Insert: {
          id?: string
          juros_por_parcela?: number | null
          max_parcelas?: number | null
          parcelas_sem_juros?: number | null
          updated_at?: string | null
          valor_minimo_parcela?: number | null
        }
        Update: {
          id?: string
          juros_por_parcela?: number | null
          max_parcelas?: number | null
          parcelas_sem_juros?: number | null
          updated_at?: string | null
          valor_minimo_parcela?: number | null
        }
        Relationships: []
      }
      payment_pix_settings: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          desconto_percentual: number | null
          id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          desconto_percentual?: number | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          desconto_percentual?: number | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          gateway: string | null
          gateway_id: string | null
          id: string
          installments: number | null
          method: string | null
          order_id: string | null
          paid_at: string | null
          pix_code: string | null
          pix_url: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          gateway?: string | null
          gateway_id?: string | null
          id?: string
          installments?: number | null
          method?: string | null
          order_id?: string | null
          paid_at?: string | null
          pix_code?: string | null
          pix_url?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          gateway?: string | null
          gateway_id?: string | null
          id?: string
          installments?: number | null
          method?: string | null
          order_id?: string | null
          paid_at?: string | null
          pix_code?: string | null
          pix_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_stores: {
        Row: {
          cep: string | null
          cidade: string | null
          created_at: string | null
          endereco: string
          estado: string | null
          habilitado: boolean | null
          id: string
          nome: string
          prazo_dias: number | null
          telefone: string | null
          valor: number | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          endereco: string
          estado?: string | null
          habilitado?: boolean | null
          id?: string
          nome: string
          prazo_dias?: number | null
          telefone?: string | null
          valor?: number | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          endereco?: string
          estado?: string | null
          habilitado?: boolean | null
          id?: string
          nome?: string
          prazo_dias?: number | null
          telefone?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      popup_promos: {
        Row: {
          active: boolean | null
          bg_color: string | null
          button_link: string | null
          button_text: string | null
          created_at: string | null
          end_date: string | null
          id: string
          image_url: string | null
          start_date: string | null
          subtitle: string | null
          title: string
        }
        Insert: {
          active?: boolean | null
          bg_color?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          start_date?: string | null
          subtitle?: string | null
          title: string
        }
        Update: {
          active?: boolean | null
          bg_color?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          start_date?: string | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      product_features: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          product_id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          product_id: string
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          product_id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_features_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          is_main: boolean | null
          product_id: string | null
          sort_order: number | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          is_main?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          is_main?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          author_name: string
          comment: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          descricao: string | null
          id: string
          nota: number | null
          product_id: string
          rating: number
          status: string | null
          titulo: string | null
          verified: boolean | null
        }
        Insert: {
          author_name: string
          comment?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          descricao?: string | null
          id?: string
          nota?: number | null
          product_id: string
          rating: number
          status?: string | null
          titulo?: string | null
          verified?: boolean | null
        }
        Update: {
          author_name?: string
          comment?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          descricao?: string | null
          id?: string
          nota?: number | null
          product_id?: string
          rating?: number
          status?: string | null
          titulo?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specs: {
        Row: {
          chave: string
          created_at: string | null
          id: string
          product_id: string
          sort_order: number | null
          valor: string
        }
        Insert: {
          chave: string
          created_at?: string | null
          id?: string
          product_id: string
          sort_order?: number | null
          valor: string
        }
        Update: {
          chave?: string
          created_at?: string | null
          id?: string
          product_id?: string
          sort_order?: number | null
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean | null
          badges: string[] | null
          created_at: string | null
          ean: string | null
          id: string
          images: string[] | null
          is_lancamento: boolean
          main_image: string | null
          name: string
          price: number | null
          product_id: string | null
          promo_price: number | null
          sku: string | null
          sort_order: number | null
          stock_qty: number | null
          technical_description: string | null
          type: string
          updated_at: string | null
          value: string
        }
        Insert: {
          active?: boolean | null
          badges?: string[] | null
          created_at?: string | null
          ean?: string | null
          id?: string
          images?: string[] | null
          is_lancamento?: boolean
          main_image?: string | null
          name: string
          price?: number | null
          product_id?: string | null
          promo_price?: number | null
          sku?: string | null
          sort_order?: number | null
          stock_qty?: number | null
          technical_description?: string | null
          type: string
          updated_at?: string | null
          value: string
        }
        Update: {
          active?: boolean | null
          badges?: string[] | null
          created_at?: string | null
          ean?: string | null
          id?: string
          images?: string[] | null
          is_lancamento?: boolean
          main_image?: string | null
          name?: string
          price?: number | null
          product_id?: string | null
          promo_price?: number | null
          sku?: string | null
          sort_order?: number | null
          stock_qty?: number | null
          technical_description?: string | null
          type?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variations: {
        Row: {
          active: boolean | null
          created_at: string | null
          ean: string | null
          id: string
          price: number | null
          product_id: string
          promo_price: number | null
          sku: string
          sort_order: number | null
          stock_qty: number | null
          updated_at: string | null
          variation_type: string | null
          variation_value: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          ean?: string | null
          id?: string
          price?: number | null
          product_id: string
          promo_price?: number | null
          sku: string
          sort_order?: number | null
          stock_qty?: number | null
          updated_at?: string | null
          variation_type?: string | null
          variation_value?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          ean?: string | null
          id?: string
          price?: number | null
          product_id?: string
          promo_price?: number | null
          sku?: string
          sort_order?: number | null
          stock_qty?: number | null
          updated_at?: string | null
          variation_type?: string | null
          variation_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          badge: string | null
          badges: string[] | null
          brand: string | null
          brand_id: string | null
          categories: string[] | null
          category_id: string | null
          category_slug: string | null
          color_temp_k: number | null
          cor_id: string | null
          cores_relacionadas: string[] | null
          cost: number | null
          created_at: string | null
          datasheet_url: string | null
          depth_cm: number | null
          depth_cm_packed: number | null
          description: string | null
          ean: string | null
          familia_cor: string | null
          family: string | null
          height_cm: number | null
          height_cm_packed: number | null
          id: string
          images: string[] | null
          ip_rating: string | null
          is_lancamento: boolean
          length_cm: number | null
          long_description: string | null
          main_image: string | null
          name: string
          power_w: number | null
          price: number
          promo_price: number | null
          sales_count: number
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sku: string
          slug: string
          sort_order: number
          stock_qty: number | null
          subcategory_slug: string | null
          tags: string[] | null
          technical_description: string | null
          unit: string | null
          updated_at: string | null
          video_url: string | null
          voltage: string | null
          warranty: string | null
          warranty_months: number | null
          weight_kg: number | null
          weight_kg_packed: number | null
          width_cm: number | null
          width_cm_packed: number | null
        }
        Insert: {
          active?: boolean | null
          badge?: string | null
          badges?: string[] | null
          brand?: string | null
          brand_id?: string | null
          categories?: string[] | null
          category_id?: string | null
          category_slug?: string | null
          color_temp_k?: number | null
          cor_id?: string | null
          cores_relacionadas?: string[] | null
          cost?: number | null
          created_at?: string | null
          datasheet_url?: string | null
          depth_cm?: number | null
          depth_cm_packed?: number | null
          description?: string | null
          ean?: string | null
          familia_cor?: string | null
          family?: string | null
          height_cm?: number | null
          height_cm_packed?: number | null
          id?: string
          images?: string[] | null
          ip_rating?: string | null
          is_lancamento?: boolean
          length_cm?: number | null
          long_description?: string | null
          main_image?: string | null
          name: string
          power_w?: number | null
          price?: number
          promo_price?: number | null
          sales_count?: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku: string
          slug: string
          sort_order?: number
          stock_qty?: number | null
          subcategory_slug?: string | null
          tags?: string[] | null
          technical_description?: string | null
          unit?: string | null
          updated_at?: string | null
          video_url?: string | null
          voltage?: string | null
          warranty?: string | null
          warranty_months?: number | null
          weight_kg?: number | null
          weight_kg_packed?: number | null
          width_cm?: number | null
          width_cm_packed?: number | null
        }
        Update: {
          active?: boolean | null
          badge?: string | null
          badges?: string[] | null
          brand?: string | null
          brand_id?: string | null
          categories?: string[] | null
          category_id?: string | null
          category_slug?: string | null
          color_temp_k?: number | null
          cor_id?: string | null
          cores_relacionadas?: string[] | null
          cost?: number | null
          created_at?: string | null
          datasheet_url?: string | null
          depth_cm?: number | null
          depth_cm_packed?: number | null
          description?: string | null
          ean?: string | null
          familia_cor?: string | null
          family?: string | null
          height_cm?: number | null
          height_cm_packed?: number | null
          id?: string
          images?: string[] | null
          ip_rating?: string | null
          is_lancamento?: boolean
          length_cm?: number | null
          long_description?: string | null
          main_image?: string | null
          name?: string
          power_w?: number | null
          price?: number
          promo_price?: number | null
          sales_count?: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string
          slug?: string
          sort_order?: number
          stock_qty?: number | null
          subcategory_slug?: string | null
          tags?: string[] | null
          technical_description?: string | null
          unit?: string | null
          updated_at?: string | null
          video_url?: string | null
          voltage?: string | null
          warranty?: string | null
          warranty_months?: number | null
          weight_kg?: number | null
          weight_kg_packed?: number | null
          width_cm?: number | null
          width_cm_packed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_cor_id_fkey"
            columns: ["cor_id"]
            isOneToOne: false
            referencedRelation: "color_library"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_banners: {
        Row: {
          ativo: boolean | null
          cor_fundo: string | null
          created_at: string | null
          cupons: Json | null
          emoji: string | null
          id: string
          imagem_url: string | null
          subtitulo: string | null
          tipo: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor_fundo?: string | null
          created_at?: string | null
          cupons?: Json | null
          emoji?: string | null
          id?: string
          imagem_url?: string | null
          subtitulo?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor_fundo?: string | null
          created_at?: string | null
          cupons?: Json | null
          emoji?: string | null
          id?: string
          imagem_url?: string | null
          subtitulo?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean | null
          comment: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          order_id: string | null
          product_id: string | null
          rating: number
          title: string | null
        }
        Insert: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          rating: number
          title?: string | null
        }
        Update: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          rating?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          descricao: string | null
          id: string
          rota: string
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          descricao?: string | null
          id?: string
          rota: string
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          descricao?: string | null
          id?: string
          rota?: string
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shipping_extra_days: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_final: string
          data_inicial: string
          dias_adicionais: number
          id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_final: string
          data_inicial: string
          dias_adicionais?: number
          id?: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_final?: string
          data_inicial?: string
          dias_adicionais?: number
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          network: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          network: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          network?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      top_bar: {
        Row: {
          active: boolean | null
          cor_fundo: string | null
          cor_texto: string | null
          created_at: string | null
          id: string
          imagem_url: string | null
          link: string | null
          subtexto: string | null
          texto: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          cor_fundo?: string | null
          cor_texto?: string | null
          created_at?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          subtexto?: string | null
          texto?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          cor_fundo?: string | null
          cor_texto?: string | null
          created_at?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          subtexto?: string | null
          texto?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_master: { Args: { user_id_param: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
