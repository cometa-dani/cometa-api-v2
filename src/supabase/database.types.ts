export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      _ChatGroupMember: {
        Row: {
          A: number
          B: number
        }
        Insert: {
          A: number
          B: number
        }
        Update: {
          A?: number
          B?: number
        }
        Relationships: [
          {
            foreignKeyName: '_ChatGroupMember_A_fkey'
            columns: ['A']
            isOneToOne: false
            referencedRelation: 'ChatGroup'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: '_ChatGroupMember_B_fkey'
            columns: ['B']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      ChatGroup: {
        Row: {
          admin_id: number
          avatar_url: string | null
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          admin_id: number
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at: string
        }
        Update: {
          admin_id?: number
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ChatGroup_admin_id_fkey'
            columns: ['admin_id']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      Event: {
        Row: {
          categories: Database['public']['Enums']['EventCategory'][] | null
          created_at: string
          date: string
          description: string
          id: number
          location_id: number
          name: string
          organization_id: number | null
          updated_at: string
        }
        Insert: {
          categories?: Database['public']['Enums']['EventCategory'][] | null
          created_at?: string
          date: string
          description: string
          id?: number
          location_id: number
          name: string
          organization_id?: number | null
          updated_at: string
        }
        Update: {
          categories?: Database['public']['Enums']['EventCategory'][] | null
          created_at?: string
          date?: string
          description?: string
          id?: number
          location_id?: number
          name?: string
          organization_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'Event_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'Location'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'Event_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'Organization'
            referencedColumns: ['id']
          },
        ]
      }
      EventLike: {
        Row: {
          created_at: string
          event_id: number
          id: number
          updated_at: string
          user_id: number
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: number
          updated_at: string
          user_id: number
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: number
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'EventLike_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'Event'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'EventLike_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      EventPhoto: {
        Row: {
          created_at: string
          event_id: number
          id: number
          order: number
          placeholder: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: number
          order: number
          placeholder?: string | null
          updated_at: string
          url?: string | null
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: number
          order?: number
          placeholder?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'EventPhoto_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'Event'
            referencedColumns: ['id']
          },
        ]
      }
      EventShare: {
        Row: {
          created_at: string
          event_id: number
          id: number
          updated_at: string
          user_id: number
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: number
          updated_at: string
          user_id: number
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: number
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'EventShare_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'Event'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'EventShare_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      Friendship: {
        Row: {
          created_at: string
          id: number
          receiver_id: number
          sender_id: number
          status: Database['public']['Enums']['FriendshipStatus']
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          receiver_id: number
          sender_id: number
          status?: Database['public']['Enums']['FriendshipStatus']
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: number
          receiver_id?: number
          sender_id?: number
          status?: Database['public']['Enums']['FriendshipStatus']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'Friendship_receiver_id_fkey'
            columns: ['receiver_id']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'Friendship_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      Location: {
        Row: {
          created_at: string
          description: string | null
          id: number
          latitude: number
          longitude: number
          name: string
          organizationId: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          latitude: number
          longitude: number
          name: string
          organizationId?: number | null
          updated_at: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          latitude?: number
          longitude?: number
          name?: string
          organizationId?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'Location_organizationId_fkey'
            columns: ['organizationId']
            isOneToOne: false
            referencedRelation: 'Organization'
            referencedColumns: ['id']
          },
        ]
      }
      Notification: {
        Row: {
          created_at: string
          id: number
          message: string
          read: boolean
          receiver_id: number
          sender_id: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          read?: boolean
          receiver_id: number
          sender_id: number
          type: string
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          read?: boolean
          receiver_id?: number
          sender_id?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'Notification_receiver_id_fkey'
            columns: ['receiver_id']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'Notification_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      Organization: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          email: string
          facebook_page: string | null
          id: number
          instagram_page: string | null
          name: string
          phone: string | null
          uid: string | null
          updated_at: string
          web_page: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          email: string
          facebook_page?: string | null
          id?: number
          instagram_page?: string | null
          name: string
          phone?: string | null
          uid?: string | null
          updated_at: string
          web_page?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          email?: string
          facebook_page?: string | null
          id?: number
          instagram_page?: string | null
          name?: string
          phone?: string | null
          uid?: string | null
          updated_at?: string
          web_page?: string | null
        }
        Relationships: []
      }
      User: {
        Row: {
          activate_notifications: boolean
          biography: string | null
          birthday: string | null
          children: boolean | null
          company: string | null
          created_at: string | null
          current_location: string | null
          drinking: boolean | null
          education_level: Database['public']['Enums']['Education'] | null
          email: string
          ethnicity: Database['public']['Enums']['Ethnicity'] | null
          exercise_frequency:
          | Database['public']['Enums']['ExerciseFrequency']
          | null
          favorite_sports: string[] | null
          gender: Database['public']['Enums']['Gender'] | null
          height: number | null
          home_town: string | null
          id: number
          interests: Database['public']['Enums']['EventCategory'][] | null
          languages: string[] | null
          looking_for: Database['public']['Enums']['LookingFor'] | null
          music: string[] | null
          name: string | null
          occupation: string | null
          pets: string[] | null
          phone: string | null
          relationship_status:
          | Database['public']['Enums']['RelationshipStatus']
          | null
          smoking: boolean | null
          uid: string | null
          updated_at: string | null
          username: string
          verified: boolean | null
          weight: number | null
        }
        Insert: {
          activate_notifications?: boolean
          biography?: string | null
          birthday?: string | null
          children?: boolean | null
          company?: string | null
          created_at?: string | null
          current_location?: string | null
          drinking?: boolean | null
          education_level?: Database['public']['Enums']['Education'] | null
          email: string
          ethnicity?: Database['public']['Enums']['Ethnicity'] | null
          exercise_frequency?:
          | Database['public']['Enums']['ExerciseFrequency']
          | null
          favorite_sports?: string[] | null
          gender?: Database['public']['Enums']['Gender'] | null
          height?: number | null
          home_town?: string | null
          id?: number
          interests?: Database['public']['Enums']['EventCategory'][] | null
          languages?: string[] | null
          looking_for?: Database['public']['Enums']['LookingFor'] | null
          music?: string[] | null
          name?: string | null
          occupation?: string | null
          pets?: string[] | null
          phone?: string | null
          relationship_status?:
          | Database['public']['Enums']['RelationshipStatus']
          | null
          smoking?: boolean | null
          uid?: string | null
          updated_at?: string | null
          username: string
          verified?: boolean | null
          weight?: number | null
        }
        Update: {
          activate_notifications?: boolean
          biography?: string | null
          birthday?: string | null
          children?: boolean | null
          company?: string | null
          created_at?: string | null
          current_location?: string | null
          drinking?: boolean | null
          education_level?: Database['public']['Enums']['Education'] | null
          email?: string
          ethnicity?: Database['public']['Enums']['Ethnicity'] | null
          exercise_frequency?:
          | Database['public']['Enums']['ExerciseFrequency']
          | null
          favorite_sports?: string[] | null
          gender?: Database['public']['Enums']['Gender'] | null
          height?: number | null
          home_town?: string | null
          id?: number
          interests?: Database['public']['Enums']['EventCategory'][] | null
          languages?: string[] | null
          looking_for?: Database['public']['Enums']['LookingFor'] | null
          music?: string[] | null
          name?: string | null
          occupation?: string | null
          pets?: string[] | null
          phone?: string | null
          relationship_status?:
          | Database['public']['Enums']['RelationshipStatus']
          | null
          smoking?: boolean | null
          uid?: string | null
          updated_at?: string | null
          username?: string
          verified?: boolean | null
          weight?: number | null
        }
        Relationships: []
      }
      UserPhoto: {
        Row: {
          created_at: string
          id: number
          order: number
          placeholder: string | null
          updated_at: string
          url: string | null
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          order: number
          placeholder?: string | null
          updated_at: string
          url?: string | null
          user_id: number
        }
        Update: {
          created_at?: string
          id?: number
          order?: number
          placeholder?: string | null
          updated_at?: string
          url?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'UserPhoto_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      WorldCities: {
        Row: {
          city: string
          country: string | null
          id: number
        }
        Insert: {
          city: string
          country?: string | null
          id?: number
        }
        Update: {
          city?: string
          country?: string | null
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Education:
      | 'SECONDARY'
      | 'UNIVERSITY'
      | 'HIGH_SCHOOL'
      | 'SOME_COLLEGE'
      | 'BACHELORS'
      | 'MASTERS'
      | 'DOCTORATE'
      | 'OTHER'
      Ethnicity:
      | 'WHITE'
      | 'HISPANIC'
      | 'LATINO'
      | 'BLACK'
      | 'ASIAN'
      | 'MIDDLE_EASTERN'
      | 'NATIVE_AMERICAN'
      | 'PACIFIC_ISLANDER'
      | 'MIXED'
      | 'OTHER'
      EventCategory:
      | 'RESTAURANT'
      | 'BAR'
      | 'CLUB'
      | 'CAFE'
      | 'CONCERT'
      | 'FESTIVAL'
      | 'THEATRE'
      | 'MUSEUM'
      | 'EXHIBITION'
      | 'PARK'
      | 'BRUNCH'
      | 'SHOWS'
      | 'SPORTS'
      | 'GALLERY'
      | 'PARTY'
      | 'CINEMA'
      | 'CONFERENCE'
      | 'FOOD_AND_DRINK'
      | 'SEMINAR'
      | 'WORKSHOP'
      | 'EDUCATIONAL'
      | 'CULTURAL'
      ExerciseFrequency: 'NEVER' | 'RARELY' | 'SOMETIMES' | 'OFTEN' | 'DAILY'
      FriendshipStatus: 'PENDING' | 'ACCEPTED' | 'BLOCKED'
      Gender:
      | 'MALE'
      | 'FEMALE'
      | 'BINARY'
      | 'GAY'
      | 'BISEXUAL'
      | 'LESBIAN'
      | 'OTHER'
      LookingFor:
      | 'MEET_NEW_PEOPLE'
      | 'DISCOVER_NEW_EVENTS'
      | 'FIND_NEW_PLACES'
      | 'FRIENDSHIP'
      | 'RELATIONSHIP'
      | 'NETWORKING'
      RelationshipStatus:
      | 'SINGLE'
      | 'IN_A_RELATIONSHIP'
      | 'MARRIED'
      | 'DIVORCED'
      | 'WIDOWED'
      | 'OTHER'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  realtime: {
    Tables: {
      messages: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          inserted_at: string | null
          version: number
        }
        Insert: {
          inserted_at?: string | null
          version: number
        }
        Update: {
          inserted_at?: string | null
          version?: number
        }
        Relationships: []
      }
      subscription: {
        Row: {
          claims: Json
          claims_role: unknown
          created_at: string
          entity: unknown
          filters: Database['realtime']['CompositeTypes']['user_defined_filter'][]
          id: number
          subscription_id: string
        }
        Insert: {
          claims: Json
          claims_role?: unknown
          created_at?: string
          entity: unknown
          filters?: Database['realtime']['CompositeTypes']['user_defined_filter'][]
          id?: never
          subscription_id: string
        }
        Update: {
          claims?: Json
          claims_role?: unknown
          created_at?: string
          entity?: unknown
          filters?: Database['realtime']['CompositeTypes']['user_defined_filter'][]
          id?: never
          subscription_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_rls: {
        Args: {
          wal: Json
          max_record_bytes?: number
        }
        Returns: Database['realtime']['CompositeTypes']['wal_rls'][]
      }
      broadcast_changes: {
        Args: {
          topic_name: string
          event_name: string
          operation: string
          table_name: string
          table_schema: string
          new: Record<string, unknown>
          old: Record<string, unknown>
          level?: string
        }
        Returns: undefined
      }
      build_prepared_statement_sql: {
        Args: {
          prepared_statement_name: string
          entity: unknown
          columns: Database['realtime']['CompositeTypes']['wal_column'][]
        }
        Returns: string
      }
      cast: {
        Args: {
          val: string
          type_: unknown
        }
        Returns: Json
      }
      check_equality_op: {
        Args: {
          op: Database['realtime']['Enums']['equality_op']
          type_: unknown
          val_1: string
          val_2: string
        }
        Returns: boolean
      }
      is_visible_through_filters: {
        Args: {
          columns: Database['realtime']['CompositeTypes']['wal_column'][]
          filters: Database['realtime']['CompositeTypes']['user_defined_filter'][]
        }
        Returns: boolean
      }
      list_changes: {
        Args: {
          publication: unknown
          slot_name: unknown
          max_changes: number
          max_record_bytes: number
        }
        Returns: Database['realtime']['CompositeTypes']['wal_rls'][]
      }
      quote_wal2json: {
        Args: {
          entity: unknown
        }
        Returns: string
      }
      send: {
        Args: {
          payload: Json
          event: string
          topic: string
          private?: boolean
        }
        Returns: undefined
      }
      to_regrole: {
        Args: {
          role_name: string
        }
        Returns: unknown
      }
      topic: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      action: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE' | 'ERROR'
      equality_op: 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in'
    }
    CompositeTypes: {
      user_defined_filter: {
        column_name: string | null
        op: Database['realtime']['Enums']['equality_op'] | null
        value: string | null
      }
      wal_column: {
        name: string | null
        type_name: string | null
        type_oid: unknown | null
        value: Json | null
        is_pkey: boolean | null
        is_selectable: boolean | null
      }
      wal_rls: {
        wal: Json | null
        is_rls_enabled: boolean | null
        subscription_ids: string[] | null
        errors: string[] | null
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey'
            columns: ['bucket_id']
            isOneToOne: false
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey'
            columns: ['bucket_id']
            isOneToOne: false
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey'
            columns: ['bucket_id']
            isOneToOne: false
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey'
            columns: ['upload_id']
            isOneToOne: false
            referencedRelation: 's3_multipart_uploads'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
    PublicSchema['Views'])
  ? (PublicSchema['Tables'] &
    PublicSchema['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
  ? PublicSchema['Enums'][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema['CompositeTypes']
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
  ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never
